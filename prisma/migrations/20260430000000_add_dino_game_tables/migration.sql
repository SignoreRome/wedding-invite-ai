-- CreateTable
CREATE TABLE "game_attempts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mode" TEXT NOT NULL,
    "player_name" TEXT,
    "score" INTEGER NOT NULL,
    "coins_collected" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "is_success" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_attempts_mode_check" CHECK ("mode" IN ('story', 'endless')),
    CONSTRAINT "game_attempts_score_check" CHECK ("score" >= 0),
    CONSTRAINT "game_attempts_coins_collected_check" CHECK ("coins_collected" >= 0),
    CONSTRAINT "game_attempts_distance_check" CHECK ("distance" >= 0)
);

-- CreateTable
CREATE TABLE "game_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "story_required_distance" INTEGER NOT NULL DEFAULT 2500,
    "endless_speed_multiplier" REAL NOT NULL DEFAULT 1,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "game_settings_story_required_distance_check" CHECK ("story_required_distance" > 0),
    CONSTRAINT "game_settings_endless_speed_multiplier_check" CHECK ("endless_speed_multiplier" > 0 AND "endless_speed_multiplier" <= 3)
);

-- SeedData
INSERT INTO "game_settings" (
    "id",
    "story_required_distance",
    "endless_speed_multiplier"
) VALUES (1, 2500, 1);
