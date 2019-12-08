const GamesService = {
  CreateNewGame(knex, player_one, game_room) {
    return knex
      .insert({
        player_one_id: player_one.id,
        player_one_usrname: player_one.user_name,
        current_player: player_one.id,
        game_room,
      })
      .into('game_session')
      .returning('*')
      .then(([game]) => game)
      .then(() => this.RespondWithCurrentGame(knex, game_room));
  },
  RespondWithCurrentGame(knex, game_room) {
    return knex
      .select('*')
      .from('game_session')
      .where({ game_room })
      .first();
  },
  insertSecondPlayerIntoGame(knex, game_room, player_two) {
    return knex('game_session')
      .update({
        player_two_id: player_two.id,
        player_two_usrname: player_two.user_name,
      })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(() => this.RespondWithCurrentGame(knex, game_room));
  },
  UpdateCurrentGame(knex, game_room, board, other_player_id) {
    return knex('game_session')
      .update({ board, current_player: other_player_id })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(() => this.RespondWithCurrentGame(knex, game_room));
  },
  clearBoardWithWinner(knex, game, winner) {
    let { game_room, round } = game;
    return knex('game_session')
      .update(winner)
      .update({ board: '000000000', round: round + 1 })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(() => this.RespondWithCurrentGame(knex, game_room));
  },
  clearBoardWithOutWinner(knex, game) {
    let { game_room, round } = game;
    return knex('game_session')
      .update({ board: '000000000', round: round + 1 })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(() => this.RespondWithCurrentGame(knex, game_room));
  },
  handleIfThereIsAWinner(knex, game) {
    let boardCopy = [...game.board.split('')];
    let playerOneMoves = [];
    let playerOneWon = {
      player_started_score: game.player_started_score + 1,
    };
    let playerTwoWon = {
      player_joined_score: game.player_joined_score + 1,
    };
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
        this.clearBoardWithWinner(knex, game, playerOneWon);
        return;
      }
      if (
        playerTwoMoves.includes(a) &&
        playerTwoMoves.includes(b) &&
        playerTwoMoves.includes(c)
      ) {
        this.clearBoardWithWinner(knex, game, playerTwoWon);
        return;
      }
    });
    if (this.checkIfBoardIsFull(boardCopy)) {
      this.clearBoardWithOutWinner(knex, game);
    }
    return game;
  },
  checkIfBoardIsFull(board) {
    if (!board.find(square => Number.isInteger(parseInt(square)))) {
      return true;
    } else return false;
  },
};

module.exports = GamesService;
