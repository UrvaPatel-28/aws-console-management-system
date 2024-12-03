import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { OrderByEnum, SortByEnum } from 'src/constants/enum';

export class PaginationDto {
  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => +value)
  current_page: number = 1;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional()
  @Transform(({ value }) => +value)
  record_per_page: number = 10;
}

export class GetAuditLogsRequestDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ example: 'a173180c-19cd-4c4d-ae30-83b25874a222' })
  user_id: UUID;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '/user/create-aws-console-user' })
  api_endpoint: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'POST' })
  http_method: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ example: 200 })
  @Transform(({ value }) => +value)
  response_status: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'successfully' })
  response_message: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ example: '2024-12-02 04:14:54.178882' })
  @Transform(({ value }) => (value ? new Date(value) : value))
  date_from: Date;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({ example: '2024-12-02 04:14:54.178882' })
  @Transform(({ value }) => (value ? new Date(value) : value))
  date_to: Date;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '192.78.0.9' })
  ip_address: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ example: 70 })
  @Transform(({ value }) => +value)
  execution_duration_in_ms: number;

  @IsEnum(SortByEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: SortByEnum })
  sort_by?: SortByEnum;

  @IsEnum(OrderByEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by?: OrderByEnum;
}
