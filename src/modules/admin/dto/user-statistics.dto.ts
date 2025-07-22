import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsOverviewDto {
    @ApiProperty({ description: 'Total number of users', example: 150 })
    totalUsers: number;

    @ApiProperty({ description: 'Number of active users', example: 140 })
    totalActiveUsers: number;

    @ApiProperty({ description: 'Number of inactive users', example: 10 })
    totalInactiveUsers: number;

    @ApiProperty({ description: 'Number of expert users', example: 25 })
    totalExperts: number;

    @ApiProperty({ description: 'Number of regular users', example: 125 })
    totalRegularUsers: number;

    @ApiProperty({ description: 'Percentage of active users', example: '93.33' })
    activeUserPercentage: string;

    @ApiProperty({ description: 'Percentage of expert users', example: '16.67' })
    expertPercentage: string;
}

export class UserRegistrationsDto {
    @ApiProperty({ description: 'Users registered today', example: 5 })
    today: number;

    @ApiProperty({ description: 'Users registered this week', example: 20 })
    thisWeek: number;

    @ApiProperty({ description: 'Users registered this month', example: 50 })
    thisMonth: number;

    @ApiProperty({ description: 'Users registered last month', example: 45 })
    lastMonth: number;

    @ApiProperty({ description: 'Growth rate percentage', example: '11.11%' })
    growthRate: string;
}

export class UserProviderStatsDto {
    @ApiProperty({ description: 'Number of Google users', example: 80 })
    google?: number;

    @ApiProperty({ description: 'Number of local users', example: 60 })
    local?: number;

    @ApiProperty({ description: 'Number of Facebook users', example: 10 })
    facebook?: number;

    @ApiProperty({ description: 'Number of unknown provider users', example: 0 })
    unknown?: number;
}

export class UserBasicInfoDto {
    @ApiProperty({ description: 'User ID', example: 'user-123' })
    userId: string;

    @ApiProperty({ description: 'User full name', example: 'John Doe' })
    fullName: string;

    @ApiProperty({ description: 'User email', example: 'john@example.com' })
    email: string;

    @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg' })
    avatarUrl: string;

    @ApiProperty({ description: 'Authentication provider', example: 'google' })
    provider?: string;

    @ApiProperty({ description: 'User creation date', example: '2025-01-15T10:30:00Z' })
    createdAt: Date;

    @ApiProperty({ description: 'User status', example: 1 })
    status?: number;
}

export class UserStatisticsDataDto {
    @ApiProperty({ type: UserStatisticsOverviewDto, description: 'Overview statistics' })
    overview: UserStatisticsOverviewDto;

    @ApiProperty({ type: UserRegistrationsDto, description: 'Registration statistics' })
    registrations: UserRegistrationsDto;

    @ApiProperty({ type: UserProviderStatsDto, description: 'Provider statistics' })
    providers: UserProviderStatsDto;

    @ApiProperty({ type: [UserBasicInfoDto], description: 'List of expert users' })
    experts: UserBasicInfoDto[];

    @ApiProperty({ type: [UserBasicInfoDto], description: 'List of recent users' })
    recentUsers: UserBasicInfoDto[];

    @ApiProperty({ description: 'Timestamp when statistics were generated', example: '2025-07-17T03:15:00.000Z' })
    generatedAt: Date;
}

export class UserStatisticsResponseDto {
    @ApiProperty({ description: 'Whether there was an error', example: false })
    error: boolean;

    @ApiProperty({ type: UserStatisticsDataDto, description: 'Statistics data' })
    data: UserStatisticsDataDto;

    @ApiProperty({ description: 'Response message', example: 'Users statistics fetched successfully' })
    message: string;
}
