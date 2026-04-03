<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add media_url column to reply table
 */
final class Version20260330000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add media_url column to reply table';
    }

    public function up(Schema $schema): void
    {
        // Add media_url column to reply table
        $this->addSql('ALTER TABLE reply ADD media_url VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE reply DROP COLUMN media_url');
    }
}
