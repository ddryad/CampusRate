import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises } from 'fs';
import { dirname } from 'path';

export interface DbShape {
  places: Record<string, any>[];
  reviews: Record<string, any>[];
}

const EMPTY_DB: DbShape = { places: [], reviews: [] };

@Injectable()
export class DatabaseService {
  constructor(private readonly configService: ConfigService) {}

  private get filePath(): string {
    return this.configService.getOrThrow<string>('DATA_FILE_PATH');
  }

  async read(): Promise<DbShape> {
    try {
      await promises.access(this.filePath);
    } catch {
      await this.initializeFile();
      return { ...EMPTY_DB };
    }

    const raw = await promises.readFile(this.filePath, 'utf-8');

    if (!raw.trim()) {
      return { ...EMPTY_DB };
    }

    try {
      return JSON.parse(raw) as DbShape;
    } catch {
      throw new InternalServerErrorException(
        'Erreur lors de l accès au fichier',
      );
    }
  }

  async write(data: DbShape): Promise<void> {
    await promises.mkdir(dirname(this.filePath), { recursive: true });
    await promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async initializeFile(): Promise<void> {
    await promises.mkdir(dirname(this.filePath), { recursive: true });
    await promises.writeFile(
      this.filePath,
      JSON.stringify(EMPTY_DB, null, 2),
      'utf-8',
    );
  }
}