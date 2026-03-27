<?php
require 'vendor/autoload.php';
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
use App\Entity\Image;

(new Dotenv())->bootEnv('.env');
$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine.orm.entity_manager');

$images = $em->getRepository(Image::class)->findAll();
foreach ($images as $image) {
    echo "ID: " . $image->getId() . " - Path: " . $image->getRutaArchivo() . "\n";
}
