const express = require('express');
const GamesService = require('./games-service');
const { requireAuth } = require('../middleware/jwt-auth');
const gamesRouter = express.Router();
const path = require('path');
const jsonBodyParser = express.json();

gamesRouter
  .route('/')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { game_room } = req.body;
    GamesService.CreateNewGame(req.app.get('db'), req.user, game_room)
      .then(board => {
        res
          .status(201)
          .json({ board })
          .end();
      })
      .catch(next);
  });

gamesRouter
  .route('/:game_room')
  .all(requireAuth)
  .all(checkGameExists)
  .get((req, res, next) => {
    GamesService.RespondWithCurrentGame(req.app.get('db'), req.params.game_room)
      .then(board => {
        res.json(board);
      })
      .catch(next);
  })
  .post((req, res, next) => {
    GamesService.insertSecondPlayerIntoGame(
      req.app.get('db'),
      req.params.game_room,
      req.user
    )
      .then(board => {
        res.json(board);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    let { game_room } = req.params;
    let { board, next_player } = req.body;
    let knex = req.app.get('db');
    GamesService.UpdateCurrentGame(knex, game_room, board, next_player)
      .then(game => {
        GamesService.handleIfThereIsAWinner(knex, game); // checks if there is a combo with winning combo and updates database accordingly
        return game;
      })
      .then(game => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${game.id}`))
          .json(game);
      })
      .catch(next);
  });

async function checkGameExists(req, res, next) {
  try {
    const game = await GamesService.RespondWithCurrentGame(
      req.app.get('db'),
      req.params.game_room
    );

    if (!game)
      return res.status(404).json({
        error: `Game doesn't exist`,
      });

    res.game = game;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = gamesRouter;
