import { Mongo } from 'meteor/mongo';
 
export const Sessions = new Mongo.Collection('sessions');

if (Meteor.isServer) {
  //This code only runs on the server
  Meteor.publish('sessions', function sessionsPublication(targetDate) {
    var self = this;
    Sessions.find({date: parseInt(targetDate, 10)}).forEach(function(session) {
        self.added('sessions', session._id, session);
    });
    self.ready();
  });
}