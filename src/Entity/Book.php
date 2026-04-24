<?php

namespace App\Entity;

use App\Repository\BookRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

#[ORM\Entity(repositoryClass: BookRepository::class)]
#[UniqueEntity(fields: ['isbn'], message: 'Este ISBN ya está registrado.')]
class Book
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $owner = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Assert\NotBlank(message: 'El ISBN es obligatorio.')]
    #[Assert\Isbn(message: 'El formato del ISBN no es válido.')]
    private string $isbn;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El título es obligatorio.')]
    #[Assert\Length(max: 255)]
    private string $title;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255)]
    private ?string $subtitle = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'El autor es obligatorio.')]
    #[Assert\Regex(
        pattern: '/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+$/u',
        message: 'El autor solo puede contener letras, espacios y puntos.'
    )]
    private string $author;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'La fecha de publicación es obligatoria.')]
    private \DateTimeImmutable $published;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $publisher = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'El número de páginas es obligatorio.')]
    #[Assert\PositiveOrZero(message: 'El número de páginas no puede ser negativo.')]
    private int $pages;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Regex(
        pattern: '/^(\s*\S+\s*){0,100}$/',
        message: 'La descripción no puede tener más de 100 palabras.'
    )]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $website = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'La categoría es obligatoria.')]
    #[Assert\Length(
        min: 3,
        minMessage: 'La categoría debe tener al menos {{ limit }} letras.'
    )]
    private string $category;

    /**
     * @var Collection<int, Image>
     */
    #[ORM\OneToMany(targetEntity: Image::class, mappedBy: 'book')]
    private Collection $images;

    public function __construct($isbn = '', $title = '', $subtitle = null, $author = null, $published = null, $publisher = null, $pages = null, $description = null, $website = null, $category = null)
    {
        $this->isbn = $isbn ?? '';
        $this->title = $title ?? '';
        $this->subtitle = $subtitle;
        $this->author = $author ?? '';
        $this->published = $published ?? new \DateTimeImmutable();
        $this->publisher = $publisher;
        $this->pages = $pages ?? 0;
        $this->description = $description;
        $this->website = $website;
        $this->category = $category ?? '';
        $this->images = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIsbn(): string
    {
        return $this->isbn;
    }

    public function setIsbn(string $isbn): static
    {
        $this->isbn = $isbn;

        return $this;
    }

    public function getTitle(): string
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

    public function getAuthor(): string
    {
        return $this->author;
    }

    public function setAuthor(string $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getPublished(): \DateTimeImmutable
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

    public function setPublisher(?string $publisher): static
    {
        $this->publisher = $publisher;

        return $this;
    }

    public function getPages(): int
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

    public function getCategory(): string
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

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

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