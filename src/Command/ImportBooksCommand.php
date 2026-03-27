<?php
namespace App\Command;

use App\Entity\Book;
use App\Entity\Image;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
   name: 'app:import-books',
   description: 'Import books from books.json into the database',
)]
class ImportBooksCommand extends Command
{
   private EntityManagerInterface $entityManager;
   public function __construct(EntityManagerInterface $entityManager)
   {
       parent::__construct();
       $this->entityManager = $entityManager;
   }

   protected function execute(InputInterface $input, OutputInterface $output): int
   {
       $io = new SymfonyStyle($input, $output);

       // Ruta del archivo JSON
       $jsonFile = __DIR__ . '/../../public/books.json';

       if (!file_exists($jsonFile)) {
           $io->error('El archivo books.json no existe en la ruta: ' . $jsonFile);
           return Command::FAILURE;
       }

       $jsonContent = file_get_contents($jsonFile);
       $booksData = json_decode($jsonContent, true);

       if ($booksData === null) {
           $io->error('Error al parsear el JSON');
           return Command::FAILURE;
       }

       // --- LIMPIEZA INICIAL ---
       $this->entityManager->createQuery('DELETE FROM App\Entity\Image i')->execute();
       $this->entityManager->createQuery('DELETE FROM App\Entity\Book b')->execute();
       $this->entityManager->flush();
       $io->info('Limpieza de base de datos completada.');

       foreach ($booksData['books'] as $individualBookData) {
            $book = new Book();
            $book->setIsbn($individualBookData['isbn']);
            $book->setTitle($individualBookData['title']);
            $book->setSubtitle($individualBookData['subtitle'] ?? null);
            $book->setAuthor($individualBookData['author']);
            $book->setPublished(new \DateTimeImmutable($individualBookData['published']));
            $book->setPublisher($individualBookData['publisher']);
            $book->setPages($individualBookData['pages']);
            $book->setDescription($individualBookData['description']);
            $book->setWebsite($individualBookData['website'] ?? null);
            $book->setCategory($individualBookData['category']);
            $this->entityManager->persist($book);

             // --- ASIGNACION AUTOMÁTICA DE PORTADA (Local or Open Library) ---
             $isbn = $individualBookData['isbn'];
             $suffixes = ['', '_2'];
             $extensions = ['jpg', 'png', 'jpeg', 'webp'];
             $projectDir = realpath(__DIR__ . '/../../');
             $hasLocalImages = false;
             
             foreach ($suffixes as $suffix) {
                 foreach ($extensions as $ext) {
                     $localPath = "/images/{$isbn}{$suffix}.{$ext}";
                     $fullPath = $projectDir . '/public' . $localPath;

                     if (file_exists($fullPath)) {
                         $image = new Image();
                         $image->setRutaArchivo($localPath);
                         $image->setBook($book);
                         $this->entityManager->persist($image);
                         $hasLocalImages = true;
                     }
                 }
             }

             if (!$hasLocalImages) {
                $image = new Image();
                $image->setRutaArchivo("https://covers.openlibrary.org/b/isbn/{$isbn}-L.jpg");
                $image->setBook($book);
                $this->entityManager->persist($image);
             }
        }

       $this->entityManager->flush();
       $io->success('Importación de libros completado con éxito (incluyendo portadas).');

       return Command::SUCCESS;
   }
}