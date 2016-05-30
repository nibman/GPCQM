// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var serdymetrics = require("pubnub").init({
    publish_key: "pub-c-16d7d717-ff4b-4d94-8ac0-88e5ea163ffa",
    subscribe_key: "sub-c-49a703aa-1bae-11e6-a01f-0619f8945a4f"
});

var fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , es = require('event-stream')
    , jsonfile = require('jsonfile')
    , moment = require('moment');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) 
{
  /*var currentUser = Parse.User.current();
  if(currentUser)
  {
    res.status(200).send('This is where the data entry and event management occurs');
  }
  else
  {
    res.sendFile(path.join(__dirname, '/public/login.html'));
  }*/
  
  startTempBiometricsParser();
  
});

function startTempBiometricsParser()
{
  serdymetrics.subscribe({
  			channel: 'serdyMetrics',
  			message: function(e) { parseData.parse(e, ""); }
		});
}

function parseData(e)
{
  console.log(e);
  var bioData = {date:moment(), data:e};
  var pl = new Buffer(JSON.stringify(bioData)).toString("base64");
  saveJSONFile("/json/biometricsLive.json", JSON.stringify(pl), {spaces: 2});
}

function saveJSONFile(path, obj)
{
    var file = path;
    var obj = obj;

    jsonfile.writeFile(file, obj, function (err)
        {
            console.log("Done saving");
            if (err == null)
            {
                console.log("file written");
            }
            else
            {
                console.error(err)
            }
        });

}


// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
