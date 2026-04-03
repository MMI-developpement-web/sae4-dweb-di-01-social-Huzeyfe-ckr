<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260329110411 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user ADD pinned_post_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6491DD13AB8 FOREIGN KEY (pinned_post_id) REFERENCES post (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8D93D6491DD13AB8 ON user (pinned_post_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D6491DD13AB8');
        $this->addSql('DROP INDEX IDX_8D93D6491DD13AB8 ON `user`');
        $this->addSql('ALTER TABLE `user` DROP pinned_post_id');
    }
}
