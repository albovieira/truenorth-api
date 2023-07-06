/*
  Warnings:

  - You are about to drop the column `user_balance` on the `Record` table. All the data in the column will be lost.
  - Added the required column `user_balance_after` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_balance_before` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "user_balance",
ADD COLUMN     "user_balance_after" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "user_balance_before" DOUBLE PRECISION NOT NULL;
