<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add media_url column to post table - real migration
 */
final class Version20260328150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add media_url column to post table';
    }

    public function up(Schema $schema): void
    {
        // Add media_url column to post table
        $this->addSql('ALTER TABLE post ADD media_url VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_post_media ON post (media_url)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_post_media ON post');
        $this->addSql('ALTER TABLE post DROP COLUMN media_url');
    }
}
