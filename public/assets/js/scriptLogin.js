function field_focus(field, email)
  {
    if(field.value == email)
    {
      field.value = '';
    }
  }

  function field_blur(field, email)
  {
    if(field.value == '')
    {
      field.value = email;
    }
  }

//Fade in dashboard box
$(document).ready(function()
  {
    $('.box').hide().fadeIn(1000);
  });

//Stop click event
$('a').click(function(event)
{
    if(event.currentTarget == "http://gpcqm.herokuapp.com/#login")
    {
      console.log($( "input[name='email']" ).value);
      // Serdy.createUser("gronour", "GNiB12031974NiBM")
      // Serdy.logIn("");
    }
    else if(event.currentTarget == "http://gpcqm.herokuapp.com/#signup")
    {
       console.log("signup");
    }
    
    event.preventDefault(); 
});



/**
 *  Parse requests handler
 */

var ParseRequest = {};

ParseRequest.postData = function() {
  XHR.setCallback(function(data){
    // store objectID
    Store.objectId = JSON.parse(data).objectId;
    // close first step
    Steps.closeStep('#step-1');
    Steps.fillStepOutput('#step-1-output', data)
    Steps.fillBtn('#step-1-btn', 'Posted');
    // open second step
    Steps.openStep('#step-2');
    Steps.bindBtn('#step-2-btn', function(e){
      ParseRequest.getData();
      e.preventDefault();
    });
  });
  XHR.POST('/parse/classes/GameScore');
}

ParseRequest.getData = function() {
  XHR.setCallback(function(data){
    // close second step
    Steps.closeStep('#step-2');
    Steps.fillStepOutput('#step-2-output', data)
    Steps.fillBtn('#step-2-btn', 'Fetched');
    // open third step
    Steps.openStep('#step-3');
    Steps.bindBtn('#step-3-btn', function(e){
      ParseRequest.postCloudCodeData();
      e.preventDefault();
    })
  });
  XHR.GET('/parse/classes/GameScore');
}

ParseRequest.postCloudCodeData = function() {
  XHR.setCallback(function(data){
    // close second step
    Steps.closeStep('#step-3');
    Steps.fillStepOutput('#step-3-output', data)
    Steps.fillBtn('#step-3-btn', 'Tested');
    // open third step
    Steps.showWorkingMessage();
  });
  XHR.POST('/parse/functions/hello');
}


/**
 * Store objectId and other references
 */

var Store = {
  objectId: ""
};

var Config = {}

Config.getUrl = function() {
  if (url) return url;
  var port = window.location.port;
  var url = window.location.protocol + '//' + window.location.hostname;
  if (port) url = url + ':' + port;
  return url;
}


/**
 * XHR object
 */

var XHR = {}

XHR.setCallback = function(callback) {
  this.xhttp = new XMLHttpRequest();
  var _self = this;
  this.xhttp.onreadystatechange = function() {
    if (_self.xhttp.readyState == 4 && _self.xhttp.status >= 200 && _self.xhttp.status <= 299) {
      callback(_self.xhttp.responseText);
    }
  };
}

XHR.POST = function(path, callback) {
  var seed = {"score":1337,"playerName":"Sean Plott","cheatMode":false}
  this.xhttp.open("POST", Config.getUrl() + path, true);
  this.xhttp.setRequestHeader("X-Parse-Application-Id", "myAppId");
  this.xhttp.setRequestHeader("Content-type", "application/json");
  this.xhttp.send(JSON.stringify(seed));
}

XHR.GET = function(path, callback) {
  this.xhttp.open("GET", Config.getUrl() + path + '/' + Store.objectId, true);
  this.xhttp.setRequestHeader("X-Parse-Application-Id", "myAppId");
  this.xhttp.setRequestHeader("Content-type", "application/json");
  this.xhttp.send(null);
}


/**
 *  Boot
 */

