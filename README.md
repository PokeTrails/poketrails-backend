# poketrails-backend

Backend React repository for the PokéTrails web application

## Install dependencies

```sh
npm install
```

## Create a .env file in the root directory of the project and add the following

```sh
PORT=8080
```

## Start MongoDB (WSL Users)

If you're using Windows Subsystem for Linux (WSL), you need to start MongoDB with the following command:

```sh
sudo systemctl start mongod
```

## Start the server in development mode

```sh
npm run dev
```

## Seed data to the db

```sh
npm run seed
```

# Endpoints

## Login Route

- URL `http://localhost:8080/login`
- Method: `POST`
- Body:`{"username": "abc",  "password": "abc"}`

## Pokemon Route

### Create a New Pokémon

- URL `http://localhost:8080/pokemon`

- Method: `POST`
- Access: Protected (requires JWT token)

### Get All Pokémon for the Authenticated User

- URL `http://localhost:8080/pokemon`
- Method: `GET`
- Access: Protected (requires JWT token)

### Get All donated Pokémon for Pokedex

- URL `http://localhost:8080/pokemon/pokedex`
- Method: `GET`
- Access: Protected (requires JWT token)

### Get Pokémon by ID

- URL `http://localhost:8080/pokemon/:pokemonID`
- Method: `GET`
- Access: Protected (requires JWT token)

### set/edit Pokémon Nickname by Pokémon ID

- URL `http://localhost:8080/pokemon/nickname/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)
- Body: `{"nickname": "<NewNickname>"}`

### Hatch Pokémon Nickname by Pokémon ID

- URL `http://localhost:8080/pokemon/hatch/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

### Donate Pokémon Nickname by Pokémon ID

- URL `http://localhost:8080/pokemon/donate/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

### Talk with Pokémon by Pokémon ID

- URL `http://localhost:8080/pokemon/talk/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

### Play with Pokémon by Pokémon ID

- URL `http://localhost:8080/pokemon/play/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

### Feed with Pokémon by Pokémon ID

- URL `http://localhost:8080/pokemon/feed/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

### Evolve with Pokémon by Pokémon ID

- URL `http://localhost:8080/pokemon/evolve/:pokemonID`
- Method: PATCH
- Access: Protected (requires JWT token)

## Party Route

### Get party details for the Authenticated User

- URL `http://localhost:8080/party`
- Method: `GET`
- Access: Protected (requires JWT token)

## Store Route

### Get all items in the store

- URL `http://localhost:8080/store`
- Method: `GET`
- Access: Protected (requires JWT token)

### View individual items in the store by id

- URL `http://localhost:8080/store/view/:id`
- Method: `GET`
- Access: Protected (requires JWT token)

### Buy individual items in the store by id

- URL `http://localhost:8080/store/buy/:id`
- Method: `PATCH`
- Access: Protected (requires JWT token)

## User Route

### Create a New user

- URL `http://localhost:8080/user/create`

- Method: `POST`

### Delete a User

- URL `http://localhost:8080/user/(userID)`

- Method: `DELETE`

- Access: Protected (requires JWT token)

### Edit a User

- URL `http://localhost:8080/user/(userID)`

- Method: `PATCH`

- Access: Protected (requires JWT token)

### Find a User

- URL `http://localhost:8080/user/(userID)`

- Method: `GET`

## Find all Users

- URL `http://localhost:8080/user`

- Method: `GET`
