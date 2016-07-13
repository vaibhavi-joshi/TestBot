var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
var bot = new builder.UniversalBot(connector);


//var connector = new builder.ConsoleConnector().listen();
// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'ceef4aa2-21d2-43d8-a1f3-d7250bec3dfc',
    appPassword: 'MJNhfc9iUbdjAHKemj7Fmkq'
});

server.post('/v1/messages', connector.listen());
server.listen(8081, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', function (session) {
    session.send('Hello World');
});


