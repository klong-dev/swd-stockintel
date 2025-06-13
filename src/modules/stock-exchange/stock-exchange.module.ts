import { Module } from '@nestjs/common';
import { StockExchangeService } from './stock-exchange.service';
import { StockExchangeController } from './stock-exchange.controller';
import { StockExchange } from './entities/stock-exchange.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfigModule } from 'src/configs/jwt-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockExchange]),
    JwtConfigModule,
  ],
  controllers: [StockExchangeController],
  providers: [StockExchangeService],
})
export class StockExchangeModule { }
