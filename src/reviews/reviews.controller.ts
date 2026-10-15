import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Reviews')
@ApiTooManyRequestsResponse({
  description: 'Trop de requêtes (maximum 100 par minute).',
  type: ProblemDetailsDto,
})
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Publier une appréciation pour un endroit',
    description:
      "La note (rating) doit être un entier entre 1 et 5. Les propriétés inconnues sont refusées (400). Les champs id, placeId, createdAt et updatedAt sont gérés par le serveur. La moyenne et le nombre d'appréciations de l'endroit sont recalculés automatiquement.",
  })
  @ApiParam({
    name: 'placeId',
    description: "Identifiant de l'endroit",
    example: '665f1c2e8b3a4d0012a4b5c6',
  })
  @ApiCreatedResponse({ description: 'Appréciation créée.' })
  @ApiBadRequestResponse({
    description:
      'Identifiant mal formé, propriété obligatoire absente, valeur invalide ou propriété inconnue.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'endroit n'existe pas.",
    type: ProblemDetailsDto,
  })
  @ApiUnsupportedMediaTypeResponse({
    description: 'Content-Type différent de application/json.',
    type: ProblemDetailsDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'Corps de la requête supérieur à 10 kb.',
    type: ProblemDetailsDto,
  })
  async create(
    @Param('placeId', ParseObjectIdPipe) placeId: string,
    @Body() dto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const review = await this.reviewsService.create(placeId, dto);
    res.location(`/api/v1/reviews/${review._id}`);
    return review;
  }

  @Get('places/:placeId/reviews')
  @ApiOperation({ summary: "Lister les appréciations d'un endroit" })
  @ApiParam({
    name: 'placeId',
    description: "Identifiant de l'endroit",
    example: '665f1c2e8b3a4d0012a4b5c6',
  })
  @ApiOkResponse({ description: 'Liste des appréciations.' })
  @ApiBadRequestResponse({
    description: 'Identifiant mal formé.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'endroit n'existe pas.",
    type: ProblemDetailsDto,
  })
  findAllForPlace(@Param('placeId', ParseObjectIdPipe) placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Consulter une appréciation' })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'appréciation",
    example: '665f1c2e8b3a4d0012a4b5c7',
  })
  @ApiOkResponse({ description: 'Appréciation trouvée.' })
  @ApiBadRequestResponse({
    description: 'Identifiant mal formé.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'appréciation n'existe pas.",
    type: ProblemDetailsDto,
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  @ApiOperation({
    summary: 'Modifier une appréciation',
    description:
      "Seuls authorName, rating et comment peuvent être modifiés. Toute propriété inconnue ou contrôlée par le serveur (id, placeId, createdAt, updatedAt) est refusée (400). Les statistiques de l'endroit sont recalculées.",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'appréciation",
    example: '665f1c2e8b3a4d0012a4b5c7',
  })
  @ApiOkResponse({ description: 'Appréciation modifiée.' })
  @ApiBadRequestResponse({
    description:
      'Identifiant mal formé, valeur invalide, propriété inconnue ou contrôlée par le serveur.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'appréciation n'existe pas.",
    type: ProblemDetailsDto,
  })
  @ApiUnsupportedMediaTypeResponse({
    description: 'Content-Type différent de application/json.',
    type: ProblemDetailsDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'Corps de la requête supérieur à 10 kb.',
    type: ProblemDetailsDto,
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une appréciation',
    description: "Les statistiques de l'endroit sont recalculées.",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'appréciation",
    example: '665f1c2e8b3a4d0012a4b5c7',
  })
  @ApiBadRequestResponse({
    description: 'Identifiant mal formé.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'appréciation n'existe pas.",
    type: ProblemDetailsDto,
  })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
