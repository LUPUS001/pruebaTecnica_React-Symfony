<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Book;
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
            $data[] = $book->toArray();
        }

        return new JsonResponse($data);
    }

    #[Route('/book/year/{year}', name: 'books_by_year')]
    public function books_by_year($year): Response
    {    
        $books = $this->em->getRepository(Book::class)->findYear($year);
        $data = [];
        foreach ($books as $book) {
            $data[] = $book->toArray();
        }

        return new JsonResponse($data);
    }

    // Creamos una ruta dinámica donde recibimos la categoría que nos llega desde el botón handleFilterByCategory
    #[Route('/book/category/{category}', name: 'category_book')]
    public function category_book($category): Response
    {
        // Normalizamos la categoría (Ej: "ficción" -> "Ficción") para asegurar que coincida con la DB
        $books = $this->em->getRepository(Book::class)->findBy(['category' => ucfirst(strtolower($category))]);            
        $data = [];

        foreach ($books as $book) {
            $data[] = $book->toArray();
        }

        return new JsonResponse($data);
    }
    // Ahora en lugar de necesitar un webservice para cada categoría, hacemos todo este trabajo en un solo webservice 'category_book' 
    



    // Webservices REST que permiten Create y Delete
    
    #[Route('/book/add', name: 'add_book', methods: ['POST'])]
    public function add_book(Request $request): Response {
        $data = $request->toArray();

        $book = new Book(
            $data['isbn'] ?? null,
            $data['title'] ?? null,
            $data['subtitle'] ?? null,
            $data['author'] ?? null,
            isset($data['published']) ? new \DateTimeImmutable($data['published']) : new \DateTimeImmutable(),
            $data['publisher'] ?? null,
            $data['pages'] ?? 1,
            $data['description'] ?? null,
            $data['website'] ?? null,
            ucfirst(strtolower($data['category'])) ?? null // Para que siempre se guarde la categoría con la primera letra en mayúscula (strlower lo pone en minúsculas y ucfirst pone la primera letra en mayúscula)
        );

        $this->em->persist($book);
        $this->em->flush();

        return new JsonResponse(['Libro añadido con éxito' => true, 'Titulo' => $book->getTitle()], 201);
    }

    
    // Renombramos a nombres en inglés para consistencia con el resto de la API
    #[Route('/book/delete/{isbn}', name: 'delete_book', methods: ['DELETE'])]
    public function delete_book($isbn): Response {
        $bookDelete = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);

        if (!$bookDelete) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        // Primero eliminamos las imágenes asociadas para evitar el error de clave foránea
        foreach ($bookDelete->getImages() as $image) {
            $this->em->remove($image);
        }

        $title = $bookDelete->getTitle();
        $this->em->remove($bookDelete);
        $this->em->flush();

        return new JsonResponse(['Libro borrado con éxito' => true, 'Titulo' => $title]);
    }



    // La información de un libro concreto, pasando como parámetro un ISBN y que devolverá las imágenes
    // Obtenemos la información de un libro y sus imágenes asociadas
    #[Route('/book/{isbn}', name: 'find_book')]
    public function find_book($isbn): Response {
        $book = $this->em->getRepository(Book::class)->findBookImagen($isbn);
        
        if (!$book) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        return new JsonResponse($book->toArray());
    }
}