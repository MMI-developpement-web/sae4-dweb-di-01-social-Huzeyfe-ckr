<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Remove active column - replaced by blocked column
 */
final class Version20260325000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove active column from user table';
    }

    public function up(Schema $schema): void
    {
        // Active column already manually dropped from database
        // This migration exists to mark it as executed in Doctrine's migration history
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` ADD active TINYINT NOT NULL DEFAULT 1');
    }
}
