# CampusRate

API REST permettant à la communauté étudiante de consulter des endroits du campus et de publier des appréciations accompagnées d'une note.

> Projet réalisé dans le cadre du cours 420-514 — Collecte et interprétation des données (TP1 et TP2).

## Fonctionnalités

- gestion des endroits évalués (créer, lister, consulter, modifier, supprimer);
- gestion des appréciations liées à un endroit (créer, lister, consulter, modifier, supprimer);
- calcul automatique de la note moyenne et du nombre d'appréciations d'un endroit;
- filtrage par catégorie et pagination sur la liste des endroits;
- validation stricte des données reçues (rejet des propriétés inconnues ou contrôlées par le serveur);
- persistance des données dans MongoDB (Mongoose), conservée après un redémarrage;
- sécurité HTTP de base : CORS explicite et en-têtes Helmet;
- gestion uniforme des erreurs au format Problem Details (`application/problem+json`);
- documentation Swagger/OpenAPI générée automatiquement.

## Technologies

- Node.js;
- TypeScript;
- NestJS;
- MongoDB / Mongoose;
- class-validator / class-transformer;
- Joi (validation de la configuration);
- Swagger (OpenAPI);
- Helmet, @nestjs/throttler;
- Jest.

## Prérequis

- une version de Node.js compatible avec le fichier `package.json`;
- npm;
- Git;
- MongoDB : une instance locale (`mongod`) ou un cluster MongoDB Atlas.

## Installation

```bash
git clone <URL_DU_DEPOT>
cd CampusRate
npm ci
```

## Configuration

### 1. Configurer MongoDB

- **MongoDB local** : installer MongoDB Community, démarrer `mongod`, puis utiliser l'URI `mongodb://localhost:27017/campusrate-dev`.
- **MongoDB Atlas** : créer un cluster, créer un utilisateur de base de données, autoriser votre adresse IP (Network Access), puis copier la chaîne de connexion (**Connect → Drivers**). Ajouter le nom de la base avant le `?` (ex. `.../campusrate-dev?retryWrites=true&w=majority`). Les caractères spéciaux du mot de passe doivent être encodés dans l'URL.

Les collections `places` et `reviews` ainsi que leurs index sont créés automatiquement au premier démarrage et à la première écriture.

### 2. Créer le fichier `.env`

```bash
cp .env.example .env
```

Puis remplacer les valeurs dans `.env`. L'application attend les variables suivantes :

| Variable | Obligatoire | Description | Exemple local |
|---|---|---|---|
| `PORT` | Non (3000) | Port d'écoute du serveur HTTP | `3000` |
| `MONGO_URI` | Oui | URI de connexion MongoDB | `mongodb://localhost:27017/campusrate-dev` |
| `CORS_ORIGINS` | Non | Origines autorisées par CORS, séparées par des virgules | `http://localhost:3000` |

L'application refuse de démarrer si `MONGO_URI` est absente (validation Joi).

### Gestion des secrets

Le fichier `.env` ne doit jamais être ajouté au dépôt (il est dans `.gitignore`). Le fichier `.env.example` documente les variables nécessaires sans contenir de secret réel : ne jamais y mettre un mot de passe, un jeton ou une URI Atlas réelle.

## Exécution

### Développement

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

Avec `PORT=3000`, l'API est accessible à l'adresse suivante :

```text
http://localhost:3000/api/v1
```

La documentation Swagger est accessible à :

```text
http://localhost:3000/docs
```

La spécification OpenAPI brute (JSON) est accessible à :

```text
http://localhost:3000/docs/openapi.json
```

## Structure du projet

```text
.env.example
docs/
├── postman/
│   └── CampusRate-TP2.postman_collection.json
└── scenarios.http
src/
├── main.ts
├── app.module.ts
├── configure-app.ts
├── configure-swagger.ts
├── config/
│   └── database.config.ts
├── common/
│   ├── database/ (mongo-errors, to-public-json)
│   ├── dto/
│   │   └── problem-details.dto.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/ (json-content-type.guard)
│   ├── middleware/ (request-logger)
│   └── pipes/ (parse-object-id.pipe)
├── places/
│   ├── places.module.ts
│   ├── places.controller.ts
│   ├── places.service.ts
│   ├── places.repository.ts
│   ├── schemas/
│   │   └── place.schema.ts
│   ├── enums/
│   │   ├── place-category.enum.ts
│   │   └── place-status.enum.ts
│   └── dto/
│       ├── create-place.dto.ts
│       ├── update-place.dto.ts
│       └── place-query.dto.ts
└── reviews/
    ├── reviews.module.ts
    ├── reviews.controller.ts
    ├── reviews.service.ts
    ├── reviews.repository.ts
    ├── schemas/
    │   └── review.schema.ts
    └── dto/
        ├── create-review.dto.ts
        └── update-review.dto.ts
```

