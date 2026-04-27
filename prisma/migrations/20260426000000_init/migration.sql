-- CreateTable
CREATE TABLE "rsvp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guest_name" TEXT NOT NULL,
    "is_attending" BOOLEAN NOT NULL,
    "has_plus_one" BOOLEAN NOT NULL DEFAULT false,
    "plus_one_name" TEXT,
    "needs_transfer" BOOLEAN NOT NULL DEFAULT false,
    "guest_comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
