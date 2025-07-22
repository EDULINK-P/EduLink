-- CreateTable
CREATE TABLE "StickyNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "lockedBy" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "StickyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickyNoteHistory" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StickyNoteHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StickyNoteHistory" ADD CONSTRAINT "StickyNoteHistory_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "StickyNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
