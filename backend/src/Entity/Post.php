<?php

namespace App\Entity;

use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PostRepository::class)]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['default', 'detail'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['default', 'detail'])]
    private ?User $user = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['default', 'detail'])]
    private string $content;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['default', 'detail'])]
    private ?\DateTime $time = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['default', 'detail'])]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['default', 'detail'])]
    private bool $censored = false;

    #[ORM\Column(type: Types::STRING, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $mediaUrl = null;

    #[ORM\OneToMany(targetEntity: Like::class, mappedBy: 'post', orphanRemoval: true)]
    private Collection $likes;

    #[ORM\ManyToMany(targetEntity: Hashtag::class, mappedBy: 'posts')]
    #[Groups(['default', 'detail'])]
    private Collection $hashtags;

    #[ORM\ManyToOne(targetEntity: self::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    #[Groups(['default', 'detail'])]
    private ?Post $retweetedFrom = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['default', 'detail'])]
    private ?string $retweetComment = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->likes = new ArrayCollection();
        $this->hashtags = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;
        return $this;
    }

    public function getTime(): ?\DateTime
    {
        return $this->time;
    }

    public function setTime(?\DateTime $time): static
    {
        $this->time = $time;
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
            $like->setPost($this);
        }
        return $this;
    }

    public function removeLike(Like $like): static
    {
        if ($this->likes->removeElement($like)) {
            if ($like->getPost() === $this) {
                $like->setPost(null);
            }
        }
        return $this;
    }

    public function isCensored(): bool
    {
        return $this->censored;
    }

    public function setCensored(bool $censored): static
    {
        $this->censored = $censored;
        return $this;
    }

    public function getMediaUrl(): ?string
    {
        return $this->mediaUrl;
    }

    public function setMediaUrl(?string $mediaUrl): static
    {
        $this->mediaUrl = $mediaUrl;
        return $this;
    }

    /**
     * @return Collection<int, Hashtag>
     */
    public function getHashtags(): Collection
    {
        return $this->hashtags;
    }

    public function addHashtag(Hashtag $hashtag): static
    {
        if (!$this->hashtags->contains($hashtag)) {
            $this->hashtags->add($hashtag);
            $hashtag->addPost($this);
        }
        return $this;
    }

    public function removeHashtag(Hashtag $hashtag): static
    {
        if ($this->hashtags->removeElement($hashtag)) {
            $hashtag->removePost($this);
        }
        return $this;
    }

    public function getRetweetedFrom(): ?Post
    {
        return $this->retweetedFrom;
    }

    public function setRetweetedFrom(?Post $retweetedFrom): static
    {
        $this->retweetedFrom = $retweetedFrom;
        return $this;
    }

    public function getRetweetComment(): ?string
    {
        return $this->retweetComment;
    }

    public function setRetweetComment(?string $retweetComment): static
    {
        $this->retweetComment = $retweetComment;
        return $this;
    }
}
