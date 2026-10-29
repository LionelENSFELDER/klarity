-- La connexion par mot de passe exige désormais une adresse vérifiée. Les
-- comptes créés avant cette règle restent utilisables : leur adresse est
-- considérée vérifiée à leur date de création.
UPDATE "users" SET "email_verified" = "created_at" WHERE "email_verified" IS NULL AND "password" IS NOT NULL;
