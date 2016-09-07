import { Template } from 'meteor/templating';

import './gameboard.html';

Template.gameboard.onCreated(function gameboardOnCreated(game) {
  this.game = game;
});

Template.gameboard.helpers({
  gameIsNotReady() {
    return this.game.playerCount !== 4;
  },
  remainingPlayers() {
    return 4 - this.game.playerCount;
  },
  turnCount() {
    return this.game.turnCount + 1;
  }, 
  turns() {
    return [0, 1, 2, 3];
  },
  isTurn(turn) {
    return turn === this.game.turnCount % 4;
  },
  player(turn) {
    return this.game.players[turn];
  },
  score(turn) {
    var score = this.game.scores[turn];
    if (score === 100) {
      return "Winner";
    } else {
      return score;
    }
  },
  hasWinner() {
    for (var i = 0; i <= 4; i++) {
      if (this.game.scores[i] === 100) {
        return true;
      }
    }
    return false;
  },
  canRollDice() {
    var currTurn = this.game.turnCount % 4;
    return Meteor.userId() === this.game.playerIds[currTurn];
  },
  gameId() {
    return this.game._id;
  }, 
  moves() {
    return this.game.lastFiveMoves;
  },
  isSnake(move) {
    return move.isSnake;
  },
  isLadder(move) {
    return move.isLadder;
  },
});

Template.gameboard.events({
  'click .exitgame'(){
    Meteor.call('games.setFinished', this.game._id);
  },
});