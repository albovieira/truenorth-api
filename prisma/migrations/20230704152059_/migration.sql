-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_formula_id_fkey";

-- AlterTable
ALTER TABLE "Record" ALTER COLUMN "formula_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "Formula"("id") ON DELETE SET NULL ON UPDATE CASCADE;
