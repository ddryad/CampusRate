import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { toPublicJson } from '../../common/database/to-public-json';
import { PlaceCategory } from '../enums/place-category.enum';
import { PlaceStatus } from '../enums/place-status.enum';

@Schema({ timestamps: true, toJSON: { transform: toPublicJson } })
export class Place extends Document {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  description!: string;

  @Prop({ required: true, enum: Object.values(PlaceCategory) })
  category!: PlaceCategory;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ type: [String], default: [] })
  services!: string[];

  @Prop({
    enum: Object.values(PlaceStatus),
    default: PlaceStatus.ACTIVE,
  })
  status!: PlaceStatus;

  @Prop({ type: Number, default: null })
  averageRating!: number | null;

  @Prop({ default: 0 })
  reviewCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);

PlaceSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'fr', strength: 2 } },
);
PlaceSchema.index({ category: 1 });
