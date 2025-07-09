/*
  Warnings:

  - You are about to drop the `AvailabilityRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvailabilityRequest" DROP CONSTRAINT "AvailabilityRequest_course_id_fkey";

-- DropForeignKey
ALTER TABLE "AvailabilityRequest" DROP CONSTRAINT "AvailabilityRequest_user_id_fkey";

-- DropTable
DROP TABLE "AvailabilityRequest";

-- CreateTable
CREATE TABLE "TAAvailability" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "intervals" JSONB NOT NULL,
    "rate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TAAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRequest" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "intervals" TEXT NOT NULL,
    "sessionsPerWeek" INTEGER NOT NULL,
    "weeklyBudget" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBudget" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "sessionsPerWeek" INTEGER NOT NULL,
    "weeklyBudget" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBudget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TAAvailability" ADD CONSTRAINT "TAAvailability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TAAvailability" ADD CONSTRAINT "TAAvailability_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBudget" ADD CONSTRAINT "StudentBudget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBudget" ADD CONSTRAINT "StudentBudget_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
