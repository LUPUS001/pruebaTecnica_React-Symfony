<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\UserType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserController extends AbstractController
{
    private $em;
    public function __construct(EntityManagerInterface $em) {
        $this->em = $em;
    }

    #[Route('/registration', name: 'user_registration')]
    public function userRegistration(Request $request, UserPasswordHasherInterface $passwordHasher): Response
    {
        $user = new User();
        $registration_form = $this->createForm(UserType::class, $user);
        $registration_form->handleRequest($request);
        
        if ($registration_form->isSubmitted() && $registration_form->isValid()) { 
            // Manejo de la foto de perfil
            $photoFile = $registration_form->get('photo')->getData();
            if ($photoFile) {
                $destination = $this->getParameter('kernel.project_dir') . '/public/uploads/profiles';
                $newFilename = uniqid() . '.' . $photoFile->guessExtension();

                try {
                    $photoFile->move($destination, $newFilename);
                    $user->setPhoto('/uploads/profiles/' . $newFilename);
                } catch (\Exception $e) {
                    // Si falla la subida, simplemente no guardamos la foto
                }
            }

            $contrasenaEnTextoPlano = $registration_form->get('password')->getData();
            $contrasenaHasheada = $passwordHasher->hashPassword(
                $user,
                $contrasenaEnTextoPlano
            );
            $user->setPassword($contrasenaHasheada);
            $user->setRoles(['ROLE_USER']);
        
            $this->em->persist($user);
            $this->em->flush();
            return $this->redirectToRoute('app_login'); // Redirigimos al login tras el éxito
        };
        return $this->render('user/index.html.twig', [
            'registration_form' => $registration_form->createView(),
        ]);
    }

    #[Route('/user/update', name: 'update_user')]
    public function update(): Response
    {
        $user = $this->em->getRepository(User::class)->find(2);
        return new JsonResponse(['success' => true, 'message' => 'Rol actualizado']);
    }
}
