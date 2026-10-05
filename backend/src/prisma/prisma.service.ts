import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 requires the driver adapter for native PostgreSQL connections
    // Extract schema from DATABASE_URL (e.g. ?schema=app) and pass it to PrismaPg
    const dbUrl = config.database.url;
    const schemaMatch = dbUrl.match(/[?&]schema=([^&]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'public';

    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool, { schema });
    super({ adapter });
  }

  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('📦 Successfully connected to the database.');
    } catch (error) {
      this.logger.error(
        '❌ Failed to connect to the database. Please check your database connection/credentials.',
      );
      console.error(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
