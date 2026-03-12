import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Account from "./ui/Account";
import EditUser from "./ui/EditUser";
import { getUsers, updateUser, deleteUser, clearCurrentUser, type User } from "../lib/api";

export default function Adminmanagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleModifyClick = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSaveUser = async (updatedUser: User) => {
    const success = await updateUser(updatedUser.id, updatedUser);
    if (success) {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsEditOpen(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      const success = await deleteUser(userId);
      if (success) {
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/adminlogin');
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <Header />

      <main className="grow max-w-sm mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/home')} className="text-text-muted">✕</button>
          <div className="text-center">
            <div className="text-lg font-extrabold">Gestion des comptes</div>
          </div>
          <Button variant="dark" size="sm" onClick={handleLogout}>Déconnexion</Button>
        </div>

        <div className="mt-4 text-sm text-text-muted">Total utilisateurs</div>
        <div className="text-3xl font-extrabold mb-4">{users.length}</div>

        <div className="mb-6">
          <Input
            placeholder="Rechercher un utilisateur..."
            value={query}
            onChange={setQuery}
            className="w-full"
          />
        </div>

        {loading ? (
          <p className="text-center text-text-muted py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-text-muted py-8">Aucun utilisateur trouvé</p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Account user={u} onModify={handleModifyClick} />
                </div>
                <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="text-error hover:opacity-80 transition"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}

        <EditUser
          user={selectedUser}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSaveUser}
        />
      </main>

      <Footer />
    </div>
  );
}
