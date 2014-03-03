;(function($){

	var methods = {
		init : function (options) {

			var $this = $(this),
			data = $('#popupImage').data('popupImage');

			if (! data) {

				options = $.extend({
					event:'',
					top:  -1,
					left: -1,
					z: 1000,
					width: "auto",
					height: "auto",
					position:'',
					src: ""
				}, options);

				var $target = $("<img />").attr('id', 'popupImage').attr('src', options.src).attr('alt', '');
				$target.css({"position":'absolute', "z-index": options.z, "width": options.width, "height": options.height});

				$(document).bind('click', methods.destroy);

				if (options.top !=  -1 && options.left != -1) {

					$target.offset({top: options.top, left:options.left});
					$('body').append($target);

				} else if (options.position == 'center') {

					var point = $(window).width() / 2;
					var hrfeW = options.width / 2;
					var setValue = 0;
					if (hrfeW > point) {
						setValue  = hrfeW - point;
					} else {
						setValue = point - hrfeW;
					}
					$target.css({'left':setValue});

					$('#popupImageArea').append($target);

				} else if (options.position == 'left'){

					$target.css({'left':0});

					$('#popupImageArea').append($target);

				} else if (options.position == 'right') {

					var point = $(window).width() - options.width;

					$target.css({'right':point});

					$('#popupImageArea').append($target);

				} else {

					this.after($target);
				}

				$('#popupImage').data('popupImage', {target : $this});
			}
		},

		destroy : function() {
			$('#popupImage').removeData('popupImage');
			$(document).unbind('click', methods.destroy);
			$('#popupImage').remove();
		}
	};

	$.fn.popUpImage = function(options) {

		options.event.stopPropagation();
		methods.init.apply( this, arguments );
	};
})(jQuery);