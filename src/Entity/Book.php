<?php

namespace App\Entity;

use App\Repository\BookRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BookRepository::class)]
class Book
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $isbn = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $subtitle = null;

    #[ORM\Column(length: 255)]
    private ?string $author = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $published = null;

    #[ORM\Column(length: 255)]
    private ?string $publisher = null;

    #[ORM\Column]
    private ?int $pages = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(length: 255)]
    private ?string $category = null;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'book')]
    private Collection $images;

    public function __construct($isbn = null, $title = null, $subtitle = null, $author = null, $published = null, $publisher = null, $pages = null, $description = null, $website = null, $category = null)
    {
        $this->isbn = $isbn;
        $this->title = $title;
        $this->subtitle = $subtitle;
        $this->author = $author;
        $this->published = $published;
        $this->publisher = $publisher;
        $this->pages = $pages;
        $this->description = $description;
        $this->website = $website;
        $this->category = $category;
        $this->images = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIsbn(): ?string
    {
        return $this->isbn;
    }

    public function setIsbn(string $isbn): static
    {
        $this->isbn = $isbn;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getSubtitle(): ?string
    {
        return $this->subtitle;
    }

    public function setSubtitle(string $subtitle): static
    {
        $this->subtitle = $subtitle;

        return $this;
    }

    public function getAuthor(): ?string
    {
        return $this->author;
    }

    public function setAuthor(string $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getPublished(): ?\DateTimeImmutable
    {
        return $this->published;
    }

    public function setPublished(\DateTimeImmutable $published): static
    {
        $this->published = $published;

        return $this;
    }

    public function getPublisher(): ?string
    {
        return $this->publisher;
    }

    public function setPublisher(string $publisher): static
    {
        $this->publisher = $publisher;

        return $this;
    }

    public function getPages(): ?int
    {
        return $this->pages;
    }

    public function setPages(int $pages): static
    {
        $this->pages = $pages;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(string $website): static
    {
        $this->website = $website;

        return $this;
    }

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    /**
     * @return Collection<int, Image>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(Image $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setBook($this);
        }

        return $this;
    }

    public function removeImage(Image $image): static
    {
        if ($this->images->removeElement($image)) {
            // set the owning side to null (unless already changed)
            if ($image->getBook() === $this) {
                $image->setBook(null);
            }
        }

        return $this;
    }

    public function toArray(): array
    {
        $images = [];
        foreach ($this->getImages() as $image) {
            $images[] = [
                'id' => $image->getId(),
                'ruta' => $image->getRutaArchivo(),
            ];
        }

        return [
            'id' => $this->getId(),
            'isbn' => $this->getIsbn(),
            'title' => $this->getTitle(),
            'subtitle' => $this->getSubtitle(),
            'author' => $this->getAuthor(),
            'published' => $this->getPublished() ? $this->getPublished()->format('Y-m-d') : null,
            'publisher' => $this->getPublisher(),
            'pages' => $this->getPages(),
            'description' => $this->getDescription(),
            'website' => $this->getWebsite(),
            'category' => $this->getCategory(),
            'total_images' => count($images),
            'images' => $images,
        ];
    }
}