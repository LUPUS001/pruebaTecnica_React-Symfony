<?php

namespace App\Form;

use App\Entity\Book;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class BookType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('isbn') // Campo de texto para el ISBN
            ->add('title') // "" para el título
            ->add('subtitle') // "" para el subtítulo
            ->add('author') // "" para el autor

            ->add('published', DateType::class, [ // Campo de fecha para la fecha de publicación
                'widget' => 'single_text', 
                /* Formato de fecha en una sola línea (ej: 2022-01-01) 
                   si no pusieramos single_text, nos aparecerian 3 campos (día, mes y año) en lugar de solo 1 campo de fecha 
                   y no podriamos enviar la fecha desde React, ya que Symfony y React usarian diferentes formatos de fecha
                */

                'input' => 'datetime_immutable', // Formato de fecha inmutable (no se puede modificar)
                'required' => true, // Es obligatorio indicar una fecha de publicación
            ])

            ->add('publisher') // "" para la editorial
            ->add('pages') // "" para el número de páginas
            ->add('description') // "" para la descripción
            ->add('website') // "" para la página web
            ->add('category') // "" para la categoría

            ->add('image', FileType::class, [ // Campo de archivo para la imagen
                'label' => 'Imagen (jpg, webp...)',
                'mapped' => false, 
                /* Indicamos que no guarde la imagen en el objeto Book, ya que lo procesamos manualmente en el controlador 
                   para guardar la imagen en la ruta que indiquemos (public/images) y que la ruta se guarde en la tabla Image */

                'required' => false, // No es obligatorio subir una imagen
                
                'constraints' => [ // Restricciones para el archivo
                    new Assert\File (
                        maxSize: '30000k', // 30MB
                        extensions: ['webp', 'jpg', 'jpeg', 'png'],
                        extensionsMessage: 'Por favor sube un formato de archivo valido (png, webp, jpg, jpeg)',
                    )
                ],
            ])
            ->add('Subir', SubmitType::class) // Botón para enviar el formulario
        ;
    }

    // Configuración de opciones del formulario
    public function configureOptions(OptionsResolver $resolver): void 
    {
        $resolver->setDefaults([ // Valores por defecto para el formulario
            'data_class' => Book::class, // Clase de la entidad que se está utilizando
            'csrf_protection' => false, // Desactivamos la protección CSRF porque no la estamos usando en el frontend (es una API REST) 
        ]);
    }
}