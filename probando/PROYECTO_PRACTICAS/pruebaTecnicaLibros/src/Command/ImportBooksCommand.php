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

    /* 2. Ya que no uso argumentos ni opciones o la modifico, en este caso, podríamos borrar configure() 
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

            if ($existing) {
                continue;
            }
            /*.. OPCIONAL*/

            $book = new Book();
            // 2. Creo una nueva entidad Book (un nuevo objeto para guardar en la BD)
            
            $book->setIsbn($individualBookData['isbn']);
            $book->setTitle($individualBookData['title']);
            $book->setSubtitle($individualBookData['subtitle'] ?? null);
            $book->setAuthor($individualBookData['author']);
            $book->setPublished(new DateTime($individualBookData['published']));
            $book->setPublisher($individualBookData['publisher']);
            $book->setPages($individualBookData['pages']);
            $book->setDescription($individualBookData['description']);
            $book->setWebsite($individualBookData['website'] ?? null);
            $book->setCategory($individualBookData['category']);
            // 3. Seteo (asigno) las propiedades del libro con los datos que vienen en el JSON para ese libro

            $this->entityManager->persist($book);
            // 4. Le digo a Doctrine que prepare este objeto Book para guardarlo en la base de datos (no se guarda aún, solo se marca para guardar)
            
            /* 
            //ESTO SERIA EN EL CASO DE QUE NUESTRO JSON TUVIERA UN CAMPO LLAMADO IMAGES, PERO NO ES EL CASO
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

        $io->success('Importada completada con éxito.');

        return Command::SUCCESS;
    }
}

        