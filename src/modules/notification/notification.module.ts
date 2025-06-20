import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtConfigModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule { }
