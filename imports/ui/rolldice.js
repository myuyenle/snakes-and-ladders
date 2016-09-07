import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './rolldice.html';

Template.rolldice.onCreated(function rollDiceOnCreate(gameId) {
  this.reroll = new ReactiveVar(false);
  this.gameId = gameId;
});

Template.rolldice.helpers({
  reroll() {
    return Template.instance().reroll.get();
  },
});

Template.rolldice.events({
  'click .roll-dice'(instance) {
    Template.instance().reroll.set(true);
  	var number = Math.floor(Math.random()*6 + 1);
    Meteor.call('games.adjustScore', this.gameId, number);
  },
});