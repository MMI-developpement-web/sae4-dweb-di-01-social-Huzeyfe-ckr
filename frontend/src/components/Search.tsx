import { useState, useEffect, useCallback } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Post from './ui/Post';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../lib/utils';
import { searchContent, getCurrentUser } from '../lib/api';

interface SearchResult {
  posts: any[];
  users: any[];
  query: string;
  postCount: number;
  userCount: number;
}

export default function Search() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'users'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [results, setResults] = useState<SearchResult>({
    posts: [],
    users: [],
    query: '',
    postCount: 0,
    userCount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (q: string, type: string, sort: string, start: string, end: string) => {
      if (q.trim().length < 1) {
        setResults({
          posts: [],
          users: [],
          query: '',
          postCount: 0,
          userCount: 0,
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await searchContent({
          q,
          type: type as 'all' | 'posts' | 'users',
          sort: sort as 'date' | 'relevance',
          startDate: start || undefined,
          endDate: end || undefined,
        });
        setResults(response);
      } catch (error) {
        console.error('Search error:', error);
        setResults({
          posts: [],
          users: [],
          query: q,
          postCount: 0,
          userCount: 0,
        });
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Update search when filters change
  useEffect(() => {
    performSearch(query, searchType, sortBy, startDate, endDate);
  }, [query, searchType, sortBy, startDate, endDate, performSearch]);

  const handleClear = () => {
    setQuery('');
    setSearchType('all');
    setSortBy('date');
    setStartDate('');
    setEndDate('');
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const getAvatarUrl = (user: any) => {
    if (user.pp && user.pp !== "null" && user.pp !== "" && user.pp !== null) {
      return user.pp;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(user.user || "default")}/200`;
  };

  return (
    <div className="w-full min-h-screen bg-bg-black">
      <div className="w-full max-w-2xl mx-auto p-4">
      {/* Search Header */}
      <div className="space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Rechercher</h1>
        
        {/* Main search input */}
        <Input
          type="text"
          placeholder="Chercher des posts ou des utilisateurs..."
          value={query}
          onChange={setQuery}
          variant="default"
          size="lg"
        />

        {/* Filter section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Type filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'all' | 'posts' | 'users')}
              className="px-3 py-2 bg-dark border border-dark rounded-lg text-white text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="all">Tous les résultats</option>
              <option value="posts">Posts seulement</option>
              <option value="users">Utilisateurs seulement</option>
            </select>
          </div>

          {/* Sort filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'relevance')}
              className="px-3 py-2 bg-dark border border-dark rounded-lg text-white text-sm focus:outline-none focus:border-gray-600"
            >
              <option value="date">Plus récent</option>
              <option value="relevance">Pertinence</option>
            </select>
          </div>

          {/* Date filters */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Depuis</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-dark border border-dark rounded-lg text-white text-sm focus:outline-none focus:border-gray-600"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Jusqu'à</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-dark border border-dark rounded-lg text-white text-sm focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleClear}
            variant="dark"
            className="flex-1"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {loading && (
          <div className="text-center text-gray-400 py-8">
            <div className="inline-block animate-spin">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full"></div>
            </div>
            <p className="mt-2">Recherche en cours...</p>
          </div>
        )}

        {!loading && query && results.postCount === 0 && results.userCount === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-lg">Aucun résultat trouvé pour "{query}"</p>
          </div>
        )}

        {/* Users section */}
        {!loading && results.userCount > 0 && (searchType === 'all' || searchType === 'users') && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Utilisateurs ({results.userCount})
            </h2>
            <div className="space-y-2">
              {results.users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="p-4 bg-dark border border-dark rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-3"
                >
                  <Avatar src={getAvatarUrl(user)} alt={user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      {user.readOnly && (
                        <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
                          🔒 Lecture seule
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">@{user.user}</p>
                    {user.bio && (
                      <p className="text-gray-300 text-sm mt-1 line-clamp-1">{user.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts section */}
        {!loading && results.postCount > 0 && (searchType === 'all' || searchType === 'posts') && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Posts ({results.postCount})
            </h2>
            <div className="space-y-4">
              {results.posts.map((post) => (
                <Post
                  key={post.id}
                  id={post.id}
                  name={post.user.name}
                  handle={`@${post.user.user}`}
                  avatar={getAvatarUrl(post.user)}
                  time={post.createdAt}
                  text={post.content}
                  image={post.mediaUrl}
                  userId={post.user.id}
                  currentUserId={currentUser?.id}
                  likes={post.likes || 0}
                  liked={post.liked || false}
                  retweets={post.retweets || 0}
                  retweeted={post.retweeted || false}
                  userBlocked={post.user.blocked || false}
                  userReadOnly={post.user.readOnly || false}
                  censored={post.censored || false}
                  onDelete={() => {
                    // Refresh search results
                    performSearch(query, searchType, sortBy, startDate, endDate);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
