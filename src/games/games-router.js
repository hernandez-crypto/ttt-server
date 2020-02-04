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
    if (!game_room)
      return res
        .status(400)
        .json({ message: 'game_room must be supplied in the request body' });
    GamesService.CreateNewGame(req.app.get('db'), req.user, game_room)
      .then((game) => {
        res
          .status(201)
          .json({ game })
          .end();
      })
      .catch(next);
  });

gamesRouter
  .route('/:game_room')
  .all(requireAuth)
  .all(checkGameExists)
  .get((req, res, next) => {
    if (!req.params.game_room) {
      return res
        .status(400)
        .json({ message: 'game_room must be supplied in query' });
    }
    GamesService.RespondWithCurrentGame(req.app.get('db'), req.params.game_room)
      .then((board) => {
        res.json(board);
      })
      .catch(next);
  })
  .post((req, res, next) => {
    if (!req.params.game_room) {
      return res
        .status(400)
        .json({ message: 'game_room must be supplied in query' });
    }
    GamesService.insertSecondPlayerIntoGame(
      req.app.get('db'),
      req.params.game_room,
      req.user
    )
      .then((board) => {
        res.json(board);
      })
      .catch(next);
  })
  .patch(jsonBodyParser, async (req, res, next) => {
    let { game_room } = req.params;
    let { index, symbol } = req.body;
    let knex = req.app.get('db');
    for (const key of [game_room, index, sybol])
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    let board, otherPlayer;
    await GamesService.RespondWithCurrentGame(
      req.app.get('db'),
      req.params.game_room
    )
      .then((gameInfo) => {
        board = gameInfo.board;
        otherPlayer =
          gameInfo.player_one_id === parseInt(req.user.id)
            ? gameInfo.player_two_id
            : gameInfo.player_one_id;
      })
      .catch(next);
    if (board[parseInt(index)] == '0') {
      let newBoard = board.split('');
      newBoard[parseInt(index)] = symbol;
      newBoard = newBoard.join('');
      GamesService.UpdateCurrentGame(knex, game_room, newBoard, otherPlayer)
        .then((game) => {
          let updatedGame = GamesService.handleIfThereIsAWinner(knex, game);
          return updatedGame;
        })
        .then((game) => {
          return res.status(200).json(game);
        })
        .catch(next);
    } else return res.status(200).json({ message: 'Please Wait' });
  });

async function checkGameExists(req, res, next) {
  try {
    const game = await GamesService.RespondWithCurrentGame(
      req.app.get('db'),
      req.params.game_room
    );

    if (!game)
      return res.status(404).json({
        error: `Game doesn't exist`
      });

    res.game = game;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = gamesRouter;
