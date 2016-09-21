var Router = (function() {

	var self = this;

	var routes = [
		{ filter:'body#accueil-index',       cls:'Home',     method:'index' },
		{ filter:'body#accueil-abonnement',       cls:'Home',     method:'newsletter' },
		{ filter:'body#accueil-contact',       cls:'Home',     method:'contact' },
		{ filter:'body#concours-none',       cls:'Contest',     method:'none' },
		{ filter:'body#concours-index',       cls:'Contest',     method:'index' },
		{ filter:'body#fromages-index',       cls:'Cheese',     method:'index' },
		{ filter:'body#fromages-slug',       cls:'Cheese',     method:'slug' },
		{ filter:'body#fromageries-slug',       cls:'Cheese',     method:'shopSlug' },
		{ filter:'body#recettes-index',       cls:'Recipe',     method:'index' },
		{ filter:'body#recettes-slug',       cls:'Recipe',     method:'slug' },
		{ filter:'body#tout_sur_les_fromages-index',       cls:'About',     method:'index' },
		{ filter:'body[id*=tout_sur_les_fromages]:not(#tout_sur_les_fromages-index)',       cls:'About',     method:'page' },
		{ filter:'body#blog.home',       cls:'Blog',     method:'index' },
		{ filter:'body#blog:not(.home)',       cls:'Blog',     method:'view' },
		{ filter:'body#trucs-slug',     cls:'Tip',    method:'slug' },
		{ filter:'body#foodies-index',       cls:'Foodies',     method:'index' },
		{ filter:'body#foodies-slug',       cls:'Foodies',     method:'slug' }
	];

	self.currentPage = null;
	self.currentController = null;

	self.init = function() {
		// Loop through routes to call initializer
		for (var i = 0; i < routes.length; i++) {
			var route = routes[i];
			
			if ($(route.filter).length) {
				// Validate if classes and methods exist
				if (typeof window[route.cls] != 'undefined') {
					// Create new page
					self.currentController = new window[route.cls]();

					if (typeof self.currentController[route.method] != 'undefined') {
						// Call specific method
						self.currentController[route.method]();
					} else {
						console.log('Method ' + route.method + ' not found in Class ' + route.cls);
					}

					// No need to check further
					break;
				} else {
					console.log('Class ' + route.cls + ' not found');
				}
			}
		}
	}

	/** ------------------------------
	 * Constructor
	 --------------------------------- */

	var construct = (function() {
		
	})();

	return self;
})();



$.fn.ajaxify = function(){
	// Empty functions for unsupported browsers
};


