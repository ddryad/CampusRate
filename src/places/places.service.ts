import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { CreatePlaceDto } from './dto/create-place.dto';
import { PlaceQueryDto } from './dto/place-query.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlacesRepository } from './places.repository';
import { Place } from './schemas/place.schema';

const UPDATABLE_FIELDS = [
  'name',
  'description',
  'category',
  'address',
  'services',
  'status',
] as const;

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  create(dto: CreatePlaceDto): Promise<Place> {
    return this.placesRepository.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services,
      status: dto.status,
    });
  }

  async findAll(query: PlaceQueryDto) {
    const filter: FilterQuery<Place> = {};
    if (query.category) {
      filter.category = query.category;
    }

    const [data, totalItems] = await Promise.all([
      this.placesRepository.findAll(
        filter,
        (query.page - 1) * query.limit,
        query.limit,
      ),
      this.placesRepository.count(filter),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit) || 0,
      },
    };
  }

  async findOne(id: string): Promise<Place> {
    const place = await this.placesRepository.findById(id);
    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${id}" n'existe pas.`);
    }
    return place;
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
    const changes: Partial<Place> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (dto[field] !== undefined) {
        (changes as Record<string, unknown>)[field] = dto[field];
      }
    }

    const place = await this.placesRepository.update(id, changes);
    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${id}" n'existe pas.`);
    }
    return place;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    if (await this.placesRepository.hasReviews(id)) {
      throw new ConflictException(
        `L'endroit avec l'ID "${id}" possède des appréciations et ne peut pas être supprimé.`,
      );
    }

    await this.placesRepository.remove(id);
  }

  async updateStats(
    placeId: string,
    averageRating: number | null,
    reviewCount: number,
  ): Promise<void> {
    await this.placesRepository.updateStats(
      placeId,
      averageRating,
      reviewCount,
    );
  }
}
