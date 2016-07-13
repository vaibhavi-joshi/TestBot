var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================
// Setup Restify Server
var server = restify.createServer();
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var port = process.env.PORT || 8082;

//var connector = new builder.ConsoleConnector().listen();
// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'ceef4aa2-21d2-43d8-a1f3-d7250bec3dfc',
    appPassword: 'MJNhfc9iUbdjAHKemj7Fmkq'
});

server.post('/api/messages', connector.listen());
server.listen(port, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', function (session) {
    session.send('Hello World');
});


