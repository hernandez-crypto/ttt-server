# Tic-Tac-Toe Server!

    - Link to live project :
    [Tic-Tac-Toe](https://ttt-client.hernandezjulio58.now.sh/ "Live Site")

The endpoints on this server are :

    - POST /api/users. This endpoint requires a username and password to be sent through the request body. There are requirements for those strings which will be made apparent through error messages.
    This endpoint is used to register users.

    // req.body
    {
    username: String,
    password: String
    }

    // res.body
    {
    id: Number,
    username: String,
    date_created: String
    }

    - POST /api/auth/login.  This endpoint also requires a username and password, but this endpoint is used to login in to your account. An authToken is sent back on this endpoint which is used on our the protected endpoint /api/auth/games.

    // req.body
    {
    username: String,
    password: String
    }

    // res.body
    {
    authToken: String
    }

    -POST /api/auth/games. This endpoint requires you to be logged in, or if testing with Postman you need to set a valid authToken in the header. This endpoint is used to create new games, the only other requirement is a game_room key in the body with a special string.'

    -GET /api/auth/games/:game_room. This endpoint requires authentication. It is used to retrieve information about a game in progress.

    //req.headers
    {
        Authorization Bearer String
        Content-Type application/json
    }
    //req.query
    {
        game_room : String
    }


    -POST /api/auth/games/:game_room. This endpoint requires authentication. It is the endpoint used to add the second player into the game. The special game_room string generated by player one needs to be sent through the request query.

     //req.headers
    {
        Authorization Bearer String
        Content-Type application/json
    }
      //req.query
    {
        game_room : String
    }
    //res.body
    {
        game_id: Number,
        game_room: String,
        date_created: String,
        player_one_id: Number,
        player_one_username: String,
        player_one_score: Number,
        player_two_id: String,
        player_two_username: String,
        player_two_score: Number,
        current_player: Number,
        board: String,
        round: Number
    }

    -PATCH /api/auth/games/:game_room. This endpoint requires authentication. This route also requires the board to be sent through using a string that represents the board. Ex. { board: '00000000X' }. It is the endpoint used to change the game state. The server checks for a winner on every request and handles that accordingly.

     //req.headers
    {
        Authorization Bearer String
        Content-Type application/json
    }
      //req.query
    {
        game_room : String
    }
        //res.body
    {
        game_id: Number,
        game_room: String,
        date_created: String,
        player_one_id: Number,
        player_one_username: String,
        player_one_score: Number,
        player_two_id: String,
        player_two_username: String,
        player_two_score: Number,
        current_player: Number,
        board: String,
        round: Number
    }

## Technology Used

    - Node, PostgreSQL, Express, Supertest, Chai, Bcrypt, Heroku, JWT

## Screenshots of Live App

![onlineLight](/screenshots/onlineLight.png 'Online Page Light')
![onlineDark](/screenshots/onlineDark.png 'Online Page Dark')
![offlineLight](/screenshots/offlineLight.png 'Offline Page Light')
![offlineDark](/screenshots/offlineDark.png 'Offline Page Dark')
![registrationLight](/screenshots/registrationLight.png 'Registration Page Light')
![registrationDark](/screenshots/registrationDark.png 'Registration Page Dark')
![landingPageLight](/screenshots/landingPageLight.png 'Landing Page Light')
![landingPageDark](/screenshots/landingPageDark.png 'Landing Page Dark')
![loadingLight](/screenshots/loadingLight.png 'Loading Animation Light')
![loadingDark](/screenshots/loadingDark.png 'Loading Animation Dark')
![gameFormLight](/screenshots/gameFormLight.png 'Game Form Page Light')
![gameFormDark](/screenshots/gameFormDark.png 'Game Form Page Dark')

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests in watch mode `npm test`

Migrate the dev database `npm run migrate`

Migrate the test database `npm run migrate:test`

## Configuring Postgres

For tests involving time to run properly, configure your Postgres database to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
   1. E.g. for an OS X, Homebrew install: `/usr/local/var/postgres/postgresql.conf`
   2. E.g. on Windows, _maybe_: `C:\Program Files\PostgreSQL\11.2\data\postgresql.conf`
2. Find the `timezone` line and set it to `UTC`:

```conf
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```
