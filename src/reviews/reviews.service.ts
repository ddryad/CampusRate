import { Injectable, NotFoundException } from '@nestjs/common';
import { PlacesService } from '../places/places.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsRepository } from './reviews.repository';
import { Review } from './schemas/review.schema';
import { Types } from 'mongoose';

const UPDATABLE_FIELDS = ['authorName', 'rating', 'comment'] as const;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly placesService: PlacesService,
  ) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<Review> {
    await this.placesService.findOne(placeId);

    const review = await this.reviewsRepository.create({
      placeId: new Types.ObjectId(placeId),
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.recalculateStats(placeId);
    return review;
  }

  async findAllForPlace(placeId: string): Promise<Review[]> {
    await this.placesService.findOne(placeId);
    return this.reviewsRepository.findAllForPlace(placeId);
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException(
        `L'appréciation avec l'ID "${id}" n'existe pas.`,
      );
    }
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const changes: Partial<Review> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (dto[field] !== undefined) {
        (changes as Record<string, unknown>)[field] = dto[field];
      }
    }

    const review = await this.reviewsRepository.update(id, changes);
    if (!review) {
      throw new NotFoundException(
        `L'appréciation avec l'ID "${id}" n'existe pas.`,
      );
    }

    await this.recalculateStats(review.placeId.toString());
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewsRepository.remove(id);
    if (!review) {
      throw new NotFoundException(
        `L'appréciation avec l'ID "${id}" n'existe pas.`,
      );
    }

    await this.recalculateStats(review.placeId.toString());
  }

  private async recalculateStats(placeId: string): Promise<void> {
    const stats = await this.reviewsRepository.getStats(placeId);
    const averageRating = stats ? Math.round(stats.average * 100) / 100 : null;
    await this.placesService.updateStats(
      placeId,
      averageRating,
      stats?.count ?? 0,
    );
  }
}
