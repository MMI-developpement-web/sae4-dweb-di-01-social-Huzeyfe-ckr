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
    private bool $blocked = false;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['default', 'detail'])]
    private bool $readOnly = false;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $phone = null;

    #[ORM\Column(type: 'date', nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $pp = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $banner = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $website = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $location = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['default', 'detail'])]
    private \DateTimeInterface $createdAt;

    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $posts;

    #[ORM\ManyToMany(targetEntity: Post::class)]
    #[ORM\JoinTable(name: 'user_pinned_posts')]
    #[ORM\OrderBy(['id' => 'DESC'])]
    #[Groups(['default', 'detail'])]
    private Collection $pinnedPosts;

    #[ORM\OneToOne(targetEntity: AccessToken::class, mappedBy: 'user', orphanRemoval: true)]
    private ?AccessToken $accessToken = null;

    #[ORM\OneToMany(targetEntity: Like::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $likes;

    #[ORM\OneToMany(targetEntity: Follow::class, mappedBy: 'follower', orphanRemoval: true)]
    private Collection $following;

    #[ORM\OneToMany(targetEntity: Follow::class, mappedBy: 'following', orphanRemoval: true)]
    private Collection $followers;

    #[ORM\OneToMany(targetEntity: BlockedUser::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $blockedUsers;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
        $this->pinnedPosts = new ArrayCollection();
        $this->likes = new ArrayCollection();
        $this->following = new ArrayCollection();
        $this->followers = new ArrayCollection();
        $this->blockedUsers = new ArrayCollection();
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

    public function isBlocked(): bool
    {
        return $this->blocked;
    }

    public function setBlocked(bool $blocked): static
    {
        $this->blocked = $blocked;
        return $this;
    }

    public function isReadOnly(): bool
    {
        return $this->readOnly;
    }

    public function setReadOnly(bool $readOnly): static
    {
        $this->readOnly = $readOnly;
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

    public function getBanner(): ?string
    {
        return $this->banner;
    }

    public function setBanner(?string $banner): static
    {
        $this->banner = $banner;
        return $this;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;
        return $this;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function setWebsite(?string $website): static
    {
        $this->website = $website;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
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

    /**
     * @return Collection<int, Like>
     */
    public function getLikes(): Collection
    {
        return $this->likes;
    }

    public function addLike(Like $like): static
    {
        if (!$this->likes->contains($like)) {
            $this->likes->add($like);
            $like->setUser($this);
        }
        return $this;
    }

    public function removeLike(Like $like): static
    {
        if ($this->likes->removeElement($like)) {
            if ($like->getUser() === $this) {
                $like->setUser(null);
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

    public function getFollowing(): Collection
    {
        return $this->following;
    }

    public function addFollowing(Follow $follow): self
    {
        if (!$this->following->contains($follow)) {
            $this->following->add($follow);
            $follow->setFollower($this);
        }
        return $this;
    }

    public function removeFollowing(Follow $follow): self
    {
        if ($this->following->removeElement($follow)) {
            if ($follow->getFollower() === $this) {
                $follow->setFollower(null);
            }
        }
        return $this;
    }

    public function getFollowers(): Collection
    {
        return $this->followers;
    }

    public function addFollowers(Follow $follow): self
    {
        if (!$this->followers->contains($follow)) {
            $this->followers->add($follow);
            $follow->setFollowing($this);
        }
        return $this;
    }

    public function removeFollowers(Follow $follow): self
    {
        if ($this->followers->removeElement($follow)) {
            if ($follow->getFollowing() === $this) {
                $follow->setFollowing(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Post>
     */
    public function getPinnedPosts(): Collection
    {
        return $this->pinnedPosts;
    }

    public function addPinnedPost(Post $pinnedPost): static
    {
        // Validate that the pinned post belongs to this user
        if ($pinnedPost->getUser() !== $this) {
            throw new \InvalidArgumentException('Cannot pin a post that does not belong to you');
        }
        if (!$this->pinnedPosts->contains($pinnedPost)) {
            $this->pinnedPosts->add($pinnedPost);
        }
        return $this;
    }

    public function removePinnedPost(Post $pinnedPost): static
    {
        $this->pinnedPosts->removeElement($pinnedPost);
        return $this;
    }

    // Legacy getter for backward compatibility
    public function getPinnedPost(): ?Post
    {
        return $this->pinnedPosts->first() ?: null;
    }
}
