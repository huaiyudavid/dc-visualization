import Network from './visualization.js';
import { Session } from 'meteor/session';

export var network = Network();

export function updateState(slider) {
  var session = Session.get('session');
  var stateid = parseInt(slider.val(), 10) - 1;
  var links = session.links;
  var states = session.states;
  var data = {
    nodes: states[stateid]['nodes'],
    links: links
  };
  network.updateState(data);
}