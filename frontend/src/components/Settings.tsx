import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleUserReadOnly, type User } from '../lib/api';
import Header from './ui/Header';
import SideBar from './ui/SideBar';
import Footer from './ui/Footer';
import { useStore } from '../store/StoreContext';

interface SettingsProps {
  user?: User | null;
  onUserUpdate?: (user: User) => void;
}

export default function Settings({ onUserUpdate }: SettingsProps) {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser } = useStore();
  const [user, setUser] = useState<User | null>(currentUser);
  const [readOnly, setReadOnly] = useState(user?.readOnly ?? false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser?.id) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setReadOnly(currentUser.readOnly ?? false);
  }, [navigate, currentUser]);

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
        updateCurrentUser(updatedUser);
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
            className="ml-4 flex-shrink-0 px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: readOnly ? 'var(--color-error)' : 'var(--color-info)',
              color: 'var(--color-text-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = readOnly 
                ? 'var(--color-error-light)'
                : 'var(--color-info-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = readOnly 
                ? 'var(--color-error)'
                : 'var(--color-info)';
            }}
          >
            {loading ? '⏳ Mise à jour...' : readOnly ? '✓ Activé' : 'Activer'}
          </button>
        </div>

        {message && (
          <div
            className="mt-3 p-3 rounded text-sm border-l-4"
            style={{
              backgroundColor: message.includes('activé') || message.includes('✓')
                ? 'color-mix(in srgb, var(--color-success) 10%, var(--color-bg-black) 90%)'
                : 'color-mix(in srgb, var(--color-error) 10%, var(--color-bg-black) 90%)',
              borderLeftColor: message.includes('activé') || message.includes('✓')
                ? 'var(--color-success)'
                : 'var(--color-error)',
              color: message.includes('activé') || message.includes('✓')
                ? 'var(--color-success)'
                : 'var(--color-error)'
            }}
          >
            <p>{message}</p>
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
