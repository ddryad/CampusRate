import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: 'about:blank' })
  type!: string;

  @ApiProperty({ example: 'Bad Request' })
  title!: string;

  @ApiProperty({ example: 400 })
  status!: number;

  @ApiProperty({ example: 'La requête contient des données invalides.' })
  detail!: string;

  @ApiProperty({ example: '/api/v1/places' })
  instance!: string;

  @ApiPropertyOptional({ type: [String], example: ['Le nom est obligatoire.'] })
  errors?: string[];
}