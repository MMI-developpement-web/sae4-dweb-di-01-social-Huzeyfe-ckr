<?php

namespace App\Entity;

use App\Repository\HashtagRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: HashtagRepository::class)]
class Hashtag
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['default', 'detail'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['default', 'detail'])]
    private string $name; // e.g., "travel" (without #)

    #[ORM\ManyToMany(targetEntity: Post::class, inversedBy: 'hashtags')]
    #[ORM\JoinTable(name: 'post_hashtag')]
    private Collection $posts;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['default', 'detail'])]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        // Normaliser: enlever le # si présent et convertir en minuscules
        $this->name = strtolower(ltrim($name, '#'));
        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
        }
        return $this;
    }

    public function removePost(Post $post): static
    {
        $this->posts->removeElement($post);
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}
