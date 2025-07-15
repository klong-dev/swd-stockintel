import { PartialType } from '@nestjs/swagger';
import { AdminCreatePostDto } from './admin-create-post.dto';

export class AdminUpdatePostDto extends PartialType(AdminCreatePostDto) { }
