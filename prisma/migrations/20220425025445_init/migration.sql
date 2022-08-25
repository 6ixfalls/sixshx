-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mimetype` VARCHAR(191) NOT NULL,
    `extension` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `delete_token` VARCHAR(191) NOT NULL,
    `vibrant` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `opengraphAuthor` VARCHAR(191) NOT NULL,
    `opengraphProvider` VARCHAR(191) NOT NULL,
    `uid` INTEGER NOT NULL,

    UNIQUE INDEX `files_delete_token_key`(`delete_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `files` ADD CONSTRAINT `files_uid_fkey` FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
