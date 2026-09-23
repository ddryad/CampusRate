# CampusRate

API REST permettant à la communauté étudiante de consulter des endroits du campus et de publier des appréciations accompagnées d'une note.

> Projet réalisé dans le cadre du cours 420-514 — Collecte et interprétation des données (TP1).

## Fonctionnalités

- gestion des endroits évalués (créer, lister, consulter, modifier, supprimer);
- gestion des appréciations liées à un endroit (créer, lister, consulter, modifier, supprimer);
- calcul automatique de la note moyenne et du nombre d'appréciations d'un endroit;
- filtrage par catégorie et pagination sur la liste des endroits;
- validation stricte des données reçues (rejet des propriétés inconnues);
- persistance des données dans un fichier JSON local, conservée après un redémarrage;
- gestion uniforme des erreurs au format Problem Details (`application/problem+json`);
- documentation Swagger/OpenAPI générée automatiquement.

## Technologies

- Node.js;
- TypeScript;
- NestJS;
- class-validator / class-transformer;
- Swagger (OpenAPI);
- Jest.

## Prérequis

- une version de Node.js compatible avec le fichier `package.json`;
- npm;
- Git.

## Installation

```bash
git clone <URL_DU_DEPOT>
cd campus-rate
npm install
```

## Configuration

L'application attend les variables d'environnement suivantes :

| Variable | Obligatoire | Description | Exemple local |
|---|---|---|---|
| `PORT` | Oui | Port d'écoute du serveur HTTP | `3000` |
| `DATA_FILE_PATH` | Oui | Chemin du fichier JSON utilisé pour la persistance | `./data/db.json` |

L'application refuse de démarrer si une de ces variables est absente.

```bash
cp .env.example .env
```

Le fichier `.env` ne doit jamais être ajouté au dépôt.

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
src/
├── main.ts
├── app.module.ts
├── configure-app.ts
├── configure-swagger.ts
├── common/
│   ├── dto/
│   │   └── problem-details.dto.ts
│   └── filters/
│       └── http-exception.filter.ts
├── database/
│   └── database.service.ts
├── health/
│   ├── health.controller.ts
│   └── health.module.ts
├── places/
│   ├── places.module.ts
│   ├── places.controller.ts
│   ├── places.service.ts
│   ├── entities/
│   │   └── place.entity.ts
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
    ├── entities/
    │   └── review.entity.ts
    └── dto/
        ├── create-review.dto.ts
        └── update-review.dto.ts
```

Organisation par fonctionnalité : chaque module regroupe son contrôleur, son service et ses DTO. Le dossier `common` contient ce qui est partagé par toute l'API (format d'erreur). Le dossier `database` isole l'accès au fichier JSON, séparé de la logique métier des services.

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

Publier une appréciation pour cet endroit :

```bash
curl -i -X POST http://localhost:3000/api/v1/places/plc_xxx/reviews \
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

Exemple d'erreur (endroit inexistant) :

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "L'endroit avec l'ID \"plc_inexistant\" n'existe pas.",
  "instance": "/api/v1/places/plc_inexistant"
}
```

L'identifiant est généré par le serveur et ne doit jamais être fourni par le client. Toute propriété non reconnue envoyée dans le corps d'une requête est refusée (`400`).

## Persistance des données

Les données sont conservées dans un fichier JSON local (chemin défini par `DATA_FILE_PATH`), contenant deux collections : `places` et `reviews`. Le fichier est créé automatiquement au premier démarrage s'il n'existe pas. Un fichier corrompu (JSON invalide) produit une erreur contrôlée plutôt qu'un plantage.

L'accès au fichier est isolé dans un service dédié (`DatabaseService`), séparé de la logique métier des services `PlacesService` et `ReviewsService`, qui ne connaissent que des tableaux d'objets.

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
| Persistance | Fichier JSON unique, accès isolé dans un service dédié | Simplicité demandée par le mandat, séparation claire entre logique métier et accès aux données |

## Limites connues

- la persistance par fichier JSON n'est pas adaptée à des accès concurrents importants;
- aucune authentification ni autorisation n'est mise en place à ce stade;
- la suppression d'un endroit avec appréciations est bloquée plutôt que gérée par une suppression en cascade.

## Développement et Git

Le développement a suivi une issue parente par grande fonctionnalité, avec une branche `feature/*` associée à chacune :

- `feature/places-resource` — ressource `places`;
- `feature/reviews-resource` — ressource `reviews` et règles métier associées;
- `feature/swagger` — validation globale, gestion des erreurs, pagination, documentation.

Chaque branche a fait l'objet d'une pull request avant d'être fusionnée dans `main`.

## Vérification manuelle

Une collection Postman (ou un document équivalent) couvrant les scénarios principaux (création, consultation, modification, suppression, note invalide, ressource inexistante, conflit de suppression, filtre, pagination, persistance après redémarrage) est disponible dans [`docs/postman`](docs/postman).

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run start` | Démarre l'application |
| `npm run start:dev` | Démarre l'application en mode surveillance |
| `npm run build` | Compile l'application |
| `npm run lint` | Analyse et corrige le code selon les règles configurées |
| `npm run test` | Exécute les tests unitaires |

## Qualité du code

Avant de soumettre une pull request :

```bash
npm run build
npm run lint
npm run test
```

## Utilisation de l'IA

L'utilisation de l'intelligence artificielle dans la réalisation de ce travail est déclarée selon IAGraphie (voir le document fourni avec la remise).

## Licence

Projet réalisé dans un cadre scolaire (420-514, Automne 2026).