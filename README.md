# Smartmarket

MVP mobile-first pour mettre en relation les acheteurs et vendeurs de produits frais à Abidjan.

## Démarrage

1. Installer Node.js 18 ou supérieur.
2. Installer les dépendances avec `npm install`.
3. Copier `.env.example` vers `.env` et renseigner l’URL Supabase ainsi que la clé anon du projet.
4. Exécuter [`supabase/schema.sql`](./supabase/schema.sql) dans l’éditeur SQL Supabase.
5. Dans Supabase Auth, activer l’authentification par e-mail et conserver la confirmation des adresses e-mail. Configurer un fournisseur SMTP pour envoyer les e-mails de confirmation aux utilisateurs en production. Les comptes historiquement créés avec un numéro ne sont pas convertis automatiquement.
6. Lancer `npm run dev`.

Sans configuration Supabase, l’interface de bienvenue reste accessible, mais les inscriptions, connexions et données catalogue signalent explicitement que la configuration est nécessaire.

## Déploiement sur GitHub Pages

Le workflow GitHub Actions publie automatiquement l’application sur GitHub Pages à chaque mise à jour de la branche `main`. Les routes utilisent des fragments d’URL (par exemple `/#/onboarding`) pour fonctionner aussi lorsqu’une page est ouverte directement. Dans les paramètres du dépôt, choisir **Settings → Pages → Build and deployment → GitHub Actions**.

Pour activer Supabase dans la version publiée, ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` comme secrets Actions dans **Settings → Secrets and variables → Actions**. Ces valeurs sont intégrées au JavaScript envoyé au navigateur ; la clé anon n’est pas un secret d’accès à la base. Configurer les politiques RLS de Supabase avant la mise en ligne et ne jamais utiliser une clé `service_role` dans l’application.

L’URL du site et l’authentification dépendent aussi de la configuration de l’URL du site dans Supabase Auth. GitHub Pages est public même si le dépôt source est privé.

## Parcours inclus

- Onboarding, inscription et connexion par adresse e-mail et mot de passe avec confirmation de l’adresse, puis sélection du rôle.
- Profil de boutique soumis à validation, catalogue et gestion vendeur des produits/brouillons et photos.
- Accueil acheteur, menu du marché, rayons, fiche produit et contact direct par WhatsApp.
- Panier conservé sur l’appareil, quantités limitées au stock annoncé et demandes de commande envoyées au vendeur via WhatsApp.
- Espace « En gros » pour les restaurants et professionnels, avec sélection de volumes selon le stock disponible.

Pour une base Supabase déjà configurée, exécuter à nouveau [`supabase/schema.sql`](./supabase/schema.sql) afin d’ajouter la quantité disponible aux produits existants. Les produits déjà enregistrés reçoivent une quantité initiale de zéro, à ajuster dans l’espace vendeur pour refléter le stock réel.
