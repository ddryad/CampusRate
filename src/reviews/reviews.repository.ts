import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  create(data: Partial<Review>) {
    return this.reviewModel.create(data);
  }

  findAllForPlace(placeId: string) {
    return this.reviewModel
      .find({ placeId })
      .sort({ createdAt: 1, _id: 1 })
      .exec();
  }

  findById(id: string) {
    return this.reviewModel.findById(id).exec();
  }

  update(id: string, changes: Partial<Review>) {
    return this.reviewModel
      .findByIdAndUpdate(
        id,
        { $set: changes },
        { new: true, runValidators: true },
      )
      .exec();
  }

  remove(id: string) {
    return this.reviewModel.findByIdAndDelete(id).exec();
  }

  async getStats(placeId: string) {
    const [stats] = await this.reviewModel
      .aggregate<{ average: number; count: number }>([
        { $match: { placeId: new Types.ObjectId(placeId) } },
        {
          $group: {
            _id: null,
            average: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    return stats;
  }
}
