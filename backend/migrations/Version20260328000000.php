<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260328000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add censored field to post table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE post ADD censored TINYINT(1) DEFAULT 0 NOT NULL');
        $this->addSql('CREATE INDEX IDX_5A8A6C8D_CENSORED ON post (censored)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_5A8A6C8D_CENSORED ON post');
        $this->addSql('ALTER TABLE post DROP censored');
    }
}
