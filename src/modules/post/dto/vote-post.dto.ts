import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class VotePostDto {
    @ApiProperty({
        description: 'Type of vote',
        enum: ['UPVOTE', 'DOWNVOTE'],
        example: 'UPVOTE'
    })
    @IsEnum(['UPVOTE', 'DOWNVOTE'])
    @IsNotEmpty()
    voteType: 'UPVOTE' | 'DOWNVOTE';
}
