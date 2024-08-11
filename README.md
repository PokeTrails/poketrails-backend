![PokeTrails App Logo](./src/assets/app_logo.png)

# PokéTrails Front End Application

**Developed by Rahal Abeyrathna, Suraj Shrestha, and Talie Hodge**

---

## 🚀 Deployed Applications

- **Front End:** [https://poketrails.com](https://poketrails.com)
- **Back End:** [https://api.poketrails.com](https://api.poketrails.com)

## 📂 Repositories

- **Part A Docs:** [PokeTrailsDocs](https://github.com/PokeTrails/PokeTrailsDocs)
- **Client:** [poketrails-frontend](https://github.com/PokeTrails/poketrails-frontend)
- **Server:** [poketrails-backend](https://github.com/PokeTrails/poketrails-backend)

## 📄 Documentation

## Backend Install Instructions

### Install dependencies

```sh
npm install
```

### Create a .env file in the root directory of the project and add the following

```sh
PORT=8080
DATABASE_URL="YOUR URL HERE"
JWT_KEY="YOUR JWT KEY HERE"
```

### Start MongoDB (WSL Users)

If you're using Windows Subsystem for Linux (WSL), you need to start MongoDB with the following command:

```sh
sudo systemctl start mongod
```

### Start the server in development mode

```sh
npm run dev
```

## Seed data to the db

```sh
npm run seed
```

Login Details For a User:

```sh
USERNAME: user3
PASSWORD: user3
```

## Endpoints

### Authentication

| **Operation** | **URL**                | **Method** | **Body**                                   | **Access**           |
|---------------|------------------------|------------|--------------------------------------------|----------------------|
| Login          | `/login`                | POST       | `{"username": "abc", "password": "abc"}`   | Public               |

### Pokémon

| **Operation**                       | **URL**                                | **Method** | **Body**                      | **Access**           |
|-------------------------------------|----------------------------------------|------------|-------------------------------|----------------------|
| Create a New Pokémon                | `/pokemon`                             | POST       | -                             | Protected (JWT)      |
| Get All Pokémon                     | `/pokemon`                             | GET        | -                             | Protected (JWT)      |
| Get All Donated Pokémon             | `/pokemon/donated`                     | GET        | -                             | Protected (JWT)      |
| Get Pokémon by ID                   | `/pokemon/:pokemonID`                  | GET        | -                             | Protected (JWT)      |
| Set/Edit Pokémon Nickname           | `/pokemon/nickname/:pokemonID`         | PATCH      | `{"nickname": "<NewNickname>"}` | Protected (JWT)      |
| Hatch Pokémon                       | `/pokemon/hatch/:pokemonID`            | PATCH      | -                             | Protected (JWT)      |
| Donate Pokémon                      | `/pokemon/donate/:pokemonID`           | PATCH      | -                             | Protected (JWT)      |
| View Donation Reward                | `/pokemon/donate/reward/:pokemonID`    | GET        | -                             | Protected (JWT)      |
| Talk with Pokémon                   | `/pokemon/talk/:pokemonID`             | PATCH      | -                             | Protected (JWT)      |
| Play with Pokémon                   | `/pokemon/play/:pokemonID`             | PATCH      | -                             | Protected (JWT)      |
| Feed Pokémon                        | `/pokemon/feed/:pokemonID`             | PATCH      | -                             | Protected (JWT)      |
| Evolve Pokémon                      | `/pokemon/evolve/:pokemonID`           | PATCH      | -                             | Protected (JWT)      |

### Pokedex

| **Operation**       | **URL**            | **Method** | **Body** | **Access**           |
|---------------------|--------------------|------------|----------|----------------------|
| Get Pokedex Data    | `/pokedex`         | GET        | -        | Protected (JWT)      |

### Party

| **Operation**                      | **URL**           | **Method** | **Body** | **Access**           |
|------------------------------------|-------------------|------------|----------|----------------------|
| Get Party Details                  | `/party`          | GET        | -        | Protected (JWT)      |

### Store

| **Operation**           | **URL**                   | **Method** | **Body** | **Access**           |
|-------------------------|---------------------------|------------|----------|----------------------|
| Get All Items           | `/store`                  | GET        | -        | Protected (JWT)      |
| View Item by ID         | `/store/view/:id`         | GET        | -        | Protected (JWT)      |
| Buy Item by ID          | `/store/buy/:id`          | PATCH      | -        | Protected (JWT)      |

### User

| **Operation**         | **URL**                 | **Method** | **Body**                                                       | **Access**           |
|-----------------------|-------------------------|------------|----------------------------------------------------------------|----------------------|
| Create a New User     | `/user/signup`          | POST       | `{"username": "James", "trainerName": "James3", "sprite": "boySprite", "password": "password"}` | Public               |
| Login a User          | `/user/login`           | POST       | `{"username": "James", "password": "password"}`               | Public               |
| Delete a User         | `/user/delete/:userID`  | DELETE     | -                                                              | Protected (JWT)      |
| Edit a User           | `/user/patch/:userID`   | PATCH      | -                                                              | Protected (JWT)      |
| Find a User by ID     | `/user/find/:userID`    | GET        | -                                                              | Protected (JWT)      |
| Find All Users        | `/user`                 | GET        | -                                                              | Protected (JWT)      |

### Trail

| **Operation**         | **URL**                          | **Method** | **Body**                                             | **Access**           |
|-----------------------|----------------------------------|------------|------------------------------------------------------|----------------------|
| Send on Trail         | `/trail/simulate`                 | POST       | `{"title": "Wild Trail", "pokemonId": "12123123aseasdasda"}` | Protected (JWT)      |
| Finish Trail          | `/trail/finish`                  | POST       | `{"pokemonId": "12123123aseasdasda"}`                | Protected (JWT)      |
| Find a Trail by Title | `/trail/:trailtitle` (e.g., `wettrail`) | GET        | -                                                    | -                    |
| Get All Trails        | `/trail/`                        | GET        | -                                                    | -                    |
| Delete a Trail by Title | `/trail/:trailtitle` (e.g., `wettrail`) | DELETE     | -                                                    | -                    |
| Patch a Trail by Title | `/trail/:trailtitle` (e.g., `wettrail`) | PATCH      | Any fields present on Trail Model (e.g., `{"length": "12030"}`) | -                    |

## Libaries Used

### Front-end

#### Vite

---

### Back-end

---

#### bcryptjs

Bcrypt is an essential tool in our application for securing user passwords. It hashes passwords before storing them in the database, ensuring they remain protected against potential breaches. Additionally, bcrypt provides a reliable method to verify hashed passwords against plain text inputs, enabling users to authenticate securely when logging in. This approach not only safeguards user credentials but also enhances overall application security by preventing unauthorized access.

#### cors

CORS is implemented in our application to manage and control access to resources from different domains. By using CORS, we allow or restrict requests from external origins, ensuring that only authorized domains can interact with our API. This helps prevent unauthorized or malicious access, enhancing the security of our application while still enabling legitimate cross-origin requests to function smoothly.

#### dotenv

Dotenv is utilized in our application to securely manage environment variables. By using dotenv, we load environment-specific configurations from a .env file into process.env. This allows us to keep sensitive information like API keys, database credentials, and other configuration settings out of the source code, enhancing security and flexibility. Dotenv ensures that different environments (development, testing, production) can have their own configurations, making the application easier to manage and deploy across various environments.

#### express

Express is the web framework used in our application to build the server-side logic efficiently and manage HTTP requests and responses. It provides a robust set of features for web and mobile applications, including routing, middleware support, and easy integration with various templating engines. Express allows us to define routes for different parts of our application, handle various HTTP methods, and manage middleware to process requests before they reach our endpoints.

#### jsonwebtoken

JSON Web Token (jsonwebtoken) is used in our application to securely manage user authentication. When a user logs in, the server generates a token that encodes the user's information (such as their user ID) using a secret key. This token is then sent to the client, typically in the headers of HTTP requests, and can be used to authenticate subsequent requests without the need to re-enter credentials. JSON Web Token allows us to verify the authenticity of the token on each request, ensuring that the user is who they claim to be.

#### mongoose

Mongoose is used in our application as an Object Data Modeling (ODM) library to interact with MongoDB, a NoSQL database. It provides a straightforward, schema-based solution to model application data, allowing us to define the structure of documents within collections in MongoDB. With Mongoose, we can create, read, update, and delete records in the database using a more intuitive, JavaScript-friendly syntax. Additionally, Mongoose offers powerful features like data validation, middleware for pre- and post-processing, and methods to perform complex queries, making it easier to manage and interact with the database.

#### nodemon

Nodemon is used in our application as a development tool that automatically monitors the files in your project for changes. Whenever you make changes to your code, Nodemon automatically restarts the server, ensuring that your application reflects the latest updates without the need to manually stop and start the server.

#### jest

Jest is used in our application as a testing framework designed to ensure the reliability and correctness of the codebase.

#### supertest

Supertest is used in our application as an HTTP assertion library to test the API endpoints. It allows us to simulate HTTP requests to our Express routes, verifying that the API behaves as expected in different scenarios.

## Testing

### Front-end Testing

(Rahal)

### Back-end Testing

(Suraj)

## Screenshots of Live Application

## Project Management

(Project management desciption, process, organisation and plannign)

Other planning as well (discord, meetings etc)

Link to trello board

### Screenshots of Trello Board
