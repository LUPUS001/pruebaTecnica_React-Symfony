<?php

namespace App\Repository;

use App\Entity\Book;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Book>
 */
class BookRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Book::class);
    }

    public function findYear($year, $limit = null, $offset = null) // limit y offset son para paginación
    {
        // El QueryBuilder es la forma más segura y profesional de crear consultas en Symfony.
        $qb = $this->createQueryBuilder('book')
            ->where('book.published LIKE :fecha')
            ->setParameter('fecha', $year . "%") 
            // setParameter limpia el valor para evitar ataques de Inyección SQL.
            // El símbolo % indica que busque cualquier fecha que "empiece" por ese año.
            ->orderBy('book.id', 'DESC');

        // Si no son null, aplicamos paginación
        if ($limit !== null) {
            $qb->setMaxResults($limit);
        }

        // OFFSET indica dónde empezar a leer los resultados (útil para saltar páginas)
        if ($offset !== null) {
            $qb->setFirstResult($offset);
        }

        // Ejecutamos la consulta y devolvemos los resultados
        return $qb->getQuery()->getResult();
    }

    // Contamos los libros de un año específico (sin paginación)
    public function countYear($year)
    {
        return $this->createQueryBuilder('book')
            ->select('count(book.id)')
            ->where('book.published LIKE :fecha')
            ->setParameter('fecha', $year . "%")
            ->getQuery()
            ->getSingleScalarResult(); // devuelve un solo resultado (en este caso, el conteo de libros) 
    }

    // Buscamos un libro por su ISBN y traemos su imagen (y la imagen se une al libro)
    public function findBookImagen($isbn)
    {
        // Left Join: une la tabla Book con la tabla Image
        // addSelect: selecciona los datos de la imagen para que los traiga junto con los del libro
        // where: filtra por el ISBN que le pasamos
        // getOneOrNullResult: devuelve un solo resultado (o null si no se encuentra)
        /* 
         ESTA ERA LA FORMA CON DQL (STRING):
         return $this->getEntityManager()->createQuery('
         SELECT book
         FROM App\Entity\Book book 
         LEFT JOIN FETCH book.images
         WHERE book.isbn = :isbn
         ')
         ->setParameter('isbn', $isbn)
         ->getOneOrNullResult(); 
         */

        // ESTA ES LA FORMA CON QUERY BUILDER (MÁS SEGURA Y ESTÁNDAR):
        return $this->createQueryBuilder('book')
            ->leftJoin('book.images', 'images')
            ->addSelect('images')
            ->where('book.isbn = :isbn')
            ->setParameter('isbn', $isbn)
            ->getQuery()
            ->getOneOrNullResult();
    }

    //    /**
//     * @return Book[] Returns an array of Book objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('b')
//            ->andWhere('b.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('b.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    } 

    //    public function findOneBySomeField($value): ?Book
//    {
//        return $this->createQueryBuilder('b')
//            ->andWhere('b.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}