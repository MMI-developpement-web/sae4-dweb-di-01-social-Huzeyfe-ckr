import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import Button from './Button';

// SVG Icons - wrapped in spans with proper sizing
const HomeIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v6a2 2 0 002 2h10a2 2 0 002-2V9m-9 4h4" /></svg></span>;

const ExploreIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>;

const NotificationsIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></span>;

const ProfileIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>;

const SettingsIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>;

const LogoutIcon = <span className="w-5 h-5 inline-flex"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m14-4V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v2" /></svg></span>;

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();

  const handleLogout = () => {
    logout();
    alert('Déconnexion réussie');
    navigate('/login');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Burger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-white hover:bg-surface-dark rounded-lg transition"
        aria-label="Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-12 bg-black border border-border-dark rounded-lg shadow-lg z-50 w-56 py-2">
          <nav className="space-y-1">
            {/* Accueil */}
            <Button
              variant="dark"
              size="sm"
              icon={HomeIcon}
              onClick={() => handleNavigation('/home')}
              className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4"
            >
              Accueil
            </Button>

            {/* Explorer */}
            <Button
              variant="dark"
              size="sm"
              icon={ExploreIcon}
              onClick={() => handleNavigation('/search')}
              className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4"
            >
              Explorer
            </Button>

            {/* Notifications */}
            <Button
              variant="dark"
              size="sm"
              icon={NotificationsIcon}
              className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4"
            >
              Notifications
            </Button>

            {/* Profil - conditionnel */}
            {currentUser && (
              <Button
                variant="dark"
                size="sm"
                icon={ProfileIcon}
                onClick={() => handleNavigation(`/profile/${currentUser.id}`)}
                className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4"
              >
                Profil
              </Button>
            )}

            {/* Paramètres */}
            <Button
              variant="dark"
              size="sm"
              icon={SettingsIcon}
              onClick={() => handleNavigation('/settings')}
              className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4"
            >
              Paramètres
            </Button>

            {/* Divider */}
            <div className="my-2 border-t border-border-dark/50"></div>

            {/* Logout Button */}
            <Button
              variant="dark"
              size="sm"
              icon={LogoutIcon}
              onClick={handleLogout}
              className="w-full justify-start rounded-none border-none hover:bg-surface-dark/50 px-4 text-error"
            >
              Déconnexion
            </Button>
          </nav>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
