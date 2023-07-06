/*
  Warnings:

  - A unique constraint covering the columns `[symbol]` on the table `Operation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `Operation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `symbol` on table `Operation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Operation" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "symbol" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Operation_symbol_key" ON "Operation"("symbol");
