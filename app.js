var builder = require('botbuilder');
var restify = require('restify');
var request = require('request');

//=========================================================
// HRMS varibale
//=========================================================
var host = "http://14.141.118.75";
var base_url = "/mobile/hrms_web_services/services/index.php?";


var sessionID = null;
var username = null;
var password = null;
var emp_number = null;
var current_leave_count = null;

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

bot.dialog('/login',[ function (session) {
        username = null;
        password = null;
		builder.Prompts.text(session, 'Enter your username and password for login. First Enter your username.');
	},
	function (session, results, next) {
		username = results.response;
	//	console.log('username = %s',username);
		builder.Prompts.text(session, 'Enter your Domain Password');
	},
	function (session, results, next) {
			
		password = results.response;
        session.send('Please wait... I am logging in for you...');
		//console.log('passowrd = %s',password);
	

        //Call login API of HRMS with user Input
        login(username, password, function (token, emp_num, err) {
		
         console.log('login call back is called');
			if(token == null) {
				builder.Prompts.choice(session, "Something went wrong while logging in. Retry?", ["yes","no"]);
                //builder.Prompts.choice(session, "Which color?", ["red","green","blue"]);
			}
			else {
                console.log('Login  Callback is called successful');
                session.send('You are now logged into HRMS');
				//set received token and emp_num to program vars for future work
				sessionID = token;
				emp_number = emp_num;
             	session.endDialog(); //For BotconnectorBot
			 // session.replaceDialog('/',dialog); //For Textbot to test scenario
			  
			}
		}
		); 
 },
 function (session, results) {

		if(results.response) {
			var choice = results.response.entity;
			//console.log('choice entered = %s', choice);
			if(choice == "yes") {
				session.endDialog();
				session.beginDialog("/login");
			}
			else {
				session.endDialog();		
			}
		}	
	}
 
 ]);

 //=========================================================
// Luis Dialog that matches particular IntentDialog
//=========================================================

//dialog.on('CheckLeave', builder.DialogAction.send("Next Holiday is 'Independence Day' on Monday, July 04 2016. Happy Holiday!"));
dialog.matches('CheckLeave', [function (session) {
if (sessionID != null && emp_number != null) {
     //  session.send("your previous session is still alive, you can continue with HRMS Task..ask for check leave balance");
        
         checkLeaveBalance(function (leave_count,error) {

					if (error == null)
					{
						session.send('Your available leave balance is = %s',leave_count);
					}
					else
					{
							session.send('Something went wrong while checking for your leave balance, please try after sometime.');
                          //  session.endDialog();
					}
			});
   }//end elseif
   else
   {
     session.beginDialog('/login'); 
   }
}]


);
dialog.matches('CheckHoliday',function (session, args) {

//	console.log('holiday detected');
    session.send("Next Holiday is 'Independece Day' on Monday July 04 2016");
});


dialog.matches('logout',function (session, args) {

	console.log('It might take while..please wait');
    username = null;
    password = null;
    sessionID = null;
    emp_number = null;
    current_leave_count = null;
    session.send("You are now logged out!")
});


 dialog.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));


//=========================================================
// User defined Function Login
//=========================================================

function login(uname, pwd, callback) {

var t = null,  emp = null , err = null;

//http://10.12.40.86/mobile/hrms_web_services/services/index.php?data={"method":"login","params":{"username":"shailesh.kanzariya","password":"DoaminPassword”}}
var propertiesObject =  "data={\"method\":\"login\",\"params\":{\"username\":\"" +uname+ "\",\"password\":\"" +pwd+ "\"}}";   

var options = {

  uri: host+base_url+propertiesObject
  
};

request(options, function (error, response, body) {

   console.log("received resonse from HRMS"); // Show the HTML for the Google homepage.
   var jsonData = JSON.parse(body);

   console.log("josn parsing is done");
   if (jsonData.error)
   {
         console.log("josn data error");
        console.log('Error = ', jsonData.message);
		err = jsonData.message;
        callback(t, emp, err);
   }
   else{
       console.log("Entered into else part!!!");
        console.log('token = ', jsonData.token);
		console.log('emp_number =', jsonData.emp_number);
		t = jsonData.token;
		emp = jsonData.emp_number;
        console.log("calling call back function");
        callback(t, emp, err);
   }
	
});
 console.log('waiting for response');
 }

//=========================================================
// User defined Function Check Leave Balance
//=========================================================

function checkLeaveBalance(callback){
   // http://10.12.40.86/mobile/hrms_web_services/services/index.php?data={"method":"fetch_leave_count_by_type","params":{"user_id":"11311","leave_type":"LTY001","token":"Receivedfromloginresponse"}}
 var propertiesObject =  "data={\"method\":\"fetch_leave_count_by_type\",\"params\":{\"user_id\":\"" +emp_number+ "\",\"leave_type\":\"LTY001\",\"token\":\"" +sessionID+ "\"}}"    

var options = {
  uri: host+base_url+propertiesObject
};

request(options, function (error, response, body) {

   // console.log(body) // Show the HTML for the Google homepage.
   var jsonData = JSON.parse(body);
   if (jsonData.error)
   {
       //console.log('Error = ', jsonData.message);
	   callback(null,jsonData.message);
       
   }
   else{
		current_leave_count = jsonData.leave_count;
	//	console.log('your leave balance is = ', current_leave_count);	
		callback(current_leave_count,null);
		
   }
	
});

}
