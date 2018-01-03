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
		left: (($cur.offset().left - $nav.offset().left) + $nav.scrollLeft() + 16) + 'px',
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
function drag(element, clickEvent, moveEvent, scrollOnStart) {
	var startPos = clickEvent.pageX;
	var curPos = moveEvent.clientX;

	var distance = - (curPos - startPos);
	menuDragDistance = Math.abs(distance);

	if (distance === 0) return;
	$(element).scrollLeft(scrollOnStart + distance);
}
function setDDMenuPos(reference, menu, fixed) {
	if (fixed) {
		$(menu).css({
			position: 'fixed',
			top: (reference.getBoundingClientRect().top + $(reference).outerHeight()) + 'px',
			left: reference.getBoundingClientRect().left + 'px',
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
function setDDHeight(dropdown) {
	var toggler 	= $(dropdown).find('a[data-toggle="dropdown"]'),
		id 			= $(toggler).attr('id'),
		menu 		= $('.dropdown-menu[aria-labelledby="' + id + '"]'),
		reference 	= $(dropdown).hasClass('reference') ? dropdown : toggler,
		headHeight	= $(menu).find('.dd-menu-header').length ? $(menu).find('.dd-menu-header').outerHeight() : 0,
		footHeight	= $(menu).find('.dd-menu-footer').length ? $(menu).find('.dd-menu-footer').outerHeight() : 0,
		target		= $(menu).find('.dd-menu-body') ? (menu).find('.dd-menu-body') : $(menu);

	var maxHeight 	= $(window).outerHeight() - reference.getBoundingClientRect().top - $(reference).outerHeight() - headHeight - footHeight - 24;

	if ($(reference).hasClass('city')) {
		var topMenuCityHeight = parseInt($('#topMenu .dropdown.city .autocomplete-results').css('max-height'), 10);
		maxHeight = maxHeight < topMenuCityHeight ? maxHeight : topMenuCityHeight;
	}

	$(target).css({
		maxHeight: maxHeight + 'px',
		overflowY: 'auto'
	});
	$(dropdown).dropdown('update');
}
function initFormControls() {
    $.each($('.form-control').find('input, textarea'), function(i, input) {
		$(input).off('focus');
		$(input).off('blur');
		$(input).off('scroll');

        onFormControlBlur(input);

		$(input).on('focus', onFormControlFocus.bind(this));
		$(input).on('blur', onFormControlBlur.bind(this));
		$(input).on('scroll', onFormControlScroll.bind(this));

        if ($(input).val()) {
            $(input).closest('.form-control').addClass('filled');
        }
	});
}
function onFormControlFocus(input) {
	$(this).closest('.form-control').addClass('active').removeClass('filled');
	$(this).addClass('focus').attr('placeholder', $(this).data('placeholder'));
}
function onFormControlBlur(input) {
	$(this).attr('placeholder', '').closest('.form-control').removeClass('active');
	if (this.value) $(this).closest('.form-control').addClass('filled');
}
function onFormControlScroll(input) {
	var scroll = $(this).scrollTop();
	var placeholder = $(this).closest('.form-control').find('.placeholder');
	$(placeholder) && $(placeholder).css({
		transform: 'translateY(-' + scroll + 'px)'
	});
}
function setMenuHeight() {
	setTimeout(function(){
		$('#mainMenuCategories.show').css({
			maxHeight: $(window).outerHeight() - $('#mainMenu').outerHeight() - 24 + 'px'
		});
	}, 1);
}
function hideMainMenuDD() {
	$.each($('#mainMenuCategories .dropdown.show'), function(i, dropdown){
		// console.log('blah');
		var id = $(dropdown).attr('id');
		var menu = $('body').find('.dropdown-menu[aria-labelledby="' + id + '"]');

		if ($(event.target).closest('#' + id).length || $(event.target).closest('.dropdown-menu[aria-labelledby="' + id + '"]').length) {
			return;
		}

		$(dropdown).append(
			$(menu).removeAttr('style').removeClass('fixed').hide().detach()
		).removeClass('show');
	});
}
function isImageLoaded(img) {
	if (!img.complete) {
        return false;
    }
    if (img.naturalWidth === 0) {
        return false;
    }

    return true;
}
function showFadedImages(selector, maxPending) {
	selector = selector || '.preloading img:not(.show)';
	maxPending = maxPending || 10000;

	$(selector).each(function(i, img){
		img = $(img)[0];
		// console.log(img);
		// $(img).addClass('fade');

		if (img.complete) {
			$(img).addClass('show');
		} else {
			// console.log(img);
			$(img).on('load', function() {
				$(img).addClass('show');
			});
		}

		// var started = performance.now();
        //
		// var checkTime = 100;
		// setTimeout(function check(){
		// 	var timepass = performance.now() - started;
        //
		// 	if (!isImageLoaded(img)) {
        //
		// 		if (timepass > 1000) checkTime = 500;
        //
		// 		if (maxPending > timepass) {
		// 			setTimeout(check, checkTime);
		// 		} else {
		// 			console.error('Image (src="' + $(img).attr('src') + '") not loaded: pending time exceeded.');
		// 		}
        //
		// 	} else {
		// 		$(img).addClass('show');
		// 	}
		// }, checkTime);
	});
}
function scrollTopState() {
	var scroll = $(window).scrollTop();

	if (scroll > $(window).height()) {
		$('body').addClass('show-to-top');
	} else {
		$('body').removeClass('show-to-top');
	}

	if (scroll + $(window).height() - 48 >= $('footer').offset().top) {
		$('.scroll-to-top').css({
			position: 'absolute',
			bottom: $('footer').outerHeight() - ($('.scroll-to-top').offset().top - $('#scrollToTop').offset().top) + $('#scrollToTop').outerHeight() / 2 + 'px'
		});
	} else {
		$('.scroll-to-top').css({
			position: 'fixed',
			bottom: '0px'
		});
	}
}
function setTourTitlePos() {
	if ($(window).width() >= 992) {
		$('.tour__desc').prepend($('.tour__title').detach());
	} else {
		$('.tour').parent().prepend($('.tour__title').detach());
	}
}

function setStoryState(selector, item) {
	var basis = $(item).hasClass('collapsed') ? 'pic' : 'wrapper';
	var basisHeight = $(item).find(selector + '__' + basis).outerHeight(true);

	basisHeight += parseInt($(item).find(selector + '__body').css('padding-top')) + parseInt($(item).find(selector + '__body').css('padding-bottom'));

	// $(item).find(selector + '__body')
	// 	.clearQueue().stop()
	// 	.animate({'height': basisHeight + 'px'}, 'medium');
	if (basis == 'wrapper') {
		$(item).find(selector + '__body')
			.css({
				'max-height': basisHeight + 'px'
			});
	} else {
		$(item).find(selector + '__body').removeAttr('style');
	}
}
function adjustStories(selector) {
	$.each($(selector), function(i, eventStory){

		setStoryState(selector, eventStory);

		$(eventStory).find('.toggle-body').off('click');

		$(eventStory).find('.toggle-body').on('click', function(){
			$(eventStory).toggleClass('collapsed');

			setStoryState(selector, eventStory);

			// if ($(eventStory).hasClass('collapsed') && $(selector + '__title').length) {
			// 	var scrollTarget = $(selector + '__title').offset().top - $('.main-menu').outerHeight();
			// 	$("html, body").animate({ scrollTop: scrollTarget - 32 });
			// }
		});

	});
}

function setNextButtonState(gallery, currentSlide) {
	var widthSum = $(gallery.$slides[currentSlide]).outerWidth();

	for (var i = currentSlide + 1; i < gallery.$slides.length; i++) {
		widthSum += $(gallery.$slides[i]).outerWidth();
	}

	if (widthSum < gallery.$list.width() || currentSlide == gallery.$slides.length - 1) {
		gallery.$nextArrow.off('click.slick');
		gallery.$slider.find('.slick-arrow.next')
			.attr('aria-disabled', 'true')
			.addClass('slick-disabled');
	} else {
		gallery.$slider.find('.slick-arrow.next')
			.attr('aria-disabled', 'false')
			.removeClass('slick-disabled');
		gallery.initArrowEvents();
	}
}

// Modals
function CMSalert(bodyContent, headContent, options) {
    headContent = headContent || '';
    bodyContent = bodyContent || '';
    options = options || {};
	options = {
		id: options.id || 'CMSalert',
		btnOk: options.btnOk || 'Ok',
		size: options.size || 'md',
		mode: options.mode || '',
		removeOnDismiss: options.removeOnDismiss || true
	};

	if ($('#' + options.id).length) {
		$('#' + options.id).modal('show');
		return;
	}

	var modal = $('<div class="modal modal-' + options.mode + ' fade" id="' + options.id + '" tabindex="-1" role="dialog" aria-hidden="true"></div>');
    var modalContent = '<div class="modal-dialog modal-' + options.size + '" role="document">';
			modalContent += '<div class="modal-content">';
                modalContent += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
                    modalContent += '<i class="icon-times" aria-hidden="true"></i>';
                modalContent += '</button>';

                if (headContent) {
                    modalContent += '<div class="modal-header">';
    					modalContent += headContent;
    				modalContent += '</div>';
                }

				modalContent += '<div class="modal-body">';
					modalContent += bodyContent;
				modalContent += '</div>';
				modalContent += '<div class="modal-footer">';

				if (options.btnOk != '') {
                    var modificator = options.mode ? ' btn-' + options.mode : ' btn-primary';
					modalContent += '<button class="btn btn-ok' + modificator + '" data-dismiss="modal" aria-label="Close">' + options.btnOk + '</button>';
				}

    			modalContent += '</div>';  // .modal-footer
    		modalContent += '</div>';  // .modal-content
    $(modal).html(modalContent);
    $(modal).modal();

	if (options.removeOnDismiss) {
		$(modal).on('hidden.bs.modal', function(){
			$(modal).remove();
		});
	}
}
function CMSconfirm(bodyContent, headContent, okCallback, options) {
    headContent = headContent || '';
    bodyContent = bodyContent || '';
    options = options || {};
	options = {
		id: options.id || 'CMSconfirm',
		btnCancel: options.btnCancel || 'Cancel',
		btnOk: options.btnOk || 'Ok',
		size: options.size || 'md',
		mode: options.mode || '',
		removeOnDismiss: options.removeOnDismiss || false
	};

	if ($('#' + options.id).length) {
		$('#' + options.id).modal('show');
		return;
	}

	var modal = $('<div class="modal modal-' + options.mode + ' fade" id="' + options.id + '" tabindex="-1" role="dialog" aria-hidden="true"></div>');
    var modalContent = '<div class="modal-dialog modal-' + options.size + '" role="document">';
			modalContent += '<div class="modal-content">';
                modalContent += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
                    modalContent += '<i class="icon-times" aria-hidden="true"></i>';
                modalContent += '</button>';

                if (headContent) {
                    modalContent += '<div class="modal-header">';
    					modalContent += headContent;
    				modalContent += '</div>';
                }

				modalContent += '<div class="modal-body">';
					modalContent += bodyContent;
				modalContent += '</div>';
				modalContent += '<div class="modal-footer">';

				if (options.btnCancel != '') {
					modalContent += '<button class="btn btn-cancel" data-dismiss="modal" aria-label="Close">' + options.btnCancel + '</button>';
				}
			    if (options.btnOk != '') {
					var modificator = options.mode ? ' btn-' + options.mode : ' btn-primary';
			        modalContent += '<button class="btn btn-ok' + modificator + '">' + options.btnOk + '</button>';
			    }

    			modalContent += '</div>';  // .modal-footer
    		modalContent += '</div>';  // .modal-content
    $(modal).html(modalContent);
    $(modal).modal();

	if (options.btnOk != '' && okCallback) {
        $(modal).on('hidden.bs.modal', okCallback.bind(modal));
		$(modal).find('.btn-ok').on('click', function(){
            $(modal).modal('hide');
        });
	}

	if (options.removeOnDismiss) {
		$(modal).on('hidden.bs.modal', function(){
			$(modal).remove();
		});
	}
}
function CMSprompt(promptText, value, headContent, okCallback, options) {
    headContent = headContent || '';
    promptText = promptText || '';
    options = options || {};
	options = {
		id: options.id || 'CMSprompt',
		btnCancel: options.btnCancel || 'Cancel',
		btnOk: options.btnOk || 'Submit',
		size: options.size || 'md',
		mode: options.mode || '',
		removeOnDismiss: options.removeOnDismiss || false
	};

	if ($('#' + options.id).length) {
		$('#' + options.id).modal('show');
		return;
	}

	var modal = $('<div class="modal modal-' + options.mode + ' fade" id="' + options.id + '" tabindex="-1" role="dialog" aria-hidden="true"></div>');
    var modalContent = '<div class="modal-dialog modal-' + options.size + '" role="document">';
			modalContent += '<div class="modal-content">';
                modalContent += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
                    modalContent += '<i class="icon-times" aria-hidden="true"></i>';
                modalContent += '</button>';

                if (headContent) {
                    modalContent += '<div class="modal-header">';
    					modalContent += headContent;
    				modalContent += '</div>';
                }

				modalContent += '<div class="modal-body">';
                    modalContent += '<div class="form-control">';
                        var tail = options.id ? options.id : '';
                        modalContent += '<input type="text" name="cms_prompt_' + tail + '" id="cms_prompt_' + tail + '" value="' + value + '">';
                        modalContent += '<label for="cms_prompt_' + tail + '" class="placeholder">' + promptText + '</label>';
                    modalContent += '</div>';
				modalContent += '</div>';
				modalContent += '<div class="modal-footer">';

				if (options.btnCancel != '') {
					modalContent += '<button class="btn btn-cancel" data-dismiss="modal" aria-label="Close">' + options.btnCancel + '</button>';
				}
			    if (options.btnOk != '') {
					var modificator = options.mode ? ' btn-' + options.mode : ' btn-primary';
			        modalContent += '<button class="btn btn-ok' + modificator + '">' + options.btnOk + '</button>';
			    }

    			modalContent += '</div>';  // .modal-footer
    		modalContent += '</div>';  // .modal-content
    $(modal).html(modalContent);

    $(modal).on('shown.bs.modal', function(){
        initFormControls();
        $(modal).find('input').eq(0).focus();
    });

    $(modal).modal();

	if (options.btnOk != '' && okCallback) {
        $(modal).on('hidden.bs.modal', okCallback.bind(modal));
		$(modal).find('.btn-ok').on('click', function(){
            $(modal).modal('hide');
        });
	}

	if (options.removeOnDismiss) {
		$(modal).on('hidden.bs.modal', function(){
			$(modal).remove();
		});
	}
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
