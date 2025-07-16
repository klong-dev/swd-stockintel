import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyCommentDto {
    @ApiProperty({ description: 'Content of the reply comment', example: 'This is a reply to your comment' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
