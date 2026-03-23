<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260323150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create follow table for user subscriptions';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE follow (
            id INT AUTO_INCREMENT NOT NULL,
            follower_id INT NOT NULL,
            following_id INT NOT NULL,
            created_at DATETIME NOT NULL,
            UNIQUE KEY unique_follower_following (follower_id, following_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE follow ADD CONSTRAINT FK_B61D6DF7AC24F853 FOREIGN KEY (follower_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE follow ADD CONSTRAINT FK_B61D6DF76DD2D5C FOREIGN KEY (following_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_B61D6DF7AC24F853 ON follow (follower_id)');
        $this->addSql('CREATE INDEX IDX_B61D6DF76DD2D5C ON follow (following_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY FK_B61D6DF7AC24F853');
        $this->addSql('ALTER TABLE follow DROP FOREIGN KEY FK_B61D6DF76DD2D5C');
        $this->addSql('DROP TABLE follow');
    }
}
