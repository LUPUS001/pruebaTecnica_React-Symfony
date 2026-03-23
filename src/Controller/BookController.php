<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Book;
use Symfony\Component\Validator\Constraints\DateTime;

final class BookController extends AbstractController
{
    private $em;
    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    #[Route('/books', name: 'app_book')]
    public function index(): Response
    {
        // Trae todos los libros
        $books = $this->em->getRepository(Book::class)->findAll();
        
        // return $this->json($books);
        return $this->render('book/index.html.twig', [
            'controller_name' => $books,
        ]);
    }

    #[Route('/book/antes2013', name: 'libros2013')]
    public function libros2013(): Response
    {
        // $anyo = DateTime();
        // $anyo_publicacion = '2013-01-01 00:00:00';
        
        $book2013 = $this->em->getRepository(Book::class)->findBefore2013();
        
        
        // return $this->json($book2013);
        return $this->render('book/index.html.twig', [
            'controller_name' => $book2013,
        ]);
    }

    #[Route('/book/drama', name: 'drama_book')]
    public function drama_book(): Response
    {
        // Trae todos los libros con la categoría "Drama"
        $bookDrama = $this->em->getRepository(Book::class)->findBy(['category' => 'Drama']);

        // return $this->json($bookDrama);
        return $this->render('book/index.html.twig', [
            'controller_name' => $bookDrama,
        ]);
    }
}
