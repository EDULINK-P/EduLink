/*
  Warnings:

  - You are about to drop the column `interval` on the `AvailabilityRequest` table. All the data in the column will be lost.
  - Added the required column `intervals` to the `AvailabilityRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AvailabilityRequest" DROP COLUMN "interval",
ADD COLUMN     "intervals" JSONB NOT NULL;
