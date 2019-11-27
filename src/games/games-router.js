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
        res.json({ board }, 200).end();
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
    GamesService.RespondWithCurrentGame(
      req.app.get('db'),
      req.params.game_room
    ).then(data => {
      if (data.player_joined_id == null) {
        return res.status(400).json({
          error: `Second player has not yet joined.`, // this entire function should just check if the second player has joined
        }); //if they have then the patch request should be canceled, currently the front-end is handling this problem
      }
    });
    GamesService.UpdateCurrentGame(
      req.app.get('db'),
      req.params.game_room,
      req.body.board,
      req.body.next_player
    )
      .then(game => {
        let boardCopy = [...game.board.split('')];
        let playerOneMoves = [];
        let playerTwoMoves = [];
        boardCopy.forEach((square, index) => {
          if (square === 'X') {
            playerOneMoves = [...playerOneMoves, index];
          }
          if (square === 'O') {
            playerTwoMoves = [...playerTwoMoves, index];
          }
        });
        const winCombos = [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
          [0, 4, 8],
          [2, 4, 6],
        ];
        winCombos.forEach(item => {
          let [a, b, c] = item;
          if (
            playerOneMoves.includes(a) &&
            playerOneMoves.includes(b) &&
            playerOneMoves.includes(c)
          ) {
            return console.log('Player One has Won');
          }
          if (
            playerTwoMoves.includes(a) &&
            playerTwoMoves.includes(b) &&
            playerTwoMoves.includes(c)
          ) {
            return console.log('Player Two has Won');
          }
        });
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
