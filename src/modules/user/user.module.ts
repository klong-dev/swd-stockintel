import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserFavorite } from './entities/user-favorite.entity';
import { UserVote } from './entities/user-vote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFavorite, UserVote]),
    JwtConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
