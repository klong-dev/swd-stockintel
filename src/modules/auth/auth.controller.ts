import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: 'Login with Facebook' })
  @ApiBody({ schema: { properties: { accessToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Facebook login successful.' })
  @Post('facebook')
  facebookLogin(@Body('accessToken') fbToken: string) {
    return this.authService.facebookLogin(fbToken);
  }

  @ApiOperation({ summary: 'Login with Google' })
  @ApiBody({ schema: { properties: { accessToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Google login successful.' })
  @Post('google')
  googleLogin(@Body('accessToken') ggToken: string) {
    return this.authService.googleLogin(ggToken);
  }

  @ApiOperation({ summary: 'Register a new user and get JWT token' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' }, fullName: { type: 'string' } }, required: ['email', 'password'] } })
  @ApiResponse({ status: 201, description: 'User registered and JWT token returned.' })
  @Post('register')
  async register(@Body() body: { email: string; password: string; fullName?: string }) {
    return this.authService.register(body.email, body.password, body.fullName);
  }

  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } })
  @ApiResponse({ status: 200, description: 'JWT token returned.' })
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } })
  @ApiResponse({ status: 200, description: 'New access token returned.' })
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const userId = req.user.userId;
    return this.authService.getFullUserById(userId);
  }
}
