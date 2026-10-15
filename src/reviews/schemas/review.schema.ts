import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { toPublicJson } from '../../common/database/to-public-json';

@Schema({ timestamps: true, toJSON: { transform: toPublicJson } })
export class Review extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Place', required: true })
  placeId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 80 })
  authorName!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true, trim: true, minlength: 5, maxlength: 500 })
  comment!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ placeId: 1 });
