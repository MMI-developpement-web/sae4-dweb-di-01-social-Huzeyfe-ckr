import { useState, useEffect, useCallback } from "react";
import { searchContent } from "../../lib/api";
import { debounce } from "../../lib/utils";
import Avatar from "./Avatar";
import Post from "./Post";
import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../../lib/api";

interface SearchBarProps {
  onSearchChange?: (query: string) => void;
  compact?: boolean; // true = compact mode (Home), false = full page mode (Search page)
}

export default function SearchBar({
  onSearchChange,
  compact = true,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    posts: PostType[];
    users: any[];
  }>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);

  // Fonction de recherche débounced
  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setSearchResults({ posts: [], users: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await searchContent({
          q,
          type: "all",
          sort: "date",
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ posts: [], users: [] });
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Mettre à jour la recherche quand la query change
  useEffect(() => {
    performSearch(query);
    onSearchChange?.(query);
  }, [query, performSearch, onSearchChange]);

  const getAvatarUrl = (user: any) => {
    if (user.pp && user.pp !== "null" && user.pp !== "") {
      return user.pp;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(user.user || "default")}/200`;
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className={`${compact ? "sticky top-0 z-20 bg-bg-black/95 backdrop-blur-sm border-b border-border-dark px-4 md:px-6 py-3" : "space-y-4 mb-6"}`}>
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="🔍 Chercher des posts ou des utilisateurs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-neutral-900 text-text-white placeholder-text-muted rounded-full py-2 px-4 border border-border-dark focus:border-tick focus:outline-none transition"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full font-semibold text-sm whitespace-nowrap transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results - Only show in compact mode */}
      {compact && query && (
        <div className="border-b border-border-dark">
          {loading && (
            <div className="p-4 text-center text-text-muted">
              <div className="inline-block animate-spin">
                <div className="w-4 h-4 border-2 border-text-muted border-t-tick rounded-full"></div>
              </div>
              <p className="mt-2 text-sm">Recherche en cours...</p>
            </div>
          )}

          {!loading &&
            searchResults.users.length === 0 &&
            searchResults.posts.length === 0 && (
              <div className="p-4 text-center text-text-muted">
                <p className="text-sm">Aucun résultat trouvé pour "{query}"</p>
              </div>
            )}

          {/* Users Results */}
          {searchResults.users.length > 0 && (
            <div className="border-b border-border-dark">
              <div className="px-4 md:px-6 py-3 border-b border-border-dark">
                <p className="text-sm font-bold text-text-muted">
                  Utilisateurs ({searchResults.users.length})
                </p>
              </div>
              <div className="divide-y divide-border-dark">
                {searchResults.users.map((user: any) => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="p-4 md:px-6 hover:bg-surface-dark/20 cursor-pointer transition flex items-center gap-3"
                  >
                    <Avatar
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate">
                          {user.name}
                        </p>
                        {user.readOnly && (
                          <span className="text-xs bg-neutral-700 text-neutral-200 px-2 py-1 rounded">
                            🔒 Lecture
                          </span>
                        )}
                      </div>
                      <p className="text-text-muted text-sm">@{user.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {searchResults.posts.length > 0 && (
            <div>
              <div className="px-4 md:px-6 py-3">
                <p className="text-sm font-bold text-text-muted">
                  Posts ({searchResults.posts.length})
                </p>
              </div>
              <div className="space-y-1">
                {searchResults.posts.map((post: PostType) => (
                  <Post
                    key={post.id}
                    id={post.id}
                    name={post.user.name}
                    handle={`@${post.user.user}`}
                    avatar={
                      post.user.pp && post.user.pp !== "null"
                        ? post.user.pp
                        : `https://picsum.photos/seed/${encodeURIComponent(post.user.user || "default")}/200`
                    }
                    time={post.createdAt}
                    text={post.content}
                    image={post.mediaUrl}
                    userId={post.user.id}
                    likes={post.likes || 0}
                    liked={post.liked || false}
                    retweets={post.retweets || 0}
                    retweeted={post.retweeted || false}
                    userBlocked={post.user.blocked || false}
                    userReadOnly={post.user.readOnly || false}
                    censored={post.censored || false}
                    onDelete={() => {
                      performSearch(query);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
