/**
 * Utility to parse and render hashtags and mentions in text
 */

export function parseHashtagsAndMentions(text: string, onHashtagClick?: (tag: string) => void, onMentionClick?: (mention: string) => void | Promise<void>) {
  // Pattern to match hashtags (#word) and mentions (@word)
  const pattern = /(#\w+|@\w+)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('#')) {
      const hashtag = part.substring(1); // Remove #
      return (
        <a
          key={index}
          href={`/search/hashtag/${hashtag}`}
          onClick={(e) => {
            e.preventDefault();
            onHashtagClick?.(hashtag);
          }}
          className="text-blue-400 hover:underline"
          title={`#${hashtag}`}
        >
          <span className="text-blue-400 font-semibold">{part}</span>
        </a>
      );
    }

    if (part.startsWith('@')) {
      const mention = part.substring(1); // Remove @
      return (
        <a
          key={index}
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            await onMentionClick?.(mention);
          }}
          className="text-blue-400 hover:underline"
          title={`@${mention}`}
        >
          <span className="text-blue-400 font-semibold">{part}</span>
        </a>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

/**
 * Component to display text with interactive hashtags and mentions
 */
export function InteractiveText({ text, onHashtagClick, onMentionClick }: {
  text: string;
  onHashtagClick?: (tag: string) => void;
  onMentionClick?: (mention: string) => void | Promise<void>;
}) {
  return (
    <>{parseHashtagsAndMentions(text, onHashtagClick, onMentionClick)}</>
  );
}
