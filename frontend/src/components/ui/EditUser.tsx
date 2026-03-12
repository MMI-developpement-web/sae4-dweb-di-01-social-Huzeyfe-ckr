import { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import type { User } from "../../lib/api";

interface EditUserProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditUser({ user, isOpen, onClose, onSave }: EditUserProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user, isOpen]);

  const handleSave = () => {
    if (user) {
      const updatedUser = {
        ...user,
        name: `${firstName} ${lastName}`,
        email,
      };
      onSave(updatedUser);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-bg-black border border-border-white rounded-2xl p-6 w-96 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-text-white">Modifier l'utilisateur</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-2">Prénom</label>
              <Input
                type="text"
                value={firstName}
                onChange={setFirstName}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-2">Nom</label>
              <Input
                type="text"
                value={lastName}
                onChange={setLastName}
                placeholder="Nom"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-text-muted block mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-xs text-text-muted block mb-2">Téléphone</label>
            <Input
              type="text"
              value={phone}
              onChange={setPhone}
              placeholder="Téléphone (optionnel)"
            />
          </div>

          {/* Info message */}
          <div className="bg-surface border border-border-dark rounded-2xl p-3">
            <p className="text-xs text-text-muted">
              La modification de mot de passe n'est pas autorisée.
            </p>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="dark"
              size="md"
              className="w-full rounded-full border border-white"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="solid"
              size="md"
              className="w-full rounded-full"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