// History.js It!
// v1.0.1 - 30 September, 2012
// https://gist.github.com/854622
(function(window,undefined){
	
	// Prepare our Variables
	var
		History = window.History,
		$ = window.jQuery,
		document = window.document;

	// Check to see if History.js is enabled for our Browser
	if ( !History.enabled) {
		return false;
	}
	
	// Wait for Document
	$(function(){
		if ($('body').hasClass('accessible')) {
			return false;
		}
		
		// Prepare Variables
		var
		/* Application Specific Variables */
			contentSelector = '#layout-content',
			$content = $(contentSelector).filter(':first'),
			contentNode = $content.get(0),
			$menu = $('.nav-primary').filter(':first'),
			activeClass = 'nav-active',
			activeSelector = '.nav-active',
			menuChildrenSelector = '> ul > li',
			completedEventName = 'statechangecomplete',
			templateType = "text/x-jquery-tmpl",
		/* Application Generic Variables */
			$window = $(window),
			$body = $(document.body),
			$html = $(document.documentElement),
			rootUrl = History.getRootUrl(),
			scrollHistory = {},
			scrollOptions = {
				duration: 800,
				easing:'swing'
			};
		
		// Ensure Content
		if ($content.length === 0) {
			$content = $body;
		}

		// Internal Helper
		$.expr[':'].internal = function(obj, index, meta, stack){
			// Prepare
			var
				$this = $(obj),
				url = $this.attr('href')||'',
				isInternalLink;
			
			// Check link
			isInternalLink = url.substring(0,rootUrl.length) === rootUrl || url.indexOf('http') === -1;
			
			if (url.match(/^#/)) {
				isInternalLink = false;
			}
			
			if ($this.attr('target')) {
				isInternalLink = false;
			}
			
			// Ignore or Keep
			return isInternalLink;
		};
		
		var normalizeUrl = function(url) {
			return url.replace(rootUrl,'').replace(/^\/|\/$/g, '');
		}

		// HTML Helper
		var documentHtml = function(html){
			// Template regex
			var regex = new RegExp('<script.*'+templateType+'\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>', 'gmi');
			
			// Prepare
			var result = String(html)
					.replace(/<\!DOCTYPE[^>]*>/i, '')
					.replace(regex, '')
					.replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div data-identifier="document-$1"$2')
					.replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
				;

			// Return
			return $.parseHTML(result);
		};
		
		$(document).on('submit', 'form.ajaxified', function(ev) {
			var form = $(this);

			// Prepare Variables
			var
				url = form.attr('action'),
				relativeUrl = url.replace(rootUrl,'');
			
			// Method
			var method = form.attr('method')
			if(method == 'get'){
				url += '?'+form.serialize();
				History.pushState(null, null, url);
			}

			// Set Loading
			$body.addClass('is-loading');
			
			// Close toplayers and popovers
			$body.removeClass('has-toplayer-active');
			$('.popover').removeClass('popover-active');
			$('.popover-content').hide();

			// Start Fade Out
			// Animating to opacity to 0 still keeps the element's height intact
			// Which prevents that annoying pop bang issue when loading in new content
			// $content.animate({opacity:0},800);

			// Ajax Request the Traditional Page
			$.ajax({
				url:form.attr('action'),
				type:method,
				dataType:'text',
				data:form.serializeArray(),
				success: function(data, textStatus, jqXHR) {
					onPageFetched(url, relativeUrl, data, textStatus, jqXHR)
				},
				error: function(jqXHR, textStatus, errorThrown){
					document.location.href = url;
					return false;
				}
			}); // end ajax

			ev.preventDefault()
		});

		// Ajaxify Helper
		$.fn.ajaxify = function(){
			// Prepare
			var $this = $(this);

			// Ajaxify
			$this.find('a:internal:not(.no-ajaxy)').click(function(event) {
				// Prepare
				var
					$this = $(this),
					url = $this.attr('href'),
					title = $this.attr('title')||null;

				// Continue as normal for cmd clicks etc
				if ( event.which == 2 || event.metaKey ) { return true; }
				
				scrollHistory[normalizeUrl(window.location.href)] = $(document).scrollTop();
				var scrollHistoryCompare = normalizeUrl(url);
				
				// This is not a back button event, 
				// if page has been visited and is current target, reset scroll
				$.each(scrollHistory, function(key, value) {
					if (key == scrollHistoryCompare) {
						scrollHistory[scrollHistoryCompare] = 0;
					}
				});
				
				// Ajaxify this link
				History.pushState(null,title,url);
				event.preventDefault();
				// return false;
			});

			// Chain
			return $this;
		};

		// Ajaxify our Internal Links
		$body.ajaxify();
		
		// Hook into State Changes
		$window.bind('statechange', function(ev) {
			// Prepare Variables
			var
				State = History.getState(),
				url = State.url,
				relativeUrl = url.replace(rootUrl,'');
			
			// Set Loading
			$body.addClass('is-loading');
			
			// Close toplayers
			$body.removeClass('has-toplayer-active');
			$('.popover').removeClass('popover-active');
			$('.popover-content').hide();

			// Start Fade Out
			// Animating to opacity to 0 still keeps the element's height intact
			// Which prevents that annoying pop bang issue when loading in new content
			// $content.animate({ opacity:0 }, 500);
			
			// Complete the change
			$('html, body').animate({scrollTop : 0}, 500);
			
			// Ajax Request the Traditional Page
			$.ajax({
				url: url,
				success: function(data, textStatus, jqXHR) {
					onPageFetched(url, relativeUrl, data, textStatus, jqXHR)
				},
				error: function(jqXHR, textStatus, errorThrown){
					document.location.href = url;
					return false;
				}
			}); // end ajax

		}); // end onStateChange
		
		// Write scripts and templates into the dom
		var appendScript = function($el, $head){
			var $head = $head || false;
			var $script = $el, scriptText = $script.html(), scriptNode = document.createElement('script');
			var decoded = $('<div/>').html(scriptText).text();
			
			// Transfer node attributes to newly created script tag
			$.each($script[0].attributes, function(index, attr) {
				scriptNode.setAttribute(attr.name, attr.value);
			});
			
			if (!$.support.style) {
				// IE <=8 doesn't support appendChild on HTMLScriptElement
				scriptNode.text = scriptText;
			} else {
				// Modern browsers
				scriptNode.appendChild(document.createTextNode(scriptText));
			}
			
			if($head){
				$('head').prepend(scriptNode);
			}else{
				contentNode.appendChild(scriptNode);
			}
		}

		var onPageFetched = function(url, relativeUrl, data, textStatus, jqXHR){
			// Prepare
			var $parsed = $(data),
				$templates = $parsed.find('[type="'+templateType+'"]'), // Get templates out before transformation of scripts into divs
				$data = $(documentHtml(data)),
				$dataHead = $data.find('[data-identifier="document-head"]:first'),
				$dataBody = $data.find('[data-identifier="document-body"]:first'),
				$dataContent = $dataBody.find(contentSelector).filter(':first'),
				$metas = $data.find('[data-identifier="document-meta"]'),
				$menuChildren, contentHtml, $scripts;
			
			// Replace head scripts
			$scriptsToPush = $dataHead.find('[data-identifier="document-script"][class="push-to-head"]');
			if ( $scriptsToPush.length ) {
				$scriptsToPush.detach();
			}
			
			// Fetch the scripts
			$scripts = $dataContent.find('[data-identifier="document-script"]');
			if ( $scripts.length ) {
				$scripts.detach();
			}
			
			// Fetch the content
			contentHtml = $dataContent.html()||$data.html();
			
			if ( !contentHtml ) {
				document.location.href = url;
				return false;
			}
			
			// Get page category
			var category = relativeUrl;
			if(relativeUrl.indexOf('/') != -1){
				var category = relativeUrl.substr(0, relativeUrl.indexOf('/'));
			}
			
			// Update metas
			var cpt = $metas.length;
			$metas.each(function(){
				var name = $(this).attr('name');
				if(name != null){
					$('meta[name="'+name+'"]').attr('content', $(this).attr('content'));
				}
				var property = $(this).attr('property');

				if(property != null){
					$('meta[property="'+property+'"]').attr('content', $(this).attr('content'));
				}
			});
			
			// Update the menu
			$menuChildren = $menu.find(menuChildrenSelector);
			$menuChildren.children('a').filter(activeSelector).removeClass(activeClass);
			$menuChildren = $menuChildren.has('a[href^="'+relativeUrl+'"],a[href^="/'+relativeUrl+'"],a[href^="/' + relativeUrl.split("/")[0] + '"],a[href^="'+url+'"]');
			
			// Update mirror link
			$('.nav-toolbar .nav-item-last a').attr('href', $dataBody.find('.nav-toolbar .nav-item-last a').attr('href'));
			
			// Close all sub menus
			$menu.find('.is-hovered').removeClass('is-hovered');
			
			if ( $menuChildren.length === 1 ) { $menuChildren.children('a').addClass(activeClass); }
			
			// Update the content
			$content.attr('class', $dataContent.attr('class'));
			
			$content.stop(true,true);
			$content.html(contentHtml).ajaxify();
				//.animate({ opacity:1 }, 500);
			
			// Wait for selector to be visible to scroll
			setTimeout(function() {
				if ($.scrollTo && scrollHistory[normalizeUrl(window.location.href)]) {
					$.scrollTo(scrollHistory[normalizeUrl(window.location.href)], 0);
				}
			}, 1);
			
			// Update selectors
			$content = $(contentSelector).filter(':first');
			
			// Update the body id
			$body.attr('id', $dataBody.attr('id'));

			// Update the body class
			$body.attr('class', $dataBody.attr('class'));
			
			// Update the body page id
			$body.attr('data-page-id', $dataBody.attr('data-page-id'));
			
			// Update the title
			document.title = $data.find('[data-identifier="document-title"]:first').text();
			try {
				document.getElementsByTagName('title')[0].innerHTML = document.title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			
			// Add header scripts
			$('head').find('.push-to-head').remove();
			
			$scriptsToPush.each(function(){
				appendScript($(this), true); });

			// Add the scripts
			$scripts.each(function(){
				appendScript($(this), false);
			});

			// Add the templates
			$templates.each(function(){
				appendScript($(this), false);
			});
			
			$body.removeClass('is-loading');
			$window.trigger(completedEventName);
			
			// Inform Google Analytics of the change
			if ( typeof window.ga !== 'undefined' ) {
				// Universal Analytics
				window.ga('send', 'pageview', relativeUrl);
			} else if ( typeof window._gaq !== 'undefined' ) {
				// Legacy analytics
				window._gaq.push(['_trackPageview', relativeUrl]);
			}
			
			// Update disqus only when needed
			if (typeof window.DISQUS !== 'undefined') {
				/*try {
					DISQUS.reset({
						reload: true,
						config: function () {  
							this.page.identifier = 'newid1';
							this.page.url = url;
							this.page.title = document.title;
							this.language = "fr";
						}
					});
				} catch(err) { }*/
				
				if($dataContent.find('#disqus_thread').length){
					//App.resetDisqus($dataContent.find('#disqus_thread').data('identifier'), url, document.title);
				}
			}
			
			// AddThis parse
			if (typeof window.addthis !== 'undefined') {
				try {
					// Delay AddThis
					// TODO : should defer this to onload
					setTimeout(function() {
						addthis.update('share', 'url', window.location.href); // new url
						addthis.update('share', 'title', window.document.title); // new title
						addthis.toolbox($content.get(0));
					}, 1500);
				} catch(err) { }
			}

			// Facebook parse
			if (typeof window.FB !== 'undefined') {
				try {
					if ($content.length) {
						FB.XFBML.parse($content.get(0));
					} else {
						FB.XFBML.parse();
					}
				} catch(err) { }
			}

			// Twitter parse
			if (typeof window.twttr !== 'undefined') {
				try {
					twttr.widgets.load();
				} catch(err) { }
			}

			// G+ parse
			if (typeof window.gapi !== 'undefined') {
				try {
					gapi.plusone.go();
				} catch(err) { }
			}
		}

		if (window.location.hash && window.location.hash.match(/^\#\.\//)) {
			$(window).trigger('statechange');
		}

	}); // end onDomLoad

})(window); // end closure