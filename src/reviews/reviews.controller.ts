import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('places/:placeId/reviews')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('placeId') placeId: string,
    @Body() dto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const review = await this.reviewsService.create(placeId, dto);
    res.location(`/api/v1/reviews/${review.id}`);
    return review;
  }

  @Get('places/:placeId/reviews')
  findAllForPlace(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }

  @Get('reviews/:id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}