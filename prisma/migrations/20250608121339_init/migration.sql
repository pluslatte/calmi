-- CreateTable
CREATE TABLE "misskey_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_user_id" TEXT NOT NULL,
    "instance_url" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_settings" (
    "session_user_id" TEXT NOT NULL PRIMARY KEY,
    "active_account_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_settings_active_account_id_fkey" FOREIGN KEY ("active_account_id") REFERENCES "misskey_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
