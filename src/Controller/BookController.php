<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Book;
use DateTimeImmutable;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Constraints\DateTime;

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
        
        return $this->json($books);   
    }

    #[Route('/book/antes2013', name: 'libros2013')]
    public function libros2013(): Response
    {    
        $book2013 = $this->em->getRepository(Book::class)->findBefore2013();
           
        return $this->json($book2013);
    }

    #[Route('/book/drama', name: 'drama_book')]
    public function drama_book(): Response
    {
        $bookDrama = $this->em->getRepository(Book::class)->findBy(['category' => 'Drama']);

        return $this->json($bookDrama);
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

        return new JsonResponse(['Libro añadido con  éxito' => true]);
    }
    
    #[Route('/book/delete/{isbn}', name: 'borrar_libro')]
    public function borrar_libro($isbn): Response {
        $bookDelete = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);

        $this->em->remove($bookDelete);
        $this->em->flush();

        return new JsonResponse(['Libro borrado con  éxito' => true]);
    }
}
