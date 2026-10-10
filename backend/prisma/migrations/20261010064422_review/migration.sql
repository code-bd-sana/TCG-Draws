-- AlterTable
ALTER TABLE "instant_wins" ALTER COLUMN "image" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "raffles" ALTER COLUMN "main_image" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "winners" ADD COLUMN     "is_claimed" BOOLEAN NOT NULL DEFAULT false;
