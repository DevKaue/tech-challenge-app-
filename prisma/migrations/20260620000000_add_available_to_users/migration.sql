-- Add available column to users table
ALTER TABLE "users" ADD COLUMN "available" BOOLEAN NOT NULL DEFAULT true;
