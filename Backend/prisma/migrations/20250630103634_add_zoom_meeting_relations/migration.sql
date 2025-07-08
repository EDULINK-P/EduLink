-- CreateTable
CREATE TABLE "ZoomMeeting" (
    "id" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "joinUrl" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "course_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoomMeeting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ZoomMeeting" ADD CONSTRAINT "ZoomMeeting_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZoomMeeting" ADD CONSTRAINT "ZoomMeeting_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
