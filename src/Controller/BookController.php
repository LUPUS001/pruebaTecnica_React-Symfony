<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface; // Importamos el validador para validar los datos del libro 
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

            $book->setOwner($this->getUser()); // Asignamos el usuario logueado como dueño del libro
            $this->em->persist($book); // Guardamos el libro en la base de datos


            // Manejo de las imágenes desde el formulario (ya validadas por BookType)
            $uploadedFiles = $form->get('image')->getData(); // Obtenemos las imágenes del formulario (ahora es un array)
            if ($uploadedFiles) { // Si hay imágenes
                $destination = $this->getParameter('kernel.project_dir') . '/public/images'; // Obtenemos la ruta de la carpeta images
                
                foreach ($uploadedFiles as $uploadedFile) { // Recorremos cada imagen subida
                    $isbn = $book->getIsbn(); 
                    // Generamos un nombre único para cada imagen para evitar que choquen, ya que al subir una imagen esta "hereda como nombre" 
                    // el isbn del libro, si hay varias imágenes necesitamos el uniqid para que no tengan el mismo nombre y no se sobrescriban entre sí
                    $newFilename = ($isbn ?: uniqid()) . '-' . uniqid() . '.' . $uploadedFile->guessExtension(); 
                    
                    // Intentamos mover la imagen a la carpeta images
                    try {
                        $uploadedFile->move($destination, $newFilename); // Movemos la imagen a la carpeta images
                        
                        $image = new Image(); // Creamos una nueva imagen
                        $image->setRutaArchivo('/images/' . $newFilename); // Guardamos la ruta de la imagen
                        $image->setBook($book); // Asociamos la imagen al libro
                        $this->em->persist($image); // Guardamos la imagen en la base de datos
                    } catch (\Exception $e) {
                        // ya que catch esta vacío, php termina el try-catch y como estamos dentro de un foreach, pasa a la siguiente imagen (es como poner 'continue')
                    }
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

        // Seguridad: Solo el dueño o un ADMIN puede borrar el libro
        if ($bookDelete->getOwner() !== $this->getUser() && !$this->isGranted('ROLE_ADMIN')) {
            return new JsonResponse(['error' => 'No tienes permiso para borrar este libro'], 403);
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

    #[Route('/book/edit/{isbn}', name: 'edit_book', methods: ['POST'])] // usamos POST porque vamos a modificar el libro
    public function edit_book(Request $request, $isbn): Response { 
        /*
           $request -> contiene los datos enviados por el formulario (su titulo, autor...)
           $isbn -> contiene el isbn del libro que se quiere editar
        */
        
        $book = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]); // Buscamos el libro por su isbn

        if (!$book) { // Si no existe el libro
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        // Seguridad: Solo el dueño o un ADMIN puede editar el libro
        if ($book->getOwner() !== $this->getUser() && !$this->isGranted('ROLE_ADMIN')) { // Si el dueño del libro no es el usuario logueado y no es admin
            return new JsonResponse(['error' => 'No tienes permiso para editar este libro'], 403);
        }

        
        /* MINI REPASO */
        // Creamos el formulario y le pasamos el libro que queremos editar
        $form = $this->createForm(BookType::class, $book);
        /*
            BookType::class: Es el "mapa" o las reglas (qué campos existen, cuáles son obligatorios, qué validaciones tienen).
            $book: Es el libro real que acabamos de sacar de la base de datos. Por lo tanto, el formulario ya viene "relleno" con los datos del libro.

            Lo que ocurre: Al pasarle $book como segundo argumento, el formulario se precarga con los datos de ese libro. Es como poner el libro dentro 
            de un molde. A partir de ahora, todo lo que le pase al formulario le pasará automáticamente al objeto $book.
        */

        // Procesamos los datos enviados (mismo formato que add_book)
        $form->submit(array_merge($request->request->all(), $request->files->all()), false); // false para permitir actualizaciones parciales
        /**
         * array_merge($request->request->all(), $request->files->all()): Aqui unificamos la información
         * Une los datos enviados por el formulario (request->all()) con las imágenes subidas (request->files->all()).
         * 
         * false: Indica que no queremos validar los datos del formulario, es decir, que solo queremos sobreescribir lo que editemos, si fuera
         * true, borraría todo el libro y lo volvería a crear con los datos que le pasemos.
        **/

        // Gracias a estas 2 líneas editando el libro, no tienes que hacer if ($nuevoTitulo) $book->setTitle($nuevoTitulo); para cada uno de los 10 o 12 campos 
        // que tiene tu entidad. Symfony lo hace por ti comparando el paquete con el objeto.



        if ($form->isValid()) {
            // Normalización de categoría (primera letra mayúscula y el resto minúsculas)
            if ($book->getCategory()) {
                $book->setCategory(ucfirst(strtolower($book->getCategory())));
            }

            // Manejo de nuevas imágenes (si el usuario sube nuevas imágenes, se guardan)
            $uploadedFiles = $form->get('image')->getData(); // getData() obtiene los datos del formulario (en este caso, las imágenes subidas)

            // Si el usuario sube nuevas imágenes
            if ($uploadedFiles) { 
                // guarda la imagen físicamente en la carpeta /public/images y crea una nueva entidad Image en la base de datos (vinculada al libro)
                $destination = $this->getParameter('kernel.project_dir') . '/public/images';
                foreach ($uploadedFiles as $uploadedFile) {
                    // Generamos un nombre único para cada imagen para evitar que choquen, ya que al subir una imagen esta "hereda como nombre" 
                    // el isbn del libro, si hay varias imágenes necesitamos el uniqid para que no tengan el mismo nombre y no se sobrescriban entre sí
                    $newFilename = ($book->getIsbn() ?: uniqid()) . '-' . uniqid() . '.' . $uploadedFile->guessExtension();
                    $uploadedFile->move($destination, $newFilename);
                    
                    $image = new Image();
                    $image->setRutaArchivo('/images/' . $newFilename); // Guardamos la ruta de la imagen 
                    $image->setBook($book); // Asociamos la imagen al libro
                    $this->em->persist($image);
                }
            }

            $this->em->flush();
            return new JsonResponse($book->toArray());
        }

        $errors = []; // Array para guardar los errores
        foreach ($form->getErrors(true) as $error) { // Recorremos todos los errores del formulario
            $errors[] = $error->getMessage(); // Guardamos el mensaje de error en el array $errors
        }

        return new JsonResponse(['errors' => $errors], 400); // Devolvemos el array de errores en formato JSON
    }



    /**
     * Endpoint para la importación masiva de libros vía JSON.
     * Estructura esperada: {"books": [{"isbn": "...", "title": "...", ...}]}
     */
    #[Route('/book/import', name: 'api_book_import_json', methods: ['POST'])]
    public function import_books(Request $request, ValidatorInterface $validator): Response {
        $content = $request->getContent(); // Obtenemos el contenido del request/petición (el archivo JSON)
        $data = json_decode($content, true); // Decodificamos el contenido del request y lo convertimos a un array asociativo

        if (!$data || !isset($data['books'])) { // Si el contenido del request no es válido o no tiene la clave 'books'
            return new JsonResponse(['error' => 'Formato JSON inválido. Se espera {"books": [...]}'], 400); // Devolvemos un error
        }

        $importedCount = 0; // Contador de libros importados
        $skippedCount = 0; // Contador de libros saltados (por ISBN duplicado o inválido)

        foreach ($data['books'] as $bookData) { // Recorremos todos los libros
            $isbn = $bookData['isbn'] ?? null; // Obtenemos el ISBN del libro
            
            // Antes de guardar el libro, verificamos si el ISBN es válido
            // Si el ISBN no es válido, saltamos el libro
            if (!$isbn) { 
                $skippedCount++; // Incrementamos el contador de libros saltados
                continue; // Pasamos al siguiente libro
            }

            // Y verificamos si ya existe
            $existingBook = $this->em->getRepository(Book::class)->findOneBy(['isbn' => $isbn]); // Buscamos si el libro ya existe
            if ($existingBook) { // Si el libro ya existe
                $skippedCount++; // Incrementamos el contador de libros saltados
                continue; // Pasamos al siguiente libro
            }

            // 3. Creación del objeto y mapeo de datos
            $book = new Book();
            $book->setIsbn($isbn);
            $book->setTitle($bookData['title'] ?? 'Sin título');
            $book->setSubtitle($bookData['subtitle'] ?? null);
            $book->setAuthor($bookData['author'] ?? 'Anónimo');
            $book->setPublisher($bookData['publisher'] ?? null);
            $book->setPages((int)($bookData['pages'] ?? 0));
            $book->setDescription($bookData['description'] ?? null);
            $book->setWebsite($bookData['website'] ?? null);
            
            // Categoría con normalización
            $category = $bookData['category'] ?? 'General';
            $book->setCategory(ucfirst(strtolower($category)));

            // Fecha de publicación
            if (isset($bookData['published'])) {
                try { 
                    $book->setPublished(new \DateTimeImmutable($bookData['published']));
                } catch (\Exception $e) { 
                    $book->setPublished(new \DateTimeImmutable());
                }
            } else {
                $book->setPublished(new \DateTimeImmutable());
            }

            // 4. VALIDACIÓN ESTRICTA (Detección de las reglas de Book.php)
            // Validamos el libro ya relleno según las reglas definidas en la entidad Book.php (Asserts)
            $errors = $validator->validate($book); 
            if (count($errors) > 0) { // Si hay errores de validación (ej: descripción demasiado larga, autor con números...), lo saltamos
                $skippedCount++;
                continue;
            }

            $book->setOwner($this->getUser()); // Asignamos el usuario logueado como dueño del libro
            $this->em->persist($book);
            $importedCount++;
        }


        $this->em->flush(); // Guardamos todos los cambios en la base de datos

        // Devolvemos un mensaje de éxito con el número de libros importados y saltados
        return new JsonResponse([
            'message' => 'Importación completada',
            'imported' => $importedCount, 
            'skipped' => $skippedCount 
        ]);
    }

    #[Route('/book/year/{year}', name: 'books_by_year', methods: ['GET'])]
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
    #[Route('/book/category/{category}', name: 'category_book', methods: ['GET'])]
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


    // La información de un libro concreto, pasando como parámetro un ISBN y que devolverá las imágenes
    // Obtenemos la información de un libro y sus imágenes asociadas
    // IMPORTANTE: Esta ruta debe ir AL FINAL de las que empiezan por /book/ para no interceptar otras (ej: /book/import)
    #[Route('/book/{isbn}', name: 'find_book', methods: ['GET'])]
    public function find_book($isbn): Response {
        $book = $this->em->getRepository(Book::class)->findBookImagen($isbn);
        
        if (!$book) {
            return new JsonResponse(['error' => 'Libro no encontrado'], 404);
        }

        return new JsonResponse($book->toArray());
    }

    // Webservices REST que permiten obtener los libros de un usuario concreto
    #[Route('/api/me/books', name: 'app_my_books', methods: ['GET'])]
    public function my_books(): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'No estás identificado'], 401);
        }

        $books = $this->em->getRepository(Book::class)->findBy(['owner' => $user]);
        $data = [];

        foreach ($books as $book) {
            $data[] = $book->toArray(); // Convertimos cada libro a un array y lo guardamos en $data
        }

        return new JsonResponse($data);
    }
}