import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { UserFavorite } from '../user/entities/user-favorite.entity';
import { UserVote } from '../user/entities/user-vote.entity';
import { JwtConfigModule } from 'src/configs/jwt-config.module';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, UserFavorite, UserVote]),
    JwtConfigModule,
  ],
  controllers: [PostController],
  providers: [PostService, JwtAuthGuard],
})
export class PostModule { }
