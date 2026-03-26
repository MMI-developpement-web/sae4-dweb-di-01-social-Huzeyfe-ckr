<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326153000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create blocked_user table for user blocking functionality';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE blocked_user (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, blocked_user_id INT NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX unique_block (user_id, blocked_user_id), INDEX IDX_4C4B6C64A76ED395 (user_id), INDEX IDX_4C4B6C6411AE65CF (blocked_user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE blocked_user ADD CONSTRAINT FK_4C4B6C64A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE blocked_user ADD CONSTRAINT FK_4C4B6C6411AE65CF FOREIGN KEY (blocked_user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE blocked_user DROP FOREIGN KEY FK_4C4B6C64A76ED395');
        $this->addSql('ALTER TABLE blocked_user DROP FOREIGN KEY FK_4C4B6C6411AE65CF');
        $this->addSql('DROP TABLE blocked_user');
    }
}
