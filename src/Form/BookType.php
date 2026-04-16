<?php

namespace App\Form;

use App\Entity\Book;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class BookType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('isbn')
            ->add('title')
            ->add('subtitle')
            ->add('author')
            ->add('published', null, [
                'widget' => 'single_text',
            ])
            ->add('publisher')
            ->add('pages')
            ->add('description')
            ->add('website')
            ->add('category')
            // cambio de nombre a 'image' para que coincida con el nombre del campo en el frontend
            ->add('image', FileType::class, [
                'label' => 'Imagen (jpg, webp...)',
                'mapped' => false, 
                'required' => false,
                'constraints' => [
                    new Assert\File (
                        maxSize: '30000k', // 30MB
                        extensions: ['webp', 'jpg', 'jpeg', 'png'],
                        extensionsMessage: 'Por favor sube un formato de archivo valido (png, webp, jpg, jpeg)',
                    )
                ],
            ])
            ->add('Subir', SubmitType::class)
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Book::class,
            'csrf_protection' => false, // Desactivamos la protección CSRF porque no la estamos usando en el frontend (es una API REST) 
        ]);
    }
}