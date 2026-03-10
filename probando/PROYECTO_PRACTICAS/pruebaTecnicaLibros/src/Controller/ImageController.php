<?php

namespace App\Controller;

use App\Entity\Book;
use App\Entity\Image;
use App\Form\ImageForm;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

final class ImageController extends AbstractController
{
    private $entityManager;
    public function __construct(EntityManagerInterface $entityManager){
        $this->entityManager = $entityManager;
    }
      
    #[Route('/image/add/{id}', name: 'app_image')]
    public function index(Request $request, SluggerInterface $slugger, $id): Response
    {
      // 1. BUSCAR EL LIBRO
        //buscamos el libro al que queremos asignarle la imagen
        $book = $this->entityManager->getRepository(Book::class)->find($id);
        
        if (!$book) {//Si el libro buscado, no existe
            return new JsonResponse(['error'=>'Libro no encontrado / no existe'], 404);
        }//salta el mensaje de error
    
        $image = new Image();

        // Relacionamos el libro con la imagen para que el formulario lo pueda setear también
        $image->setBook($book);


      // 2. CREAMOS EL FORMULARIO en donde subiremos la imagen
        $form = $this->createForm(ImageForm::class, $image);
        $form->handleRequest($request);
        //procesa los datos que el usuario ha introducido en el formulario

        //comprobamos que se haya enviado el formulario y sea valido
        if ($form->isSubmitted() && $form->isValid()) {
            //obtenemos el "archivo"
            $archivoImagen = $form->get('url')->getData();
            
            
            //Si la imagen que ha subido el usuario existe
            if($archivoImagen){
                $originalFilename = pathinfo($archivoImagen->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename= $slugger->slug($originalFilename);
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $archivoImagen -> guessExtension();
                
                // 3. Preparar el DIRECTORIO en donde GUARDAREMOS LA IMAGEN
                $directorio = $this->getParameter('images_directory'); //images_directory es el nombre del parámetro que nos lleva al parámetro, no el propio directorio
                try {
                    $archivoImagen -> move($directorio, $newFilename);

                } catch(FileException $e){
                    throw new Exception('Hay problemas con tu imagen');
                }
                
                $image -> setUrl($newFilename);
            }
            $this->entityManager->persist($image);
            $this->entityManager->flush();
            
            return $this->redirectToRoute('app_allbooks');
        }
        
        return $this->render('image/index.html.twig', [
            'form' => $form->createView(),
            'book' => $book
        ]);
    }
}
