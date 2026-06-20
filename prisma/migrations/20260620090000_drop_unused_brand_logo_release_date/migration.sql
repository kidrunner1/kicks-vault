-- Drop unused columns that are not read or written by the current app flows.
ALTER TABLE "Brand" DROP COLUMN "logo";
ALTER TABLE "Shoe" DROP COLUMN "releaseDate";
