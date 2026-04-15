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

    public function findYear($year)
    {
        return $this->getEntityManager()->createQuery('
            SELECT book 
            FROM App\Entity\Book book
            WHERE book.published LIKE :fecha
        ')
            ->setParameter('fecha', $year . "%")
            ->getResult();
    }

    public function findBookImagen($isbn)
    {
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