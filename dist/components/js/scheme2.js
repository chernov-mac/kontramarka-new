(function($) {

    var version = '0.2.3';
    var enableScaleControls = false;
    var logging = true;
    var showZoomPoints = false;
    var pinchSpeed = 1;

    var
        mainData        = document.getElementById('MainData'),
        helper          = document.getElementById('helper'),
        zoomPlaceholder = document.getElementById('ZoomPlaceholder'),
        dataCopy        = document.getElementById('DataCopy'),
        logbox          = null;

    var
        helperSize      = {}, // {x, y}
        helperPos       = {}, // {x, y}
        helperLastPos   = {}, // {x, y}
        helperMaxPos    = {}, // {x, y}
        dataCopyPos     = {}, // {x, y}
        dataCopyLastPos = {}, // {x, y}
        dataCopyMaxPos  = {}, // {x, y}
        dataCopySizeOut = {}, // {x, y}
        vision          = {}; // {x, y}


    var ratio = dataCopy.clientWidth / dataCopy.clientHeight;
    var proportion = dataCopy.clientWidth / mainData.clientWidth;

    var
        scale = 1,
        lastScale = 1,
        zoomStep = 0.1;

    var helperIsDragging = false;
    var dataCopyIsDragging = false;

    var helperDisableDown = 991; // 991px -- xs, sm, md screens
    var helperDisable = false;

    var dot = null;
    var dotCounter = 0;


    // ----------------------
    // Инициализация переменных
    // ----------------------

    helper.style.position = 'absolute';
    helper.style.top = 0;
    helper.style.left = 0;
    dataCopy.style.position = 'relative';
    dataCopy.style.top = 0;
    dataCopy.style.left = 0;

    setMainDataSize();
    setHelperSize();
    setHelperPos();
    if (enableScaleControls) addControls();
    handleScale(scale);

    if (showZoomPoints) {
        var zoomCenterElem = document.createElement('div');
        zoomCenterElem.style.position = 'absolute';
        zoomCenterElem.style.top = '50%';
        zoomCenterElem.style.left = '50%';
        zoomCenterElem.style.transform = 'translate3d(-50%, -50%, 0) rotate(45deg)';
        zoomCenterElem.style.display = 'block';
        zoomCenterElem.style.width = '40px';
        zoomCenterElem.style.height = '40px';
        zoomCenterElem.style.lineHeight = '40px';
        zoomCenterElem.style.fontSize = '16px';
        zoomCenterElem.style.textAlign = 'center';
        zoomCenterElem.style.color = '#ffc800';
        zoomCenterElem.innerHTML = '<i class="icon-times"></i>';
        zoomCenterElem.style.textShadow = '0 3px 18px rgba(0,0,0,0.74)';
        zoomPlaceholder.appendChild(zoomCenterElem);
    }

    // ----------------------
    // Инициализация Hammer
    // ----------------------

    var helperManager = new Hammer(helper);
    helperManager.get('pan').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    });

    var dataCopyManager = new Hammer(dataCopy);
    dataCopyManager.get('pan').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    });

    var zoomPlaceholderManager = new Hammer(zoomPlaceholder);
    zoomPlaceholderManager.get('pinch').set({
        enable: true
    });


    // ----------------------
    // Инициализация событий
    // ----------------------

    window.addEventListener('resize', function(){
        if (window.innerWidth <= helperDisableDown) {
            helperDisable = false;
        }
        if (!helperDisable) {
            setHelperSize();
            setHelperPos();
        }
    });

    // #helper handlers
    helperManager.on('pan', handleHelperPan);

    // #DataCopy handlers
    dataCopyManager.on('pan', handleDataCopyPan);

    // #ZoomPlaceholder handlers
    // zoomPlaceholderManager.on('pinch', onPinch);
    zoomPlaceholderManager.on('pinchin', onPinchIn);
    zoomPlaceholderManager.on('pinchout', onPinchOut);
    zoomPlaceholder.addEventListener('mousewheel', onZoomWheel);
    if (enableScaleControls) {
        zoomPlaceholder.find('.control-scale__btn--minus').addEventListener('click', function(){
            handleScale(scale - zoomStep);
        });
        zoomPlaceholder.find('.control-scale__btn--plus').addEventListener('click', function(){
            handleScale(scale + zoomStep);
        });
    }

    if (logging) {
        var pageBlock = document.createElement('section');
        pageBlock.classList.add('page-block');
        var container = document.createElement('div');
        container.classList.add('container');
        var box = document.createElement('div');
        box.classList.add('box');
        var boxBody = document.createElement('div');
        boxBody.classList.add('box-body');

        logbox = document.createElement('div');
        logbox.id = 'logbox';
        logbox.classList.add('plain-text');

        boxBody.appendChild(logbox);
        box.appendChild(boxBody);
        container.appendChild(box);
        pageBlock.appendChild(container);
        document.querySelector('main').appendChild(pageBlock);

        log('Initialized. Ver.: ' + version);
    }


    // ----------------------
    // Функции
    // ----------------------

    function log(text) {
        console.log(text);
        if (logbox) {
            var textElem = document.createElement('p');
            textElem.innerHTML = text;
            logbox.appendChild(textElem);
        }
    }

    function getVision() {
        return {
            x: zoomPlaceholder.clientWidth / dataCopy.clientWidth,
            y: zoomPlaceholder.clientHeight / dataCopy.clientHeight
        };
    }

    function getDeltaSize(elem) {
        return {
            x: (elem.offsetWidth - elem.clientWidth),
            y: (elem.offsetHeight - elem.clientHeight)
        };
    }

    function getSizeOut(elem) {
        return {
            x: (elem.clientWidth * scale - elem.clientWidth),
            y: (elem.clientHeight * scale - elem.clientHeight)
        };
    }

    function getHelperMaxPos() {
        var deltaMainData = getDeltaSize(mainData);
        return {
            x: {
                min: 0,
                max: mainData.clientWidth - helper.clientWidth - deltaMainData.x
            },
            y: {
                min: 0,
                max: mainData.clientHeight - helper.clientHeight - deltaMainData.y
            }
        };
    }

    function getDataCopyMaxPos() {
        dataCopyPos = getDataCopyPos();
        dataCopySizeOut = getSizeOut(dataCopy);
        return {
            x: {
                min: - (dataCopy.clientWidth - zoomPlaceholder.clientWidth + dataCopySizeOut.x / 2),
                max: dataCopySizeOut.x / 2
            },
            y: {
                min: - (dataCopy.clientHeight - zoomPlaceholder.clientHeight + dataCopySizeOut.y / 2),
                max: dataCopySizeOut.y / 2
            }
        };
    }

    function getDataCopyPos() {
        var deltaZoomPlaceholder = getDeltaSize(zoomPlaceholder);
        var zoomPlaceholderRect = zoomPlaceholder.getBoundingClientRect();
        var zoomPlaceholderOffset = {
            top: zoomPlaceholderRect.top + document.body.scrollTop,
            left: zoomPlaceholderRect.left + document.body.scrollLeft
        };
        var dataCopyRect = dataCopy.getBoundingClientRect();
        var dataCopyOffset = {
            top: dataCopyRect.top + document.body.scrollTop,
            left: dataCopyRect.left + document.body.scrollLeft
        };
        return {
            x: dataCopyOffset.left - zoomPlaceholderOffset.left - deltaZoomPlaceholder.x / 2,
            y: dataCopyOffset.top - zoomPlaceholderOffset.top - deltaZoomPlaceholder.y / 2
        };
    }

    function getHelperPos() {
        return {
            x: helper.offsetLeft,
            y: helper.offsetTop
        };
    }

    function getHelperSize() {
        vision = getVision();
        return {
            width: mainData.clientWidth * (vision.x < 1 ? vision.x : 1),
            height: mainData.clientHeight * (vision.y < 1 ? vision.y : 1)
        };
    }

    function calcDelta(diff, coeff) {
        if (!coeff) coeff = 0.1;
        var delta = Math.sqrt(Math.abs(Math.round(diff * 100) / 100)) * coeff * zoomStep;
        return delta;
    }

    function setMainDataSize() {
        var deltaSizeMainData = getDeltaSize(mainData);
        mainData.style.height = Math.round(mainData.clientWidth / ratio) + deltaSizeMainData.y + 'px';
    }

    function setHelperSize() {
        helperSize = getHelperSize();

        helperSize.width *= 1 / scale;
        if (helperSize.width > mainData.clientWidth) helperSize.width = mainData.clientWidth;
        helper.style.width = helperSize.width + 'px';

        helperSize.height *= 1 / scale;
        if (helperSize.height > mainData.clientHeight) helperSize.height = mainData.clientHeight;
        helper.style.height = helperSize.height + 'px';
    }

    function setHelperPos(actualPos) {
        if (!actualPos) {
            vision = getVision();
            dataCopyPos = getDataCopyPos();

            actualPos = {
                x: - Math.round(dataCopyPos.x / proportion / scale),
                y: - Math.round(dataCopyPos.y / proportion / scale)
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        helperMaxPos = getHelperMaxPos();
        if (actualPos.x < helperMaxPos.x.min) actualPos.x = helperMaxPos.x.min;
        if (actualPos.y < helperMaxPos.y.min) actualPos.y = helperMaxPos.y.min;
        if (actualPos.x > helperMaxPos.x.max) actualPos.x = helperMaxPos.x.max;
        if (actualPos.y > helperMaxPos.y.max) actualPos.y = helperMaxPos.y.max;

        // Двигаем элемент до нужной позиции
        helper.style.top = actualPos.y + 'px';
        helper.style.left = actualPos.x + 'px';
    }

    function setDataCopyPos(actualPos) {
        if (!actualPos) {
            actualPos = {
                x: 0,
                y: 0
            };
        }

        // Проверяем, чтобы новая позиция не выходила за пределы допустимого
        dataCopyMaxPos = getDataCopyMaxPos();
        if (actualPos.x < dataCopyMaxPos.x.min) actualPos.x = dataCopyMaxPos.x.min;
        if (actualPos.y < dataCopyMaxPos.y.min) actualPos.y = dataCopyMaxPos.y.min;
        if (actualPos.x > dataCopyMaxPos.x.max) actualPos.x = dataCopyMaxPos.x.max;
        if (actualPos.y > dataCopyMaxPos.y.max) actualPos.y = dataCopyMaxPos.y.max;

        // Двигаем элемент до нужной позиции
        dataCopy.style.transform = 'translate3d(' + Math.round(actualPos.x) + 'px, ' + Math.round(actualPos.y) + 'px, 0) scale(' + scale + ')';
    }

    function setScale(actualScale) {
        if (enableScaleControls) {
            zoomPlaceholder.querySelector('.control-scale__btn--minus').classList.remove('disabled');
            zoomPlaceholder.querySelector('.control-scale__btn--plus').classList.remove('disabled');
        }

        if (actualScale <= 0.25) {
            scale = 0.25;
            if (enableScaleControls) zoomPlaceholder.querySelector('.control-scale__btn--minus').classList.add('disabled');
        } else if (actualScale >= 5) {
            scale = 5;
            if (enableScaleControls) zoomPlaceholder.querySelector('.control-scale__btn--plus').classList.add('disabled');
        } else {
            scale = actualScale;
        }
    }

    function addControls() {
        var schemeControls = document.createElement('div');
        schemeControls.className = 'scheme-controls';

        var scaleMinusBtn = document.createElement('button');
        var scaleMinusBtnText = document.createTextNode('-');
        scaleMinusBtn.appendChild(scaleMinusBtnText);
        scaleMinusBtn.className = 'control-scale__btn control-scale__btn--minus';

        var scalePlusBtn = document.createElement('button');
        var scalePlusBtnText = document.createTextNode('+');
        scalePlusBtn.appendChild(scalePlusBtnText);
        scalePlusBtn.className = 'control-scale__btn control-scale__btn--plus';

        var scaleStatus = document.createElement('div');
        scaleStatus.className = 'control-scale__status';

        var controlScale = document.createElement('div');
        controlScale.className = 'control-scale';
        controlScale.appendChild(scaleStatus);
        controlScale.appendChild(scaleMinusBtn);
        controlScale.appendChild(scalePlusBtn);

        schemeControls.appendChild(controlScale);
        zoomPlaceholder.appendChild(schemeControls);
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
            helper.classList.add('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        var curHelperPos = {
            x: ev.deltaX + helperLastPos.x,
            y: ev.deltaY + helperLastPos.y
        };

        dataCopySizeOut = getSizeOut(dataCopy);
        var curDataCopyPos = {
            x: - Math.round((ev.deltaX + helperLastPos.x) * proportion * scale) + dataCopySizeOut.x / 2,
            y: - Math.round((ev.deltaY + helperLastPos.y) * proportion * scale) + dataCopySizeOut.y / 2
        };

        setHelperPos(curHelperPos);
        setDataCopyPos(curDataCopyPos);

        // DRAG ENDED
        if (ev.isFinal) {
            helperIsDragging = false;
            helper.classList.remove('dragging');
        }
    }

    function handleDataCopyPan(ev) {
        var elem = ev.target;

        // DRAG STARTED
        if (!dataCopyIsDragging) {
            dataCopyIsDragging = true;
            dataCopyLastPos = getDataCopyPos();
            dataCopy.classList.add('dragging');
        }

        // Определяем разницу, на которую должны сдвинуть блоки
        dataCopySizeOut = getSizeOut(dataCopy);
        var curDataCopyPos = {
            x: ev.deltaX + dataCopyLastPos.x + dataCopySizeOut.x / 2,
            y: ev.deltaY + dataCopyLastPos.y + dataCopySizeOut.y / 2
        };
        setDataCopyPos(curDataCopyPos);

        if (!helperDisable) {
            var curHelperPos = {
                x: - Math.round((ev.deltaX + dataCopyLastPos.x) / proportion / scale),
                y: - Math.round((ev.deltaY + dataCopyLastPos.y) / proportion / scale)
            };
            setHelperPos(curHelperPos);
        }

        // DRAG ENDED
        if (ev.isFinal) {
            dataCopyIsDragging = false;
            dataCopy.classList.remove('dragging');
        }
    }

    function onZoomWheel(ev) {
        ev.preventDefault();
        var zoomPlaceholderRect = zoomPlaceholder.getBoundingClientRect();
        var zoomPlaceholderOffset = {
            top: zoomPlaceholderRect.top + document.body.scrollTop,
            left: zoomPlaceholderRect.left + document.body.scrollLeft
        };
        var zoomPoint = {
            x: ev.clientX - zoomPlaceholderOffset.left,
            y: ev.clientY - zoomPlaceholderOffset.top
        };
        var delta = calcDelta(ev.deltaY);
        var newScale = ev.deltaY > 0 ? scale + delta : scale - delta;
        handleScale(newScale, zoomPoint);

        log('zoomwheel');
    }

    function onPinchIn(ev) {
        var coeff = 0.1;
        var diff = Math.round(ev.scale * 100) / 100 * coeff;
        var newScale = scale * Math.pow(diff, pinchSpeed);

        handleScale(newScale, ev.center);

        if (ev.type == 'pinchend') {
            lastScale = scale;
        }
        log('pinch out');
    }

    function onPinchOut(ev) {
        var coeff = 0.01;
        var diff = scale * Math.abs(Math.round(ev.scale * 100) / 100) * coeff;
        var newScale = scale + diff * pinchSpeed;

        handleScale(newScale, ev.center);

        if (ev.type == 'pinchend') {
            lastScale = scale;
        }
        log('pinch out');
    }

    function handleScale(actualScale, zoomCenterPoint) {
        if (!zoomCenterPoint) {
            var deltaZoomPlaceholder = getDeltaSize(zoomPlaceholder);
            zoomCenterPoint = {
                x: zoomPlaceholder.offsetWidth / 2 - deltaZoomPlaceholder.x / 2,
                y: zoomPlaceholder.offsetHeight / 2 - deltaZoomPlaceholder.y / 2
            };
        }

        dataCopyPos = getDataCopyPos();
        var schemeZoomCenterPoint = {
            x: (zoomCenterPoint.x - dataCopyPos.x) / scale,
            y: (zoomCenterPoint.y - dataCopyPos.y) / scale
        };

        if (showZoomPoints) {
            var scalePrev = document.createElement('div');
            scalePrev.style.position = 'absolute';
            scalePrev.style.top = schemeZoomCenterPoint.y + 'px';
            scalePrev.style.left = schemeZoomCenterPoint.x + 'px';
            scalePrev.style.transform = 'translate3d(-50%, -50%, 0)';
            scalePrev.style.display = 'block';
            scalePrev.style.width = '40px';
            scalePrev.style.height = '40px';
            scalePrev.style.lineHeight = '40px';
            scalePrev.style.fontSize = '24px';
            scalePrev.style.textAlign = 'center';
            scalePrev.style.color = '#bd25b2';
            scalePrev.innerHTML = '<i class="icon-times"></i>';
            scalePrev.style.textShadow = '0 3px 2px rgba(0,0,0,0.74)';
            dataCopy.appendChild(scalePrev);
        }

        setScale(actualScale);

        var sizeOut = getSizeOut(dataCopy);

        var correctPos = {
            x: zoomCenterPoint.x - schemeZoomCenterPoint.x * scale + sizeOut.x / 2,
            y: zoomCenterPoint.y - schemeZoomCenterPoint.y * scale + sizeOut.y / 2
        };

        setDataCopyPos(correctPos);

        if (!helperDisable) {
            setHelperSize();
            setHelperPos();
        }

        if (enableScaleControls) zoomPlaceholder.querySelector('.control-scale__status').innerHTML = Math.round(scale * 100) + '%';
    }

})(jQuery);
