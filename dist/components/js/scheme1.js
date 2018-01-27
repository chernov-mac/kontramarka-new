(function() {

    // Элементы
    var $mainData = $('#MainData');
    var helper = document.getElementById('helper'),
        $helper = $(helper);
    var zoomPlaceholder = document.getElementById('ZoomPlaceholder'),
        $zoomPlaceholder = $(zoomPlaceholder);
    var dataCopy = document.getElementById('DataCopy'),
        $dataCopy = $(dataCopy);

    // Соотношение сторон схемы
    var ratio = $dataCopy.width() / $dataCopy.height();

    // Пропорция между #ZoomPlaceholder и #MainData
    var proportion = $dataCopy.width() / $mainData.width();

    // Масштаб
    var scale = 1;

    // Позиция #DataCopy относительно $zoomPlaceholder в виде {top: int, left: int}
    var dataCopyPos = getDataCopyPos();

    // Позиция #helper относительно $MainData в виде {top: int, left: int}
    var helperSize = getHelperSize();
        helperPos = getHelperPos();

    // Запоминаем позиции и масштаб
    var helperLastPos = {
        x: helperPos.x,
        y: helperPos.y
    };
    var dataCopyLastPos = {
        x: dataCopyPos.x,
        y: dataCopyPos.y
    };
    var helperIsDragging = false;
    var dataCopyIsDragging = false;
    dataCopySizeOut = 0;
    var helperTranslate = 'translate3d(' + Math.round(helperLastPos.x) + 'px, ' + Math.round(helperLastPos.y) + 'px, 0)';
    var dataCopyTranslate = 'translate3d(' + Math.round(dataCopyLastPos.x) + 'px, ' + Math.round(dataCopyLastPos.y) + 'px, 0)';


    // ----------------------
    // Инициализация
    // ----------------------

    $helper.css({ position: 'absolute', top: 0, left: 0 });
    $dataCopy.css({ position: 'relative', top: 0, left: 0 });
    setMainDataSize();
    setHelperSize();
    setHelperPos();
    addControls();
    var $zoomPlaceholderCenter = $('<div id="zoomPlaceholderCenter" style="position: absolute; z-index: 2; top: 50%; left: 50%; display: block; width: 10px; height: 10px; transform: translate3d(-50%, -50%, 0) rotate(45deg); background: #ffc800; box-shadow: 0px 2px 20px 5px rgba(0, 0, 0, 0.4);"></div>');
    $zoomPlaceholder.prepend($zoomPlaceholderCenter);

    // Ограничения на перемещения
    var maxHelperPos = getHelperMaxPos();
    var maxDataCopyPos = getDataCopyMaxPos();

    // Коэффициент отношения видимой части схемы ко всей схеме в виде {x: float, y: float}
    var vision = getVision();


    // ----------------------
    // Инициализация событий
    // ----------------------

    $(window).on('resize', function(){
        setHelperSize();
        setHelperPos();
    });

    // #helper handlers

    var helperManager = new Hammer.Manager(helper, {
		transform_always_block: true,
		transform_min_scale: 1,
		drag_block_horizontal: true,
		drag_block_vertical: true,
		drag_min_distance: 0
	});
    helperManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));
    helperManager.on('pan', handleHelperPan);

    // #DataCopy handlers

    var dataCopyManager = new Hammer.Manager(dataCopy, {
		transform_always_block: true,
		transform_min_scale: 1,
		drag_block_horizontal: true,
		drag_block_vertical: true,
		drag_min_distance: 0
	});
    dataCopyManager.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));
    dataCopyManager.add(new Hammer.Pinch({
        enable: true,
        threshold: 0
    })).recognizeWith([dataCopyManager.get('pan')]);
    dataCopyManager.get('pinch').set({ enable: true });

    dataCopyManager.on('pan', handleDataCopyPan);
    dataCopyManager.on('pinch', function(ev){
        var pinched = Math.round(ev.scale * 100) / 100;

        $('#evScale').append('<div>Last scale: ' + lastScale + '</div>');
        $('#evScale').append('<div>Curr scale: ' + scale + '</div>');
        $('#evScale').append('<div>Pinched: ' + pinched + '</div>');

        scale = lastScale * pinched;
        changeScale();
    });
    dataCopyManager.on('pinchend', function(ev){
        lastScale = scale;
        $('#evScale').append('<div>Result: ' + scale + '</div>');
        $('#evScale').append('<div>_________________________</div>');
    });

    // #ZoomPlaceholder handlers

    $zoomPlaceholder.find('.control-scale__btn--minus').on('click', function(){
        scale -= 0.25;
        changeScale();
        lastScale = scale;
    });
    $zoomPlaceholder.find('.control-scale__btn--plus').on('click', function(){
        scale += 0.25;
        changeScale();
        lastScale = scale;
    });


    // ----------------------
    // Функции
    // ----------------------

    function getVision() {
        return {
            x: $zoomPlaceholder.width() / $dataCopy.width(),
            y: $zoomPlaceholder.height() / $dataCopy.height()
        };
    }

    function getHelperMaxPos() {
        var deltaSize = {
            x: ($mainData.outerWidth() - $mainData.width()) / 2,
            y: ($mainData.outerHeight() - $mainData.height()) / 2
        };
        return {
            x: {
                min: 0,
                max: $mainData.width() - $helper.width() - (deltaSize.x * 2)
                // min: ($helper.width() * (1 / scale) - $helper.width()) / 2,
                // max: $mainData.width() - ($helper.width() * (1 / scale)) + (($helper.width() * (1 / scale) - $helper.width()) / 2) - (deltaSize.x * 2)
            },
            y: {
                min: 0,
                max: $mainData.height() - $helper.height() - (deltaSize.y * 2)
                // min: ($helper.height() * (1 / scale) - $helper.height()) / 2,
                // max: $mainData.height() - ($helper.height() * (1 / scale)) + (($helper.height() * (1 / scale) - $helper.height()) / 2) - (deltaSize.y * 2)
            }
        };
    }

    function getDataCopyMaxPos() {
        dataCopyPos = getDataCopyPos();
        // console.log('dataCopy.width: ' + $dataCopy.width());
        // console.log('zoomPlaceholder.width: ' + $zoomPlaceholder.width());
        // console.log('diff: ' + ($dataCopy.width() - $zoomPlaceholder.width()));
        // console.log('scaled diff: ' + (($dataCopy.width() - $zoomPlaceholder.width()) * scale));
        // console.log('curPos: ' + dataCopyPos.x);
        return {
            x: {
                min: - ($dataCopy.width() - $zoomPlaceholder.width() + (($dataCopy.width() * scale - $dataCopy.width()) / 2)),
                max: ($dataCopy.width() * scale - $dataCopy.width()) / 2
            },
            y: {
                min: - ($dataCopy.height() - $zoomPlaceholder.height() + (($dataCopy.height() * scale - $dataCopy.height()) / 2)),
                max: ($dataCopy.height() * scale - $dataCopy.height()) / 2
            }
        };
    }

    function getDataCopyPos() {
        var deltaSize = {
            x: ($zoomPlaceholder.outerWidth() - $zoomPlaceholder.width()) / 2,
            y: ($zoomPlaceholder.outerHeight() - $zoomPlaceholder.height()) / 2
        };
        return {
            x: $dataCopy.offset().left - $zoomPlaceholder.offset().left - deltaSize.x,
            y: $dataCopy.offset().top - $zoomPlaceholder.offset().top - deltaSize.y
        };
    }

    function getHelperPos() {
        var deltaSize = {
            x: ($mainData.outerWidth() - $mainData.width()) / 2,
            y: ($mainData.outerHeight() - $mainData.height()) / 2
        };
        return {
            x: $helper.offset().left - $mainData.offset().left - deltaSize.x,
            y: $helper.offset().top - $mainData.offset().top - deltaSize.y
        };
        // return {
        //     x: $helper.offset().left - $mainData.offset().left + (($helper.width() * (1 / scale) - $helper.width()) / 2),
        //     y: $helper.offset().top - $mainData.offset().top + (($helper.width() * (1 / scale) - $helper.width()) / 2)
        // };
    }

    function getHelperSize() {
        vision = getVision();
        return {
            width: $mainData.width() * (vision.x < 1 ? vision.x : 1),
            height: $mainData.height() * (vision.y < 1 ? vision.y : 1)
        };
    }

    function setMainDataSize() {
        var deltaSizeY = ($mainData.outerHeight() - $mainData.height());
        $mainData.css({
            height: Math.round($mainData.width() / ratio) + deltaSizeY + 'px'
        });
    }

    function setHelperSize() {
        helperSize = getHelperSize();
        helperSize.width *= 1 / scale;
        helperSize.height *= 1 / scale;
        if (helperSize.width > $mainData.width()) helperSize.width = $mainData.width();
        if (helperSize.height > $mainData.height()) helperSize.height = $mainData.height();
        $helper.css({
            width: helperSize.width + 'px',
            height: helperSize.height + 'px'
        });
    }

    function setHelperPos(actualPos) {
        if (!actualPos) {
            vision = getVision();
            dataCopyPos = getDataCopyPos();

            actualPos = {
                x: dataCopyPos.x * vision.x,
                y: dataCopyPos.y * vision.y
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        maxHelperPos = getHelperMaxPos();
        if (actualPos.x < maxHelperPos.x.min) actualPos.x = maxHelperPos.x.min;
        if (actualPos.y < maxHelperPos.y.min) actualPos.y = maxHelperPos.y.min;
        if (actualPos.x > maxHelperPos.x.max) actualPos.x = maxHelperPos.x.max;
        if (actualPos.y > maxHelperPos.y.max) actualPos.y = maxHelperPos.y.max;

        // Двигаем элемент до нужной позиции
        applyHelperTransform(actualPos);
    }

    function setDataCopyPos(actualPos) {
        if (!actualPos) {
            actualPos = {
                x: 0,
                y: 0
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        maxDataCopyPos = getDataCopyMaxPos();
        if (actualPos.x < maxDataCopyPos.x.min) actualPos.x = maxDataCopyPos.x.min;
        if (actualPos.y < maxDataCopyPos.y.min) actualPos.y = maxDataCopyPos.y.min;
        if (actualPos.x > maxDataCopyPos.x.max) actualPos.x = maxDataCopyPos.x.max;
        if (actualPos.y > maxDataCopyPos.y.max) actualPos.y = maxDataCopyPos.y.max;

        // Двигаем элемент до нужной позиции
        dataCopyTranslate = 'translate3d(' + Math.round(actualPos.x) + 'px, ' + Math.round(actualPos.y) + 'px, 0)';
        applyDataCopyTransform();
    }

    function applyHelperTransform(actualPos) {
        // helperSize = getHelperSize();
        if (!actualPos) {
            actualPos = getHelperPos();
        }
        $helper.css({
            // width: helperSize.width * (1 / scale),
            // height: helperSize.height * (1 / scale),
            top: actualPos.y + 'px',
            left: actualPos.x + 'px'
            // transform: helperTranslate
        });
    }

    function applyDataCopyTransform() {
        $dataCopy.css({
            transform: dataCopyTranslate + ' scale(' + scale + ')'
        });
    }

    function addControls() {
        var $schemeControls = $('<div class="scheme-controls"></div>');

        var $scaleMinus = $('<button class="control-scale__btn control-scale__btn--minus">-</button>');
        var $scalePlus = $('<button class="control-scale__btn control-scale__btn--plus">+</button>');
        var $scaleStatus = $('<div class="control-scale__status">100%</div>');

        var $controlScale = $('<div class="control-scale"></div>')
            .append($scaleStatus)
            .append($scaleMinus)
            .append($scalePlus);

        $schemeControls.append($controlScale);
        $zoomPlaceholder.append($schemeControls);
    }

    // ----------------------
    // Функции обработчиков
    // ----------------------

    function handleHelperPan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!helperIsDragging) {
            helperIsDragging = true;
            helperLastPos = getHelperPos();
            $helper.addClass('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        var curHelperPos = {
            x: ev.deltaX + helperLastPos.x,
            y: ev.deltaY + helperLastPos.y
        };

        dataCopySizeOut = {
            x: $dataCopy.width() * scale - $dataCopy.width(),
            y: $dataCopy.height() * scale - $dataCopy.height()
        };
        var curDataCopyPos = {
            x: - Math.round((ev.deltaX + helperLastPos.x) * proportion * scale) + dataCopySizeOut.x / 2,
            y: - Math.round((ev.deltaY + helperLastPos.y) * proportion * scale) + dataCopySizeOut.y / 2
        };

        setHelperPos(curHelperPos);
        setDataCopyPos(curDataCopyPos);

        // DRAG ENDED
        if (ev.isFinal) {
            helperIsDragging = false;
            $helper.removeClass('dragging');
        }
    }

    function handleDataCopyPan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!dataCopyIsDragging) {
            dataCopyIsDragging = true;
            dataCopyLastPos = getDataCopyPos();
            console.log(dataCopyLastPos);
            $dataCopy.addClass('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        dataCopySizeOut = {
            x: $dataCopy.width() * scale - $dataCopy.width(),
            y: $dataCopy.height() * scale - $dataCopy.height()
        };
        var curDataCopyPos = {
            x: ev.deltaX + dataCopyLastPos.x + dataCopySizeOut.x / 2,
            y: ev.deltaY + dataCopyLastPos.y + dataCopySizeOut.y / 2
        };
        var curHelperPos = {
            x: - Math.round((ev.deltaX + dataCopyLastPos.x) / proportion / scale),
            y: - Math.round((ev.deltaY + dataCopyLastPos.y) / proportion / scale)
        };

        setDataCopyPos(curDataCopyPos);
        setHelperPos(curHelperPos);

        // DRAG ENDED
        if (ev.isFinal) {
            dataCopyIsDragging = false;
            $dataCopy.removeClass('dragging');
        }
    }

    function changeScale() {
        $('#evScale').append('<div>changeScale() invoked with scale: ' + scale + '</div>');
        setDataCopyPos();
        dataCopyPos = getDataCopyPos();

        var curHelperPos = {
            x: - Math.round(dataCopyPos.x / proportion / scale),
            y: - Math.round(dataCopyPos.y / proportion / scale)
        };
        setHelperSize();
        setHelperPos(curHelperPos);

        $zoomPlaceholder.find('.control-scale__status').html(Math.round(scale * 100) + '%');
    }

})(jQuery, $);
