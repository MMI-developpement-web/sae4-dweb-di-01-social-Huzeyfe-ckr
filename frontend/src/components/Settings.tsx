import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleUserReadOnly, getCurrentUser, saveCurrentUser, type User } from '../lib/api';
import Header from './ui/Header';
import SideBar from './ui/SideBar';
import Footer from './ui/Footer';

interface SettingsProps {
  user?: User | null;
  onUserUpdate?: (user: User) => void;
}

export default function Settings({ onUserUpdate }: SettingsProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [readOnly, setReadOnly] = useState(user?.readOnly ?? false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser?.id) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setReadOnly(currentUser.readOnly ?? false);
  }, [navigate]);

  const handleToggleReadOnly = async () => {
    if (!user?.id) return;

    setLoading(true);
    setMessage('');

    try {
      const newValue = !readOnly;
      const updatedUser = await toggleUserReadOnly(user.id, newValue);

      if (updatedUser) {
        setReadOnly(newValue);
        setUser(updatedUser);
        saveCurrentUser(updatedUser);
        setMessage(newValue ? '🔒 Mode lecture seule activé' : '✓ Mode lecture seule désactivé');
        onUserUpdate?.(updatedUser);
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de la mise à jour');
      }
    } catch (err) {
      setMessage('❌ Erreur lors de la mise à jour');
      console.error('Toggle readOnly error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-black min-h-screen text-text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <SideBar />

      {/* Header Mobile */}
      <Header showLogout={true} />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 flex flex-col items-center w-full">
        <div className="w-full max-w-2xl border-r border-border-dark md:border-l md:border-border-dark pb-24 md:pb-0 px-4 md:px-6 py-6">
          <h2 className="text-2xl font-bold mb-6 text-text-white">⚙️ Paramètres</h2>

      {/* Read Only Mode */}
      <div className="border-b border-border-dark pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-white flex items-center gap-2">
              🔒 Mode lecture seule
            </h3>
            <p className="text-sm text-text-muted mt-2">
              Quand activé, vos tweets seront visibles mais personne ne pourra les commenter ou répondre.
            </p>
            <p className="text-xs text-text-muted mt-1">
              Cet option est compatible avec un compte privé.
            </p>
          </div>

          <button
            onClick={handleToggleReadOnly}
            disabled={loading}
            className={`ml-4 flex-shrink-0 px-6 py-2 rounded-full font-semibold transition-colors ${
              readOnly
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-surface-dark'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-surface-dark'
            }`}
          >
            {loading ? '⏳ Mise à jour...' : readOnly ? '✓ Activé' : 'Activer'}
          </button>
        </div>

        {message && (
          <div
            className={`mt-3 p-3 rounded text-sm ${
              message.includes('activé') || message.includes('✓')
                ? 'bg-green-900/30 border border-green-600 text-green-400'
                : 'bg-red-900/30 border border-red-600 text-red-400'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted mt-6">
        💡 Note: Vous pouvez toggler cet option à tout moment.
      </p>
        </div>
      </main>

      {/* Footer Mobile */}
      <Footer className="md:hidden z-50" />
    </div>
  );
}
