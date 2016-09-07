import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Games = new Mongo.Collection('games');

if (Meteor.isServer) {
	Meteor.publish('games', function gamesPublication() {
		return Games.find({ finished: { $ne: true } });
  });
}

const BOARD =   [0,37,0,0,10,0,0,0,0,22,0,
                0,0,0,0,0,0,-10,0,0,0,
                21,0,0,0,0,0,0,56,0,0,
                0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,
                16,0,0,-20,0,0,0,0,0,0,
                0,-43,0,-4,0,0,0,0,0,0,
                20,0,0,0,0,0,0,0,0,20,
                0,0,0,0,0,0,-63,0,0,0,
                0,0,-20,0,-20,0,0,-19,0,0];

Meteor.methods({
	'games.start'() {
 		if (!this.userId) {
 	  	throw new Meteor.Error('not-authorized');
 		}
 		Games.insert({
      owner: this.userId,
      playerIds: [ this.userId ],
      players: [ Meteor.users.findOne(this.userId).username ],
      scores: [ 0, 0, 0, 0 ],
      playerCount: 1,
 	  	turnCount: 0,
    });
 	},
 	'games.remove'(gameId) {
 		check(gameId, String);

 		const game = Games.findOne(gameId);
 		if (game.owner !== this.userId) {
 			throw new Meteor.Error('not-authorized');
 		}
 		Games.remove(gameId);
 	},
 	'games.join'(gameId, userId) {
 		check(gameId, String);
 		check(userId, String);
 		
    const game = Games.findOne(gameId);
 		if (game.playerIds.length === 4) {
 			throw new Meteor.Error('game-is-full');
 		}

 		Games.update(gameId, 
      { $addToSet: { players: Meteor.users.findOne(userId).username, 
        playerIds: userId },
        $inc: { playerCount: 1 } 
      }
    );
 	},
 	'games.adjustScore'(gameId, diceNumber) {
 		check(gameId, String);
 		check(diceNumber, Number);
    const game = Games.findOne(gameId);

    var turnNumber = game.turnCount % 4;
    var newScore = Math.min(game.scores[turnNumber] + diceNumber, 100);
    //the tile is snake or ladder, the score is further changed
    var boardValue = BOARD[newScore];
    var finalNewScore = newScore + boardValue;
    console.log(finalNewScore);
    
    //check if there is any same score
    var noIdenticalScore = true;
    for (var i = 0; i < game.scores.length; i++) {
      if (finalNewScore === game.scores[i]) {
        console.log("identical score");
        noIdenticalScore = false;
      }
    }

    //if no identical score, update the score
    if (noIdenticalScore) {
      var playerPos = game.turnCount%4 ;
     	Games.update(gameId,
        { $set: { [`scores.${playerPos}`]: finalNewScore } }
      );
      Games.update(gameId, 
        { $inc : { turnCount: 1 } } 
      );
    }

    //lastly, update the list of last 5 moves
    var isSnake = (boardValue < 0);
    var isLadder = (boardValue > 0);
    var player = Meteor.users.findOne(game.playerIds[turnNumber]).username;
    Games.update(gameId,
      { $push: {
        lastFiveMoves: {
          $each: [ { at: new Date(), player: player,
            diceNumber: diceNumber, isSnake: isSnake, isLadder: isLadder } ],
          $sort: { at: -1 },
          $slice: 5
        }
      } } 
    );
  },
  'games.setFinished'(gameId) {
    check(gameId, String);
    Games.update(gameId,
      { $set: { finished: true } } 
    );
  },
});