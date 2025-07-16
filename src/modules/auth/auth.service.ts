import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/modules/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import e from 'express';

@Injectable()
export class AuthService {
  private readonly redis;
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  private async setToCache(key: string, value: any, ttl = 60): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  private async removeFromCache(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async facebookLogin(accessToken: string) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,email,picture',
        },
      });

      const fbUser = data;

      const user = {
        id: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        picture: fbUser.picture?.data?.url,
      };

      const token = this.jwtService.sign({ sub: user.id, email: user.email });

      return { accessToken: token, user };
    } catch (err) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }

  async googleLogin(idToken: string) {
    try {
      const { data } = await axios.post(
        `https://www.googleapis.com/oauth2/v3/tokeninfo`,
        {
          id_token: idToken,
        },
      );

      const user = {
        userId: data.sub,
        name: data.name,
        email: data.email,
        avatarUrl: data.picture,
        provider: 'google',
      };

      // Check if user haven't registered yet
      let existingUser = await this.userRepository.findOne({
        where: { socialId: user.userId, provider: 'google' },
      });
      if (!existingUser) {
        existingUser = this.userRepository.create({
          userId: uuidv4(),
          email: user.email,
          fullName: user.name,
          avatarUrl: user.avatarUrl,
          socialId: user.userId,
          provider: 'google',
          refreshToken: uuidv4(),
        });
        await this.userRepository.save(existingUser);
      } else {
        existingUser.fullName = user.name;
        existingUser.avatarUrl = user.avatarUrl;
        existingUser.socialId = user.userId;
        existingUser.provider = 'google';
        await this.userRepository.save(existingUser);
      }

      const refreshToken = uuidv4();
      existingUser.refreshToken = refreshToken;
      await this.userRepository.save(existingUser);
      return this.generateToken(existingUser, refreshToken);
    } catch (e) {
      throw new UnauthorizedException('Google token invalid' + e.message);
    }
  }

  async register(email: string, password: string, fullName?: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const refreshToken = uuidv4();
    const user = this.userRepository.create({
      userId: uuidv4(),
      provider: 'local',
      email,
      passwordHash,
      fullName,
      refreshToken,
    });
    await this.userRepository.save(user);
    return this.generateToken(user, refreshToken);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
    return this.generateToken(user, refreshToken);
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { refreshToken } });
    if (!user) throw new UnauthorizedException('Invalid refresh token');
    return this.generateToken(user, refreshToken);
  }

  private generateToken(user: User, refreshToken?: string) {
    const payload = {
      userId: user.userId,
      email: user.email,
      isExpert: user.isExpert,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken || user.refreshToken,
      user: payload,
    };
  }

  async getFullUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    return {
      error: false,
      user,
      message: 'Fetch user infor successfully',
    };
  }
}
