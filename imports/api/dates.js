import { Mongo } from 'meteor/mongo';
 
export const Dates = new Mongo.Collection('dates');



if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('dates', function datesPublication() {
    var self = this;
    Dates.find().forEach(function(date) {
        self.added('dates', date._id, date);
    });
    self.ready();
  });
}