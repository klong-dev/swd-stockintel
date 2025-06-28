import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import typeormConfig from './configs/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './modules/admin/admin.module';
import { CommentModule } from './modules/comment/comment.module';
import { AiAnalysisModule } from './modules/ai-analysis/ai-analysis.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PostModule } from './modules/post/post.module';
import { ReportModule } from './modules/report/report.module';
import { StockModule } from './modules/stock/stock.module';
import { StockCrawlDataModule } from './modules/stock-crawl-data/stock-crawl-data.module';
import { StockExchangeModule } from './modules/stock-exchange/stock-exchange.module';
import { UserModule } from './modules/user/user.module';
import { RedisProvider } from './configs/redis.provider';
import { RedisModule } from './modules/redis/redis.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),
    AuthModule,
    AdminModule,
    CommentModule,
    AiAnalysisModule,
    NotificationModule,
    PostModule,
    ReportModule,
    StockModule,
    StockCrawlDataModule,
    StockExchangeModule,
    UserModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [RedisProvider, AppService],
})
export class AppModule { }