Organisation par fonctionnalité : chaque module regroupe son contrôleur, son service, son repository, son schéma et ses DTO. Le dossier `common` contient ce qui est partagé par toute l'API (format d'erreur, filtre, garde, pipe, journalisation). Les repositories (`*.repository.ts`) isolent les requêtes Mongoose de la logique métier des services.

## API

Toutes les routes sont exposées sous le préfixe `/api/v1`.

### Endroits (`places`)

| Méthode | Route | Succès | Description |
|---|---|---:|---|
| `POST` | `/api/v1/places` | `201` | Crée un endroit |
| `GET` | `/api/v1/places` | `200` | Liste les endroits (filtre + pagination) |
| `GET` | `/api/v1/places/:id` | `200` | Consulte un endroit |
| `PATCH` | `/api/v1/places/:id` | `200` | Modifie un endroit |
| `DELETE` | `/api/v1/places/:id` | `204` | Supprime un endroit (refusé si des appréciations existent) |

### Appréciations (`reviews`)

| Méthode | Route | Succès | Description |
|---|---|---:|---|
| `POST` | `/api/v1/places/:placeId/reviews` | `201` | Publie une appréciation pour un endroit |
| `GET` | `/api/v1/places/:placeId/reviews` | `200` | Liste les appréciations d'un endroit |
| `GET` | `/api/v1/reviews/:id` | `200` | Consulte une appréciation |
| `PATCH` | `/api/v1/reviews/:id` | `200` | Modifie une appréciation |
| `DELETE` | `/api/v1/reviews/:id` | `204` | Supprime une appréciation |

### Exemples

Créer un endroit :

```bash
curl -i -X POST http://localhost:3000/api/v1/places \
  -H "Content-Type: application/json" \
  -d '{"name":"Bibliothèque principale","description":"Espace calme avec prises.","category":"LIBRARY","address":"Pavillon A, local A-210"}'
```

