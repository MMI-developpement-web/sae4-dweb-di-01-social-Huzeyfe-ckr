<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260329105655 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE hashtag (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_5AB52A615E237E06 (name), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE post_hashtag (hashtag_id INT NOT NULL, post_id INT NOT NULL, INDEX IDX_675D9D52FB34EF56 (hashtag_id), INDEX IDX_675D9D524B89032C (post_id), PRIMARY KEY (hashtag_id, post_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE post_hashtag ADD CONSTRAINT FK_675D9D52FB34EF56 FOREIGN KEY (hashtag_id) REFERENCES hashtag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_hashtag ADD CONSTRAINT FK_675D9D524B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE blocked_user RENAME INDEX idx_4c4b6c64a76ed395 TO IDX_718E1137A76ED395');
        $this->addSql('ALTER TABLE blocked_user RENAME INDEX idx_4c4b6c6411ae65cf TO IDX_718E11371EBCBB63');
        $this->addSql('DROP INDEX idx_post_media ON post');
        $this->addSql('DROP INDEX IDX_5A8A6C8D_CENSORED ON post');
        $this->addSql('ALTER TABLE reply RENAME INDEX idx_fda8c6e04b89dc62 TO IDX_FDA8C6E04B89032C');
        $this->addSql('ALTER TABLE user CHANGE blocked blocked TINYINT NOT NULL, CHANGE read_only read_only TINYINT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post_hashtag DROP FOREIGN KEY FK_675D9D52FB34EF56');
        $this->addSql('ALTER TABLE post_hashtag DROP FOREIGN KEY FK_675D9D524B89032C');
        $this->addSql('DROP TABLE hashtag');
        $this->addSql('DROP TABLE post_hashtag');
        $this->addSql('ALTER TABLE blocked_user RENAME INDEX idx_718e11371ebcbb63 TO IDX_4C4B6C6411AE65CF');
        $this->addSql('ALTER TABLE blocked_user RENAME INDEX idx_718e1137a76ed395 TO IDX_4C4B6C64A76ED395');
        $this->addSql('CREATE INDEX idx_post_media ON post (media_url)');
        $this->addSql('CREATE INDEX IDX_5A8A6C8D_CENSORED ON post (censored)');
        $this->addSql('ALTER TABLE reply RENAME INDEX idx_fda8c6e04b89032c TO IDX_FDA8C6E04B89DC62');
        $this->addSql('ALTER TABLE `user` CHANGE blocked blocked TINYINT DEFAULT 0 NOT NULL, CHANGE read_only read_only TINYINT DEFAULT 0 NOT NULL');
    }
}
