/*global Router*/

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loadingWheel',
    waitOn: function() {
        Meteor.subscribe('dates');
        return Meteor.subscribe('sessions', '20160404');
    }
});

Router.route('/', {
    name: 'loadedData'
});