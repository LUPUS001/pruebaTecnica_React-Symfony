<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Validator\Constraints\File;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email')
            ->add('password', PasswordType::class)
            ->add('description', TextareaType::class, [
                'required' => false,
                'attr' => ['rows' => 4]
            ])
            ->add('photo', FileType::class, [
                'label' => 'Foto de perfil (Opcional)',
                'mapped' => false, // No mapeado a la entidad directamente para manejarlo manualmente
                'required' => false,
                'constraints' => [
                    new File(
                        maxSize: '2M',
                        mimeTypes: [
                            'image/jpg',
                            'image/jpeg',
                            'image/webp',
                            'image/png',
                        ],
                        mimeTypesMessage: 'Por favor sube una imagen válida (JPG, JPEG, WEBP o PNG)',
                    )
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}