import React, { useState } from "react";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Account from "./ui/Account";
import EditUser from "./ui/EditUser";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user";
  active: boolean;
}

const initialUsers: User[] = [
  { id: 1, name: "Mehmet Çakir", email: "mehmet@example.com", role: "user", active: true },
  { id: 2, name: "Aylin Kaya", email: "aylin@example.com", role: "user", active: true },
  { id: 3, name: "Samuel Dupont", email: "samuel@example.com", role: "user", active: false },
  
];

export default function Adminmanagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleModifyClick = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleSaveUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-black text-text-white flex flex-col">
      <Header />

      <main className="flex-grow max-w-sm mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <button className="text-text-muted">✕</button>
          <div className="text-center">
            <div className="text-lg font-extrabold">Gestion des comptes</div>
          </div>
          <Button variant="dark" size="sm">Déconnexion</Button>
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

        <ul className="space-y-4">
          {filtered.map((u) => (
            <li key={u.id}>
              <Account user={u} onModify={handleModifyClick} />
            </li>
          ))}
        </ul>

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
