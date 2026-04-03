<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260326000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add bio, banner, website, and location fields to user table';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` ADD banner VARCHAR(1000) DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD bio VARCHAR(500) DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD website VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD location VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` DROP COLUMN banner');
        $this->addSql('ALTER TABLE `user` DROP COLUMN bio');
        $this->addSql('ALTER TABLE `user` DROP COLUMN website');
        $this->addSql('ALTER TABLE `user` DROP COLUMN location');
    }
}
