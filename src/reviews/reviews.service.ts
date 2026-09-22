import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService, DbShape } from '../database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Place } from '../places/entities/place.entity';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DatabaseService) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<Review> {
    const data = await this.db.read();
    const places = data.places as Place[];
    const reviews = data.reviews as Review[];

    const place = places.find((p) => p.id === placeId);
    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${placeId}" n'existe pas.`);
    }

    const now = new Date().toISOString();
    const newReview: Review = {
      id: `rev_${randomUUID()}`,
      placeId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: now,
      updatedAt: now,
    };

    reviews.push(newReview);
    this.calculateRating(data, placeId);
    await this.db.write(data);

    return newReview;
  }

  async findAllForPlace(placeId: string): Promise<Review[]> {
    const data = await this.db.read();
    const places = data.places as Place[];
    const reviews = data.reviews as Review[];

    const place = places.find((p) => p.id === placeId);
    if (!place) {
      throw new NotFoundException(`L'endroit avec l'ID "${placeId}" n'existe pas.`);
    }

    return reviews.filter((r) => r.placeId === placeId);
  }

  async findOne(id: string): Promise<Review> {
    const data = await this.db.read();
    const reviews = data.reviews as Review[];
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      throw new NotFoundException(`L'appréciation avec l'ID "${id}" n'existe pas.`);
    }

    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const data = await this.db.read();
    const reviews = data.reviews as Review[];
    const review = reviews.find((r) => r.id === id);

    if (!review) {
      throw new NotFoundException(`L'appréciation avec l'ID "${id}" n'existe pas.`);
    }

    Object.assign(review, dto);
    review.updatedAt = new Date().toISOString();

    this.calculateRating(data, review.placeId);
    await this.db.write(data);

    return review;
  }

  async remove(id: string): Promise<void> {
    const data = await this.db.read();
    const reviews = data.reviews as Review[];
    const index = reviews.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`L'appréciation avec l'ID "${id}" n'existe pas.`);
    }

    const placeId = reviews[index].placeId;
    reviews.splice(index, 1);

    this.calculateRating(data, placeId);
    await this.db.write(data);
  }

  private calculateRating(data: DbShape, placeId: string): void {
    const places = data.places as Place[];
    const reviews = data.reviews as Review[];

    const place = places.find((p) => p.id === placeId);
    if (!place) return;

    const placeReviews = reviews.filter((r) => r.placeId === placeId);

    if (placeReviews.length === 0) {
      place.averageRating = null;
      place.reviewCount = 0;
    } else {
      const sum = placeReviews.reduce((acc, r) => acc + r.rating, 0);
      place.averageRating = Math.round((sum / placeReviews.length) * 100) / 100;
      place.reviewCount = placeReviews.length;
    }

    place.updatedAt = new Date().toISOString();
  }
}