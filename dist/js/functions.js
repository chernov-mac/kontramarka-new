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
	var padding = $cur.outerWidth() - $cur.width();

	$ind.css({
		left: (($cur.offset().left - $nav.offset().left) + $nav.scrollLeft() + padding / 2) + 'px',
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
    $.each($('.form-control').find('input, textarea, select'), function(i, input) {
		$(input).off('focus');
		$(input).off('blur');
		$(input).off('scroll');

        onFormControlBlur(input);

		$(input).on('click', onFormControlClick.bind(this));
		$(input).on('focus', onFormControlFocus.bind(this));
		$(input).on('blur', onFormControlBlur.bind(this));
		$(input).on('scroll', onFormControlScroll.bind(this));
		$(input).on('change', onFormControlChange.bind(this));

		checkInputFill(input);
		setTimeout(function(){
			checkInputFill(input);
		}, 100);
		setTimeout(function(){
			checkInputFill(input);
		}, 1000);
	});
}
function checkInputFill(input) {
	if ($(input).val()) {
		$(input).closest('.form-control').addClass('filled');
	}
}
function onFormControlClick(e) {
	if ($(this).attr('readonly')) {
		var target = $(this).closest('.form-control').find('input:not([readonly])');
		target && $(target).focus();
	}
}
function onFormControlFocus(e) {
	$(this).closest('.form-control').addClass('active').removeClass('filled');
	$(this).addClass('focus').attr('placeholder', $(this).data('placeholder'));
}
function onFormControlBlur(e) {
	$(this).attr('placeholder', '').closest('.form-control').removeClass('active');
	if (this.value) $(this).closest('.form-control').addClass('filled');
}
function onFormControlScroll(e) {
	var scroll = $(this).scrollTop();
	var placeholder = $(this).closest('.form-control').find('.placeholder');
	$(placeholder) && $(placeholder).css({
		transform: 'translateY(-' + scroll + 'px)'
	});
}
function onFormControlChange(e) {
	checkInputFill(this);
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
		// $(img).addClass('fade');

		if (img.complete) {
			$(img).addClass('show');
		} else {
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
		$('.scroll-to-top').addClass('at-footer');
		// $('.scroll-to-top').css({
		// 	position: 'absolute',
		// 	bottom: $('footer').outerHeight() - ($('.scroll-to-top').offset().top - $('#scrollToTop').offset().top) + $('#scrollToTop').outerHeight() / 2 + 'px'
		// });
	} else {
		$('.scroll-to-top').removeClass('at-footer');
		// $('.scroll-to-top').css({
		// 	position: 'fixed',
		// 	bottom: '0px'
		// });
	}
}
function setTourTitlePos() {
	if ($(window).width() >= 992) {
		$('.tour__desc').prepend($('.tour__title').detach());
	} else {
		$('.tour').parent().prepend($('.tour__title').detach());
	}
}
function setOptionalMenuItems() {
	var requiredOffset = $('header').outerHeight() - $('#mainMenu').outerHeight();

	if ($(window).scrollTop() >= requiredOffset) {
		$('#mainMenu').addClass('fixed-top');
		$('body').addClass('fixed-nav');

		if (!$('#mainMenu .menu-item.optional').hasClass('in')) {
			$('#mainMenu .menu-item.optional').removeClass('out').addClass('moving in');
			setTimeout(function(){
				$('#mainMenu .menu-item.optional').removeClass('moving');
			}, 225);
		}
	} else {
		$('body').removeClass('fixed-nav');
		$('#mainMenu').removeClass('fixed-top');

		if (!$('#mainMenu .menu-item.optional').hasClass('out')) {
			$('#mainMenu .menu-item.optional').removeClass('in').addClass('moving out');
			setTimeout(function(){
				$('#mainMenu .menu-item.optional').removeClass('moving');
			}, 225);
		}
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

function positionGroupbox() {
	if ($(window).outerWidth() < 992) {
		$('#pre_scheme').html($('#groupbox').detach());
		$('#post_scheme').html($('#ticketbox').detach());
	} else {
		$('#maindata_wrapper')
			.append($('#ticketbox').detach())
			.append($('#groupbox').detach());
	}
}

function initCounters() {
	if ($('.counter').length) {
		$.each($('.counter'), function(i, counter){
			checkCounter(counter);
		});
	}
}
function checkCounter(counter) {
	if ($(counter).find('select').val() == 0) {
		$(counter).find(".prev").addClass('disabled');
	}

	$(counter).find('.prev, .next').off('click');
    $(counter).find('.next')
        .on('click', function(){
            counterSelectNext(counter);
        });

    $(counter).find('.prev')
        .on('click', function(){
            counterSelectPrev(counter);
        });

    $(counter).find('select').on('change', function() {
        var maxValue = $(counter).find('select :last').val();
    	if($(this).val()==0) {
    		$(counter).find(".prev").addClass('disabled');
            $(counter).find(".next").removeClass('disabled').tooltip('dispose');
        } else if($(this).val() == maxValue) {
            $(counter).find(".prev").removeClass('disabled');
            $(counter).find(".next")
				.addClass('disabled')
				.tooltip($(this).data('title'));
        } else {
            $(counter).find(".prev").removeClass('disabled');
            $(counter).find(".next").removeClass('disabled').tooltip('dispose');
		}
    });
}
function counterSelectPrev(counter) {
    $(counter).find(".next").removeClass('disabled').tooltip('dispose');
    var curValue = $(counter).find('select').val();
    var prevValue = parseInt(curValue, 10) - 1;
    if(prevValue >= 0) $(counter).find('select').val(prevValue);
    if(prevValue == 0)  $(counter).find(".prev").addClass('disabled');
	$(counter).find('select').trigger('change');
}
function counterSelectNext(counter) {
    $(counter).find(".prev").removeClass('disabled');
	var maxValue = $(counter).find('select :last').val();
    var curValue = $(counter).find('select').val();
    var nextValue = parseInt(curValue, 10) + 1;
    if(nextValue <= maxValue) $(counter).find('select').val(nextValue);
    if(nextValue == maxValue) {
		$(counter).find(".next").addClass('disabled').tooltip($(this).data('title'));
		$(counter).find(".next").tooltip('show');
	}
	$(counter).find('select').trigger('change');
}

function wrapScrollShadow(element, height) {
	$(element)
	.addClass('beauty-scroll')
	.attr('data-max-height', height)
	.wrap('<div class="scroll-shadow"></div>')
	.wrap('<div class="scroll-shadow__outer"></div>')
	.wrap('<div class="scroll-shadow__scroller"></div>')
	.wrap('<div class="scroll-shadow__inner"></div>')
	.addClass('scroll-shadow__target');

	initScrollShadow();
}
function initScrollShadow() {
	$.each($('.scroll-shadow__target'), function(i, target){
		checkScrollShadowPos(target);

		// $(window).on('resize', checkScrollShadowPos.bind(this, target));
		$(target).closest('.scroll-shadow__scroller').on('scroll', checkScrollShadowPos.bind(this, target));
		$(target).on('DOMSubtreeModified', checkScrollShadowPos.bind(this, target));
	});

	$(window).on('resize', function() {
		$.each($('.scroll-shadow__target'), function(i, target){
			checkScrollShadowPos(target);
		});
	});
}
function checkScrollShadowPos(target) {
	var $target = $(target),
		$inner = $target.closest('.scroll-shadow__inner'),
		$scroller = $target.closest('.scroll-shadow__scroller'),
		$outer = $inner.closest('.scroll-shadow__outer'),
		$parent = $outer.closest('.scroll-shadow');

	var scrollEnd = $target.outerHeight() - $outer.outerHeight();
	var height = parseInt($target.attr('data-max-height'), 10) > $target.outerHeight() ? $target.outerHeight() + 'px' : $target.attr('data-max-height');

	$inner.css({
		width: $parent.width() + 'px',
		height: height
	});
	$outer.css({
		width: $parent.width() + 'px',
		height: height
	});

	if ($target.outerHeight() <= $outer.outerHeight()) {
		$parent
		.removeClass('not-start')
		.removeClass('not-end');

		return;
	}

	if ($scroller.scrollTop() > 0) {
		$parent.addClass('not-start');
	} else {
		$parent.removeClass('not-start');
	}

	if (scrollEnd <= 0 || $scroller.scrollTop() < scrollEnd) {
		$parent.addClass('not-end');
	} else {
		$parent.removeClass('not-end');
	}
}

function showGroupsField(id, elem) {
	var popoverId = $(elem).attr('aria-describedby');
	$('#' + popoverId)
		.addClass('pgroups-activated')
		.find('.popover-body')
			.html('<div class="pgroups-title">Выберите категорию:</div>')
			.append($('#' + id).clone());
	$(elem).popover('update');
}


function BoxMessage(title, text, options) {
	options = options || {};
	var opts = {
		container: options.container || $('#messager'),
		id: options.id || '',
		size: options.size || 'md',
		mode: options.mode || 'info',
		showOnInit: options.showOnInit || false,
		animate: options.animate || false,
		closing: options.closing || false
	}

	var id = opts.id ? ' id="' + opts.id + '"' : '';
	var state = opts.showOnInit ? ' show' : '';
	var animate = opts.animate ? ' animate' : '';

	var icon = '<span class="message__icon">';
	switch (opts.mode) {
		case 'announce':
			icon += '<i class="icon-brand-logo colored"></i>';
			break;
		case 'info':
			icon += '<i class="fa fa-info-circle"></i>';
			break;
		case 'success':
			icon += '<i class="icon-check"></i>';
			break;
		case 'warning': case 'danger':
			icon += '<i class="icon-exclamation-circle"></i>';
	}
	icon += '</span>';

	var titleString = '';
	if (opts.size != 'lg') {
		titleString = '<div class="message__title">' + icon + ' ' + title + '</div>';
	} else {
		titleString = '<div class="message__title">' + title + '</div>';
	}

	var template = 	'<div ' + id + ' class="box box-message collapse ' + state + animate + '">' +
						'<div class="box-body">' +
							'<div class="message message-' + opts.size + ' message-' + opts.mode + '">';

								if (opts.closing) {
									template += '<button class="close"><i class="icon-times"></i></button>'
								}
								if (opts.size == 'lg') {
									template += icon;
								}
								template += titleString;
								template += '<div class="message__text">' + text + '</div>' +

							'</div>' +
						'</div>' +
					'</div>';

	var msg = $.parseHTML(template);
	$(opts.container).append(msg);

	initBoxMessageEvents(msg, opts);

	return msg;
}
function initBoxMessageEvents(msg, opts) {
	$(msg).on('show.bs.collapse', function(){
		TweenMax.to($(msg), 0.3, {
			marginBottom: '32px',
			opacity: 1,
			top: '0',
			ease: Power1.easeOut
		});
		if (opts.animate && opts.mode == 'success') {
			TweenMax.to($(msg).find('.message__icon'), .5, {
				transform: 'scale(1)',
				opacity: 1,
				ease: Back.easeInOut
			});
		}
	});
	$(msg).on('hide.bs.collapse', function(){
		TweenMax.to($(msg), 0.3, {
			marginBottom: '0',
			opacity: 0,
			top: '-32px',
			ease: Power1.easeOut
		});
		if (opts.animate && opts.mode == 'success') {
			TweenMax.to($(msg).find('.message__icon'), .5, {
				transform: 'scale(0.1)',
				opacity: 0,
				ease: Ease.easeOut
			});
		}
	});

	if (opts.closing) {
		$(msg).find('.close').on('click', function(){
			$(msg).collapse('hide');
		});
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
		$(modal).find('.btn-ok').on('click', function(){
            $(modal).on('hidden.bs.modal', okCallback.bind(modal));
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
		$(modal).find('.btn-ok').on('click', function(){
            $(modal).on('hidden.bs.modal', okCallback.bind(modal, $(modal).find('input').val()));
            $(modal).modal('hide');
        });
	}

	if (options.removeOnDismiss) {
		$(modal).on('hidden.bs.modal', function(){
			$(modal).remove();
		});
	}
}



function onExtensibleItemFocus(toggler) {
	var $menu = $(toggler).closest('.extensible'),
		$itemsWrapper = $menu.find('.extensible__items-list'),
		$visibleItems = [];

	$menu.find('.extensible__item').removeClass('active');

	if ($(window).width() < 768) {
		var currItem = $(toggler).closest('.extensible__item')[0];
		var currNum = 0;
		$.each($menu.find('.extensible__item'), function(i, item){
			if ($(item).is(':visible')) {
				$visibleItems.push(item);
			}
			if (item == currItem) {
				currNum = $visibleItems.length - 1;
			}
		});

		$itemsWrapper.css({
			marginLeft: -($itemsWrapper.width() / $visibleItems.length * currNum) + 'px'
		});
	}

	$menu.addClass('expanded');
	$(toggler).closest('.extensible__item').addClass('active');
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
