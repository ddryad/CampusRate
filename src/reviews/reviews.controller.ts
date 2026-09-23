import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publier une appréciation pour un endroit' })
  @ApiParam({ name: 'placeId', description: "Identifiant de l'endroit", example: 'plc_...' })
  @ApiCreatedResponse({ description: 'Appréciation créée.' })
  @ApiBadRequestResponse({ description: 'Données invalides.', type: ProblemDetailsDto })
  @ApiNotFoundResponse({ description: "L'endroit n'existe pas.", type: ProblemDetailsDto })
  async create(
    @Param('placeId') placeId: string,
    @Body() dto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const review = await this.reviewsService.create(placeId, dto);
    res.location(`/api/v1/reviews/${review.id}`);
    return review;
  }

  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: "Lister les appréciations d'un endroit" })
  @ApiParam({ name: 'placeId', description: "Identifiant de l'endroit", example: 'plc_...' })
  @ApiOkResponse({ description: 'Liste des appréciations.' })
  @ApiNotFoundResponse({ description: "L'endroit n'existe pas.", type: ProblemDetailsDto })
  findAllForPlace(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Consulter une appréciation' })
  @ApiParam({ name: 'id', description: "Identifiant de l'appréciation", example: 'rev_...' })
  @ApiOkResponse({ description: 'Appréciation trouvée.' })
  @ApiNotFoundResponse({ description: "L'appréciation n'existe pas.", type: ProblemDetailsDto })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  @ApiOperation({ summary: 'Modifier une appréciation' })
  @ApiParam({ name: 'id', description: "Identifiant de l'appréciation", example: 'rev_...' })
  @ApiOkResponse({ description: 'Appréciation modifiée.' })
  @ApiNotFoundResponse({ description: "L'appréciation n'existe pas.", type: ProblemDetailsDto })
  @ApiBadRequestResponse({ description: 'Données invalides.', type: ProblemDetailsDto })
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une appréciation' })
  @ApiParam({ name: 'id', description: "Identifiant de l'appréciation", example: 'rev_...' })
  @ApiNotFoundResponse({ description: "L'appréciation n'existe pas.", type: ProblemDetailsDto })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}