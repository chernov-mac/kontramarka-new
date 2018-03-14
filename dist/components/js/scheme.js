(function($) {

    var id_koncert, id_tour;

    var path = document.location.pathname;
    var matches = path.match(/plan\/(\d{1,})\/(\d{1,})\//);
    if (matches && matches[2]) id_koncert = parseInt(matches[2], 10);
    // console.log('Concert ID: ' + id_koncert);

    // Options

    var options = {
        devmode: false,
        schemeHolder: {
            selector: '#ZoomPlaceholder'
        },
        minimap: {
            selector: '#MainData',
            disableDown: 991 // 991px -- xs, sm, md screens
        },
        ticketbox: {
            selector: '#ticketbox_inner'
        },
        controls: {
            scale: {
                enable: true,
                label: 'РњР°СЃС€С‚Р°Р±'
            }
        },
        place: {
            radius: 7.5
        },
        placeNew: {
            radius: 4
        }
    };

    var GLYPHS = {
        check: {
            'class': 'check',
            'd': 'M2.9 4.5l3.8 3.8L15 0l3 2.9-8.3 8.3-3 3L0 7.4z'
        },
        r: {
            'class': 'letter-r',
            'd': 'M0,7.975V0h2.86c0.44,0,0.85,0.041,1.229,0.122c0.379,0.082,0.707,0.213,0.983,0.396s0.494,0.425,0.653,0.726  c0.16,0.301,0.24,0.675,0.24,1.122c0,0.61-0.154,1.102-0.46,1.476C5.201,4.215,4.792,4.483,4.284,4.646l2.019,3.329H4.621  L2.795,4.853H1.501v3.122H0z M1.501,3.731h1.204c0.578,0,1.02-0.114,1.326-0.341c0.307-0.228,0.46-0.569,0.46-1.024  c0-0.463-0.153-0.784-0.46-0.963C3.725,1.224,3.283,1.134,2.705,1.134H1.501V3.731z'
        },
        union: {
            'class': 'place-union',
            'd': 'M14.957,23.695C14.602,20.212,12,18.315,12,15.985c0-2.33,2.603-4.227,2.958-7.711c0.002-0.02,0.006-0.039,0.008-0.058   c0.007-0.072,0.006-0.15,0.011-0.223C14.987,7.826,15,7.659,15,7.493c0-0.003,0-0.005,0-0.007c0-0.003-0.001-0.007-0.001-0.01   c-0.006-1.911-0.737-3.82-2.196-5.279c-2.929-2.929-7.678-2.929-10.607,0C0.739,3.655,0.007,5.564,0.001,7.475   C0.001,7.479,0,7.482,0,7.485C0,7.488,0,7.49,0,7.493c0,0.167,0.012,0.333,0.023,0.5c0.005,0.074,0.004,0.151,0.011,0.223   c0.002,0.02,0.006,0.039,0.008,0.058C0.397,11.758,3,13.656,3,15.985c0,2.329-2.602,4.226-2.957,7.709   c-0.002,0.02-0.006,0.04-0.008,0.06c-0.007,0.072-0.006,0.148-0.011,0.221C0.013,24.143,0,24.31,0,24.478c0,0.003,0,0.005,0,0.008   c0,0,0,0,0.001,0c0.004,1.915,0.735,3.828,2.196,5.289c2.929,2.929,7.678,2.929,10.607,0c1.461-1.461,2.192-3.374,2.196-5.289   c0,0,0,0,0.001,0c0-0.003,0-0.005,0-0.008c0-0.167-0.012-0.335-0.023-0.502c-0.005-0.073-0.004-0.15-0.011-0.221   C14.964,23.735,14.96,23.715,14.957,23.695z'
        }
    };

    var
        $schemeHolder   = $(options.schemeHolder.selector),
        $minimap        = $(options.minimap.selector),
        $scaleControl,
        $scaleStatus,
        $scaleMinus,
        $scalePlus;

    var helper = $('<div class="helper"></div>');
    $minimap.append(helper);

    var Place = function(g) {
        var place = {
            data: {},

            size: 0,
            posX: 0,
            posY: 0,
            label: null,

            title: '', // for popover
            pgroups: '', // for popover with group select

            svgG: null,
            svgText: null,
            svgCircle: null,

            isDouble: false,
            isMarkable: true,
            isMarked: false,

            init: function(g) {
                this.data.id = $(g).attr('id');

                this.data.groupId = 0;
                this.data.price = $(g).data('price');
                this.data.currency = $(g).data('currency');

                this.data.block = $(g).data('block');
                this.data.row = $(g).data('row');
                this.data.place = $(g).data('place');

                this.posX = $(g).data('cx');
                this.posY = $(g).data('cy');

                this.title = $(g).attr('title');
                this.pgroups = $(g).data('pgroups');

                this.svgG = $(g)[0];
                this.svgText = $(this.svgG).find('text');

                this.size = $(this.svgG).hasClass('place_new') ? options.placeNew.radius : options.place.radius;

                if ($(this.svgG).hasClass('place-double')) {
                    this.isDouble = true;
                }

                if (!this.isDouble) {
                    this.svgCircle = makeSVG('circle', {class: 'place_label', cx: this.posX, cy: this.posY, r: this.size});
                    this.svgG.prepend(this.svgCircle);

                    if ($(this.svgG).find('text').length) {
                        this.svgText = $(this.svgG).find('text')[0];
                        this.svgText.setAttribute('x', this.posX);
                        this.svgText.setAttribute('y', this.posY);
                    }
                } else {
                    this.isRightSide = $(this.svgG).hasClass('right');
                    this.additionShift = this.size * 2 * 0.8;
                    var rotate = this.isRightSide ? 45 : -45;
                    this.svgUnion = makeSVG('path', {
                        class: GLYPHS.union.class,
                        d: GLYPHS.union.d,
                        style: 'transform-origin: 50% 23.4%',
                        transform: 'matrix(1, 0, 0, 1, '+ (this.posX - this.size + (this.isRightSide ? this.additionShift : 0)) +', '+( this.posY - this.size) +') rotate('+ rotate +')'
                    });
                    this.svgTopCircle = makeSVG('circle', {
                        class: 'place_label',
                        cx: this.posX + (this.isRightSide ? this.additionShift : 0),
                        cy: this.posY,
                        r: this.size
                    });
                    this.svgBottomCircle = makeSVG('circle', {
                        class: 'place_label',
                        cx: this.posX + (this.isRightSide ? 0 : this.additionShift),
                        cy: this.posY + this.additionShift,
                        r: this.size
                    });
                    this.svgG.prepend(this.svgTopCircle);
                    this.svgG.prepend(this.svgBottomCircle);
                    this.svgG.prepend(this.svgUnion);
                }

                var classList = this.svgG.classList;
                for (var i = classList.length - 1; i > 0; i--) {
                    if (~this.svgG.classList[i].indexOf('_label')) {
                        this.label = this.svgG.classList[i].split('_')[0];
                        break;
                    }
                }
                if (this.label == 'empty' || this.label == 'sold' || this.label == 'reserve') this.isMarkable = false;

                if (!this.isMarkable) this.setAdditions();
                this.initEvents();
            },
            initEvents: function() {
                if (this.isMarkable && !this.pgroups) {
                    $(this.svgG).on('click', this.toggleMarker.bind(this));
                }

                var place = this;
                if (this.pgroups) {
                    $(this.svgG).on('click', function() {
                        var popoverId = $(this).attr('aria-describedby');
                        if (!popoverId) return;
                        $('#' + popoverId).addClass('pgroups-activated');
                        $('#' + popoverId).find('.popover-body')
                            .html('<div class="pgroups-title">' + lang['choose-category'] + ':</div>')
                            .append($('#' + place.pgroups).clone());

                        dispEvent(place.svgG, 'schemePgroupsActivated', {target: place.svgG});

                        $('#' + popoverId).find('p').on('click', function(){
                            place.onPgroupsClick(this);
                        });
                    });
                }
            },
            setAdditions: function() {
                this.setAdditionCircle();
                if (this.label == 'sold') { this.setBrick(); }
                if (this.label == 'reserve') { this.setLetterR(); }

                $(this.svgG).append($(this.svgText).detach());
            },
            setAdditionCircle: function() {
                this.svgAddition = makeSVG('circle', {class: 'addition', cx: this.posX, cy: this.posY, r: this.size - 0.63});
                this.svgG.appendChild(this.svgAddition);

                if (this.isDouble) {
                    this.svgAdditionDuplicate = this.svgAddition.cloneNode(true);
                    this.svgG.appendChild(this.svgAdditionDuplicate);

                    if (this.isRightSide) {
                        $(this.svgAdditionDuplicate).attr('cy', parseInt($(this.svgAddition).attr('cy'), 10) + this.additionShift);
                        $(this.svgAddition).attr('cx', parseInt($(this.svgAddition).attr('cx'), 10) + this.additionShift);
                    }
                }
            },
            setBrick: function() {
                var svgopts = {};
                if ($(this.svgG).hasClass('place_new')) {
                    svgopts = {
                        class: 'brick',
                        x: this.posX - 2,
                        y: this.posY - 0.5,
                        width: 4,
                        height: 1
                    };
                } else {
                    svgopts = {
                        class: 'brick',
                        x: this.posX - 5,
                        y: this.posY - 1,
                        width: 10,
                        height: 2
                    };
                }
                this.svgBrick = makeSVG('rect', svgopts);
                this.svgG.appendChild(this.svgBrick);

                if (this.isDouble) {
                    this.svgBrickDuplicate = this.svgBrick.cloneNode(true);
                    this.svgG.appendChild(this.svgBrickDuplicate);

                    if (this.isRightSide) {
                        $(this.svgAdditionDuplicate).attr('cy', parseInt($(this.svgAddition).attr('cy'), 10) + this.additionShift);
                        $(this.svgAddition).attr('cx', parseInt($(this.svgAddition).attr('cx'), 10) + this.additionShift);
                    }
                }
            },
            setLetterR: function() {
                var sizeCoeff = 1;
                if ($(this.svgG).hasClass('place_new')) {
                    sizeCoeff = 0.5;
                }
                this.svgLetter = makeSVG('path', {
                    class: GLYPHS.r.class,
                    d: GLYPHS.r.d,
                    transform: 'matrix('+ sizeCoeff +', 0, 0, '+ sizeCoeff +', '+ (this.posX - this.size * 2 * 0.186) +', '+( this.posY - this.size * 2 * 0.266) +')'
                });
                this.svgG.appendChild(this.svgLetter);
            },
            toggleMarker: function() {
                if (!this.isMarked) this.selectPlace();
                else this.deselectPlace();
            },
            selectPlace: function() {
                var newState = !this.isMarked;
                this.isMarked = true;

                var coeff = $(this.svgG).hasClass('place_new') ? 0.3 : 0.54;

                $(this.svgG).addClass('marker');
                this.svgCheck = makeSVG('path', {
                    class: GLYPHS.check.class,
                    d: GLYPHS.check.d,
                    transform: 'matrix('+ coeff +', 0, 0, '+ coeff +', '+ (this.posX - this.size * 2 * 0.333) +', '+( this.posY - this.size * 2 * 0.233) +')'
                });
                this.svgG.appendChild(this.svgCheck);

                if (newState) dispEvent(this.svgG, 'placeSelect', {place: this});
            },
            deselectPlace: function() {
                var newState = this.isMarked;
                this.isMarked = false;

                $(this.svgCheck).remove();
                $(this.svgG).removeClass('marker');

                if (newState) dispEvent(this.svgG, 'placeDeselect', {place: this});
            },
            makeEmpty: function() {
                var isPlaceNew = $(this.svgG).hasClass('place_new');

                $(this.svgG).removeAttr('class');
                $(this.svgG).off('click');
                $(this.svgG).popover('disable');

                $(this.svgG).removeAttr('title');
                $(this.svgG).data('original-title', false);
                $(this.svgG).data('toggle', false);
                $(this.svgG).removeAttr('data-original-title');
                $(this.svgG).removeAttr('data-toggle');

                $(this.svgG).addClass('place empty_label');
                if (isPlaceNew) {
                    $(this.svgG).removeClass('place').addClass('place_new');
                }
                this.title = '';
                this.pgroups = '';
                this.isDouble = false;
                this.isMarkable = false;
                this.isMarked = false;

                // console.log($(this.svgG));
                if (this.svgBrick) this.svgBrick.remove();
                if (this.svgLetter) this.svgLetter.remove();
                this.init(this.svgG);
            },
            onPgroupsClick: function(p) {
                var isNew = !$(p).hasClass('active');

                // Remove old select
                $('#' + place.pgroups + ' p').removeClass('active');
                $(p).parent().find('p').removeClass('active');

                this.deselectPlace();

                if (isNew) {
                    // Set new select if it's different
                    this.data.groupId = $(p).data('group');
                    this.data.price = $(p).data('price');
                    this.data.currency = $(p).data('currency');

                    this.selectPlace();

                    $('#' + place.pgroups + ' p').eq($(p).index()).addClass('active');
                    $(p).addClass('active');
                }
            }
        };

        place.init(g);

        return place;
    };
    var Ticket = function(place) {
        var ticket = {
            place: place,

            $ticket: null,
            $delButton: null,

            init: function(place) {
                this.$ticket = $('<div id="ticket_' + this.place.data.id + '" class="ticket_point"><p>' + this.place.data.block + '</p>' + lang.row + ': ' + this.place.data.row + ', ' + lang.place + ': ' + this.place.data.place + ', ' + lang.price + ': ' + (this.place.data.price + '').replace(/\./, ',') + ' ' + this.place.data.currency + '</div>');

                this.$delButton = $('<div class="delplace_btn" title="' + lang.del + '">&times;</div>');
                this.$ticket.append(this.$delButton);

                this.initEvents();
            },
            initEvents: function() {
                this.$delButton.on('click', this.removeTicket.bind(this));
            },
            removeTicket: function() {
                this.place.deselectPlace();
                this.$ticket[0].remove();
            }
        };

        ticket.init(place);

        return ticket;
    };

    var schemePanEventsHandler = {
        haltEventListeners: ["touchstart", "touchend", "touchmove", "touchleave", "touchcancel"],
        init: function (t) {
            var e = t.instance, n = 1, a = 0, o = 0;
            this.hammer = new Hammer(t.svgElement, {inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput}); this.hammer.get('pinch').set({enable: !0});
            this.hammer.on('doubletap', function () { e.zoomIn(); });
            this.hammer.on('panstart panmove', function (t) {
                if ('panstart' === t.type) {
                    a = 0;
                    o = 0;
                }
                e.panBy({
                    x: t.deltaX - a,
                    y: t.deltaY - o
                });
                a = t.deltaX;
                o = t.deltaY;
            });
            this.hammer.on('pinchstart pinchmove', function (t) {
                if ('pinchstart' === t.type) {
                    n = e.getZoom();
                    e.zoom(n * t.scale);
                }
                e.zoom(n * t.scale);
            });
            t.svgElement.addEventListener('touchmove', function (t) {
                t.preventDefault();
            });
        },
        destroy: function () {
            this.hammer.destroy();
        }
    };
    var Scheme = {
        $holder: $(options.schemeHolder.selector),
        $holderWrapper: null,
        $base: $(options.schemeHolder.selector + ' .scheme-base'),
        $svg: $(options.schemeHolder.selector + ' svg'),
        $image: $(options.schemeHolder.selector + ' svg image'),
        $viewport: null,
        $minimap: $(options.minimap.selector),
        $minimapWrapper: null,
        $helper: helper,

        $scaleControl: null,
        $scaleStatus: null,
        $scaleMinus: null,
        $scalePlus: null,

        helperManager: null,
        baseSize: {},
        origSize: {},
        schemePosRange: {x: {}, y: {}},
        schemeDistance: {},
        schemeLastPos: {},
        outsize: {},
        minimapSize: {},
        helperSize: {},
        helperLastSize: {},
        helperPosRange: {},
        helperPos: {},
        helperLastPos: {},
        ratio: 0,
        proportion: 0,
        zoom: 0,
        realZoom: 0,
        vision: {},
        minimapIsShown: false,
        helperIsDragging: false,

        panzoom: null,
        places: [],

        init: function() {
            var scheme = this;

            this.$minimap.append(makeSVG('svg', {}));

            this.$holderWrapper = this.$holder.wrap('<div class="scheme-wrapper"></div>').closest('.scheme-wrapper');
            this.$minimapWrapper = this.$minimap.wrap('<div class="minimap-wrapper"></div>').closest('.minimap-wrapper');

            this.panzoom = svgPanZoom(options.schemeHolder.selector + ' svg', {
                dblClickZoomEnabled: false,
                zoomScaleSensitivity: 0.25,
                minZoom: 1.0,
                fit: true,
                center: true,
                beforePan: this.beforePan,
                onZoom: this.onZoom.bind(scheme),
                onPan: this.onSchemePan.bind(scheme),
                customEventsHandler: schemePanEventsHandler
            });

            this.$viewport = $(this.viewportSelector);

            this.$minimap.find('svg').prepend(makeSVG('g', {class: 'minimap-viewport'}));
            this.$minimapViewport = this.$minimap.find('svg .minimap-viewport');
            this.$minimapViewport.append(this.$image[0].cloneNode(true));
            this.$minimapViewport.append('<g class="minimap-content"></g>');

            this.zoom = this.panzoom.getZoom();
            this.realZoom = this.panzoom.getSizes().realZoom;

            if (options.controls.scale.enable) {
                this.addScaleControl();
            }

            this.panzoom.zoomBy(2);

            this.setState();
            var initPos = {
                x: this.schemeLastPos.x,
                y: this.schemePosRange.y.min
            };
            this.panzoom.pan(initPos);

            this.parsePlaces(jsnstr);

            this.initEvents();

            $(this.$holder).removeClass('loading');
        },
        initEvents: function () {
            var scheme = this;

            $(window).on('resize', function (e) {
                scheme.panzoom.resize();
                scheme.setState();
                scheme.placeScaleControl();
            });
            $(this.imageSelector).on('contextmenu', function(e){
                return e.preventDefault(), e.stopPropagation(), false;
            });

            this.helperManager = new Hammer(this.$helper[0]);
            this.helperManager.get('pan').set({
                direction: Hammer.DIRECTION_ALL,
                threshold: 0
            });
            this.helperManager.on('pan', this.onHelperPan.bind(this));

            this.$scaleMinus.on('click', this.onScaleMinus.bind(this));
            this.$scalePlus.on('click', this.onScalePlus.bind(this));

            $(document).on('delPlace', this.onDelPlace.bind(this));
            $(document).on('placeToCart', this.onPlaceToCart.bind(this));
        },

        setState: function() {
            this.baseSize = {
                width: this.$base.width(),
                height: this.$base.height()
            };

            this.origSize = {
                width: parseInt(this.$image.attr('width'), 10),
                height: parseInt(this.$image.attr('height'), 10)
            };

            this.ratio = this.origSize.width / this.origSize.height;
            this.proportion = this.origSize.width / this.$minimap.width();

            this.vision = {
                x: Math.round(this.baseSize.width / (this.origSize.width * this.realZoom) * 100) / 100,
                y: Math.round(this.baseSize.height / (this.origSize.height * this.realZoom) * 100) / 100
            };

            this.setSchemePosRange();
            this.setSchemeDistance();
            this.setOutsize();
            this.schemeLastPos = this.panzoom.getPan();

            this.minimapIsShown = this.$minimap.is(':visible');
            if (this.minimapIsShown) {
                this.setMinimapSize();
                this.setHelperSize();
            }
        },
        setSchemePosRange: function() {
            this.schemePosRange.x.min = 0;
            this.schemePosRange.x.max = this.origSize.width * this.realZoom;

            this.schemePosRange.y.min = 0;
            this.schemePosRange.y.max = this.origSize.height * this.realZoom;
        },
        setSchemeDistance: function(pos) {
            var range = {};
            range.x = this.schemePosRange.x.max - this.schemePosRange.x.min - this.baseSize.width;
            range.y = this.schemePosRange.y.max - this.schemePosRange.y.min - this.baseSize.height;

            if (!pos) pos = this.panzoom.getPan();

            if (range.x > 0) this.schemeDistance.x = -pos.x / range.x;
            else this.schemeDistance.x = 0;

            if (range.y > 0) this.schemeDistance.y = -pos.y / range.y;
            else this.schemeDistance.y = 0;
        },
        setOutsize: function(pos) {
            if (!pos) pos = this.panzoom.getPan();
            this.outsize = {x: 0, y: 0};
            if (this.vision.x < 1) {
                if (this.schemeDistance.x < 0) {
                    this.outsize.x = pos.x;
                } else if (this.schemeDistance.x > 1) {
                    this.outsize.x = Math.abs(pos.x) - Math.abs(this.schemePosRange.x.max - this.baseSize.width);
                }
            }
            if (this.vision.y < 1) {
                if (this.schemeDistance.y < 0) {
                    this.outsize.y = pos.y;
                } else if (this.schemeDistance.y > 1) {
                    this.outsize.y = Math.abs(pos.y) - Math.abs(this.schemePosRange.y.max - this.baseSize.height);
                }
            }
        },
        setMinimapSize: function() {
            this.$minimap.css({
                width: 'auto',
                height: Math.round(this.origSize.height / this.proportion) + 'px'
            });
            this.$minimap.find('svg').css({
                display: 'block',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                'touch-action': 'none',
                'user-select': 'none',
                '-webkit-user-drag': 'none',
                '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
            });
            this.$minimapViewport.css({
                transform: 'matrix(' + 1/this.proportion + ', 0, 0, ' + 1/this.proportion + ', 0, 0)'
            });
            this.minimapSize = {
                width: this.$minimap.width(),
                height: this.$minimap.height()
            };
        },
        setHelperSize: function() {
            this.helperSize = {
                width: Math.round(this.minimapSize.width * (this.vision.x < 1 ? this.vision.x : 1)) - this.outsize.x / this.proportion / this.realZoom,
                height: Math.round(this.minimapSize.height * (this.vision.y < 1 ? this.vision.y : 1)) - this.outsize.y / this.proportion / this.realZoom
            };

            if (this.helperSize.width > this.minimapSize.width) this.helperSize.width = this.minimapSize.width;
            if (this.helperSize.height > this.minimapSize.height) this.helperSize.height = this.minimapSize.height;

            this.$helper.css({
                width: this.helperSize.width + 'px',
                height: this.helperSize.height + 'px'
            });

            this.setHelperPosRange();
        },
        setHelperPosRange: function() {
            this.helperPosRange = {
                x: {
                    min: 0,
                    max: this.minimapSize.width - this.helperSize.width
                },
                y: {
                    min: 0,
                    max: this.minimapSize.height - this.helperSize.height
                }
            };
        },
        setHelperPos: function(pos) {
            pos.x = Math.round(pos.x * 100) / 100;
            pos.y = Math.round(pos.y * 100) / 100;

            if (pos.x < this.helperPosRange.x.min) pos.x = this.helperPosRange.x.min;
            if (pos.y < this.helperPosRange.y.min) pos.y = this.helperPosRange.y.min;
            if (pos.x > this.helperPosRange.x.max) pos.x = this.helperPosRange.x.max;
            if (pos.y > this.helperPosRange.y.max) pos.y = this.helperPosRange.y.max;

            this.$helper.css({
                top: pos.y + 'px',
                left: pos.x + 'px'
            });
            this.helperPos = pos;
        },

        addScaleControl: function() {
            var $controlLabel = $('<div class="scheme-control__label">' + lang.scale + ': </div>');
            this.$scaleControl = $('<div class="scheme-control scale-control"></div>');
            this.$scaleStatus = $('<div class="scale-control__status"></div>');
            this.$scaleMinus = $('<div class="scale-control__btn scale-control__btn--minus">-</div>');
            this.$scalePlus = $('<div class="scale-control__btn scale-control__btn--plus">+</div>');

            this.$scaleControl
                .append($controlLabel)
                .append(this.$scaleMinus)
                .append(this.$scaleStatus)
                .append(this.$scalePlus);

            this.placeScaleControl();
            this.updateScaleStatus();
        },
        placeScaleControl: function() {
            if ($(window).width() > options.minimap.disableDown) {
                // this.$minimapWrapper.append(this.$scaleControl.detach());
                this.$holder.append(this.$scaleControl.detach());
            } else {
                this.$holderWrapper.prepend(this.$scaleControl.detach());
            }
        },
        updateScaleStatus: function() {
            this.$scaleStatus.html(Math.round(this.zoom * 100) + '%');
        },
        moveHelper: function(distance) {
            var pos = {};
            pos.x = (this.helperPosRange.x.max - this.helperPosRange.x.min) * distance.x;
            pos.y = (this.helperPosRange.y.max - this.helperPosRange.y.min) * distance.y;

            this.setHelperSize();
            this.setHelperPos(pos);
        },

        parsePlaces: function(jsnstr) {
            if (jsnstr) {
                $.each(JSON.parse(jsnstr), function (k, v) {
                    var cls = $('#' + v.placeID).attr('class');
                    if (cls) {
                        var newcls = cls.replace(/empty/, v.color);
                        $('#' + v.placeID)
                            .attr('class', newcls)
                            .attr('title', v.title)
                            .data('block', v.block)
                            .data('row', v.row)
                            .data('place', v.place)
                            .data('price', v.price)
                            .data('currency', v.currency);
                        if (v.pgroups) {
                            var pgroups = $(v.pgroups);
                            $('body').append(pgroups);
                            $('#' + v.placeID).data('pgroups', pgroups.attr('id'));
                        }
                        Scheme.addPlace($('#' + v.placeID));
                    } else {
                        console.warn('Cannot find place ID: ' + v.placeID);
                    }
                });

                // if(id_koncert != 3746){
                    // $('g.empty_label').remove();
                // } else {
                    var emptyPlaces = this.$base.find("g.empty_label");
                    $.each(emptyPlaces, function(key, val){
                        $(val)
                            .data('block', 0)
                            .data('row', 0)
                            .data('place', 0)
                            .data('price', 0)
                            .data('currency', '');
                        Scheme.addPlace($(val));
                    });
                // }

            } else {
                console.error('`jsnstr` is not defined. Cannot parse places.');
            }
        },
        addPlace: function(place) {
            var newPlace = Place(place);
            this.places[newPlace.data.id] = newPlace;

            var placeCloneSVG = newPlace.svgG.cloneNode(true);
            $(placeCloneSVG).find('text').remove();
            this.$minimapViewport.append(placeCloneSVG);
        },

        beforePan: function(t, e) {
            var n = this.getSizes(),
                a = -(n.viewBox.x + n.viewBox.width) * n.realZoom + 200,
                o = n.width - 200 - n.viewBox.x * n.realZoom,
                i = -(n.viewBox.y + n.viewBox.height) * n.realZoom + 200,
                m = n.height - 200 - n.viewBox.y * n.realZoom;
            return {
                x: Math.max(a, Math.min(o, e.x)),
                y: Math.max(i, Math.min(m, e.y))
            };
        },
        onZoom: function(zoom) {
            var sizes = this.panzoom.getSizes();
            Scheme.zoom = Math.round(zoom * 100) / 100;
            Scheme.realZoom = Math.round(sizes.realZoom * 100) / 100;
            Scheme.setState();
            Scheme.updateScaleStatus();
        },
        onSchemePan: function(pos) {
            this.setSchemeDistance(pos);
            this.setOutsize(pos);
            if (Scheme.minimapIsShown) this.moveHelper(this.schemeDistance);
            dispEvent(this.$base[0], 'schemePan');
        },
        onHelperPan: function(ev) {
            if (!this.helperIsDragging) {
                this.helperIsDragging = true;
                this.schemeLastPos = this.panzoom.getPan();
                this.$helper.addClass('dragging');
            }

            var curPos = {
                x: this.schemeLastPos.x - ev.deltaX * this.proportion * this.realZoom,
                y: this.schemeLastPos.y - ev.deltaY * this.proportion * this.realZoom
            };
            this.panzoom.pan(curPos);

            if (ev.isFinal) {
                this.helperIsDragging = false;
                this.$helper.removeClass('dragging');
            }
        },
        onScaleMinus: function(ev) {
            var newZoom = Math.round(this.zoom) - 1;
            this.panzoom.zoomBy(newZoom / this.zoom);
        },
        onScalePlus: function(ev) {
            var newZoom = Math.round(this.zoom) + 1;
            this.panzoom.zoomBy(newZoom / this.zoom);
        },

        onDelPlace: function(e) {
            var detail = e.detail || e.originalEvent.detail;
            this.places[detail.id].deselectPlace();
        },
        onPlaceToCart: function(e){
            var detail = e.detail || e.originalEvent.detail;
            this.places[detail.placeId].deselectPlace();
            this.places[detail.placeId].makeEmpty();
        }
    };

    var Ticketbox = {
        $scheme: null,
        $ticketbox: $(options.ticketbox.selector),
        tickets: [],

        init: function(scheme) {
            this.$scheme = scheme.$base;
            this.initEvents();
        },
        initEvents: function() {
            this.$scheme.on('placeSelect', this.onPlaceSelect.bind(this));
            this.$scheme.on('placeDeselect', this.onPlaceDeselect.bind(this));
            this.$ticketbox.on('ticketRemove', this.onTicketRemove.bind(this));
        },
        onPlaceSelect: function(e) {
            var detail = e.detail || e.originalEvent.detail;
            var place = detail.place;
            this.tickets[place.data.id] = Ticket(place);
            this.$ticketbox.append(this.tickets[place.data.id].$ticket);

            dispEvent(this.$ticketbox[0], 'ticketboxTicketAdd', {ticket: this.tickets[place.data.id]});
        },
        onPlaceDeselect: function(e) {
            var detail = e.detail || e.originalEvent.detail;
            var place = detail.place;
            this.tickets[place.data.id].removeTicket();
        },
        onTicketRemove: function(e) {
            var detail = e.detail || e.originalEvent.detail;
            var ticket = detail.ticket;
            this.tickets.splice(ticket.pace.data.id, 1);

            this.updateInfo();

            dispEvent(this.$ticketbox[0], 'ticketboxTicketDelete', {ticket: ticket});
        }
    };

    Scheme.init();

    // Ticketbox.init(Scheme);

    function dispEvent(target, name, detail) {
        name = name || 'customEvent';
        detail = detail || {};
        var eventInstance;
        try {
            eventInstance = new CustomEvent(name, {
                bubbles: true,
                detail: detail
            });
        } catch (n) {
            (eventInstance = document.createEvent('CustomEvent')).initCustomEvent(name, true, true, detail);
        }
        target.dispatchEvent(eventInstance);
        return eventInstance;
    }
    function makeSVG(tag, attrs, text) {
        var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs) {
            el.setAttribute(k, attrs[k]);
        }
        return el;
    }


})(jQuery);
