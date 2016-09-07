import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Games } from '../api/games.js';
import './mainmenu.html';

Template.mainmenu.onCreated(function mainmenuOnCreated() {
  Meteor.subscribe('games');
});

Template.mainmenu.helpers({
  inAGame() {
    var gameCount = Games.find({ playerIds: { $in: [ Meteor.userId() ]} }).count();
    return gameCount === 1;    
  },
  ongoingGame() {
    return Games.findOne({ playerIds: { $in: [ Meteor.userId() ] }
    });
  },
  hasWaitingGame() {
    var gameCount = Games.find({ playerCount: { $lt: 4 } }).count();
    return gameCount !== 0;
  },
  waitingGames() {
    return Games.find({ 
      $and: [
        { playerIds: { $nin: [Meteor.userId()] } },
        { playerCount: { $lt: 4 } },
      ],
    });
  },
  waitingCount() {
    return Games.find({ playerCount: { $lt: 4 } }).count();
  },
});

Template.mainmenu.events({
  'click .creategame'() {
    Meteor.call('games.start');
  },
});