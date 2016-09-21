/*-----------------------------------------------------------------------------------------------------------
		MAIN APP
-----------------------------------------------------------------------------------------------------------*/
var App = (function() {

	var self = this,
		$document,
		$body,
		$html,
		$window,
		$content,
		infiniteScroll,
		didScroll = false,
		didResize = false,
		delayedEventsFrequency = 250,
		delayedEventsInterval = null,
		infiniteLoading = false,
		infiniteThreshold = 300,
		lazySettings = { event : 'scroll', threshold : 200,  placeholder: '/img/blank.gif' };

	var cookie;
	var regex1=/^(.*)\/(repertoire|directory)\/(.+)$/;
	var regex2=/^(.*)\/(recettes|recipes)\/(.+)$/;
	var regex3=/^(.*)\/(repertoire|directory)(\/)?$/;
	var regex4=/^(.*)\/(trucs|tips)(\/)?$/;

	self.mediaQueries = {
		lg:"screen and (min-width:1201px)",
		md:"screen and (max-width:1200px)",
		sm:"screen and (max-width:768px)",
		xs:"screen and (max-width:500px)",
		largerThan_sm:"screen and (min-width:769px)"
	}

	var onAppReady = function(ev) {
		console.log('DOM ready');

		// Default easing
		$.easing.def = "easeOutQuad";

		// Global elements
		$document = $(document);
		$window = $(window);
		$html = $('html');
		$body = $('body');
		$content = $('#layout-content');

		// Main nav(for mobile)
		initMainNav();

		// Print
		$content.on('click tap', '.sharebar-item-print a', onTriggerPrint);

		// Fullscreen
		$content.on('click tap', '.sharebar-item-fullscreen a', onFullscreenOpen);
		$content.on('click tap', '.btn-close-fullscreen', onFullscreenClose);

		// Tracking
		$document.on('click tap', 'a[data-event-category][data-event-action], div[data-event-category][data-event-action]', onTrackEventClick);

		$body.on('click tap', '.scroll-to', onScrollToClick);


		$window.on('statechangecomplete', onPageReady).trigger('statechangecomplete');

	}

	var onAppLoaded = function(ev) {
		console.log('Window loaded');
	}

	var onPageReady = function(ev) {
		console.log('Page ready');

		// Init subnav
		self.initSubNav();

		// Init tipsy
		$('.has-tipsy').tipsy({
			className: 'tipsy-fplq',
			delayOut: 1000,
			fade: true,
			gravity: 's',
			html: true,
			title: function() {
				return $($(this).attr('href')).html();
			}
		});

		$window.trigger('delayedscroll');

		// Init fancyboxes
		initFancyboxes();

		// Lazy load images
		if ($html.attr('class').indexOf('ie') == -1) {
			lazySettings.effect = 'fadeIn';
		}

		$(".lazy").lazyload(lazySettings);

		// Steps click
		var $steps = $('.box-full-steps');
		if($steps.length){
			$steps.on('click tap', 'ul.list-steps:not(.non-clickable) li', function() {
				$(this).toggleClass("step-dashed");
			});

			$steps.on('click tap',"#close-hint", function(ev) {
				ev.preventDefault();

				$(this).closest(".box-hint").slideUp(300);
				$.cookie('hide_hint',"true");
			});
		}

		// Box send validate
		var $form = $('#formSend')
		$form.on('submit', onSendSubmit);
		$form.on('click tap focus', '.error input, .error select, .error .label-radio', self.onErrorBlur);

		if(!$html.hasClass('ie8')){
			bindInView();
		}

		Router.init();
	}

	/** ------------------------------
	 * Events
	 --------------------------------- */

	var onTriggerPrint = function(ev) {
		ev.preventDefault();
		if ($('body#blog').length) {
			var $this = $(this);
			var $embedded = $this.closest('.embedded-content');

			if ($embedded) {
				$embedded.addClass('print-show');
				$embedded.siblings().removeClass('print-show');
				$embedded.siblings().addClass('print-hide');
			}
		}

		window.print();
	};

	var onTrackEventClick = function(ev){
		var category = $(this).data('event-category') || 'Generic category',
			action = $(this).data('event-action') || 'Generic action',
			label = $(this).data('event-label') || 'Generic label';

		try{
			ga('send', 'event', category, action, label);
		}catch(err){
			console.log('Error tracking reserve button : '+err);
		}
	}

	var onSendSubmit = function(ev){
		ev.preventDefault();

		var $this = $(this);

		$('.alert').removeClass('alert-active');

		var validation = new Validation();

		if(validation.validate($this, 'div')){
			$.post($this.attr('action'), $this.serializeArray(), function(data){
				$this.hide();
				$('.alert-success').addClass('alert-active');
			})
		}
	}

	var onFullscreenOpen = function(ev){
		ev.preventDefault();

		var $this = $(this),
			$container = ($this.parents('#embeddable-content').length) ? $this.parents('#embeddable-content') : $this.parents('.embedded-content');

		$container.addClass('fullscreen-content');
		$body.addClass('is-fullscreen');

		$('html, body').animate({scrollTop : 0}, 1000);
	}

	var onFullscreenClose = function(ev){
		ev.preventDefault();

		// Reset fullscreen content
		$('.fullscreen-content').removeClass('fullscreen-content');

		$body.removeClass('is-fullscreen');
	}

	var onScrollToClick = function(ev){
		ev.preventDefault();
		var $this = $(this);

		if($this.attr('href').indexOf('#') != -1 && $($this.attr('href')).length){
			var top = $($this.attr('href')).offset().top;

			$('html, body').animate({
				scrollTop: top
			}, 1000, function() {
			});
		}
	}

	/**
	 *  DELAYED EVENTS
	 */

	var onFetchResults = function(data){
		var toWrite = {};

		if($body.attr('id') == 'blog'){
			var $html = $(data),
				$results = $html.find('#results-container');

			var postsData = [];

			$results.find('article').each(function(){
				var $this = $(this),
					$desc = $this.find('.preview-desc'),
					$link = $desc.children('a'),
					authorHref = $link.attr('href'),
					authorText = $link.text();

				$link.remove();

				var postDada = {
					link : $this.children('a:first').attr('href'),
					title: $this.find('h1').html(),
					image: $this.find('img').attr('src'),
					date: $desc.text(),
					author: {
						name: authorText,
						link : authorHref
					}
				};

				postsData.push(postDada);
			});

			toWrite.results = postsData;

			var $nextLink = $('#infinite-scroll-pagination a:first');
			$nextLink.attr('data-next', parseInt($nextLink.attr('data-next'))+1);

		}else{
			data = $.parseJSON(data);
			toWrite.results = data;
		}

		infiniteLoading = false;
		$('#infinite-loading-bar').remove();

		if(Globals.mobile){
			infiniteScroll.el.addClass('is-paused');
		}

		if(toWrite.results.length){
			// Prepare index
			var baseCpt = infiniteScroll.el.find('.preview').size();

			for(var i = 0;i < toWrite.results.length;i++){
				toWrite.results[i].position = i + baseCpt;
			}

			// Load data in page
			$.tmpl(infiniteScroll.templateName, toWrite).appendTo(infiniteScroll.container);

			// Bind lazyload
			var $newHtml = infiniteScroll.el.find("div.page-separator:last").nextAll('div');
			$newHtml.find('.lazy').lazyload(lazySettings);


			// Ajaxify
			$newHtml.ajaxify();

			// Update cookie
			var $loaded = infiniteScroll.el.find('.preview'),
				fetched = {visible:[]};

			$loaded.each(function() {
				var $this = $(this);
				bindInView($this);
				fetched.visible.push(parseInt($this.data('id')));
			});

			if($loaded.find('.spinner').length) {
				var spinnerTimeout = setTimeout(function(){$loaded.find('.spinner').remove(); clearTimeout(spinnerTimeout);}, 1000);
			}

			cookie = fetched.visible.join('-');

			if(window.location.href.match(regex3)!=null){
				$.cookie('cheese_array',cookie);
			}else if(window.location.href.match(regex4)!=null){
				$.cookie('truc_array',cookie);
			}else if(window.location.href.match(regex2)!=null){
				$.cookie('recipe_array',cookie);
			}
		}else{
			infiniteScroll.el.addClass('is-eof');
		}
	}



	/** ------------------------------
	 * Private
	 --------------------------------- */
	var initMainNav = function(){
		var $wrapper = $('.nav-primary-wrapper'),
			$nav = $wrapper.find('.nav-primary'),
			$trigger = $wrapper.find('.nav-primary-trigger');

		$trigger.on('click tap', function(ev){
			ev.preventDefault();

			var $this = $(this);

			if (Modernizr.mq(self.mediaQueries.sm)){
				$this.parent().toggleClass('nav-opened');
			}
		});

		$nav.on('click tap', 'a', function(){
			var $this = $(this);
			$this.parent().siblings('li').children().removeClass('nav-active');
			$this.addClass('nav-active');

			if (Modernizr.mq(self.mediaQueries.sm)){
				$wrapper.removeClass('nav-opened')
			}
		})
	}

	var initFancyboxes = function(){
		$('.fancybox-iframe').fancybox({
			type: 'iframe',
			width:600
		});

		$('.fancybox').fancybox({
			width:600
		});
	}

	var bindInView = function(elements) {
		// Sectors if no arguments passed
		elements = elements || $('.preview');
		// Start by hiding all sectors
		elements.attr('data-offset', 700);

		// Show sectors only when they're in view, hide otherwise
		elements.bind('inview', function(ev, visible, topOrBottomOrBoth) {
			var element = $(this);
			if (visible) {

				element.css('visibility', 'visible');
			} else {
				element.css('visibility', 'hidden');
			}
		});

		$window.trigger('checkInView');
	}

	/** ------------------------------
	 * Public
	 --------------------------------- */
	self.initShowcases = function(){
		var $showcases = $('.showcase-container');

		$showcases.each(function(){
			var $this = $(this),
				$showcase = $this.find('.showcase'),
				$container = $this.next('.showcase-content-container'),
				slides = $showcase.data('slides'),
				padding = (slides == 1) ? '40px' : '0px';

			if(!$('html').hasClass('ie8')){
				// Duplicates when there are equal or less items than visible slides to avoid weird problem with slick
				var $items = $showcase.find('.showcase-item');
				if($items.size() <= slides && slides >= 3 && $items.size() > 1){
					var $slides = $items.clone().appendTo($showcase);
					$slides.addClass('showcase-item-cloned');
				}

				$showcase.slick({
					speed: 300,
					slidesToShow: 100,
					slidesToScroll: 100,
					arrows: false,
					onInit: function(){
						$showcase.addClass('is-ready');
					},
					responsive: [
						{
							breakpoint: 501,
							settings: {
								arrows: false,
								slidesToShow: slides,
								slidesToScroll: 1,
								centerMode:true,
								centerPadding:padding,
								infinite: true,
								onAfterChange: function(obj, slide){
									obj.$slider.find('.slick-center a').trigger('tap');
								},
								onInit: function(){
									$showcase.addClass('is-ready');
								}
							}
						}
					]
				});
			}

			$this.on('click tap', '.showcase-item > a', function(ev){
				ev.preventDefault();

				var $link = $(this),
					content = $link.next('.showcase-content').html();

				$this.find('a').removeClass('showcase-active');
				$link.addClass('showcase-active');

				$container.addClass('showcase-container-active');
				$container.html(content);
				initSlider($('.showcase-content-container .slider-secondary-in-showcase'), true, false);


				if (Modernizr.mq(self.mediaQueries.xs)){
					var $track = $link.parents('.slick-track'),
						centerIndex = $track.find('.slick-center:not(.slick-cloned)').index(),
						clickedIndex = $link.parent().index();

					if(clickedIndex < centerIndex){
						$link.parents('.showcase').slickPrev();
					}else if(clickedIndex > centerIndex){
						$link.parents('.showcase').slickNext();
					}
				}
			});

			//$this.find('.showcase-item:not(.slick-cloned):first > a').trigger('tap');
		});
	}

	self.initSubNav = function(){
		var $nav = $('.nav-secondary'),
			$triggers = $nav.find('> div > div > ul > li'),
			$opener = $nav.find('.nav-submenu-opener'),
			$submenu = $nav.find('.nav-submenu');

		var menuTimeout = [];

		$opener.on('click tap', function(ev){
			ev.preventDefault();

			$(this).toggleClass('is-opened');

			var $wrapper = $nav.find('.nav-submenu-wrapper');
			$wrapper.toggleClass('is-opened');
			$wrapper.slideToggle(300);
		})

		$triggers.children('a').on('click tap', function(ev){
			ev.preventDefault();

			var $this = $(this),
				$li = $this.parent(),
				$submenu = $li.children('.nav-submenu');

			if(Modernizr.mq(self.mediaQueries.sm)){
				// Close all others
				var $opened = $li.siblings('.is-hovered');
				$opened.find('.nav-submenu').hide();
				$opened.removeClass('is-hovered');

				// Toggle menu down
				$li.toggleClass('is-hovered');
				$submenu.slideToggle(500);
			}
		})

		$triggers.on('mouseenter', function(){
			var $this = $(this),
				$submenu = $this.children('.nav-submenu');

			if(Modernizr.mq(self.mediaQueries.largerThan_sm) || $("html").hasClass("ie8")){
				// Clear timeout
				if(menuTimeout[$this.index()] != null){
					clearTimeout(menuTimeout[$this.index()]);
					$submenu.removeClass('is-closing')
				}

				$this.addClass('is-hovered');
				$submenu.slideDown(500);
			}
		})

		$triggers.on('mouseleave', function(){
			var $this = $(this),
				$submenu = $this.children('.nav-submenu');

			if(Modernizr.mq(self.mediaQueries.largerThan_sm) || $("html").hasClass("ie8")){
				$this.removeClass('is-hovered');

				$submenu.addClass('is-closing');

				// Close after little timeout
				menuTimeout[$this.index()] = setTimeout(function(){
					$submenu.slideUp(200, function(){
						$submenu.removeClass('is-closing')
					});
				}, 200);
			}
		})

		// Custom scrollbars
		$('.nav-submenu').mCustomScrollbar({
		    theme:"dark"
		});
	}

	self.initSliderAfterLoaded = function(sliderObj, arrows, dots){
		sliderObj.imagesLoaded(function(){
			self.initSlider(sliderObj, arrows, dots);
		})
	}

	self.initSlider = function(sliderObj, arrows, dots) {
		sliderObj.each(function(){
			var $slider = $(this);
			var sliderItemsLg = $slider.data('items-lg');
			var sliderItemsMd = ($slider.data('items-md') != null) ? $slider.data('items-md') : sliderItemsLg;
			var sliderItemsTab = ($slider.data('items-tab') != null) ? $slider.data('items-tab') : sliderItemsMd;
			var sliderItemsSm = ($slider.data('items-sm') != null) ? $slider.data('items-sm') : sliderItemsTab;
			var sliderItemsMob = ($slider.data('items-mob') != null) ? $slider.data('items-mob') : sliderItemsSm;

			$slider.slick({
				speed: 300,
				slidesToShow: sliderItemsLg,
				slidesToScroll: sliderItemsLg,
				arrows: arrows,
				dots: dots,
				infinite: false,
				onInit: function(){
					$slider.addClass('is-ready');
				},
				responsive: [
					{
						breakpoint: 941,
						settings: {
							slidesToShow: sliderItemsMd,
							slidesToScroll: sliderItemsMd,
							arrows: arrows,
							dots: dots,
							infinite: false,
							onInit: function(){
								$slider.addClass('is-ready');
							}
						}
					},
					{
						breakpoint: 769,
						settings: {
							slidesToShow: sliderItemsTab,
							slidesToScroll: sliderItemsTab,
							arrows: arrows,
							dots: dots,
							infinite: false,
							onInit: function(){
								$slider.addClass('is-ready');
							}
						}
					},
					{
						breakpoint: 600,
						settings: {
							slidesToShow: sliderItemsSm,
							slidesToScroll: sliderItemsSm,
							arrows: arrows,
							dots: dots,
							infinite: false,
							onInit: function(){
								$slider.addClass('is-ready');
							}
						}
					},
					{
						breakpoint: 501,
						settings: {
							slidesToShow: sliderItemsMob,
							slidesToScroll: sliderItemsMob,
							arrows: arrows,
							dots: dots,
							infinite: false,
							onInit: function(){
								$slider.addClass('is-ready');
							}
						}
					}
				]
			});
		})
	};

	self.initDrawer = function($el){
		$el.each(function(){
			var $this = $(this),
				$trigger = $this.find('.drawer-trigger-link'),
				$visible = $this.find('.drawer-visible-content'),
				$hidden = $this.find('.drawer-hidden-content'),
				fullReplace = ($this.data('replace') != null && $this.data('replace')) ? true : false;

			$trigger.on('click tap', function(ev){
				ev.preventDefault();

				if($this.hasClass('is-opened')){
					$this.removeClass('is-opened');

					$hidden.slideUp(200);

					if(fullReplace){
						$visible.show();

						$('html, body').animate({scrollTop: $this.offset().top - 100}, 500);
					}else{
						$('html, body').animate({scrollTop: $hidden.offset().top - 100}, 500);
					}
				}else{
					$this.addClass('is-opened');

					if(fullReplace){
						$visible.hide();

						$('html, body').animate({scrollTop: $this.offset().top - 100}, 500);
					}

					$hidden.slideDown(500);
				}
			});
		})
	}

	self.initVideos = function($el){
		var players = {};

		$el.each(function(){
			var $this = $(this),
				$play = $this.find('.video-btn-play, .acts-as-video-btn-play'),
				$stop = $this.find('.video-btn-stop, .acts-as-video-btn-stop'),
				$video = $this.find('iframe'),
				iframe = $video[0];

	            $f(iframe).addEvent('ready', function(player_id) {
		            // Set the API player
		            players[player_id] = $f(player_id);

	                // Mute it on load
		            players[player_id].api('setVolume', 0);
	            });

				$play.on('click', function(ev){
					ev.preventDefault();

					var $this = $(this),
						$holder = $this.parents('.video-holder'),
						$content = $holder.find('.video-content'),
						id = $holder.data('video-id');

					$holder.addClass('is-playing');

					if(Globals.mobile || players[id] == null) {
						$content.css({'visibility':'visible', 'z-index': 1});
						$content.show();
					}else {
						$content.hide().css({'visibility':'visible', 'z-index': 1});

						$content.fadeIn(500, function(){
							players[id].api('play');
						});
					}
				});

			$stop.on('click', function(ev){
				ev.preventDefault();

				var $this = $(this),
					$holder = $this.parents('.video-holder'),
					$content = $holder.find('.video-content'),
					id = $holder.data('video-id');

				$holder.removeClass('is-playing');

				if(Globals.mobile || players[id] == null) {
					$content.css({'visibility':'hidden', 'z-index': -1});
				}else {
					players[id].api('stop');
					$content.fadeOut(500);
				}
			});

		});
	}

	self.onNewsletterSubmit = function(ev){
		var $this = $(this),
			$error = $this.find('#error'),
			$duplicate = $this.find('#duplicate');

		// Hide alerts and specific errors
		$('.alert').removeClass('alert-active');
		$error.hide();
		$duplicate.hide();

		var validation = new Validation();

		if(validation.validate($this, 'div')){
			var confirmation = false;
			var erreur;
			var post = {
				first_name: $("input[name='first_name']").val(),
				last_name: $("input[name='last_name']").val(),
				email: $("input[name='email']").val(),
				postal: $("input[name='postal']").val(),
				language: $("input[name='language']").val(),
				newsletter_important: $("input[name='newsletter_important']").val(),
				newsletter_source: $("input[name='newsletter_source']").val(),
				newsletter_beurre: $("input[name='newsletter_beurre']").is(':checked'),
				newsletter_famille: $("input[name='newsletter_famille']").is(':checked'),
				newsletter_lait: $("input[name='newsletter_lait']").is(':checked'),
				newsletter_chocolat: $("input[name='newsletter_chocolat']").is(':checked'),
				newsletter_creme: $("input[name='newsletter_creme']").is(':checked'),
			}

			$.post('/abonnement/inscription', post, function(data){
				//var postBackHtml = $(data);
				if(data != null){
					data = $.parseJSON(data);
					if(data.status != null && data.status == 'error'){
						confirmation = false;

						if(data.name == 'List_AlreadySubscribed'){
							erreur = "doublons";
							$('#duplicate').show();
						} else {
							erreur = "erreur";
							$('#error').show();
						}

						$('#submit-errors').addClass('alert-active')
					} else {
						confirmation = true;
						$this.hide();
						$('.alert-success').addClass('alert-active');

						//$('#bt-fermer-toplayer a').trigger('click');
					}
				}
				//return confirmation;
			})
		}

		return false;
	}

	self.onErrorBlur = function(){
		var input = $(this);
		var inputContainer = input.parents('.form-group');

		if(typeof inputContainer.attr('class') !== 'undefined' && inputContainer.attr('class') !== false){
			var classes = inputContainer.attr('class').split(' ');
			for(var i = 0; i < classes.length; i++) {
				if(classes[i].indexOf('error') != -1) {
					inputContainer.removeClass(classes[i]);
				}
			}
		}
	}

	/** ------------------------------
	 * Constructor
	 --------------------------------- */

	var construct = (function() {
		$(document).ready(function(){
			onAppReady();
		});
		$(window).on('load', onAppLoaded);
	})();

	return self;
})();
