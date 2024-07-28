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

- URL `http://localhost:8080/api/pokemon`

- Method: `POST`
- Access: Protected (requires JWT token)

### Get All Pokémon for the Authenticated User

- URL `http://localhost:8080/api/pokemon`
- Method: `GET`
- Access: Protected (requires JWT token)

## Party Route

### Get party details for the Authenticated User

- URL `http://localhost:8080/api/party`
- Method: `GET`
- Access: Protected (requires JWT token)
