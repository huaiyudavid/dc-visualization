/*global $*/

import { network } from './NetworkAdapter.js';
import { Dates } from '../api/dates.js';
import { Sessions } from '../api/sessions.js';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import './tabs.html';

Template.tabs.helpers({
  'tabList': function() {
    var dates = Dates.find({}, {sort: {date: 1}}).fetch();
    var tabs = [];
    dates.forEach(function(date) {
      var dateStr = date.date.toString();
      tabs.push({
        id: date.date,
        text: (dateStr.substring(4, 6) + '/' + dateStr.substring(6) + '/' + dateStr.substring(0, 4)),
        active: date.date == Session.get('activedate')
      });
    });
    return tabs;
  }
});

Template.tabs.events({
  'click a': function(event, template) {
    var targetDate = parseInt(event.target.id, 10);
    
    //make this tab active
    Session.set('activedate', targetDate);
    
    Session.set('loading', true);
    
    Meteor.subscribe('sessions', event.target.id, function() {
      var session = Sessions.find({
        id: 0,
        date: targetDate
      }).fetch()[0];
      
      Session.set('session', session);
      var links = session.links;
      var states = session.states;
      var data = {
        nodes: states[0]['nodes'],
        links: links
      };
    
      var slider = $('#slider');
      slider.val(1);
      Session.set('sliderVal', 1);
      Session.set('playing', false);
      Session.set('timer', null);
      Session.set('time', 0);
      var gameInput = $('#game-input');
      gameInput.val(1);
      
      Session.set('loading', false);
    
      network.updateData(data);
    });
  }
});