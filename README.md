# 🎟️ Tombola Interactive & Gestion de Tirage au Sort

Une application web moderne, interactive et complète, dédiée à l'organisation et à la gestion d'un événement de tirage au sort (tombola) en ligne.

🌍 **Site Live** : [tombola-maroc.vercel.app](https://tombola-maroc.vercel.app/)

---

## 📌 Présentation

Conçue pour offrir une expérience ludique et fluide aux participants, la plateforme intègre un système de gestion de tickets personnalisés, un suivi de cagnotte en temps réel, et une interface d'administration ultra-sécurisée. 

L'application se démarque par son approche hautement visuelle et dynamique, intégrant notamment une "Roue de la Fortune" animée pour les tirages en direct (idéal pour les diffusions sur les réseaux sociaux comme TikTok), ainsi qu'une vitrine immersive pour présenter les lots à gagner.

## 🚀 Fonctionnalités Clés

- **Système de Tickets Personnalisés** : Espace "Mes Tickets" permettant aux participants de consulter et retrouver facilement leurs numéros de participation générés numériquement.
- **Tirage au Sort Animé** : Intégration d'une roue interactive et de confettis virtuels pour rendre l'annonce des résultats ludique, transparente et virale.
- **Vitrine des Lots & Cagnotte** : Pages dédiées à la présentation visuelle des lots à gagner et au suivi de l'objectif de la cagnotte.
- **Espace Administration Sécurisé** : Back-office protégé pour gérer la liste des participants, superviser la cagnotte et déclencher officiellement les tirages.
- **Génération & Notification** : Création automatisée de visuels de tickets de tombola (rendu graphique via Canvas/Puppeteer) et envoi de confirmations par email aux participants.

## 🛠 Stack Technique

- **Framework Core** : [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Animations** : [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Base de Données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL)
- **Sécurité** : Bcrypt / Bcryptjs (Hachage côté admin)
- **Traitement Serveur** : Node.js, Puppeteer & Canvas (Génération d'images), Nodemailer (Envoi d'emails)
- **Déploiement & Analytics** : [Vercel](https://vercel.com/) (Hébergement, Analytics & Speed Insights)

## 💻 Installation en local

1. Clonez le dépôt :
```bash
git clone https://github.com/Hedi1312/Tombola.git
cd Tombola/tombola-site
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez vos variables d'environnement (`.env.local`) :
- *Renseignez vos clés Supabase, vos identifiants SMTP pour Nodemailer, etc.*

4. Lancez le serveur de développement :
```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

## 🔒 Administration

Pour accéder au tableau de bord d'administration localement, rendez-vous sur la route `/admin-login`. 

## 📄 Licence

Ce projet a été développé par **Hëdi OKBA**. Tous droits réservés.
