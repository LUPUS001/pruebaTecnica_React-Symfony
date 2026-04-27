<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;


final class AuthController extends AbstractController
{
    // Esta ruta nos devolverá la información del usuario logueado, quien es y los permisos que tiene (si es admin o usuario normal)
    #[Route('/api/user/status', name: 'api_user_status', methods: ['GET'])]
    public function status(): JsonResponse // JsonResponse es una clase de Symfony que nos permite devolver una respuesta en formato JSON
    {
        $user = $this->getUser(); // Obtenemos el usuario logueado

        if (!$user) { // Si no hay usuario logueado
            return new JsonResponse(['logged_in' => false], 401); // Devolvemos un error 401 
        }

        return new JsonResponse([ // Devolvemos un JSON con la información del usuario logueado
            'logged_in' => true, 
            'user' => [ // Objeto con la información del usuario
                'email' => $user->getUserIdentifier(), // Obtenemos el email del usuario
                'roles' => $user->getRoles(), // Obtenemos los roles del usuario (ROLE_ADMIN o ROLE_USER)
                'photo' => $user->getPhoto(), // Obtenemos la ruta de la foto de perfil
            ]
        ]);
    }

    #[Route('/logout-success', name: 'logout_success')]
    public function logoutSuccess(): Response
    {
        return $this->redirect($this->getParameter('frontend_url')); // Redirigimos al usuario a la página de inicio de React cuando cierre sesión
    }
}

// logged_in: true -> hay usuario logueado, false -> no hay usuario logueado
// user: {email: "[EMAIL_ADDRESS]", roles: ["ROLE_ADMIN"]} -> información del usuario logueado