<?php
namespace App\Command;

use App\Entity\Book;
use DateTime;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;


#[AsCommand(
   name: 'app:import-books',
   description: 'Add a short description for your command',
)]
class ImportBooksCommand extends Command
{
   // 1. Cambiar el constructor para inyectar EntityManagerInterface
   private EntityManagerInterface $entityManager;
   public function __construct(EntityManagerInterface $entityManager)
   {
       parent::__construct();
       $this->entityManager = $entityManager;
   }

   /* 2. Ya que no usó argumentos ni opciones o la modificó, en este caso, podríamos borrar configure()
   pero ya que estamos, lo utilizaremos para dejar una descripción */
   protected function configure(): void
   {
       $this->setDescription('Import books from books.json into the database');
   }
  
   // 3. Cambiar completamente el método execute()
   protected function execute(InputInterface $input, OutputInterface $output): int
   {
       $io = new SymfonyStyle($input, $output);

       // Ruta del archivo JSON, ajusta según dónde lo tengas
       $jsonFile = __DIR__ . '/../../public/books.json';

       // 4. Leer el archivo JSON y decodificarlo
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

      
       foreach ($booksData['books'] as $individualBookData) {
           // 1. Por cada libro que está en el array $booksData (que viene del JSON)

           /*OPCIONAL: ...*/
           $existing = $this->entityManager->getRepository(Book::class)
               ->findOneBy(['isbn' => $individualBookData['isbn']]);

            if (!$existing) {
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
            } else {
                $book = $existing;
            }

            // COMPROBAR SI EXISTEN IMÁGENES PARA ESTE LIBRO
            $publicPath = __DIR__ . '/../../public/';
            $imageFiles = glob($publicPath . 'images/' . $individualBookData['isbn'] . '*.*');

            foreach ($imageFiles as $absolutePath) {
                $imagePath = 'images/' . basename($absolutePath);
                
                // Evitar duplicados de imágenes si ya está enlazada
                $imageExists = false;
                foreach ($book->getImages() as $existingImg) {
                    if ($existingImg->getRutaArchivo() === $imagePath) {
                        $imageExists = true;
                        break;
                    }
                }

                if (!$imageExists) {
                    $image = new \App\Entity\Image();
                    $image->setRutaArchivo($imagePath);
                    $image->setBook($book);
                    $this->entityManager->persist($image);
                }
            }
           /*
           //ESTO SERÍA EN EL CASO DE QUE NUESTRO JSON TUVIERA UN CAMPO LLAMADO IMAGES, PERO NO ES EL CASO
           // 5. Recorrer los libros y persistirlos en la base de datos


           if (!empty($individualBookData['images'])) {
               foreach ($individualBookData['images'] as $imageUrl) {
                   $image = new Image();
                   $image->setUrl($imageUrl);
                   $image->setBook($book);


                   $this->entityManager->persist($image);
               }
           }
           */
       }

       // 6. Guardar todo en base de datos
       $this->entityManager->flush();

       $io->success('Importación de libros completado con éxito.');

       return Command::SUCCESS;
   }
}