function nl2br(str){return str.replace(/[\n\r]/g, "<br />");}
function escapeHTML(val) {return $('<div />').text(val).html();}
String.prototype.trim = function() {return this.replace( /^[ 　\t\r\n]+|[ 　\t\r\n]+$/, "" );};

function selectMove(_this, target, optiondelete) {
    $("select[name=" + _this + "] option:selected").each(function() {
        var exists = false;
        var select = $(this).val();
        $("select[name=" + target + "] option").each(function() {
            if(select === $(this).val()) {
                exists = true;
                return false;
            }
        })
        if (!exists) $("select[name=" + target + "]").append($(this).clone());
        if (optiondelete) $(this).remove();
    });
};
function selectDelete(_this) {
    $("select[name=" + _this + "] option:selected").each(function() {
        $(this).remove();
    });
}
function getScrolBottom(element) {
    
//    return $(element).scrollTop() + $(element).height();
    return 10000;
}
function popMessage(message, sticky) {
    
    $().toastmessage('showToast', {
        text     : message,
        sticky   : sticky,
        type     : 'notice'
    });
}
+ function ($) { "use strict";

  var dismiss = '[data-dismiss="to-user"]'
  var ToUser   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  ToUser.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('to-user') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.to-user'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.to-user').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.touser

  $.fn.touser = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.to-user')

      if (!data) $this.data('bs.to-user', (data = new ToUser(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = ToUser


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.to-user.data-api', dismiss, ToUser.prototype.close)

}(jQuery);
