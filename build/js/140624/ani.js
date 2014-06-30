(function() {
  var Controll;

  Controll = {
    init: function() {
      this.config();
      this.runAll();
    },
    config: function() {
      this.BORDERHEI = parseInt($(".J_border").css("height")) - 30;
      this.LOGCSS = "";
      this.COUNT = 0;
    },
    runAll: function() {
      this.addOneBall();
      this.moveCircle();
      this.clickEvent();
    },
    moveCircle: function() {
      var _t;
      _t = this;
      return $(".J_border").on("mousedown", ".J_circle", function(e) {
        var mouse_y, offset_y, _thisBall;
        _thisBall = $(this);
        offset_y = $(this)[0].offsetTop;
        mouse_y = event.pageY;
        $(this).addClass("clickCircle");
        $(document).on("mousemove", function(ev) {
          var now_y, _y;
          _y = ev.pageY - mouse_y;
          now_y = offset_y + _y;
          if (now_y < 0) {
            return;
          }
          if (now_y > _t.BORDERHEI) {
            _thisBall.css({
              top: _t.BORDERHEI + "px"
            });
            _t.changeInputHei(_t.BORDERHEI, _thisBall);
            return;
          } else {
            _thisBall.css({
              top: now_y + "px"
            });
            _t.changeInputHei(now_y, _thisBall);
            _t.calPer(now_y, _thisBall);
          }
        });
        return $(document).on("mouseup", function() {
          $(this).unbind("mousemove");
          return _thisBall.removeClass("clickCircle");
        });
      });
    },
    changeInputHei: function(top, ball) {
      var classAtr, exitAtr;
      classAtr = ball.attr("data-input");
      exitAtr = ball.attr("data-exit");
      $("." + classAtr).css("top", top);
      return $("." + exitAtr).css("top", top);
    },
    calPer: function(top, ball) {
      var per;
      per = parseInt(top / this.BORDERHEI * 100);
      if (per > 100) {
        return;
      }
      return ball.html(per);
    },
    addOneBall: function() {
      var cirId, obj, str, str_input;
      this.COUNT = this.COUNT + 1;
      cirId = this.COUNT;
      obj = {
        cirId: cirId,
        color: this.getRandomCol()
      };
      str = this.tmpl("circle-tmpl", obj);
      str_input = this.tmpl("input-tmpl", obj);
      $(".J_border").find(".J_circle").removeClass("clickCircle");
      $(".J_border").append(str);
      $(".J_inputFrm").append(str_input);
    },
    tmpl: function(name, obj) {
      var doTtmpl, tmpl, tmplHtml;
      tmpl = document.getElementById(name);
      tmplHtml = tmpl.innerHTML;
      doTtmpl = doT.template(tmplHtml);
      return doTtmpl(obj);
    },
    getRandomCol: function() {
      return "#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6);
    },
    clickEvent: function() {
      var _t;
      _t = this;
      $(".J_addBtn").click(function() {
        return _t.addOneBall();
      });
      $(".J_code_sure").click(function() {
        var val;
        val = $(".J_code_content").val();
        if (val === "") {
          return alert("please input content");
        } else {
          _t.execpCss(val);
          return $("#J_input_code").modal("hide");
        }
      });
      $(".J_play").click(function() {
        var attr, duration, fun, perarr, repeatTime;
        perarr = _t.getDataByPlay();
        _t.demo_animate(perarr);
        duration = parseInt($(".J_duration").val());
        fun = $(".J_fun").val();
        repeatTime = $(".J_repeat").val();
        attr = {
          name: 'animate',
          duration: duration,
          timingFunction: fun,
          delay: 0,
          repeat: repeatTime,
          direction: 'normal',
          fillMode: 'forwards',
          complete: function() {}
        };
        return $(".J_roundBall").playKeyframe(attr);
      });
      $(".J_resume").click(function() {
        $(".J_roundBall").removeClass("boostKeyframe");
        return $(".J_roundBall").removeAttr("style");
      });
      $(".J_log").click(function() {
        var perarr, unitObj;
        perarr = _t.getDataByPlay();
        unitObj = _t.getUnitObj(perarr);
        $(".J_code_content").val(_t.LOGCSS);
        return $("#J_input_code").modal("show");
      });
      $(document).on("click", ".J_exitBtn", function() {
        var cirStr, id, inputStr;
        id = $(this).attr("data-id");
        inputStr = "J_input_" + id;
        cirStr = "J_circle_" + id;
        $("." + inputStr).remove();
        $("." + cirStr).remove();
        return $(this).remove();
      });
      return $(".J_group").click(function() {
        return $("#J_input_code").modal("show");
      });
    },
    getDataByPlay: function() {
      var perarr, _t;
      perarr = [];
      _t = this;
      $(".J_circle").each(function() {
        var arr_b, classIn, classObj, obj, per, val;
        per = $(this).html();
        classIn = $(this).attr("data-input");
        classObj = $("." + classIn);
        val = classObj.val();
        obj = {};
        obj.per = per;
        if (val === "") {
          classObj.addClass("blood");
          return false;
        } else {
          arr_b = _t.genCssArr(val);
          obj.attr = arr_b;
          classObj.removeClass("blood");
        }
        return perarr.push(obj);
      });
      return perarr;
    },
    genCssArr: function(val) {
      var arr_a, arr_b, index, obj, unitObj;
      arr_a = [];
      if (val.indexOf(";" !== -1)) {
        arr_a = val.split(";");
      } else {
        arr_a.push(val);
      }
      arr_b = [];
      for (index in arr_a) {
        obj = arr_a[index];
        if (obj === "") {
          continue;
        } else {
          if (obj.indexOf(":" !== -1)) {
            unitObj = {
              key: obj.split(":")[0],
              val: obj.split(":")[1]
            };
            arr_b.push(unitObj);
          }
        }
      }
      return arr_b;
    },
    demo_animate: function(obj) {
      var attr, unitObj, _t;
      attr = [];
      _t = this;
      unitObj = _t.getUnitObj(obj);
      attr.push(unitObj);
      return $.keyframe.define(attr);
    },
    getUnitObj: function(obj) {
      var con, con_b, css_str, index, index_b, per, perObj, unitObj, _ref, _t;
      unitObj = {
        name: 'animate'
      };
      _t = this;
      _t.LOGCSS = "";
      for (index in obj) {
        con = obj[index];
        per = con.per + "%";
        perObj = {};
        css_str = "";
        _ref = con.attr;
        for (index_b in _ref) {
          con_b = _ref[index_b];
          perObj[con_b.key] = con_b.val;
          css_str = css_str + con_b.key + ":" + con_b.val + ";";
        }
        _t.LOGCSS = _t.LOGCSS + per + " " + "{" + css_str + "}" + " ";
        unitObj[per] = perObj;
      }
      _t.LOGCSS = "{" + _t.LOGCSS + "}";
      return unitObj;
    },
    execpCss: function(val) {
      var arr_a, arr_b, data, index, num, obj, per, str, str_con, _t;
      arr_a = val.match(/\w+[%].*?[{].*?[}]/gim);
      arr_b = [];
      _t = this;
      for (index in arr_a) {
        obj = arr_a[index];
        data = {};
        per = obj.match(/\d+[%]/gim)[0];
        str = obj.match(/{(.*?)}/gim)[0];
        data.cirId = parseInt(index);
        _t.COUNT = parseInt(index);
        num = parseInt(per.match(/\d+/gim)[0]);
        data.num = num;
        data.val = str.match(/[^{}]+/gim)[0];
        data.top = num / 100 * _t.BORDERHEI;
        data.color = _t.getRandomCol();
        arr_b.push(data);
      }
      str = this.tmpl("circle-tmpl-b", arr_b);
      str_con = this.tmpl("input-tmpl-b", arr_b);
      $(".J_inputFrm").html(str_con);
      return $(".J_border").html(str);
    }
  };

  Controll.init();

}).call(this);
