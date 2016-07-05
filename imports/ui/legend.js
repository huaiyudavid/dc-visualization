import { Session } from 'meteor/session';
import './legend.html';


Template.legend.helpers({
    'incentives': function() {
        var session = Session.get('session');
        return session.info.incentives;
    },
    
    'homophilic': function() {
        var session = Session.get('session');
        return session.info.homophilic;
    },
    
    'communication': function() {
        var session = Session.get('session');
        return session.info.communication;
    },
    
    'model': function() {
        var session = Session.get('session');
        return session.info.model;
    },
    
    'structured': function() {
        var session = Session.get('session');
        return session.info.structured;
    }
})