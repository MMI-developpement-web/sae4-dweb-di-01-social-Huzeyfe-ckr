import { useState } from "react";
import { blockUser, unblockUser } from "../../lib/api";

interface BlockButtonProps {
  userId: number;
  isBlocked: boolean;
  onBlockChange: (blocked: boolean) => void;
}

export default function BlockButton({ userId, isBlocked, onBlockChange }: BlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await blockUser(userId);
      if (success) {
        onBlockChange(true);
      } else {
        setError("Erreur lors du blocage");
      }
    } catch (err) {
      setError("Erreur lors du blocage");
      console.error("Block error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await unblockUser(userId);
      if (success) {
        onBlockChange(false);
      } else {
        setError("Erreur lors du déblocage");
      }
    } catch (err) {
      setError("Erreur lors du déblocage");
      console.error("Unblock error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={isBlocked ? handleUnblock : handleBlock}
        disabled={loading}
        className={`px-4 py-2 rounded-full font-semibold transition ${
          isBlocked
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-red-500 text-white hover:bg-red-600"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? "Chargement..." : isBlocked ? "Débloquer" : "Bloquer"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
