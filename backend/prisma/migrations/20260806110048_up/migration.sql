-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_raffle_id_fkey";

-- DropForeignKey
ALTER TABLE "winners" DROP CONSTRAINT "winners_raffle_id_fkey";

-- DropForeignKey
ALTER TABLE "winners" DROP CONSTRAINT "winners_ticket_id_fkey";

-- AlterTable
ALTER TABLE "instant_wins" ADD COLUMN     "rrp_value" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "raffles" ADD COLUMN     "main_prize_value" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "winners" ADD COLUMN     "verification_status" VARCHAR(50) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "fee_amount" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "net_amount" DECIMAL(10,2) DEFAULT 0.00;

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(50),
    "image" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "raffles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
