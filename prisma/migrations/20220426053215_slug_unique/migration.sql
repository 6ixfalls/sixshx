/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `files_slug_key` ON `files`(`slug`);
