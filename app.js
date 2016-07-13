var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

var server = restify.createServer();
var port = process.env.PORT || 8082;

//var connector = new builder.ConsoleConnector().listen();
// Create chat bot
var connector = new builder.ChatConnector({
    appId: 'ceef4aa2-21d2-43d8-a1f3-d7250bec3dfc',
    appPassword: 'MJNhfc9iUbdjAHKemj7Fmkq'
});
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());
server.listen(port, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

//=========================================================
// Luis Setup
//=========================================================

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=814f9a05-0e84-41f4-aec9-f205211b3a46&subscription-key=0d6df140e73b4f07a204058a0769d60e');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });


//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', dialog);


dialog.matches('CheckHoliday',function (session, args) {

	console.log('holiday detected');
    session.send("Next Holiday is 'Independece Day' on Monday July 04 2016");
});

 dialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

