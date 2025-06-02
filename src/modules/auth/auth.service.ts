import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
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
}
