# Smartmarket

MVP mobile-first pour mettre en relation les acheteurs et vendeurs de produits frais à Abidjan.

## Démarrage

1. Installer Node.js 18 ou supérieur.
2. Installer les dépendances avec `npm install`.
3. Copier `.env.example` vers `.env` et renseigner l’URL Supabase ainsi que la clé anon du projet.
4. Exécuter [`supabase/schema.sql`](./supabase/schema.sql) dans l’éditeur SQL Supabase.
5. Dans Supabase Auth, activer l’authentification par téléphone. Pour créer des comptes sans code de vérification, désactiver également la confirmation des numéros de téléphone.
6. Lancer `npm run dev`.

Sans configuration Supabase, l’interface de bienvenue reste accessible, mais les inscriptions, connexions et données catalogue signalent explicitement que la configuration est nécessaire.

## Déploiement sur GitHub Pages

Le workflow GitHub Actions publie automatiquement l’application sur GitHub Pages à chaque mise à jour de la branche `main`. Dans les paramètres du dépôt, choisir **Settings → Pages → Build and deployment → GitHub Actions**.

Pour activer Supabase dans la version publiée, ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` comme secrets Actions dans **Settings → Secrets and variables → Actions**. Ces valeurs sont intégrées au JavaScript envoyé au navigateur ; la clé anon n’est pas un secret d’accès à la base. Configurer les politiques RLS de Supabase avant la mise en ligne et ne jamais utiliser une clé `service_role` dans l’application.

L’URL du site et l’authentification dépendent aussi de la configuration de l’URL du site dans Supabase Auth. GitHub Pages est public même si le dépôt source est privé.

## Parcours inclus

- Onboarding, inscription par numéro de téléphone et mot de passe, connexion par numéro et mot de passe, puis sélection du rôle.
- Profil de boutique soumis à validation, catalogue et gestion vendeur des produits/brouillons et photos.
- Accueil acheteur, rayons, fiche produit et contact direct par WhatsApp.
- Les commandes, le panier et le paiement sont prévus pour la Phase 2.
