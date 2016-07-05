/*global updateState*/
/*global $*/

import './controls.html'
import { Session } from 'meteor/session';
import { Dates } from '../api/dates.js';
import { Sessions } from '../api/sessions.js';
import { network, updateState } from './NetworkAdapter.js';

function leftPad(value, padding) {
    var zeroes = '0';
    
    for (var i = 0; i < padding; i++) { zeroes += '0'; }
    
    return (zeroes + value).slice(padding * -1);
}

//returns millis
function timeConvertSTI(timestr) {
  var hours = parseInt(timestr.substring(0, 2), 10);
  var mins = parseInt(timestr.substring(3, 5), 10);
  var secs = parseInt(timestr.substring(6, 8), 10);
  var millis = parseInt(timestr.substring(9, 11), 10);
  return millis + secs*100 + mins*60*100 + hours*60*60*100;
}

//returns string
function timeConvertITS(timeNum) {
  var hours = leftPad((~~(timeNum/360000)).toString(), 2);
  var mins = leftPad((~~(timeNum/6000)%60).toString(), 2);
  var secs = leftPad((~~(timeNum/100)%60).toString(), 2);
  var millis = leftPad((timeNum%100).toString(), 2);
  return hours + ':' + mins + ':' + secs + '.' + millis + '0000';
}

Template.controls.helpers({
  'total': function() {
    var session = Session.get('session');
    var states = session.states;
    return states.length;
  },
  
  'time': function() {
    if (Session.get('playing')) {
      var time = timeConvertITS(Session.get('time'));
      return time;
    } else {
      var session = Session.get('session');
      // var timeid = Template.instance().sliderVal.get() - 1;
      var timeid = Session.get('sliderVal') - 1;
      var time = session.states[timeid].time;
      //console.log(time);
      return time;
    }
  },
  
  'gameMax': function() {
    return Sessions.find({date: Session.get('activedate')}).count();
  },
  
  'playing': function() {
    return Session.get('playing');
  }
});

Template.controls.events({
  'click #next'(event, template) {
    event.preventDefault();
    
    var slider = template.$('#slider');
    var value = parseInt(slider.val(), 10);
    var newValue = value + 1;
    slider.val(newValue);
    // Template.instance().sliderVal.set(newValue);
    Session.set('sliderVal', newValue);
    
    if (!Session.get('playing')) {
      var time = timeConvertSTI(Session.get('session').states[newValue-1].time);
      Session.set('time', time);
    }

    updateState(slider);
  },
  
  'click #back'(event, template) {
    event.preventDefault();
    
    if (!Session.get('playing')) {
      var slider = template.$('#slider');
      var value = parseInt(slider.val(), 10);
      var newValue = value - 1;
      slider.val(newValue);
      Session.set('sliderVal', newValue);
      var time = timeConvertSTI(Session.get('session').states[newValue - 1].time);
      Session.set('time', time);
    
      updateState(slider);
    }
  },
  
  'mouseup #slider'(event, template) {
    if (!Session.get('playing')) {
      console.log('up');
    
      var slider = template.$('#slider');
      var value = parseInt(slider.val(), 10);
      Session.set('sliderVal', value);
      var time = timeConvertSTI(Session.get('session').states[value-1].time);
      Session.set('time', time);
      console.log(time);
      
      updateState(slider);
    } else {
      event.preventDefault();
    }
  },
  
  'input #slider'(event, template) {
    if (!Session.get('playing')) {
      console.log('slide');
      var slider = template.$('#slider');
      var value = parseInt(slider.val(), 10);
      Session.set('sliderVal', value);
    } else {
      event.preventDefault();
    }
  },
  
  'submit #game-form'(event, template) {
    event.preventDefault();
    
    console.log('submitted');
    
    var targetid = parseInt(template.$('#game-input').val(), 10) - 1;
    
    console.log(targetid);
    
    var session = Sessions.find({id: targetid, date: Session.get('activedate')}).fetch()[0];
    console.log(Session.get('activedate'));
    console.log(session);
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
    
    network.updateData(data);
  },
  
  'click #play'(event, template) {
    Session.set('playing', true);
    Session.set('timer', setInterval(function() {
      var time = Session.get('time');
      console.log(time);
      time += 1;
      var session = Session.get('session');
      var nextStateID = parseInt($('#slider').val(), 10);
      if (nextStateID < session.states.length) {
        var state = session.states[nextStateID];
        var nextTime = timeConvertSTI(state.time);
        if (time >= nextTime) {
          $('#next').click();
        }
      } else {
        $('#pause').click();
      }
      Session.set('time', time);
    }), 1);
  },
  
  'click #stop'(event, template) {
    clearInterval(Session.get('timer'));
    Session.set('playing', false);
    var slider = template.$('#slider');
    Session.set('sliderVal', 1);
    slider.val(1);
    slider.mouseup();
    Session.set('time', 0);
  },
  
  'click #pause'(event, template) {
    clearInterval(Session.get('timer'));
    Session.set('playing', false);
  }
});