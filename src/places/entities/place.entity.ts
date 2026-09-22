import { PlaceCategory } from '../enums/place-category.enum';
import { PlaceStatus } from '../enums/place-status.enum';

export class Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  address: string;
  services: string[];
  status: PlaceStatus;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}