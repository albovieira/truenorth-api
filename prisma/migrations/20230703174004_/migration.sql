/*
  Warnings:

  - You are about to drop the column `user_balance_after` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `user_balance_before` on the `Record` table. All the data in the column will be lost.
  - Added the required column `formula_id` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "user_balance_after",
DROP COLUMN "user_balance_before",
ADD COLUMN     "formula_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Formula" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "Formula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
