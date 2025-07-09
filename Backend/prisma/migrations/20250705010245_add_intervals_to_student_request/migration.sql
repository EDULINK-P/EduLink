/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentBudget` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maxSessionsPerDay` to the `StudentRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `intervals` on the `StudentRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_TA_id_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_student_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentBudget" DROP CONSTRAINT "StudentBudget_course_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentBudget" DROP CONSTRAINT "StudentBudget_user_id_fkey";

-- AlterTable
ALTER TABLE "StudentRequest" ADD COLUMN     "maxSessionsPerDay" INTEGER NOT NULL,
DROP COLUMN "intervals",
ADD COLUMN     "intervals" JSONB NOT NULL;

-- DropTable
DROP TABLE "Request";

-- DropTable
DROP TABLE "StudentBudget";

-- DropEnum
DROP TYPE "RequestStatus";
