var $form_wrapper	= $('#form_wrapper'),
$currentForm	= $form_wrapper.children('form.active'),
$linkform		= $form_wrapper.find('.linkform');

$form_wrapper.children('form').each(function(i)
  {
	  var $theForm	= $(this);
	  //solve the inline display none problem when using fadeIn/fadeOut
	  if(!$theForm.hasClass('active'))
		  $theForm.hide();
	
    $theForm.data(
      {
		    width	: $theForm.width(),
		    height	: $theForm.height()
	    });
  });

setWrapperWidth();

$linkform.bind('click', function(e)
  {
    var $link	= $(this);
    var target	= $link.attr('rel');
	  
    $currentForm.fadeOut(400, function()
    {
		  //remove class "active" from current form
		  $currentForm.removeClass('active');
		  //new current form
		  $currentForm= $form_wrapper.children('form.'+target);
		  //animate the wrapper
		  $form_wrapper.stop()
					 .animate({
						width	: $currentForm.data('width') + 'px',
						height	: $currentForm.data('height') + 'px'
					 },500,function(){
						//new form gets class "active"
						$currentForm.addClass('active');
						//show the new form
						$currentForm.fadeIn(400);
					 });
	  });
	  e.preventDefault();
  });

  function setWrapperWidth()
  {
	  $form_wrapper.css({
		  width	: $currentForm.data('width') + 'px',
		  height	: $currentForm.data('height') + 'px'
	  });
  }
  
  $form_wrapper.find('input[type="submit"]')
			 .click(function(e){
				e.preventDefault();
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

