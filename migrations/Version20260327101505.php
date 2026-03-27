<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260327101505 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE book CHANGE subtitle subtitle VARCHAR(255) DEFAULT NULL, CHANGE author author VARCHAR(255) DEFAULT NULL, CHANGE published published DATETIME DEFAULT NULL, CHANGE publisher publisher VARCHAR(255) DEFAULT NULL, CHANGE pages pages INT DEFAULT NULL, CHANGE description description LONGTEXT DEFAULT NULL, CHANGE website website VARCHAR(255) DEFAULT NULL, CHANGE category category VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE book CHANGE subtitle subtitle VARCHAR(255) NOT NULL, CHANGE author author VARCHAR(255) NOT NULL, CHANGE published published DATETIME NOT NULL, CHANGE publisher publisher VARCHAR(255) NOT NULL, CHANGE pages pages INT NOT NULL, CHANGE description description LONGTEXT NOT NULL, CHANGE website website VARCHAR(255) NOT NULL, CHANGE category category VARCHAR(255) NOT NULL');
    }
}
