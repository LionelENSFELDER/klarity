-- Les anciens contrats sans montant affichaient monthly_amount : on le
-- recopie dans amount avant de supprimer la colonne.
UPDATE "contracts" SET "amount" = "monthly_amount" WHERE "amount" = 0 AND "monthly_amount" IS NOT NULL;

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "annual_amount",
DROP COLUMN "icon_type",
DROP COLUMN "icon_value",
DROP COLUMN "monthly_amount";

