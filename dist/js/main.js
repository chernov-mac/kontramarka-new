$(function() {

	// Initialization

	// Slider
	var topSliderOptions = {
		speed: 500,
		infinite: true,
		fade: false,
		autoplay: true,
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

	// Scheme
	// if ($('#scheme').length) {
	// 	initScheme();
	// }

	// Indicated tabs
	$('.nav-tabs.indicated').append('<div class="indicator"></div>');
	$.each($('.nav-tabs.indicated'), function(i, nav){
		setTimeout(function(){
			setTabIndicator(nav, $(nav).find('.nav-link.active'));
		}, 100);

		$(nav).find('.nav-item').on({
			mouseenter: function(event) {
				setTabIndicator(nav, event.target);
			},
			mouseleave: function(event) {
				setTabIndicator(nav);
			}
		});
	});


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

	// Navbar
	$('#navbar').on('show.bs.collapse', function() {
		$('#topMenu').addClass('modal-zindex');
		$('<div class="modal-backdrop fade"></div>').appendTo(document.body);

		setTimeout(function(){
			$('.modal-backdrop').addClass('show');
		}, 1);

		$('.modal-backdrop').on('click', onNavbarBDClick);
	});
	$('#navbar').on('hide.bs.collapse', function() {
		$('.modal-backdrop').removeClass('show');
		setTimeout(function(){
			$('.modal-backdrop').remove();
			$('#topMenu').removeClass('modal-zindex');
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
	$('#scrollToTop').on('click', function() {
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;
	});

	// Tabs on modal shown
	$('.modal').on('shown.bs.modal', function(event){
		$.each($(this).find('.nav-tabs'), function(i, nav){
			setTabIndicator(nav, $(nav).find('.nav-link.active'));
		});
	});

});


function onNavbarBDClick(event) {
	$('#topMenu .navbar-toggler').trigger('click');
	$('.modal-backdrop').off('click', onNavbarBDClick);
}



function setTabIndicator(nav, activeTab) {
	var $nav = $(nav),
		$cur = activeTab ? $(activeTab) : $(nav).find('.nav-link.active'),
		$ind = $nav.find('.indicator');

	$ind.css({
		left: (($cur.offset().left - $nav.offset().left) + ($cur.outerWidth() - $cur.width()) / 2) + 'px',
		width: $cur.width() + 'px',
		backgroundColor: '#ffcc00'
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
