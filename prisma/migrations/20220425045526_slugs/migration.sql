/*
  Warnings:

  - Added the required column `slug` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `files` ADD COLUMN `slug` VARCHAR(191) NOT NULL;