Publier une appréciation pour cet endroit (remplacer l'identifiant par celui retourné à la création) :

```bash
curl -i -X POST http://localhost:3000/api/v1/places/665f1c2e8b3a4d0012a4b5c6/reviews \
  -H "Content-Type: application/json" \
  -d '{"authorName":"Samira","rating":4,"comment":"Calme et Wi-Fi stable."}'
```

Lister les endroits d'une catégorie, page 1, 10 résultats :

```bash
curl -i "http://localhost:3000/api/v1/places?category=LIBRARY&page=1&limit=10"
```

Réponse :

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Exemple d'erreur (endroit inexistant, `404`) :

```json
{
  "type": "about:blank",
  "title": "NOT_FOUND",
  "status": 404,
  "detail": "L'endroit avec l'ID \"000000000000000000000000\" n'existe pas.",
  "instance": "/api/v1/places/000000000000000000000000"
}
```

Exemple d'erreur de validation (`400`, propriété obligatoire absente) :

```json
{
  "type": "about:blank",
  "title": "BAD_REQUEST",
  "status": 400,
  "detail": "La requête contient des données invalides.",
  "instance": "/api/v1/places",
  "errors": [
    "address must be shorter than or equal to 200 characters",
    "address should not be empty",
    "address must be a string"
  ]
}
```

Une même propriété absente déclenche plusieurs règles de validation, d'où plusieurs messages pour un seul champ.

L'identifiant est généré par le serveur et ne doit jamais être fourni par le client. Toute propriété non reconnue envoyée dans le corps d'une requête est refusée (`400`).

### Codes d'erreur principaux

| Code | Cas |
|---:|---|
| `400` | Données invalides, propriété inconnue ou contrôlée par le serveur, identifiant mal formé |
| `404` | Ressource inexistante |
| `409` | Nom d'endroit déjà utilisé, ou suppression d'un endroit qui possède des appréciations |
| `413` | Corps de la requête supérieur à 10 kb |
| `415` | `Content-Type` différent de `application/json` |
| `429` | Plus de 100 requêtes par minute depuis la même adresse |

## Persistance des données

Les données sont conservées dans MongoDB via Mongoose, dans deux collections : `places` et `reviews`. Le fichier JSON du TP1 n'est plus utilisé. Une appréciation référence son endroit par `placeId` (**référence plutôt qu'imbrication** : une appréciation a son propre cycle de vie, peut devenir nombreuse et est consultée/modifiée indépendamment des autres appréciations de l'endroit).

Index :

- `places.name` unique (insensible à la casse) : empêche les doublons, même en cas de requêtes simultanées → `409 Conflict`;
- `places.category` : filtre par catégorie;
- `reviews.placeId` : retrouver les appréciations d'un endroit.

Les statistiques d'un endroit (`averageRating`, `reviewCount`) sont recalculées avec une **agrégation MongoDB** (`$group` / `$avg`) à chaque changement d'appréciation.

Le contrat public est conservé : les routes, méthodes, codes de statut et formats de réponse sont ceux du TP1, `id` (chaîne) remplace `_id` et `__v` est masqué. Changements de comportement liés à MongoDB :

- l'identifiant est maintenant un ObjectId MongoDB (ex. `665f1c2e8b3a4d0012a4b5c6`) au lieu de `plc_<uuid>` / `rev_<uuid>`; un identifiant mal formé produit `400`;
- deux endroits ne peuvent plus porter le même nom (`409`).

## Règles métier

- une appréciation doit toujours référer à un endroit existant;
- `id`, les dates et les valeurs calculées (`averageRating`, `reviewCount`) ne peuvent pas être fournis par le client;
- un endroit sans appréciation affiche `averageRating: null` et `reviewCount: 0`;
- la création, la modification ou la suppression d'une appréciation recalcule automatiquement les statistiques de l'endroit associé;
- un endroit possédant au moins une appréciation ne peut pas être supprimé (`409 Conflict`).

## Choix de conception

| Décision | Choix retenu | Justification |
|---|---|---|
| Nom des ressources | `places`, `reviews` | Noms anglais, pluriels, sans verbe d'action, conformes aux conventions REST |
| Versionnement | Dans l'URI (`/api/v1/...`) | Simple à mettre en place et visible directement dans la route |
| Imbrication | Mixte : création et liste imbriquées sous `/places/:placeId/reviews`, opérations unitaires plates sous `/reviews/:id` | Une appréciation n'a de sens qu'associée à un endroit lors de sa création, mais elle a ensuite son propre cycle de vie (consultation, modification, suppression) |
| Suppression d'un endroit avec appréciations | `409 Conflict` | La requête est valide et la ressource existe, mais l'opération entre en conflit avec l'état actuel du système |
| Erreurs | Format Problem Details, type `application/problem+json` | Format uniforme sur toute l'API, exigé pour toutes les erreurs |
| Persistance | MongoDB + Mongoose, accès isolé dans des repositories | Données persistantes, index uniques, séparation contrôleur / service / accès aux données |
| Référence vs imbrication (MongoDB) | Collection `reviews` séparée, liée par `placeId` | Les appréciations sont nombreuses, modifiées indépendamment et recalculent les statistiques de l'endroit |

## Validation et sécurité

Principales validations :

- `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`) : toute propriété inconnue est refusée (`400`);
- `id`, `createdAt`, `updatedAt`, `averageRating`, `reviewCount` sont contrôlés par le serveur et refusés s'ils sont envoyés;
- `name` ≤ 100, `description` ≤ 500, `address` ≤ 200, `category`/`status` validés par enum;
- `rating` entier entre 1 et 5, `comment` entre 5 et 500 caractères, `authorName` ≤ 80;
- les identifiants de route sont validés (ObjectId), `page`/`limit` bornés (`limit` ≤ 50);
- le client n'envoie jamais d'objet directement à MongoDB : le service construit les filtres et les modifications champ par champ.

**CORS** : seules les origines de `CORS_ORIGINS` sont autorisées, avec les méthodes `GET`, `POST`, `PATCH`, `DELETE`. CORS limite ce que les *navigateurs* peuvent lire; ce n'est pas une authentification (curl ou Postman l'ignorent).

**Helmet** : ajoute des en-têtes HTTP de sécurité (ex. `X-Content-Type-Options`, `Content-Security-Policy`, `Strict-Transport-Security`) qui réduisent certains risques côté navigateur.

