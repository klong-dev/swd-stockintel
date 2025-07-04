import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created.',
    schema: {
      example: {
        error: false,
        data: { userId: 1, username: 'johndoe', email: 'john@example.com' },
        message: 'User created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to create user.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to create user',
      },
    },
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'All users fetched successfully',
    schema: {
      example: {
        error: false,
        data: {
          items: [
            { userId: 1, username: 'johndoe', email: 'john@example.com' }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        },
        message: 'All users fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch users.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to fetch users',
      },
    },
  })
  @Get()
  findAll(@Query('page') page: string = '1', @Query('pageSize') pageSize: string = '10') {
    return this.userService.findAll(Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    schema: {
      example: {
        error: false,
        data: { userId: 1, username: 'johndoe', email: 'john@example.com' },
        message: 'User fetched successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'User not found',
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user by ID with optional avatar upload' })
  @ApiParam({ name: 'id', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@email.com' },
        passwordHash: { type: 'string', example: 'hashedpassword' },
        fullName: { type: 'string', example: 'John Doe' },
        provider: { type: 'string', example: 'google' },
        socialId: { type: 'string', example: '123456' },
        status: { type: 'string', example: 'active' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional avatar image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated. Returns the user with Cloudinary avatar URL if uploaded successfully',
    schema: {
      example: {
        error: false,
        data: { userId: 1, username: 'johndoe', email: 'john@example.com' },
        message: 'User updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'User not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to update user.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to update user',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file: any, @Req() req) {
    const avatarBuffer = file ? file.buffer : undefined;
    return this.userService.update(id, updateUserDto, req.user, avatarBuffer);
  }

  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully (soft delete)',
    schema: {
      example: {
        error: false,
        data: { userId: '1', email: 'user@example.com', status: 0 },
        message: 'User deleted successfully (soft delete)',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'User not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete user.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to delete user',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.userService.remove(id, req.user);
  }

  @ApiOperation({ summary: 'Restore user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    schema: {
      example: {
        error: false,
        data: { userId: '1', email: 'user@example.com', status: 1 },
        message: 'User restored successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'User not found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to restore user.',
    schema: {
      example: {
        error: true,
        data: null,
        message: 'Failed to restore user',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  restore(@Param('id') id: string, @Req() req) {
    return this.userService.restore(id, req.user);
  }
}
