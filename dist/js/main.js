var menuDragDistance = 0;

// some changes

$(function() {

	// Initialization

	$.each($('.box-message'), function(i, msg){
		var msgOpts = {
			container: $(msg).parent(),
			id: $(msg).attr('id') || '',
			size: ($(msg).hasClass('message-lg') && 'lg') || 'md',
			mode: ($(msg).hasClass('message-success') && 'success') || ($(msg).hasClass('message-warning') && 'warning') || ($(msg).hasClass('message-danger') && 'danger') || 'info',
			showOnInit: $(msg).hasClass('show') ? true : false,
			animate: $(msg).hasClass('animate') ? true : false,
			closing: $(msg).find('.close').length ? true : false
		};

		initBoxMessageEvents(msg, msgOpts);
	});

	if ($('.card-payment').length) {
		$('.hint-cvc').tooltip({
			html: false,
			template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><img src="https://www.kontramarka.de/templates/default/images/payments/cvv2_white.gif" alt="cvv2" style="float:left; margin: 12px 12px 2px 12px;"><div class="tooltip-inner text-left"></div></div>'
		});
	}


	// Pace
	$.each(['get', 'post'], function(i, method) {
	    $[method] = function(url, data, callback, type) {
	        var rtn;
	        if ($.isFunction(data)) {
	            type = type || callback;
	            callback = data;
	            data = undefined;
	        }
	        Pace.track(function (){
	            rtn = $.ajax($.extend({
	                url: url,
	                type: method,
	                dataType: type,
	                data: data,
	                success: callback
	            }, $.isPlainObject(url) && url));
	        });
	        return rtn;
	    };
	});

	if ($('#plan_t').length) {
		$('#plan_t tbody')
			.prepend('<tr id="pre_scheme"></tr>')
			.append('<tr id="post_scheme"></tr>');
		$('#DataCopy').closest('tr').attr('id', 'scheme_row');
		$('#ticketbox_inner').wrap('<div id="ticketbox_wrapper"></div>');

		positionGroupbox();
		// wrapScrollShadow($('#ticketbox_inner'), '195px');
		$('#ticketbox_inner').wrap('<div class="edges edges-y"></div>');
		$('#ticketbox_inner').addClass('beauty-scroll').attr('data-max-height', '194px');

		if ($('.buttons-stehplatz').length) {
			$.each($('.buttons-stehplatz .cat-itm'), function(i, item) {
				$(item).append('<div class="actions"></div>');
				$(item).find('.actions').append('<div class="catprice"></div>');
				$(item).find('.catprice').append($(item).find('.catname b').html());
				$(item).find('.catname b').remove();

				$(item).find('.actions').append('<div class="counter"></div>');

				$(item).find('.counter')
					.append($(item).find('.minusnum').detach())
					.append($(item).find('.stehplatz_num').detach())
					.append($(item).find('.plusnum').detach());
			});
		}

		$('#plan_t').addClass('scheme-ready');
	}
	if ($('.beauty-scroll').length) {
		$.each($('.beauty-scroll'), function(i, ticketsList){
			wrapScrollShadow(ticketsList, $(ticketsList).data('max-height'));
		});
	}

	initScrollShadow();

	initCounters();

	setTourTitlePos();

    // Preloading images
	showFadedImages();

	// Tooltips
	$('[data-toggle="tooltip"]').tooltip({
		delay: 200
	});
	if ($('#concert_select').length) {
		$('#concert_select .eticket[title]').tooltip({
			placement: 'left',
			delay: 200
		});
	}

	// Popovers
	$('[data-toggle="popover"]').popover();
	$.each($('#topSlider .cities-list .hint-popover'), function(i, hint) {
		$(hint).popover({
			html: true,
			trigger: 'manual',
			placement: 'top',
			offset: '100%, 10',
			content: $(hint).closest('.cities-list').find('.full-list'),
		}).on("mouseenter", function () {
		    var _this = this;
		    $(this).popover("show");
		    $(".popover").on("mouseleave", function () {
		        $(_this).popover('hide');
		    });
		}).on("mouseleave", function () {
		    var _this = this;
		    setTimeout(function () {
		        if (!$(".popover:hover").length) {
		            $(_this).popover("hide");
		        }
		    }, 300);
		});
	});
	$.each($('#DataCopy .place'), function(i, place) {
		$(place).popover({
			html: true,
			animation: false,
			trigger: 'manual',
			placement: 'top',
			offset: '0, 14',
			template: '<div class="popover popover-scheme" role="tooltip"><div class="arrow"></div><div class="close">×</div><div class="popover-body"></div></div>',
			// title: '',
			content: $(this).attr('title'),
		}).on("mouseenter", function () {
			$('.popover-scheme').popover('hide', {
				animation: false
			});
		    var _this = this;
		    $(this).popover("show");
		    $(".popover-scheme").on("mouseleave", function () {
		        $(_this).popover('hide');
		    });
			$('.popover-scheme .close').on('click', function () {
				$(_this).popover('hide');
			});
		}).on("mouseleave", function () {
		    var _this = this;
		    setTimeout(function () {
		        if (!$(".popover:hover").length) {
		            $(_this).popover("hide");
		        }
		    }, 300);
		});
		$(place).on('hide.bs.popover', function() {
			var popoverId = $(place).attr('aria-describedby');
			$('#' + popoverId).removeClass('pgroups-activated');
		});
	});

	// Slider
	var topSliderOptions = {
		speed: 500,
		infinite: true,
		fade: false,
		autoplay: false,
		autoplaySpeed: 5000,
		thumbsCount: {
			xl: 5,
			lg: 4,
			md: 3,
			sm: 4,
			xs: 2
		},
		checkTime: 100
	};

	if ($('#topSlider').length) {
		$('#topSlider .slides.fade').on('init', function(event, slick){
			var firstSlideImg = $('#topSlider .slide:first-child').find('img');

			if ($(firstSlideImg).complete) {
				$('#topSlider .slides.fade').addClass('show');
				$('#topSlider .controls.fade').addClass('show');
				$('#topSlider .slider').addClass('accent');
			} else {
				$(firstSlideImg).on('load', function() {
					$('#topSlider .slides.fade').addClass('show');
					$('#topSlider .controls.fade').addClass('show');
					$('#topSlider .slider').addClass('accent');
				});
			}

			// setTimeout(function check(){
			// 	if (!isImageLoaded($(firstSlideImg)[0])) {
			// 		setTimeout(check, topSliderOptions.checkTime);
			// 	} else {
			// 		$('#topSlider .slides.fade').addClass('show');
			// 		$('#topSlider .controls.fade').addClass('show');
			// 		$('#topSlider .slider').addClass('accent');
			// 	}
			// }, topSliderOptions.checkTime);
		});

		$('#topSlider .slides').slick({
			infinite: topSliderOptions.infinite,
			autoplay: topSliderOptions.autoplay,
			autoplaySpeed: topSliderOptions.autoplaySpeed,
			speed: topSliderOptions.speed,
			fade: topSliderOptions.fade,
			arrows: false,
			dots: true,
			dotsClass: 'pagination',
			cssEase: 'ease-in-out',
			lazyLoading: 'progressive',
			responsive: [
				{
					breakpoint: 992,
					settings: {
						dots: false
					}
				}
			]
		});
		$('#topSlider .controls').slick({
			infinite: topSliderOptions.infinite,
			speed: topSliderOptions.speed,
			slidesToShow: topSliderOptions.thumbsCount.xl,
			dots: false,
			swipe: false,
			focusOnSelect: true,
			slidesToScroll: 1,
			cssEase: 'ease-in-out',
			lazyLoading: 'progressive',
			prevArrow: '<button class="controls-arrow prev"></button>',
			nextArrow: '<button class="controls-arrow next"></button>',
			asNavFor: '#topSlider .slides',
			slide: '.thumbs',
			responsive: [
				{
					breakpoint: 1266,
					settings: {
						slidesToShow: topSliderOptions.thumbsCount.lg
					}
				},
				{
					breakpoint: 992,
					settings: {
						slidesToShow: topSliderOptions.thumbsCount.md
					}
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: topSliderOptions.thumbsCount.sm
					}
				},
				{
					breakpoint: 576,
					settings: {
						slidesToShow: topSliderOptions.thumbsCount.xs
					}
				}
			]
		});
	}

	// Autocomplete
	var cityInputs = document.querySelectorAll('input[data-autocomplete="cities"]');
	$.each(cityInputs, function(i, curInput) {
	    var dataSource = curInput.dataset.src;

		var citiesData = [];
	    var activeName = '';
		var cities = curInput.closest('.autocomplete').querySelectorAll('.autocomplete-results li a');
		$.each(cities, function(i, curCity){
			citiesData.push({
				href: curCity.getAttribute('href'),
				name: curCity.textContent
			});
	        if (curCity.parentNode.classList.contains('active')) activeName = curCity.textContent;
		});

		new Autocomplete(curInput, citiesData, {
	        activeName: activeName,
	        noSuggestionText: 'Не найдено совпадений'
	    });
	});

	// Indicated tabs
	var navTimers = [];
	$('.nav-tabs.indicated, #mainMenu .categories').append('<div class="nav-indicator"></div>');
	$.each($('.nav-tabs.indicated, #mainMenu .categories'), function(i, nav) {
		navTimers[i] = setTimeout(function tick() {
			setTabIndicator(nav, $(nav).find('.nav-link.active').closest('.nav-item'));
			navTimers[i] = setTimeout(tick, 500);
		}, 500);
		setTimeout(function(){
			clearTimeout(navTimers[i]);
		}, 10000);

		$(nav).find('.nav-item').on({
			mouseenter: function(event) {
				if (navTimers[i]) {
					clearTimeout(navTimers[i]);
					delete navTimers[i];
				}
				setTabIndicator(nav, event.target.closest('.nav-item'));
			},
			mouseleave: function(event) {
				setTabIndicator(nav);
			}
		});
	});

	// Detect ios 11_0_x affected
    var ua = navigator.userAgent,
    	iOS = /iPad|iPhone|iPod/.test(ua),
    	iOS11 = /OS 11_(\d{1,2})(_{0,1})(\d{1,2})/.test(ua);
    // ios 11 bug caret position
    if ( iOS && iOS11 ) {
        $('body').addClass('iosBugFixCaret');
    }


	// Events

	// Dropdowns height
	$('#mainMenu .dropdown').on('shown.bs.dropdown', function(event){
		setDDHeight(this);
	});

	// Dropdown hover
	$('.dropdown.expand-hover').on('mouseenter', function(event){
		var dropdown = this.closest('.dropdown');
		$(this).addClass('show');
		$(this).find('.dropdown-menu').addClass('show');
	});
	$('.dropdown.expand-hover').on('mouseleave', function(event){
		var dropdown = this.closest('.dropdown');
		$(this).removeClass('show');
		$(this).find('.dropdown-menu').removeClass('show');
	});

	// Categories expand
	$('#mainMenuCategories').on('shown.bs.collapse', function() {
		setMenuHeight();
	});
	$('#mainMenuCategories').on('show.bs.collapse', function() {
		var menuPos = $('#mainMenu').offset().top;
		if (menuPos > 0) $("html, body").animate({ scrollTop: menuPos }, "slow");
	});

	// Top menu
	$('#topMenu .dropdown-menu, #mainMenu .dropdown-menu').on('click', function(event) {
		event.stopPropagation();
	});
	$('#topMenu .nav-item.dropdown').on('show.bs.dropdown', function(event) {
		if ($(window).width() < 768) {
			$('#topMenu .navbar-brand').addClass('d-none'); // hide logo
			$('#topMenu .nav-item.d-none').attr('data-d-none', 'true'); // mark nav-items hidden by default
			$('#topMenu .nav-item').addClass('d-none'); // hide all nav-items
			$(this).removeClass('d-none'); // show current nav-item
			$(this).find('.nav-link span.d-none').removeClass('d-none').attr('data-d-none', 'true'); // mark spans hidden by default
			$('#topMenu .navbar-close-nav').removeClass('d-none'); // show close button
		}
	});
	$('#topMenu .nav-item.dropdown').on('hide.bs.dropdown', function(event) {
		if ($(window).width() < 768) {
			$('#topMenu .navbar-brand').removeClass('d-none'); // show logo
			$('#topMenu .nav-item').removeClass('d-none'); // show all nav-items
			$('#topMenu .nav-item[data-d-none="true"]').addClass('d-none'); // hide marked nav-items
			$(this).find('span[data-d-none="true"]').addClass('d-none'); // hide marked spans
			$('#topMenu .navbar-close-nav').addClass('d-none'); // hide close button
		}
	});
	$('#topMenu .nav-item.search .nav-link').on('click', function(event) {
		if ($(window).width() < 768) {
			$('#topMenu .search input').css({
				maxWidth: $(this).closest('.container').outerWidth() - $('#topMenu .navbar-brand').outerWidth() + 'px'
			});
			$(this).closest('.search').addClass('expanded');
			$('#topMenu .navbar-close-nav').removeClass('d-none');
		}
		$('#topMenu .search input').focus();
	});
	$('#topMenu .nav-item.search input').on('blur', function(event) {
		if ($(window).width() < 768) {
			$('#topMenu .navbar-close-nav').trigger('click');
		}
	});
	$('#topMenu .navbar-close-nav').on('click', function(event) {
		$('#topMenu .nav-item.dropdown .dropdown-toggle[aria-expanded="true"]').dropdown('toggle');
		$('#topMenu .nav-item.search').removeClass('expanded');
		$('#topMenu .navbar-close-nav').addClass('d-none');
	});

	// Navbar
	$('#mainMenuCategories').on('show.bs.collapse', function(event) {
		$('#mainMenu').addClass('open');
		$('<div class="modal-backdrop fade"></div>').appendTo(document.body);

		setTimeout(function(){
			$('.modal-backdrop').addClass('show');
		}, 1);

		$('.modal-backdrop').on('click', onNavbarBDClick);

		$('#mainMenuCategories').css({
			maxHeight: $(window).outerWidth() < 992 ? ($('body').outerHeight() - $('#topMenu').outerHeight() + 'px') : 'none'
		});
	});
	$('#mainMenuCategories').on('hide.bs.collapse', function(event) {
		$('.modal-backdrop').removeClass('show');
		setTimeout(function(){
			$('.modal-backdrop').remove();
			$('#mainMenu').removeClass('open');
		}, 150);
	});

	// Slider
	$('#topSlider .slides').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
		$('#topSlider .controls').slick('slickGoTo', nextSlide);
	});

	// Cities
	$('#cities .page-block-action a').on('click', function(event) {
		event.preventDefault();
		$('#cities [class*="col"]').removeClass('d-none');
		$(this).addClass('d-none');
	});

	// Scroll to top
	$('#scrollToTop').on('click', function(event) {
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;
	});

	// Tabs on modal shown
	$('.modal').on('shown.bs.modal', function(event) {
		$.each($(this).find('.nav-tabs'), function(i, nav){
			setTabIndicator(nav, $(nav).find('.nav-link.active').closest('.nav-item'));
		});
	});

	// Coments adding box
	$('#commentForm').on('hide.bs.collapse', function (event) {
		$(this).closest('.box').addClass('e2e-off-xs-down');
	});
	$('#commentForm').on('show.bs.collapse', function (event) {
		$(this).closest('.box').removeClass('e2e-off-xs-down');
	});

	// Form control
	initFormControls();
	$('.form-check-label.panel-control input[type="checkbox"]').on('change', function(event) {
		event.stopPropagation();
		if ($(this).is(':checked')) {
			$('.collapse' + $(this).closest('.panel-control').data('panel-control')).stop().slideDown('fast');
		} else {
			$('.collapse' + $(this).closest('.panel-control').data('panel-control')).stop().slideUp('fast');
		}
	});

    // Categories dropdowns
	$.each($('#mainMenuCategories .dropdown'), function(i, dropdown){
		var id = $(dropdown).attr('id');
		var menu = $('body').find('.dropdown-menu[aria-labelledby="' + id + '"]');
		var arrow = $(dropdown).find('.arrow');

		$(arrow).on('click', function (e) {
			var show = $(dropdown).hasClass('show');

			if (show) {
				$(dropdown).append(
					$(menu).removeAttr('style').removeClass('fixed').hide().detach()
				).removeClass('show');
			} else {
				hideMainMenuDD();
				$('body').append(menu.show().detach());
				$(dropdown).addClass('show');

				var fixed = $('#mainMenu').css('position') == 'fixed' ? true : false;
				setDDMenuPos(dropdown, menu, fixed);
			}
	    });
	});
	$('body, #topMenu .dropdown-toggle').on('click', function(event) {
		hideMainMenuDD();
	});

	// Categories dragging
	$('#mainMenuCategories').on('mousedown', function(event) {
		event.preventDefault();
		$('#mainMenuCategories').css('cursor', '-webkit-grabbing');

		var clickEvent = event;
		var scrollOnStart = $('#mainMenuCategories').scrollLeft();
		$('body').on('mousemove', function(event){
			drag($('#mainMenuCategories'), clickEvent, event, scrollOnStart);
		});
	});
	$('body').on('mouseup', function(event) {
		$('#mainMenuCategories').css('cursor', '-webkit-grab');
		$('body').off('mousemove');
	});
	$('#mainMenuCategories a').on('click', function(event) {
		if (menuDragDistance > 5) {
			menuDragDistance = 0;
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		}
		menuDragDistance = 0;
	});

	adjustStories('.tour');

    // Resize
	$(window).on('resize', function(event) {

		setMenuHeight();
		setTourTitlePos();
		adjustStories('.tour');

		if ($('#plan_t').length) {
			positionGroupbox();
		}

		$.each($('.nav-tabs.indicated, #mainMenu .categories'), function(i, nav) {
			setTimeout(function(){
				setTabIndicator(nav, $(nav).find('.nav-link.active').closest('.nav-item'));
			}, 200);
		});

		$.each($('#mainMenu .dropdown.show'), function(i, dropdown){
			setDDHeight(dropdown);
		});

		$('#mainMenuCategories.show').css({
			maxHeight: $(window).outerWidth() < 992 ? ($('body').outerHeight() - $('#topMenu').outerHeight() + 'px') : 'none'
		});

		// lg
		if ($(window).outerWidth() > 991) {
			if ($('.modal-backdrop.show').length) {
				$('.modal-backdrop.show').trigger('click');
			}
		}
	});

	// Scroll
	$(window).on('scroll', function(event) {

		if ($('.main-menu').length) {
			setOptionalMenuItems();
			setShownDDMenuPos();
		}

		if ($('.scroll-to-top').length) {
			scrollTopState();
		}

	});
	$('#mainMenuCategories').on('scroll', function() {
		setShownDDMenuPos();
	});

	// Gallery
	if ($('.gallery').length) {
		$('.gallery').slick({
			infinite: false,
			speed: topSliderOptions.speed,
			dots: false,
			swipe: false,
			focusOnSelect: true,
			slidesToScroll: 1,
			cssEase: 'ease-in-out',
			lazyLoading: 'progressive',
			prevArrow: '<button class="gallery__control prev"></button>',
			nextArrow: '<button class="gallery__control next"></button>',
			slide: '.gallery__item',
			variableWidth: true
		});
		$('.gallery').on('afterChange', function(event, slick, currentSlide) {
			setNextButtonState(slick, currentSlide);
		});
	}

	$('.form-check-input[name="agb"]').on('click', function(){
		if ($('.form-check-input[name="agb"]').is(':checked')) {
			$('.make-order').removeClass('disabled').removeAttr('disabled');
		} else {
			$('.make-order').addClass('disabled').attr('disabled', 'disabled');
		}
	});

});
