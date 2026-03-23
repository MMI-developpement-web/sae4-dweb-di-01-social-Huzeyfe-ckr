<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['default', 'detail'])]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['default', 'detail'])]
    private string $user;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['default', 'detail'])]
    private string $email;

    #[ORM\Column(length: 255)]
    private string $password;

    #[ORM\Column(length: 255)]
    #[Groups(['default', 'detail'])]
    private string $name;

    #[ORM\Column(length: 50)]
    #[Groups(['default', 'detail'])]
    private string $role = 'user';

    #[ORM\Column(type: 'boolean')]
    #[Groups(['default', 'detail'])]
    private bool $active = true;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $phone = null;

    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $pp = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['default', 'detail'])]
    private \DateTimeInterface $createdAt;

    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'user', orphanRemoval: true)]
    #[Groups(['detail'])]
    private Collection $posts;

    #[ORM\OneToOne(targetEntity: AccessToken::class, mappedBy: 'user', orphanRemoval: true)]
    private ?AccessToken $accessToken = null;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): string
    {
        return $this->user;
    }

    public function setUser(string $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): static
    {
        $this->active = $active;
        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;
        return $this;
    }

    public function getBirthDate(): ?\DateTimeInterface
    {
        return $this->birthDate;
    }

    public function setBirthDate(?\DateTimeInterface $birthDate): static
    {
        $this->birthDate = $birthDate;
        return $this;
    }

    public function getPp(): ?string
    {
        return $this->pp;
    }

    public function setPp(?string $pp): static
    {
        $this->pp = $pp;
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
            $post->setUser($this);
        }
        return $this;
    }

    public function removePost(Post $post): static
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getUser() === $this) {
                $post->setUser(null);
            }
        }
        return $this;
    }

    public function __toString(): string
    {
        // Prefer the display name, fall back to username or id
        if (!empty($this->name)) {
            return $this->name;
        }
        if (!empty($this->user)) {
            return $this->user;
        }
        return (string) $this->id;
    }

    // ============ UserInterface implementation ============

    /**
     * A visual identifier that represents this User.
     */
    public function getUserIdentifier(): string
    {
        return $this->user;
    }

    /**
     * @return string[]
     */
    public function getRoles(): array
    {
        $role = $this->role;
        
        // Add ROLE_ prefix if not already present
        if (!str_starts_with($role, 'ROLE_')) {
            $role = 'ROLE_' . strtoupper($role);
        }
        
        $roles = [$role];
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    /**
     * Erases sensitive data from the user.
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getAccessToken(): ?AccessToken
    {
        return $this->accessToken;
    }

    public function setAccessToken(?AccessToken $accessToken): self
    {
        $this->accessToken = $accessToken;
        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}
