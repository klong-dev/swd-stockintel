import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async facebookLogin(accessToken: string) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,email,picture',
        },
      });

      const fbUser = data;
      console.log('Facebook User:', fbUser);

      const user = {
        id: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        picture: fbUser.picture?.data?.url,
      };

      const token = this.jwtService.sign({ sub: user.id, email: user.email });

      return { accessToken: token, user };
    } catch (err) {
      console.error(err.response?.data || err);
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }

  async googleLogin(idToken: string) {
    try {
      const { data } = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo`, {
        params: { id_token: idToken },
      });

      const user = {
        id: data.sub,
        name: data.name,
        email: data.email,
        picture: data.picture,
        provider: 'google',
      };

      const jwt = this.jwtService.sign({ sub: user.id, email: user.email });
      return { accessToken: jwt, user };
    } catch (e) {
      throw new UnauthorizedException('Google token invalid');
    }
  }

  async register(email: string, password: string, fullName?: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const user = this.userRepository.create({ email, passwordHash, fullName });
    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { userId: user.userId, email: user.email, isExpert: user.isExpert };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
