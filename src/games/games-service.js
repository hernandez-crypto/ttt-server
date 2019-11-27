/* eslint-disable no-console */
/* eslint-disable quotes */
const GamesService = {
  CreateNewGame(knex, player_one, game_room) {
    return knex
      .insert({
        player_started_id: player_one.id,
        player_started_usrname: player_one.user_name,
        current_player: player_one.id,
        game_room,
      })
      .into('board')
      .returning('*')
      .then(([game]) => game)
      .then(game => this.RespondWithCurrentGame(knex, game.game_room));
  },
  UpdateCurrentGame(knex, game_room, board, other_player_id) {
    return knex('board')
      .update({ board, current_player: other_player_id })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(game => this.RespondWithCurrentGame(knex, game.game_room));
  },
  RespondWithCurrentGame(knex, game_room) {
    return knex
      .select('*')
      .from('board')
      .where({ game_room })
      .first();
  },
  insertSecondPlayerIntoGame(knex, game_room, player_two) {
    return knex('board')
      .update({
        player_joined_id: player_two.id,
        player_joined_usrname: player_two.user_name,
      })
      .where({ game_room })
      .returning('*')
      .then(([game]) => game)
      .then(game => this.RespondWithCurrentGame(knex, game.game_room));
  },
};

module.exports = GamesService;
