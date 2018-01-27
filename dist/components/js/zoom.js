var MainData = null;
var DataCopy = null;
var ZoomPlaceholder = null;
var MainDataOffset = null;
var CursorFrame = null;
var widthCopy;;
var heightCopy;
var widthData;
var heightData;
var coefX;
var coefY;
var w_helper;
var h_helper;

if(smartphone_detect){

	// Инициализируем Hammer
	var hammertime = Hammer(document.getElementById('MainData'), {
			transform_always_block: true,
			transform_min_scale: 1,
			drag_block_horizontal: true,
			drag_block_vertical: true,
			drag_min_distance: 0
	});

	var posX=0, posY=0,
		lastPosX=0, lastPosY=0,
		bufferX=0, bufferY=0,
		scale=1, last_scale,
		rotation= 1, last_rotation, dragReady=0;

}

function manageMultitouch(ev){

		switch(ev.type) {
            case 'touch':
                last_scale = scale;
                last_rotation = rotation;

                break;

            case 'drag':
                	posX = ev.gesture.deltaX + lastPosX;
                	posY = ev.gesture.deltaY + lastPosY;
                break;

			case 'dragend':
				lastPosX = posX;
				lastPosY = posY;
				break;
        }

		// Ограничения на перемещения
		var maxPosX = $("#MainData").width()-$("#helper").width() - 4;
		var maxPosY = $("#MainData").height()-$("#helper").height() - 4;
		if(posX<0)posX = 0;
		if(posY<0)posY = 0;
		if(posX>maxPosX)posX = maxPosX;
		if(posY>maxPosY)posY = maxPosY;

        var transform = "translate3d("+Math.round(posX)+"px,"+Math.round(posY)+"px, 0) ";

        elemRect.style.transform = transform;
        elemRect.style.oTransform = transform;
        elemRect.style.msTransform = transform;
        elemRect.style.mozTransform = transform;
        elemRect.style.webkitTransform = transform;

		//$("#info").html("PosX: "+posX+" PosY: "+posY);

}

function ZoomInitT() {

	MainData = document.getElementById ('MainData');
	DataCopy = document.getElementById ('DataCopy');
	ZoomPlaceholder = document.getElementById ('ZoomPlaceholder');

	if (MainData && DataCopy) {

		widthData = MainData.offsetWidth;
		heightData = MainData.offsetHeight;

		widthCopy = DataCopy.offsetWidth;
		heightCopy = DataCopy.offsetHeight;

		coefX = widthCopy / ( widthData - 8 );
		coefY = heightCopy / ( heightData - 8 );

		var p = widthCopy / 100;
            p = $( '#ZoomPlaceholder' ).width () / p;
            p = Math.round ( widthData / 100 * p );
            w_helper = p;

            if ( w_helper >= widthData )
            {
                w_helper = widthData - 6;
            }

            p = heightCopy / 100;
            p = $( '#ZoomPlaceholder' ).height () / p;
            p = Math.round ( heightData / 100 * p );
            h_helper = p;

        if ( h_helper >= $( '#MainData' ).height () ) {
            //$( '#MainData' ).css ( 'height', parseInt ( h_helper + 4 ) + 'px' );
            h_helper = $( '#MainData' ).height();
        }

        $( '#helper' )
            .css ( { width: w_helper + 'px', height: h_helper + 'px' } )
            .show ()
            .draggable ( { containment: 'parent',
                           cursor: 'crosshair',
                           drag: function ( event, ui ) {
                            	DataCopy.style.left = Math.round ( -coefX * $( '#helper' ).css ( 'left' ).replace ( 'px', '' ) ) + 'px';
                            	DataCopy.style.top  = Math.round ( -coefY * $( '#helper' ).css ( 'top'  ).replace ( 'px', '' ) ) + 'px';
                           } } );
          	if(smartphone_detect){

			  // Вызываем Hammer для мобильных девайсов
			  hammertime.on('touch drag dragend transform', function(ev) {
				  elemRect = document.getElementById('helper');
				  manageMultitouch(ev);

			  });

			  hammertime.on('dragend', function(event) {
					  //DataCopy.style.left = Math.round ( -coefX * posX ) + 'px';
					 // DataCopy.style.top  = Math.round ( -coefY * posY ) + 'px';

					  $('#DataCopy').animate({'top':Math.round( -coefY * posY )+ 'px'}, 100 );
					  $('#DataCopy').animate({'left':Math.round( -coefX * posX )+ 'px'}, 100 );
			  })
		  }

	}

}


function simple_tooltip(target_items, name) {
    var title, id, my_tooltip;
    $("div[id*=tooltip_]").remove();
    $(target_items).mouseover(function(){
        if( $(this).hasClass("tickets_group") ) return;
        title = $(this).attr('title');
        id = $(this).attr('id');
        if(!$("div[id^=tooltip_]").length)$("body").append("<div class='"+name+"' id='tooltip_"+id+"'>"+title+"</div>");
        my_tooltip = $("#tooltip_"+ id);
        $(this).removeAttr("title");
        var offsetTop = $(this).offset().top - (my_tooltip.height() + 10);
        var offsetLeft = $(this).offset().left - (my_tooltip.width()/2 - 8);
        my_tooltip.css({left:offsetLeft, top:offsetTop}).show();
    });
    $(target_items).mouseout(function(){
        if( $(this).hasClass("tickets_group") ) return;
        $(this).attr("title", title);
        $("div[id*=tooltip_]").remove();
    })

    if(smartphone_detect){
        $("#DataCopy").on("click", function(e){
            var a = $(e.target).attr("id");
            if(a=='DataCopy')$("div[id^=tooltip_]").remove();
        });
    }

}

function showGroupsField(id, elem) {

	var offsetTop = $(elem).offset().top;
	var offsetLeft = $(elem).offset().left;
	var myTooltip = $("#tooltip_"+ $(elem).attr('id'));

	$('#'+ id).css({left:offsetLeft, top:offsetTop}).show().mouseenter(function() {
		myTooltip.show();
		$(".pgroups").find("p").click(function(){
			$(this).parent().hide("fast");
		})

	}).mouseleave(function() {
		myTooltip.hide();
		$('#'+ id).hide();
	});


}
