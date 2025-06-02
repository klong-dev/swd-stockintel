import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('facebook')
  facebookLogin(@Body('accessToken') fbToken: string) {
    return this.authService.facebookLogin(fbToken);
  }

  @Post('google')
  googleLogin(@Body('accessToken') ggToken: string) {
    return this.authService.googleLogin(ggToken);
  }
}
