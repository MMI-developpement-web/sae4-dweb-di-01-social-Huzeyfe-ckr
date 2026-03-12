-- ============================================================
-- SAE4 DWeb DI 01 - Données de Test
-- Copie le contenu entier et exécute-le dans phpMyAdmin
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO `user` (`id`, `user`, `password`, `email`, `name`, `role`, `active`, `phone`, `birth_date`, `created_at`) VALUES
(1, 'huzeyfe.cakir', '$2y$10$YourHashedPassword1', 'huzeyfe.cakir@example.com', 'Huzeyfe Çakir', 'admin', 1, '+33 6 12 34 56 78', '1990-03-15', '2026-01-10 10:30:00'),
(2, 'aylin.kaya', '$2y$10$YourHashedPassword2', 'aylin.kaya@example.com', 'Aylin Kaya', 'user', 1, '+33 6 98 76 54 32', '1995-07-22', '2026-01-15 14:20:00'),
(3, 'samuel.dupont', '$2y$10$YourHashedPassword3', 'samuel.dupont@example.com', 'Samuel Dupont', 'user', 1, '+33 6 45 67 89 01', '1988-11-08', '2026-01-20 09:15:00'),
(4, 'leo.martin', '$2y$10$YourHashedPassword4', 'leo.martin@example.com', 'Leo Martin', 'user', 1, '+33 7 23 45 67 89', '1992-05-30', '2026-02-01 16:45:00'),
(5, 'mao.chen', '$2y$10$YourHashedPassword5', 'mao.chen@example.com', 'Mao Chen', 'user', 0, '+33 6 11 22 33 44', '1998-12-25', '2026-02-10 11:00:00');

-- ============================================================
-- POSTS
-- ============================================================

INSERT INTO `post` (`id`, `user_id`, `content`, `time`, `created_at`) VALUES
(1, 1, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', '2026-03-12', '2026-03-12 13:30:00'),
(2, 1, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', '2026-03-12', '2026-03-12 10:15:00'),
(3, 2, 'Découvrez notre nouveau projet social network! Une plateforme moderne et intuitive pour partager vos pensées.', '2026-03-11', '2026-03-11 15:45:00'),
(4, 3, 'La technologie est au cœur de l\'innovation. Ensemble, créons le futur avec passion et dévouement!', '2026-03-11', '2026-03-11 12:20:00'),
(5, 4, 'Première journée sur cette plateforme. Très excité de partager avec vous tous mes aventures et projets!', '2026-03-10', '2026-03-10 08:30:00'),
(6, 2, 'Les migrations Doctrine c\'est génial pour gérer la base de données et les versions du schéma.', '2026-03-10', '2026-03-10 14:00:00'),
(7, 3, 'Qui a des conseils pour optimiser les performances React et TypeScript en production?', '2026-03-09', '2026-03-09 18:45:00'),
(8, 4, 'Symfony 7.4 + React = combinaison gagnante pour le développement web moderne 🚀', '2026-03-09', '2026-03-09 11:15:00'),
(9, 1, 'Travail en cours sur l\'intégration API. Les murs réagissent plutôt bien à la personnalisation CSS.', '2026-03-08', '2026-03-08 16:30:00'),
(10, 2, 'Les formulaires React avec validation côté client c\'est crucial pour l\'UX utilisateur.', '2026-03-08', '2026-03-08 09:00:00'),
(11, 5, 'Vérification des migrations Doctrine et synchronisation avec MySQL... tout fonctionne parfaitement!', '2026-03-07', '2026-03-07 13:20:00'),
(12, 4, 'Comment gérez-vous le state management dans vos applications React? Context API ou Redux?', '2026-03-07', '2026-03-07 10:50:00'),
(13, 1, 'Bravo à toute l\'équipe pour l\'excellent travail sur ce projet de réseau social!', '2026-03-06', '2026-03-06 17:30:00'),
(14, 3, 'Les variables CSS personalisant les couleurs... c\'est beaucoup plus pratique que les hardcodes!', '2026-03-06', '2026-03-06 14:15:00');

-- ============================================================
-- Note: Les passwords sont des exemples
-- En production, utiliser hash bcrypt: password_hash('password', PASSWORD_BCRYPT)
-- ============================================================

COMMIT;
