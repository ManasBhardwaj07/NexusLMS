CREATE TYPE "ConsentState" AS ENUM ('NOT_REQUIRED', 'PENDING', 'VERIFIED');

ALTER TABLE "User" ALTER COLUMN "consentState" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "consentState" TYPE "ConsentState" USING ("consentState"::"ConsentState");
ALTER TABLE "User" ALTER COLUMN "consentState" SET DEFAULT 'NOT_REQUIRED'::"ConsentState";
