-- Add access identity credentials to internal users
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
