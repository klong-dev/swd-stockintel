import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigModule } from 'src/configs/jwt-config.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User]),
    JwtConfigModule,
    RedisModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule { }
