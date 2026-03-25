<?php

namespace App\Controller;

use App\Entity\Book;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class BookController extends AbstractController
{
    //aunque no sea obligatorio declaro esta variable antes de meterla en el constructor porque
    // mejora la robustez, legibilidad y mantenibilidad del código.
    private EntityManagerInterface $entityManager;
    public function __construct(EntityManagerInterface $entityManager) {
        $this->entityManager = $entityManager;
    }
    #[Route('/books', name: 'app_allbooks', methods: ['GET'])]
    public function allbooks(): Response
    {
        //Buscar todos los libros
        $books = $this->entityManager->getRepository(Book::class)->findAll();
        
        //Para devolverlo como JSON
        return $this->json($books, 200, [], ['groups' => 'book:read']);
        
            //Para renderizarlo en el Twig
            // render('book/index.html.twig', [ 'books' => $books, ]);
        //O se renderiza o se devuelve como un JSON, las 2 no
    }
    
    #[Route('/books/antes2013', name:'app_books_antes_2013', methods: ['GET'])]
    public function antes2013(): Response {
        //fecha que utilizaremos para comparar en la consulta
        $anyo = new DateTime('2013-01-01');

        //Creamos una consulta para filtrar los libros que sean antes de la fecha de $anyo
        $books = $this->entityManager->createQuery('
            SELECT book.id, book.title, book.author, book.published
            FROM App\Entity\Book book
            WHERE book.published < :anyo
            
        ')->setParameter('anyo', $anyo)
        ->getResult();

        //$books = $this->entityManager->getRepository(Book::class)->findBy(['published' < $anyo]);
        return $this->json($books);
    }

    #[Route('/books/drama', name:'app_books_drama', methods: ['GET'])]
    public function dramabooks(): Response {
        //Utilizamos "findBy()" para usar como criterio de búsqueda los que tengan el valor 'Drama' 
        //en la propiedad (que luego se mapeara a columna en la BD) 
        $books = $this->entityManager->getRepository(Book::class)->findBy(['category' => 'Drama']);

        return $this->json($books, 200, [], ['groups' => 'book:read']);
    }

    #[Route('/books/{isbn}', name: 'book_filtrado', methods: ['GET'])]
    public function bookEspecifico($isbn): Response
    {
        $book = $this->entityManager->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);

        if (!$book) {
            return $this->json(['error' => 'Libro no encontrado'], 404);
        }

        // Obtener imágenes relacionadas
        $images = $book->getImages();

        return $this->json([
            'title' => $book->getTitle(),
            'isbn' => $book->getIsbn(),
            'category' => $book->getCategory(),
            'image_count' => count($images),
            'images' => $images, // Esto serializa con grupos
        ], 200, [], ['groups' => 'book:read']);
    }



    //Versiones funcionales
    #[Route('/book/insert', name:'insert_book')]
    public function insertBook(): Response {
        $book = new Book();
        $book->setIsbn('9781617295850');
        $book->setTitle('Grokking Algorithms');
        $book->setSubtitle('An Illustrated Guide for Programmers and Other Curious People');
        $book->setAuthor('Aditya Bhargava');
        $book->setPublished(new DateTime('2016-05-01T00:00:00.000Z'));
        $book->setPublisher('Manning Publications');
        $book->setPages(256);
        $book->setDescription('Grokking Algorithms is a friendly take on this core computer science topic. In it, youll learn how to apply common algorithms to the practical problems you face every day as a programmer.');
        $book->setWebsite('https://www.manning.com/books/grokking-algorithms');
        $book->setCategory('Computer Science');

        $this->entityManager->persist($book);
        $this->entityManager->flush();
        return new JsonResponse(['success' => true, 'title'=>$book->getTitle()],200);
    }

    #[Route('/book/delete', name:'delete_book')]
    public function deleteBook(): Response {
        $book = $this->entityManager->getRepository(Book::class)->findOneBy(['isbn'=> '9781617295850']);
        
        $this->entityManager->remove($book);
        $this->entityManager->flush();

        return new JsonResponse(['success'=> true, 'title'=> $book->getTitle()],200);
    }

    //Versiones apropiadas
    #[Route('/book/insert2', name: 'insert_book2', methods: ['POST'])] 
    public function insertBook2(Request $request): Response {
        $book = new Book();
        $book->setIsbn('9781617295850');
        $book->setTitle('Grokking Algorithms');
        $book->setSubtitle('An Illustrated Guide for Programmers and Other Curious People');
        $book->setAuthor('Aditya Bhargava');
        $book->setPublished(new \DateTime('2016-05-01'));
        $book->setPublisher('Manning Publications');
        $book->setPages(256);
        $book->setDescription('...');
        $book->setWebsite('https://www.manning.com/books/grokking-algorithms');
        $book->setCategory('Computer Science');

        $this->entityManager->persist($book);
        $this->entityManager->flush();

        return new JsonResponse(['success' => true, 'title' => $book->getTitle()], 201);
    } //lo único que cambia es que ahora específicamos que usa el method POST y usamos Request de parámetro

    // Para enviar los datos con POST, necesitaremos un formulario que he creado en un Twig 
    #[Route('/book/new', name: 'book_new')]
    public function new(): Response
    {
        return $this->render('book/insert_book.html.twig');
    }

    #[Route('/book/delete/{isbn}', name:'delete_book2', methods: ['DELETE'])]
    public function deleteBook2(string $isbn): Response {
        $book = $this->entityManager->getRepository(Book::class)->findOneBy(['isbn'=> $isbn]);
        
        if (!$book){//Si el libro no existe
            return new JsonResponse(['success'=> false,'error'=> 'Libro no encontrado'],404); 
        }

        $this->entityManager->remove($book);
        $this->entityManager->flush();

        return new JsonResponse(['success'=> true, 'title'=> $book->getTitle()],200);
    }
    //En esta versión si que se nota más la mejora, además de poner en el buscado y no en el código el isbn a borrar
    //también cubre la posibilidad de que no exista el libro, si no existe, no peta sino que salta el error personalizado 

    #[Route('/book/delete2', name: 'book_delete_form')]
    public function deleteForm(): Response
    {
        return $this->render('book/delete.html.twig');
    }
    
}

