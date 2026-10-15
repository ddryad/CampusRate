import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Review } from '../reviews/schemas/review.schema';
import { Place } from './schemas/place.schema';

@Injectable()
export class PlacesRepository {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  findAll(filter: FilterQuery<Place>, skip: number, limit: number) {
    return this.placeModel
      .find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  count(filter: FilterQuery<Place>) {
    return this.placeModel.countDocuments(filter).exec();
  }

  findById(id: string) {
    return this.placeModel.findById(id).exec();
  }

  create(data: Partial<Place>) {
    return this.placeModel.create(data);
  }

  update(id: string, changes: Partial<Place>) {
    return this.placeModel
      .findByIdAndUpdate(
        id,
        { $set: changes },
        { new: true, runValidators: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.placeModel.findByIdAndDelete(id).exec();
  }

  async hasReviews(placeId: string): Promise<boolean> {
    return (await this.reviewModel.exists({ placeId })) !== null;
  }

  updateStats(
    placeId: string,
    averageRating: number | null,
    reviewCount: number,
  ) {
    return this.placeModel
      .findByIdAndUpdate(placeId, { $set: { averageRating, reviewCount } })
      .exec();
  }
}
