import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { ExpoPushToken } from './entities/expo-push-token.entity';
import { Admin } from '../admin/entities/admin.entity';
import { JwtConfigModule } from 'src/configs/jwt-config.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, ExpoPushToken, Admin]),
    JwtConfigModule,
    RedisModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }
