var menuDragDistance = 0;

$(function() {

	// Initialization

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

	// Slider
	var topSliderOptions = {
		speed: 500,
		infinite: true,
		fade: false,
		autoplay: false,
		autoplaySpeed: 5000,
		thumbsCount: {
			xl: 5,
			lg: 3
		}
	};

	if ($('#topSlider').length) {
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
			lazyLoading: 'progressive'
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
		cities.forEach(curCity => {
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
				$('body').append(menu.show().detach());
				$(dropdown).addClass('show');

				var fixed = $('#mainMenu').css('position') == 'fixed' ? true : false;
				setDDMenuPos(dropdown, menu, fixed);
			}
	    });
	});
	$('body').on('click', function(event) {
		$.each($('#mainMenuCategories .dropdown.show'), function(i, dropdown){
			var id = $(dropdown).attr('id');
			var menu = $('body').find('.dropdown-menu[aria-labelledby="' + id + '"]');

			if ($(event.target).closest('#' + id).length || $(event.target).closest('.dropdown-menu[aria-labelledby="' + id + '"]').length) {
				return;
			}

			$(dropdown).append(
				$(menu).removeAttr('style').removeClass('fixed').hide().detach()
			).removeClass('show');
		});
	});

	// Categories dragging
	$('#mainMenuCategories').on('mousedown', function(event) {
		event.preventDefault();
		$('body').on('mousemove', drag.bind(this, event, $(this).scrollLeft()));
	});
	$('body').on('mouseup', function(event) {
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

	// Tour description height
	if ($('#tour_info').length) {
		var image = new Image();
		image.src = $('#tour_info .tour-pic img').attr('src');

		if (image.complete) {
			calcTourDescHeight();
		} else {
			$('#tour_info .tour-pic img').on('load', calcTourDescHeight);
		}
	}


	// Events

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

	// Top menu
	$('#topMenu .dropdown-menu').on('click', function(event) {
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
			$('#topMenu .search input').css('max-width', $(this).closest('.container').outerWidth() - $('#topMenu .navbar-brand').outerWidth() + 'px');
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


    // Resize
	$(window).on('resize', function(event) {

		$.each($('.nav-tabs.indicated, #mainMenu .categories'), function(i, nav) {
			setTimeout(function(){
				setTabIndicator(nav, $(nav).find('.nav-link.active').closest('.nav-item'));
			}, 200);
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
	$('body').on('scroll', function(event) {
		// $('#mainMenuCategories').dropdown('update');
		if ($('body').scrollTop() > ($('header').outerHeight() - $('#mainMenu').outerHeight())) {
			$('#mainMenu').addClass('fixed-top');
			$('body').addClass('fixed-nav');
		} else {
			$('body').removeClass('fixed-nav');
			$('#mainMenu').removeClass('fixed-top');
		}

		setShownDDMenuPos();

	});
	$('#mainMenuCategories').on('scroll', function() {
		setShownDDMenuPos();
	});

});


function onNavbarBDClick(event) {
	$('#mainMenu .menu-toggler').trigger('click');
	$('.modal-backdrop').off('click', onNavbarBDClick);
}
function setTabIndicator(nav, activeTab, indicator) {
	var $nav = $(nav),
		$cur = activeTab ? $(activeTab) : $nav.find('.nav-link.active').closest('.nav-item'),
		$ind = indicator ? $(indicator) : $nav.find('.nav-indicator');

	if (!$cur.length) {
		$ind.css({
			left: 0,
			width: 0
		});
		return;
	}
	var arrowPart = $cur.hasClass('dropdown') ? 10 : 0;

	$ind.css({
		left: (($cur.offset().left - $nav.offset().left) + 16) + 'px',
		width: $cur.width() - arrowPart + 'px',
		backgroundColor: '#ffc800'
	});
}
function calcTourDescHeight() {
	$('#tour_info .tour-info')
		.addClass('collapsed')
		.append('<a class="expand">Показать полностью...</a>')
		.css('max-height', $('#tour_info .tour-pic').outerHeight() + 'px');

	$('#tour_info .expand').on('click', function(event) {
		$(this).closest('.tour-info').removeClass('collapsed').css('max-height', 'none');
		$(this).remove();
	});
}
function drag(clickEvent, scrollOnStart) {
	var startPos = clickEvent.pageX;
	var distance = - (event.clientX - clickEvent.pageX);
	menuDragDistance = Math.abs(distance);

	if (distance === 0) return;

	$(this).scrollLeft(scrollOnStart + distance);
}
function setDDMenuPos(reference, menu, fixed) {
	if (fixed) {
		$(menu).css({
			position: 'fixed',
			top: ($(reference).offset().top + $(reference).outerHeight()) + 'px',
			left: $(reference).offset().left + 'px',
			transform: 'translate3d(0, 0, 0)'
		}).addClass('fixed');
	} else {
		$(menu).css({
			position: 'absolute',
			top: '0px',
			left: '0px',
			willChange: 'transform',
			transform:
				'translate3d(' +
					$(reference).offset().left + 'px' + ', ' +
					($(reference).offset().top + $(reference).outerHeight() + $('body').scrollTop()) + 'px, 0px)'
		}).removeClass('fixed');
	}
}
function setShownDDMenuPos() {
	$.each($('#mainMenuCategories .dropdown.show'), function(i, dropdown){
		var id = $(dropdown).attr('id');
		var menu = $('body').find('.dropdown-menu[aria-labelledby="' + id + '"]');
		var fixed = $('#mainMenu').css('position') == 'fixed' ? true : false;

		setTimeout(function(){
			setDDMenuPos(dropdown, menu, fixed);
		}, 1);
	});
}

// function initScheme() {
// 	var schemeEl = document.getElementById('scheme');
//
// 	var scheme = new Scheme(schemeEl, sample.data[0].places, {
// 		category: 0 // default
// 	});
// }
//
// function markerPlace() {
// 	console.log(arguments);
// }
