var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

app.get('/trois-rivieres', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/trois-rivieres.html"));
});

app.get('/lac-brome', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/lac-brome.html"));
});

app.get('/baie-st-paul', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/baie-st-paul.html"));
});

app.get('/montreal', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/montreal.html"));
});

app.get('/louiseville', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/louiseville.html"));
});

app.get('/st-felix-de-valois', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/st-felix-de-valois.html"));
});

app.get('/victoriaville', function(req, res) {
  res.sendFile(path.join(__dirname, "/public/victoriaville.html"));
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
