import { useState, useEffect } from "react";
import { getBlockedUsers, unblockUser, type User } from "../../lib/api";

interface BlockedUsersListProps {
  userId: number;
  onClose: () => void;
}

export default function BlockedUsersList({ userId, onClose }: BlockedUsersListProps) {
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await getBlockedUsers(userId);
        setBlockedUsers(users);
      } catch (err) {
        setError("Erreur lors du chargement des utilisateurs bloqués");
        console.error("Load blocked users error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, [userId]);

  const handleUnblock = async (blockedUserId: number) => {
    setUnblockingId(blockedUserId);
    try {
      const success = await unblockUser(blockedUserId);
      if (success) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== blockedUserId));
      } else {
        setError("Erreur lors du déblocage");
      }
    } catch (err) {
      setError("Erreur lors du déblocage");
      console.error("Unblock error:", err);
    } finally {
      setUnblockingId(null);
    }
  };

  const getAvatarUrl = (user: User) => {
    if (user.pp && user.pp !== "null" && user.pp !== "" && user.pp !== null) {
      return user.pp;
    }
    return `https://picsum.photos/seed/${encodeURIComponent(user.user || user.username || "default")}/200`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Utilisateurs bloqués</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Chargement...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-center text-gray-500">Aucun utilisateur bloqué</p>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">@{user.user || user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    disabled={unblockingId === user.id}
                    className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-2"
                  >
                    {unblockingId === user.id ? "..." : "Débloquer"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
