<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

final class LoginController extends AbstractController
{
    #[Route('/login', name: 'app_login')]
    public function index(AuthenticationUtils $authenticationUtils): Response
    {
        // Si el usuario ya tiene sesión abierta, lo redirige directamente de vuelta a React en lugar de mostrarle el formulario otra vez.
        if ($this->getUser()) { 
            return $this->redirect('http://localhost:5173/');
        }

        // aquí guardaremos el error que haya ocurrido mientras se intentaba iniciar de sesion (Usuario no encontrado, contraseña incorrecta...)

        $error = $authenticationUtils->getLastAuthenticationError(); 

        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('login/index.html.twig', [
            'controller_name' => 'LoginController',
            'last_username' => $lastUsername,
            'error' => $error
        ]);
    }

    #[Route('/logout', name: 'app_logout')]
    public function logout(AuthenticationUtils $authenticationUtils): void
    {
        
    }
}
