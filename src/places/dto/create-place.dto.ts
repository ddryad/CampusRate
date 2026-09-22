import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PlaceCategory } from '../enums/place-category.enum';
import { PlaceStatus } from '../enums/place-status.enum';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Bibliothèque principale', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Espace calme avec prises.', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ enum: PlaceCategory, example: PlaceCategory.STUDY_SPACE })
  @IsEnum(PlaceCategory)
  category!: PlaceCategory;

  @ApiProperty({ example: 'Pavillon A, local A-210' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({
    example: ['WIFI', 'POWER_OUTLETS'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ enum: PlaceStatus, example: PlaceStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PlaceStatus)
  status?: PlaceStatus;
}