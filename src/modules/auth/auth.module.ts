import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    JwtConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
