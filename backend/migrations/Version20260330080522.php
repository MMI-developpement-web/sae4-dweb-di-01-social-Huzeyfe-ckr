<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330080522 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_pinned_posts (user_id INT NOT NULL, post_id INT NOT NULL, INDEX IDX_FB10CC3DA76ED395 (user_id), INDEX IDX_FB10CC3D4B89032C (post_id), PRIMARY KEY (user_id, post_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE user_pinned_posts ADD CONSTRAINT FK_FB10CC3DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_pinned_posts ADD CONSTRAINT FK_FB10CC3D4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post RENAME INDEX idx_5a8a6c8d47d04d86 TO IDX_5A8A6C8D8BCEF275');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY `FK_8D93D6491DD13AB8`');
        $this->addSql('DROP INDEX IDX_8D93D6491DD13AB8 ON user');
        $this->addSql('ALTER TABLE user DROP pinned_post_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_pinned_posts DROP FOREIGN KEY FK_FB10CC3DA76ED395');
        $this->addSql('ALTER TABLE user_pinned_posts DROP FOREIGN KEY FK_FB10CC3D4B89032C');
        $this->addSql('DROP TABLE user_pinned_posts');
        $this->addSql('ALTER TABLE post RENAME INDEX idx_5a8a6c8d8bcef275 TO IDX_5A8A6C8D47D04D86');
        $this->addSql('ALTER TABLE `user` ADD pinned_post_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT `FK_8D93D6491DD13AB8` FOREIGN KEY (pinned_post_id) REFERENCES post (id) ON UPDATE NO ACTION ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8D93D6491DD13AB8 ON `user` (pinned_post_id)');
    }
}
