/*
  Warnings:

  - You are about to drop the column `bio` on the `instructor_applications` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `instructor_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "instructor_applications" DROP COLUMN "bio",
DROP COLUMN "expertise";