## Fonctionnalités optionnelles implantées

| Code | Option | Détail |
|---|---|---|
| M1 | Index + doublon | Index unique sur `places.name`, `409` en cas de doublon |
| M2 | Agrégation | Moyenne et nombre d'appréciations via `$group` |
| M3 | Référence vs imbrication | Justifié dans « Persistance des données » et « Choix de conception » |
| H1 | Rate limiting | 100 requêtes/minute/IP (`429`) |
| H2 | Taille du corps | 10 kb max, `413` |
| H3 | Content-Type | `application/json` requis pour POST/PATCH avec corps, sinon `415` |
| H4 | CORS par environnement | Origines définies par `CORS_ORIGINS` |
| H5 | Méthodes HTTP | CORS limité à GET, POST, PATCH, DELETE |
| P2 | Champs modifiables | Liste explicite des champs modifiables dans les services |
| L1 | Journal INFO | method, path, statusCode, durée (aucun corps ni en-tête) |
| L2 | Journal ERROR | Erreurs 5xx journalisées avec la stack côté serveur seulement |

Les options non listées ici (HTTPS, authentification JWT, RBAC) ne sont pas implantées.

## Limites connues

- aucune authentification ni autorisation n'est mise en place;
- la suppression d'un endroit avec appréciations est bloquée plutôt que gérée par une suppression en cascade;
- le recalcul des statistiques n'est pas transactionnel (deux écritures successives);
- le HTTPS n'est pas configuré (à gérer par un proxy en production);
- le journal INFO n'inclut pas de `requestId` (facultatif);
- les messages de validation (`errors`) sont ceux, en anglais, de class-validator;
- le rate limiting est appliqué par adresse IP, sans configuration spécifique derrière un proxy.

## Développement et Git

Le développement a suivi une issue parente par grande fonctionnalité, avec une branche `feature/*` associée à chacune :

- `feature/places-resource` — ressource `places`;
- `feature/reviews-resource` — ressource `reviews` et règles métier associées;
- `feature/swagger` — validation globale, gestion des erreurs, pagination, documentation.

Chaque branche a fait l'objet d'une pull request avant d'être fusionnée dans `main`.

## Vérification manuelle

La collection Postman [`docs/postman/CampusRate-TP2.postman_collection.json`](docs/postman/CampusRate-TP2.postman_collection.json) regroupe les requêtes de vérification, dans l'ordre de la démonstration vidéo. Les mêmes requêtes sont disponibles dans [`docs/scenarios.http`](docs/scenarios.http).

Préparation : importer la collection dans Postman, démarrer l'API connectée à MongoDB, puis, après les requêtes `1 - Create place` et `10 - Create review`, copier l'identifiant retourné dans les variables de collection `placeId` et `reviewId`.

Scénarios obligatoires :

1. création d'une ressource valide;
2. consultation d'une ressource persistée dans MongoDB;
3. persistance après redémarrage de l'API (envoyer la liste, redémarrer l'API, renvoyer la liste);
4. création avec une propriété obligatoire absente;
5. valeur invalide pour une propriété contrôlée;
6. propriété inconnue envoyée par le client;
7. modification valide;
8. tentative de modification d'un champ contrôlé par le serveur.

Scénarios complémentaires : doublon de nom (renvoyer la création `409`), appréciation et recalcul des statistiques, note invalide, suppression d'un endroit avec appréciations (`409`), endroit inexistant (`404`), identifiant mal formé (`400`), `Content-Type` invalide (`415`), CORS (origine autorisée et origine refusée).

Les cas `413` et `429` se vérifient avec PowerShell (voir `docs/scenarios.http`) :


## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run start` | Démarre l'application |
| `npm run start:dev` | Démarre l'application en mode surveillance |
| `npm run start:prod` | Démarre l'application compilée |
| `npm run build` | Compile l'application |
| `npm run lint` | Analyse et corrige le code selon les règles configurées |
| `npm run test` | Exécute les tests unitaires |

## Qualité du code

Avant la remise :

```bash
npm ci
npm run lint
npm run build
```

## Utilisation de l'IA

L'utilisation de l'intelligence artificielle dans la réalisation de ce travail est déclarée selon IAGraphie (voir le document fourni avec la remise).

## Licence

Projet réalisé dans un cadre scolaire (420-514, Automne 2026).