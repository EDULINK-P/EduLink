-- CreateTable
CREATE TABLE "zoomToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "zoomToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zoomToken_userId_key" ON "zoomToken"("userId");

-- AddForeignKey
ALTER TABLE "zoomToken" ADD CONSTRAINT "zoomToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
