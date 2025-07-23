import { Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { UpdateAiDto } from './dto/update-ai.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) { }

  async chat(message: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://stock-fastapi.onrender.com/chat', message, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}
