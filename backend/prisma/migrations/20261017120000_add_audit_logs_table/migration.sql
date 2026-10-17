-- CreateTable
CREATE TABLE "app"."audit_logs" (
    "id" VARCHAR(255) NOT NULL,
    "admin_id" VARCHAR(255) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "target_raffle_id" VARCHAR(255),
    "recipient_user_id" VARCHAR(255),
    "ticket_numbers" INTEGER[],
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_admin_id_idx" ON "app"."audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "app"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_recipient_user_id_idx" ON "app"."audit_logs"("recipient_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_raffle_id_idx" ON "app"."audit_logs"("target_raffle_id");
