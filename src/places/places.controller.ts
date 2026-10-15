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
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';

@ApiTags('Places')
@ApiTooManyRequestsResponse({
  description: 'Trop de requêtes (maximum 100 par minute).',
  type: ProblemDetailsDto,
})
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un endroit',
    description:
      'Les propriétés inconnues sont refusées (400). Les champs id, createdAt, updatedAt, averageRating et reviewCount sont gérés par le serveur et ne peuvent pas être envoyés. Le nom doit être unique (409).',
  })
  @ApiCreatedResponse({ description: 'Endroit créé.' })
  @ApiBadRequestResponse({
    description:
      'Données invalides : propriété obligatoire absente, valeur invalide, propriété inconnue ou contrôlée par le serveur.',
    type: ProblemDetailsDto,
  })
  @ApiConflictResponse({
    description: 'Un endroit portant ce nom existe déjà.',
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
    @Body() dto: CreatePlaceDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const place = await this.placesService.create(dto);
    res.location(`/api/v1/places/${place._id}`);
    return place;
  }

  @Get()
  @ApiOperation({ summary: 'Lister les endroits (filtrage et pagination)' })
  @ApiOkResponse({ description: 'Liste paginée des endroits.' })
  @ApiBadRequestResponse({
    description: 'Paramètre de requête invalide (category, page ou limit).',
    type: ProblemDetailsDto,
  })
  findAll(@Query() query: PlaceQueryDto) {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un endroit' })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'endroit",
    example: '665f1c2e8b3a4d0012a4b5c6',
  })
  @ApiOkResponse({ description: 'Endroit trouvé.' })
  @ApiBadRequestResponse({
    description: 'Identifiant mal formé.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'endroit n'existe pas.",
    type: ProblemDetailsDto,
  })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un endroit',
    description:
      'Seuls name, description, category, address, services et status peuvent être modifiés. Toute propriété inconnue ou contrôlée par le serveur (id, createdAt, updatedAt, averageRating, reviewCount) est refusée (400). Le nom doit rester unique (409).',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'endroit",
    example: '665f1c2e8b3a4d0012a4b5c6',
  })
  @ApiOkResponse({ description: 'Endroit modifié.' })
  @ApiBadRequestResponse({
    description:
      'Identifiant mal formé, valeur invalide, propriété inconnue ou contrôlée par le serveur.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'endroit n'existe pas.",
    type: ProblemDetailsDto,
  })
  @ApiConflictResponse({
    description: 'Un endroit portant ce nom existe déjà.',
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
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un endroit',
    description:
      'Un endroit qui possède des appréciations ne peut pas être supprimé (409).',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant de l'endroit",
    example: '665f1c2e8b3a4d0012a4b5c6',
  })
  @ApiBadRequestResponse({
    description: 'Identifiant mal formé.',
    type: ProblemDetailsDto,
  })
  @ApiNotFoundResponse({
    description: "L'endroit n'existe pas.",
    type: ProblemDetailsDto,
  })
  @ApiConflictResponse({
    description: "L'endroit possède des appréciations.",
    type: ProblemDetailsDto,
  })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.placesService.remove(id);
  }
}
