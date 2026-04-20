<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Book;
use App\Entity\Image;
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
        $books = $this->em->getRepository(Book::class)->findAll(); // Obtenemos todos los libros
        $data = []; // Array donde guardaremos los libros

        foreach ($books as $book) { // Recorremos todos los libros
            $data[] = $book->toArray(); // Convertimos cada libro a un array y lo guardamos en $data
        }

        return new JsonResponse($data); // Devolvemos el array de libros en formato JSON
    }

    #[Route('/book/year/{year}', name: 'books_by_year')]
    public function books_by_year($year): Response
    {    
        $books = $this->em->getRepository(Book::class)->findYear($year); // Obtenemos los libros del año seleccionado  
        $data = []; // Array donde guardaremos los libros

        foreach ($books as $book) { // Recorremos todos los libros del año seleccionado
            $data[] = $book->toArray(); // Convertimos cada libro a un array y lo guardamos en $data
        }

        return new JsonResponse($data); // Devolvemos el array de libros en formato JSON
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
        $book = new Book();
        $form = $this->createForm(BookType::class, $book);
        
        // Unimos los campos de texto y los archivos para que el formulario los procese de una vez
        $form->submit(array_merge($request->request->all(), $request->files->all())); 
        /*
            $request->request->all() -> Devuelve todos los campos de texto del formulario (título, autor, ISBN...)
            $request->files->all() -> Devuelve todos los archivos del formulario (imagen)
            array_merge() -> Une los dos arrays/listas (en este caso, los campos de texto y los archivos) para tener toda la información del libro en un solo paquete.
            $form->submit() -> Envía los datos al formulario para que los procese
        */

        // Si el formulario es válido, guardamos el libro
        if ($form->isValid()) {
            
            // Normalización de la categoría antes de guardar
            if ($book->getCategory()) { // Si el libro tiene categoría
                $book->setCategory(ucfirst(strtolower($book->getCategory()))); // Convierte la categoría a "Ficción" (primera letra mayúscula y el resto minúsculas)
            }

            $this->em->persist($book); // Guardamos el libro en la base de datos


            // Manejo de la imagen desde el formulario (ya validada por BookType)
            $uploadedFile = $form->get('image')->getData(); // Obtenemos la imagen del formulario
            if ($uploadedFile) { // Si la imagen existe
                $destination = $this->getParameter('kernel.project_dir') . '/public/images'; // Obtenemos la ruta de la carpeta images
                $isbn = $book->getIsbn(); 
                $newFilename = ($isbn ?: uniqid()) . '.' . $uploadedFile->guessExtension(); // Obtenemos la extensión de la imagen
                
                // Intentamos mover la imagen a la carpeta images
                try {
                    $uploadedFile->move($destination, $newFilename); // Movemos la imagen a la carpeta images
                    
                    $image = new Image(); // Creamos una nueva imagen
                    $image->setRutaArchivo('/images/' . $newFilename); // Guardamos la ruta de la imagen
                    $image->setBook($book); // Asociamos la imagen al libro
                    $this->em->persist($image); // Guardamos la imagen en la base de datos
                } catch (\Exception $e) {
                    // Si falla el movimiento físico, el libro se crea pero sin imagen
                }
            }

            $this->em->flush(); // Guardamos todos los cambios en la base de datos
            return new JsonResponse($book->toArray(), 201); // Devolvemos el libro en formato JSON
        }

        // Si el formulario NO es válido, devolvemos los errores
        $errors = [];
        foreach ($form->getErrors(true) as $error) { // Recorremos todos los errores del formulario
            $errors[] = $error->getMessage(); // Guardamos el mensaje de error en el array $errors
        }

        return new JsonResponse(['errors' => $errors], 400); // Devolvemos el array de errores en formato JSON
    }

    
    // Renombramos a nombres en inglés para consistencia con el resto de la API
    #[Route('/book/delete/{isbn}', name: 'delete_book', methods: ['DELETE'])]
    public function delete_book($isbn): Response {
        $bookDelete = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]);

        if (!$bookDelete) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        // Primero eliminamos las imágenes asociadas para evitar el error de clave foránea y liberar espacio en disco
        foreach ($bookDelete->getImages() as $image) {
            $filePath = $this->getParameter('kernel.project_dir') . '/public' . $image->getRutaArchivo();
            if (file_exists($filePath)) {
                unlink($filePath); // Borramos el archivo físico
            }
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