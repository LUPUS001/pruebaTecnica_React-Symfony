<?php

namespace App\Controller;

use App\Entity\Book;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ImportController extends AbstractController
{
    #[Route('/import-books', name: 'import_books', methods: ['GET'])]
    public function import(EntityManagerInterface $entityManager): Response
    {
        // 1. Localizamos el archivo en la carpeta public 
        $jsonFile = $this->getParameter('kernel.project_dir') . '/public/books.json';

        if (!file_exists($jsonFile)) {
            return new Response("Error: El archivo no existe.", 404);
        }

        // 2. Leemos y decodificamos 
        $jsonContent = file_get_contents($jsonFile);
        $booksData = json_decode($jsonContent, true);

        // 3. Recorremos y persistimos 
        foreach ($booksData['books'] as $data) {
            $book = new Book();
            $book->setIsbn($data['isbn']);
            $book->setTitle($data['title']);
            $book->setPublished(new \DateTimeImmutable($data['published']));
            $book->setCategory($data['category']);
            $book->setAuthor($data['author']);
            $book->setPublisher($data['publisher']);
            $book->setPages((int)$data['pages']); // Forzamos a entero por seguridad
            $book->setDescription($data['description']);

            // Campos opcionales (usamos ?? null para evitar errores si no vienen en el JSON) 
            $book->setSubtitle($data['subtitle'] ?? null);
            $book->setWebsite($data['website'] ?? null);

            $entityManager->persist($book); 
        }

        $entityManager->flush();

        return new Response("Importación finalizada. Revisa phpMyAdmin"); 
    }
}