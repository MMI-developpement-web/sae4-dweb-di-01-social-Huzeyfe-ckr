<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260312140820 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE post RENAME INDEX user_id TO IDX_5A8A6C8DA76ED395');
        $this->addSql('ALTER TABLE user CHANGE password password VARCHAR(255) NOT NULL, CHANGE role role VARCHAR(50) NOT NULL, CHANGE active active TINYINT NOT NULL, CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6498D93D649 ON user (user)');
        $this->addSql('ALTER TABLE user RENAME INDEX email TO UNIQ_8D93D649E7927C74');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post CHANGE created_at created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('ALTER TABLE post RENAME INDEX idx_5a8a6c8da76ed395 TO user_id');
        $this->addSql('DROP INDEX UNIQ_8D93D6498D93D649 ON `user`');
        $this->addSql('ALTER TABLE `user` CHANGE password password VARCHAR(200) NOT NULL, CHANGE role role ENUM(\'user\', \'admin\') DEFAULT \'user\', CHANGE active active TINYINT DEFAULT 1, CHANGE created_at created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('ALTER TABLE `user` RENAME INDEX uniq_8d93d649e7927c74 TO email');
    }
}
