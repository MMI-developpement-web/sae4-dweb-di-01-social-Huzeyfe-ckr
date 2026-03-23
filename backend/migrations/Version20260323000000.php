<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260323000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create like table for post likes functionality';
    }

    public function up(Schema $schema): void
    {
        // Create the like table
        $this->addSql('CREATE TABLE `like` (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            post_id INT NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE INDEX unique_user_post_like (user_id, post_id),
            INDEX IDX_AC6340D3A76ED395 (user_id),
            INDEX IDX_AC6340D34B89063 (post_id)
        ) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');

        // Add foreign keys
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340D3A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `like` ADD CONSTRAINT FK_AC6340D34B89063 FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Drop the like table
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340D3A76ED395');
        $this->addSql('ALTER TABLE `like` DROP FOREIGN KEY FK_AC6340D34B89063');
        $this->addSql('DROP TABLE `like`');
    }
}
