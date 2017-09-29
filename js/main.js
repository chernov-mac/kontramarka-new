$(function() {

	// Initialization

	// Slider
	var topSliderOptions = {
		speed: 500,
		infinite: true,
		fade: false,
		// autoplay: true,
		// autoplaySpeed: 5000,
		thumbsCount: {
			xl: 5,
			lg: 3
		}
	};
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


	// Events

	// Top menu
	$('#topMenu .calendar .dropdown-menu').on('click', function(event) {
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

});

function onNavbarBDClick(event) {
	$('#topMenu .navbar-toggler').trigger('click');
	$('.modal-backdrop').off('click', onNavbarBDClick);
}
