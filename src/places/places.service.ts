import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';
import { PlaceStatus } from './enums/place-status.enum';

@Injectable()
export class PlacesService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreatePlaceDto): Promise<Place> {
    const data = await this.db.read();
    const places = data.places as Place[];

    const now = new Date().toISOString();
    const newPlace: Place = {
      id: `plc_${randomUUID()}`,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services ?? [],
      status: dto.status ?? PlaceStatus.ACTIVE,
      averageRating: null,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    places.push(newPlace);
    await this.db.write(data);

    return newPlace;
  }

  async findAll(): Promise<Place[]> {
    const data = await this.db.read();
    return data.places as Place[];
  }

  async findOne(id: string): Promise<Place> {
    const data = await this.db.read();
    const places = data.places as Place[];
    const place = places.find((p) => p.id === id);

    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${id}" n'existe pas.`);
    }

    return place;
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
    const data = await this.db.read();
    const places = data.places as Place[];
    const place = places.find((p) => p.id === id);

    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${id}" n'existe pas.`);
    }

    Object.assign(place, dto);
    place.updatedAt = new Date().toISOString();

    await this.db.write(data);
    return place;
  }

  async remove(id: string): Promise<void> {
    const data = await this.db.read();
    const places = data.places as Place[];
    const reviews = data.reviews as any[];
    const index = places.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundException(`L'endroit avec l'ID "${id}" n'existe pas.`);
    }

    const hasReviews = reviews.some((r) => r.placeId === id);
    if (hasReviews) {
      throw new ConflictException(
        `L'endroit avec l'ID "${id}" possède des appréciations et ne peut pas être supprimé.`,
      );
    }

    places.splice(index, 1);
    await this.db.write(data);
  }
}