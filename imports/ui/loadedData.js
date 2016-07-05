/* global $ */
//mongoimport -h localhost:8081 --db meteor --collection sessions --type json --file experiment.json &> output.txt
//db.sessions.remove({id: {$lt: 10}})

//docker deployment
//mongoimport -h 127.0.0.1 --db dcvisual --collection sessions --type json --file /home/imports/experiment.json 
//docker exec -it mongodb mongo dcvisual
//docker cp experiment.json mongodb:/home/imports
//docker exec -t -i mongodb /bin/bash
import { Sessions } from "../api/sessions.js";
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Dates } from '../api/dates.js';

import './controls.js';
import './tabs.js';
import './legend.js';
import './loadedData.html';
import {network} from './NetworkAdapter.js';

Template.loadedData.rendered = function() {
  
  var sessions = Sessions.find({
    id: 0,
    date: 20160404
  });
  var session = sessions.fetch()[0];
  Session.set('session', session);
  Session.set('activedate', 20160404);
  Session.set('sliderVal', 1);
  Session.set('loading', false);
  Session.set('playing', false);
  Session.set('timer', null);
  Session.set('time', 0);

  var links = session.links;
  var states = session.states;
  var data = {
    nodes: states[0]['nodes'],
    links: links
  };
  //console.log(data);
  network('#vis', data);
}

Template.loadedData.helpers({
  'loading': function() {
    return Session.get('loading');
  }
})


Template.toggles.events({
  'click input': function(event, template) {
    var showNames = template.$('input').is(":checked");
    console.log(showNames);
    network.setShowNames(showNames);
  }
});

