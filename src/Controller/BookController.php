<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Book;
use App\Form\BookType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

final class BookController extends AbstractController
{
    private $em;
    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    // Webservices REST que devuelven información en formato JSON

    #[Route('/books', name: 'app_book')]
    public function index(): Response
    {
        $books = $this->em->getRepository(Book::class)->findAll();
        
        $data = [];
        foreach ($books as $book) {
            $data[] = [
                'id' => $book->getId(),
                'isbn' => $book->getIsbn(),
                'title' => $book->getTitle(),
                'author' => $book->getAuthor(),
                'category' => $book->getCategory(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/book/antes2013', name: 'libros2013')]
    public function libros2013(): Response
    {    
        $books = $this->em->getRepository(Book::class)->findBefore2013();
           
        $data = [];
        foreach ($books as $book) {
            $data[] = [
                'id' => $book->getId(),
                'isbn' => $book->getIsbn(),
                'title' => $book->getTitle(),
                'author' => $book->getAuthor(),
                'category' => $book->getCategory(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/book/drama', name: 'drama_book')]
    public function drama_book(): Response
    {
        $books = $this->em->getRepository(Book::class)->findBy(['category' => 'Drama']);

        $data = [];
        foreach ($books as $book) {
            $data[] = [
                'id' => $book->getId(),
                'isbn' => $book->getIsbn(),
                'title' => $book->getTitle(),
                'author' => $book->getAuthor(),
                'category' => $book->getCategory(),
            ];
        }

        return new JsonResponse($data);
    }



    // Webservices REST que permiten Create y Delete
    
    #[Route('/book/anadir', name: 'anadir_libro')]
    public function anadir_libro(): Response {
        $book = new Book(
            '9781506711980',
            'Berserk Deluxe Edition Volume 1',
            'The Black Swordsman & The Brand of Sacrifice',
            'Kentaro Miura',
            new \DateTimeImmutable('2019-03-26T00:00:00.000Z'),
            'Dark Horse Manga', 
            692, 
            'The reigning king of adult fantasy manga now in deluxe 7x10 hardcover editions! Born in tragedy, raised in abuse and neglect, Guts is a hardened warrior who seeks revenge against his former mentor.', 
            'https://www.darkhorse.com/Books/3003-631/Berserk-Deluxe-Edition-Volume-1-HC', 
            'Dark Fantasy'
        );

        $this->em->persist($book);
        $this->em->flush();

        return new JsonResponse(['Libro añadido con éxito' => true, 'Titulo' => $book->getTitle()]);
    }

    #[Route('/book/anadirF', name: 'anadir_libro_formulario')]
    public function anadir_libro_formulario(Request $request): Response {
        $book = new Book();
        $formularioLibro = $this->createForm(BookType::class, $book);
        $formularioLibro->handleRequest($request);
        
        if ($formularioLibro->isSubmitted() && $formularioLibro->isValid()) { 
            $this->em->persist($book);
            $this->em->flush();
            
            return $this->redirectToRoute('app_book');
        }

        return $this->render('book/index.html.twig', [ 
            'formularioLibro' => $formularioLibro->createView(),
        ]);
    }
    
    #[Route('/book/delete/{isbn}', name: 'borrar_libro')]
    public function borrar_libro($isbn): Response {
        $bookDelete = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);

        if (!$bookDelete) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        $this->em->remove($bookDelete);
        $this->em->flush();

        return new JsonResponse(['Libro borrado con éxito' => true, 'Titulo' => $bookDelete->getTitle()]);
    }



    // La información de un libro concreto, pasando como parámetro un ISBN y que devolverá las imágenes

    #[Route('/book/{isbn}', name: 'buscar_libro')]
    public function buscar_libro($isbn): Response {
        $book = $this->em->getRepository(Book::class)->findBookImagen($isbn);
        
        if (!$book) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        $images = [];
        foreach ($book->getImages() as $image) {
            $images[] = [
                'id' => $image->getId(),
                'ruta' => $image->getRutaArchivo()
            ];
        }
        
        return new JsonResponse([
            'id' => $book->getId(),
            'isbn' => $book->getIsbn(),
            'title' => $book->getTitle(),
            'subtitle' => $book->getSubtitle(),
            'author' => $book->getAuthor(),
            'published' => $book->getPublished()->format('Y-m-d'),
            'publisher' => $book->getPublisher(),
            'pages' => $book->getPages(),
            'description' => $book->getDescription(),
            'website' => $book->getWebsite(),
            'category' => $book->getCategory(),
            'total_images' => count($images),
            'images' => $images
        ]);
    }
}