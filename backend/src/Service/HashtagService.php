<?php

namespace App\Service;

use App\Entity\Post;
use App\Repository\HashtagRepository;
use Doctrine\ORM\EntityManagerInterface;

class HashtagService
{
    public function __construct(
        private HashtagRepository $hashtagRepository,
        private EntityManagerInterface $em
    ) {}

    /**
     * Extract and apply hashtags from post content
     * Finds all #word patterns and creates/links hashtags
     */
    public function extractAndApplyHashtags(Post $post): void
    {
        $content = $post->getContent();

        // Remove existing hashtags from post to avoid duplicates
        foreach ($post->getHashtags() as $hashtag) {
            $post->removeHashtag($hashtag);
        }

        // Find all hashtags in the content using regex
        // Pattern: # followed by word characters (letters, numbers, underscores)
        $pattern = '/#(\w+)/';
        if (preg_match_all($pattern, $content, $matches)) {
            foreach ($matches[1] as $hashtagName) {
                // Find or create the hashtag
                $hashtag = $this->hashtagRepository->findOrCreate($hashtagName);
                $post->addHashtag($hashtag);
            }
        }

        $this->em->flush();
    }

    /**
     * Extract hashtag names from content (for response/display purposes)
     */
    public function extractHashtagNames(string $content): array
    {
        $pattern = '/#(\w+)/';
        $names = [];

        if (preg_match_all($pattern, $content, $matches)) {
            $names = array_map('strtolower', $matches[1]);
        }

        return array_unique($names);
    }

    /**
     * Extract mention names from content (@username patterns)
     */
    public function extractMentionNames(string $content): array
    {
        $pattern = '/@(\w+)/';
        $names = [];

        if (preg_match_all($pattern, $content, $matches)) {
            $names = array_map('strtolower', $matches[1]);
        }

        return array_unique($names);
    }

    /**
     * Highlight hashtags and mentions in content for display
     * Returns content with HTML markup for frontend highlighting
     */
    public function highlightHashtagsAndMentions(string $content): string
    {
        // Highlight hashtags: #word -> <span class="hashtag">#word</span>
        $content = preg_replace(
            '/#(\w+)/',
            '<span class="hashtag">#$1</span>',
            $content
        );

        // Highlight mentions: @username -> <span class="mention">@username</span>
        $content = preg_replace(
            '/@(\w+)/',
            '<span class="mention">@$1</span>',
            $content
        );

        return $content;
    }
}
