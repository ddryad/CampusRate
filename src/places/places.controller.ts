import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
import { ProblemDetailsDto } from '../common/dto/problem-details.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un endroit' })
  @ApiCreatedResponse({ description: 'Endroit créé.' })
  @ApiBadRequestResponse({ description: 'Données invalides.', type: ProblemDetailsDto })
  async create(@Body() dto: CreatePlaceDto, @Res({ passthrough: true }) res: Response) {
    const place = await this.placesService.create(dto);
    res.location(`/api/v1/places/${place.id}`);
    return place;
  }

  @Get()
  @ApiOperation({ summary: 'Lister les endroits (filtrage et pagination)' })
  @ApiOkResponse({ description: 'Liste paginée des endroits.' })
  findAll(@Query() query: PlaceQueryDto) {
    return this.placesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un endroit' })
  @ApiParam({ name: 'id', description: 'Identifiant de l\'endroit', example: 'plc_...' })
  @ApiOkResponse({ description: 'Endroit trouvé.' })
  @ApiNotFoundResponse({ description: "L'endroit n'existe pas.", type: ProblemDetailsDto })
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un endroit' })
  @ApiParam({ name: 'id', description: 'Identifiant de l\'endroit', example: 'plc_...' })
  @ApiOkResponse({ description: 'Endroit modifié.' })
  @ApiNotFoundResponse({ description: "L'endroit n'existe pas.", type: ProblemDetailsDto })
  @ApiBadRequestResponse({ description: 'Données invalides.', type: ProblemDetailsDto })
  update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un endroit' })
  @ApiParam({ name: 'id', description: 'Identifiant de l\'endroit', example: 'plc_...' })
  @ApiNotFoundResponse({ description: "L'endroit n'existe pas.", type: ProblemDetailsDto })
  @ApiConflictResponse({
    description: "L'endroit possède des appréciations.",
    type: ProblemDetailsDto,
  })
  remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }
}