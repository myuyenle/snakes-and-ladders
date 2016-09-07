import { Template } from 'meteor/templating';

import './waitinggame.html';

Template.waitinggame.events({
  'click .joingame'() {
    Meteor.call('games.join', this._id, Meteor.userId());
  },
});