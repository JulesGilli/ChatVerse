# ChatVerse  

**ChatVerse** est une application de messagerie en temps réel moderne, conçue pour fournir une expérience utilisateur claire et intuitive. Ce projet respecte les spécifications techniques et fonctionnelles décrites pour assurer un produit performant et professionnel.

---

## 📝 Table des matières  
1. [À propos du projet](#-à-propos-du-projet)  
2. [Fonctionnalités](#-fonctionnalités)  
3. [Architecture](#-architecture)  
4. [Prérequis](#-prérequis)  
5. [Installation](#-installation)  
6. [Utilisation](#-utilisation)  
7. [Tests](#-tests)  
8. [Auteurs](#-auteurs)  

---

## 📖 À propos du projet  

ChatVerse est une plateforme de messagerie en temps réel qui permet aux utilisateurs de communiquer dans des salons de discussion et via des messages privés. Le projet met un accent particulier sur l'ergonomie, la gestion des canaux, et une architecture robuste utilisant Node.js, Express.js et React.js.

---

## 🌟 Fonctionnalités  

### Serveur  
- **Node.js + Express.js** : Support de connexions simultanées avec sockets.  
- Gestion des utilisateurs et des canaux via des APIs REST sécurisées.  

### Client  
- **React.js** : Interface utilisateur moderne et réactive.  
- Gestion des canaux intuitive avec notifications en temps réel.  

### Fonctions principales  
- Liste des utilisateurs et des canaux disponibles.  
- Création, suppression, et gestion de canaux.  
- Envoi de messages privés et publics.  
- Notifications pour les connexions et déconnexions.  
- Persistance des données des messages et canaux.  

---

## 🏗️ Architecture  

- **Frontend** : React.js avec une interface intuitive et des fonctionnalités avancées.  
- **Backend** : Node.js avec Express.js et WebSocket pour la communication en temps réel.  
- **Base de données** : MongoDB pour stocker les utilisateurs, messages et canaux.  

---

## ⚙️ Prérequis  

- **Node.js** : v16 ou supérieur  
- **npm** : v8 ou supérieur  
- **MongoDB** : v5 ou supérieur  
- **Navigateur** : Dernière version de Chrome/Firefox  

---

## 🚀 Installation  

### Backend  
1. Clonez le dépôt et déplacez vous dedans:  
   ```bash
   git clone <repository_url>
   cd T-JSF-600-TLS_2
   ```  
2. Installez les dépendances :  
   ```bash
   cd server
   npm install --save
   ```  
3. Renomez le fichier `.envTemplate` en `.env` et remplissez les deux champs avec les paramètres fournis par nos experts 


4. Démarrez le serveur :  
   ```bash
   node ./server.js
   ```  

### Frontend  
1. Allez dans le dossier frontend :  
   ```bash
   cd ..
   cd client
   ```  
2. Installez les dépendances :  
   ```bash
   npm install
   ```  
3. Lancez le client :  
   ```bash
   npm start
   ```  

---

## 📖 Utilisation  

1. Connectez-vous via l'interface.  
2. Rejoignez un canal existant ou créez le vôtre.  
3. Discutez en temps réel avec les autres utilisateurs ou envoyez des messages privés.  

---

## 🧪 Tests  

### Lancement des tests  
- **Backend** :  
   ```bash
   cd backend
   npm test
   ```  
- **Frontend** :  
   ```bash
   cd frontend
   npm test
   ```  

### Types de tests inclus  
- **Unitaires** : Tests pour les fonctions critiques.   


## ✨ Auteurs  

- **Gabriel Basso** –
- **Jules Gilli** –
- **Enzo Alfred** –


**ChatVerse** - Parce que communiquer devrait toujours être intuitif et sans effort. 
