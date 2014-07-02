(function() {
  var MainPro, Page, Util;

  Util = {
    PrefixedEvent: function(element, type, callback) {
      var index, obj, pfx, _results;
      pfx = ["webkit", "moz", "MS", "o", ""];
      _results = [];
      for (index in pfx) {
        obj = pfx[index];
        if (!obj) {
          type = type.toLowerCase();
        }
        _results.push(element[0].addEventListener(obj + type, callback, false));
      }
      return _results;
    }
  };

  MainPro = {
    config: function() {
      return console.log("config");
    },
    init: function() {
      this.config();
      return this.streamline();
    },
    streamline: function() {
      if (AC.Detector.isCSSAvailable("animation")) {
        Page.showMobile();
      } else {
        $(".J_piclist").addClass("pb-opend");
      }
      return $(".J_btn").click(function() {
        var str;
        str = $(this).html();
        if (str === "out") {
          return Page.exitMobile();
        } else if (str === "enter") {
          return Page.enterMobile();
        }
      });
    }
  };

  Page = {
    showMobile: function() {
      var anim, _t;
      _t = this;
      anim = $(".J_piclist");
      anim.addClass("pb-open");
      _t.OPENINDEX = 0;
      _t.PBLGENGTH = anim.find("li").length;
      anim.find("li").each(function() {
        return Util.PrefixedEvent($(this), "AnimationEnd", $.proxy(_t.animationEndEvent, _t));
      });
    },
    animationEndEvent: function(e) {
      var _t;
      _t = this;
      if (e.animationName.indexOf("open-") !== -1) {
        _t.OPENINDEX++;
        if (_t.OPENINDEX === _t.PBLGENGTH) {
          $(".J_piclist").removeClass("pb-open").addClass("pb-opend");
        }
      }
      if (e.animationName === 'exit-left') {
        e.target.className = 'status_hide';
        e.target.className = e.target.className.replace('status_exit', '');
        _t.EXITINDEX++;
        if (_t.EXITINDEX === _t.EXITLENGTH) {
          $(".J_btn").html("enter");
        }
      }
      if (e.animationName === 'enter-left') {
        e.target.className = e.target.className.replace('status_hide', '');
        e.target.className = e.target.className.replace('status_enter', '');
        _t.ENTERINDEX++;
        if (_t.ENTERINDEX === _t.ENTERLENGTH) {
          return $(".J_btn").html("out");
        }
      }
    },
    exitMobile: function() {
      var anim, _t;
      _t = this;
      anim = $(".J_piclist").find("li");
      anim.addClass('status_exit');
      _t.EXITINDEX = 0;
      return _t.EXITLENGTH = anim.length;
    },
    enterMobile: function() {
      var anim, _t;
      _t = this;
      anim = $(".J_piclist").find("li");
      anim.addClass('status_enter');
      _t.ENTERINDEX = 0;
      return _t.ENTERLENGTH = anim.length;
    }
  };

  $(function() {
    return MainPro.init();
  });

}).call(this);
