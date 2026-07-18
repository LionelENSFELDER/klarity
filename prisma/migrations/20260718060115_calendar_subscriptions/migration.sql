-- AlterTable
ALTER TABLE "users" ADD COLUMN "password" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contracts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "contract_number" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" DATETIME,
    "end_date" DATETIME,
    "renewal_date" DATETIME,
    "amount" REAL NOT NULL DEFAULT 0,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "debit_day" INTEGER NOT NULL DEFAULT 1,
    "anchor_month" INTEGER,
    "monthly_amount" REAL,
    "annual_amount" REAL,
    "document_url" TEXT,
    "document_name" TEXT,
    "client_phone" TEXT,
    "website" TEXT,
    "advisor_name" TEXT,
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "contracts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contracts" ("advisor_name", "annual_amount", "category", "client_phone", "contract_number", "created_at", "end_date", "id", "monthly_amount", "name", "notes", "provider", "renewal_date", "start_date", "status", "updated_at", "user_id", "website") SELECT "advisor_name", "annual_amount", "category", "client_phone", "contract_number", "created_at", "end_date", "id", "monthly_amount", "name", "notes", "provider", "renewal_date", "start_date", "status", "updated_at", "user_id", "website" FROM "contracts";
DROP TABLE "contracts";
ALTER TABLE "new_contracts" RENAME TO "contracts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
