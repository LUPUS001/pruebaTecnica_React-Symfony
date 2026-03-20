<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class LeerJsonController extends AbstractController {

    #[Route('/json', name: 'leerJson', methods: ['GET'])]
    public function leerJson(): Response 
    {
        // 1. Construir la ruta completa al archivo
        $path = $this->getParameter('kernel.project_dir') . '/public/books.json';

        // 2. Verificar si el archivo existe para evitar errores
        if (!file_exists($path)) {
            return new Response("El archivo no existe en: " . $path, 404);
        }

        $jsonContent = file_get_contents($path);
        $bookData = json_decode($jsonContent, true);

        // 3. Devolver una respuesta adecuada
        // Para ver el JSON estructurado:
        return new JsonResponse($bookData);
        
        // O si quieres ver el texto plano:
        // return new Response($jsonContent);
    }   
}

/* 
   Este commit lo hago para que veas separado el JSON, ya sea para revisarlo o para entender como
   lo lee y recibe el controlador antes de subirlo a la base de datos. 
*/