
# Documentation de l'API de Gestion des Commandes

## Introduction

Cette API permet la gestion des commandes, incluant la création, la lecture, la mise à jour et la suppression de commandes. L'API utilise JWT pour la sécurisation des routes sensibles.

### Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Créer une commande

**POST `/commandes`**

**Description :** Crée une nouvelle commande dans la base de données.

**Headers :** `x-access-token` : Token JWT pour l'authentification.

**Corps de la requête :**

```json
{
  "produit_id": "int",
  "quantite": "int",
  "date_commande": "date",
  "client_id": "int",
  "adresse_livraison": "string"
}
```

**Réponse :**

- **Code :** `201 Created`
- **Corps de la réponse :**

```json
{
  "id": "int",
  "produit_id": "int",
  "quantite": "int",
  "date_commande": "date",
  "client_id": "int",
  "adresse_livraison": "string"
}
```

**Codes d'erreur :**

- `400 Bad Request` : Requête mal formée ou données manquantes.
- `500 Internal Server Error` : Erreur lors de la création de la commande.

### 2. Récupérer toutes les commandes

**GET `/commandes`**

**Description :** Récupère la liste de toutes les commandes.

**Headers :** `x-access-token` : Token JWT pour l'authentification.

**Réponse :**

- **Code :** `200 OK`
- **Corps de la réponse :**

```json
[
  {
    "id": "int",
    "produit_id": "int",
    "quantite": "int",
    "date_commande": "date",
    "client_id": "int",
    "adresse_livraison": "string"
  },
]
```

**Codes d'erreur :**

- `401 Unauthorized` : Token JWT manquant ou invalide.
- `500 Internal Server Error` : Erreur lors de la récupération des commandes.

### 3. Récupérer une commande par ID

**GET `/commandes/:id_client/:id_produit`**

**Description :** Récupère une commande spécifique en utilisant son ID.

**Paramètres d'URL :** `commandeId` : ID de la commande (int)

**Headers :** `x-access-token` : Token JWT pour l'authentification.

**Réponse :**

- **Code :** `200 OK`
- **Corps de la réponse :**

```json
{
  "id": "int",
  "produit_id": "int",
  "quantite": "int",
  "date_commande": "date",
  "client_id": "int",
  "adresse_livraison": "string"
}
```

**Codes d'erreur :**

- `404 Not Found` : Commande non trouvée.
- `500 Internal Server Error` : Erreur lors de la récupération de la commande.

### 4. Mettre à jour une commande

**PUT `/commandes/:id_client/:id_produit`**

**Description :** Met à jour les informations d'une commande existante.

**Paramètres d'URL :** `commandeId` : ID de la commande (int)

**Headers :** `x-access-token` : Token JWT pour l'authentification.

**Corps de la requête :**

```json
{
  "produit_id": "int",
  "quantite": "int",
  "date_commande": "date",
  "client_id": "int",
  "adresse_livraison": "string"
}
```

**Réponse :**

- **Code :** `200 OK`
- **Corps de la réponse :**

```json
{
  "id": "int",
  "produit_id": "int",
  "quantite": "int",
  "date_commande": "date",
  "client_id": "int",
  "adresse_livraison": "string"
}
```

**Codes d'erreur :**

- `400 Bad Request` : Requête mal formée ou données manquantes.
- `404 Not Found` : Commande non trouvée.
- `500 Internal Server Error` : Erreur lors de la mise à jour de la commande.

### 5. Supprimer une commande

**DELETE `/commandes/:id_client/:id_produit`**

**Description :** Supprime une commande de la base de données.

**Paramètres d'URL :** `commandeId` : ID de la commande (int)

**Headers :** `x-access-token` : Token JWT pour l'authentification.

**Réponse :**

- **Code :** `200 OK`
- **Corps de la réponse :**

```json
{
  "message": "La commande a été supprimée avec succès !"
}
```

**Codes d'erreur :**

- `404 Not Found` : Commande non trouvée.
- `500 Internal Server Error` : Erreur lors de la suppression de la commande.

## Sécurité

Certaines routes de l'API (comme la récupération, la mise à jour, et la suppression des commandes) sont protégées par des tokens JWT. Assurez-vous d'inclure le token d'accès dans les en-têtes de requête sous `x-access-token` pour ces routes.
