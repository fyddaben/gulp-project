(function() {
  var main;

  main = {
    config: function() {
      this.SERVERURL = global.serverurl;
      this.TARGET = 100000;
      this.LOADWIDTH = 1024;
      this.LOOPINDEX = 1;
      this.HEADARR = [];
      this.HURRYNUM = 0;
      this.ISNEW = false;
      this.INDEXFLAG = 0;
      this.ISLOADOVER = false;
      this.ISCLICKLOGIN = false;
      return this.ISLOGIN = false;
    },
    init: function() {
      this.config();
      return this.runAll();
    },
    runAll: function() {
      this.initfb();
      return this.otherEvent();
    },
    jsonp: function(url, param, callback) {
      return $.ajax({
        url: url,
        dataType: "jsonp",
        data: param,
        jsonp: "jsonpcallback",
        success: callback
      });
    },
    login: function() {
      var redirectUrl, url, _t;
      _t = this;
      redirectUrl = global.locationUrl + "?check=true";
      url = "https://www.facebook.com/dialog/oauth?client_id=" + global.appId + "&redirect_uri=" + redirectUrl;
      return location.href = url;
    },
    updateModal: function(modal) {
      var callback, param, url, _t;
      _t = this;
      url = this.SERVERURL + "cheer/addcheer";
      param = {
        user_id: modal.userid,
        user_pic: modal.img,
        access_token: modal.token
      };
      callback = function(data) {
        var str;
        if (data.code === "300" || data.code === "200") {
          str = data.index;
          $(".J_fb_info").html(str);
          $(".J_fb_username").html(modal.username);
          $(".J_fb_userHead").attr("src", modal.img);
          if (_t.ISCLICKLOGIN) {
            $("#J_india_loading").modal("hide");
            $("#J_india_modal").modal({
              show: true,
              backdrop: "static"
            });
          }
          _t.ISLOADOVER = true;
          if (data.code === "200") {
            return _t.ISNEW = true;
          } else {
            return _t.ISNEW = false;
          }
        } else {
          $("#J_india_loading").modal("hide");
          _t.ISNEW = false;
          return alert(data.info);
        }
      };
      return this.jsonp(url, param, callback);
    },
    getHeadImgbyFb: function(accessToken) {
      var callback, url_a, url_b, userid, username, _t;
      _t = this;
      url_a = "https://graph.facebook.com/v2.0/me/picture?redirect=false&width=200&height=200&method=GET&format=json&suppress_http_code=1&access_token=" + accessToken;
      url_b = "https://graph.facebook.com/v2.0/me?method=GET&format=json&suppress_http_code=1&access_token=" + accessToken;
      userid = "";
      username = "";
      callback = function() {
        return $.get(url_a, function(data) {
          var modalData;
          modalData = {
            username: username,
            img: data.data.url,
            userid: userid,
            token: accessToken
          };
          return _t.updateModal(modalData);
        });
      };
      return $.get(url_b, function(data) {
        userid = data.id;
        username = data.name;
        return callback();
      });
    },
    checkLogin: function() {
      var response, _t;
      _t = this;
      response = _t.RESPONSE;
      if (_t.ISLOGIN) {
        return _t.getHeadImgbyFb(response.authResponse.accessToken);
      } else {
        return _t.login(response);
      }
    },
    shareFb: function() {
      return FB.ui({
        method: 'feed',
        name: shareInfo.name,
        caption: shareInfo.caption,
        description: shareInfo.description,
        link: shareInfo.link,
        picture: shareInfo.picture
      });
    },
    clickEvent: function() {
      var scrollCallback, scrollIndex, _t;
      _t = this;
      $("body").on("click", ".J_fb_login", function() {
        $("#J_india_loading").modal({
          show: true,
          backdrop: "static"
        });
        _t.ISCLICKLOGIN = true;
        if (_t.ISLOADOVER) {
          if (_t.ISLOGIN) {
            $('#J_india_modal').on('shown.bs.modal', function() {
              return $("#J_india_loading").modal("hide");
            });
            return $("#J_india_modal").modal({
              show: true,
              backdrop: "static"
            }).trigger('shown');
          } else {
            return _t.login();
          }
        }
      });
      $(".J_fb_share").click(function() {
        return _t.shareFb();
      });
      $(".J_india_modal_close").click(function() {
        var num, url;
        num = $(".J_load_num").attr("data-num");
        $("#J_india_modal").modal("hide");
        if (num > _t.HURRYNUM) {
          _t.changeLoading(num);
        }
        if (_t.ISNEW) {
          url = $(".J_fb_userHead").attr("src");
          return _t.updateImg(0, url);
        }
      });
      scrollIndex = 0;
      scrollCallback = function() {
        var attr;
        scrollIndex++;
        if (scrollIndex === 1) {
          attr = $(".J_join").attr("href").substring(1);
          _t.pageScrollToSpot($("." + attr));
          $(".J_join").fadeOut(200);
          return _t.getHeadImgbyDb(1);
        }
      };
      $(".J_join").click(function() {
        return scrollCallback();
      });
      document.onmousewheel = scrollCallback;
      return document.addEventListener('DOMMouseScroll', scrollCallback, false);
    },
    changeLoading: function(num) {
      var callback, strnum, width, _t;
      num = parseInt(num);
      _t = this;
      _t.judegeNum(num);
      width = Math.round(num * this.LOADWIDTH / 100000);
      $(".J_load_bar").css("width", width);
      strnum = (num + "").replace(/\B(?=(?:\d{3})+$)/g, ',');
      $(".J_load_num").html(strnum);
      $(".J_load_num").attr("data-num", num);
      $(".J_load_num").addClass("xm-animate-swing");
      callback = function() {
        return $(".J_load_num").removeClass("xm-animate-swing");
      };
      return setTimeout(callback, 1000);
    },
    getHurryAmount: function() {
      var callback, callback_a, param, url, _t;
      _t = this;
      url = this.SERVERURL + "cheer/getcheeramount";
      param = {};
      callback = function(data) {
        if (data.code === "200") {
          if (data.amount > _t.HURRYNUM) {
            _t.HURRYNUM = data.amount;
            return _t.changeLoading(data.amount);
          }
        } else {
          return alert(data.info);
        }
      };
      callback_a = function() {
        return _t.jsonp(url, param, callback);
      };
      setInterval(callback_a, 2000);
      return callback_a();
    },
    getHeadImgbyDb: function(cur_page) {
      var callback, param, url, _t;
      url = this.SERVERURL + "cheer/getcheeruserinfo";
      param = {
        cur_page: cur_page
      };
      _t = this;
      callback = function(data) {
        if (data.code === "200") {
          if (cur_page === 1) {
            _t.calHeadImg(data.user_list);
          } else {
            _t.changeHeadImg(data.user_list);
          }
          if (data.user_list.length === 0) {
            return clearInterval(_t.loopRequestVal);
          }
        } else {
          return alert(data.info);
        }
      };
      return this.jsonp(url, param, callback);
    },
    tmpl: function(name, obj) {
      var doTtmpl, tmpl, tmplHtml;
      tmpl = document.getElementById(name);
      tmplHtml = tmpl.innerHTML;
      doTtmpl = doT.template(tmplHtml);
      return doTtmpl(obj);
    },
    calHeadImg: function(list) {
      var index, obj, str, _t;
      _t = this;
      _t.ranArray = [];
      for (index in list) {
        obj = list[index];
        _t.ranArray.push(index);
      }
      str = _t.tmpl("img-tmpl-b", list);
      $(".J_img_list").html(str);
      return _t.loopRequest();
    },
    changeHeadImg: function(list) {
      var callback_a, callback_b, index, obj, _ref, _results, _t;
      _t = this;
      callback_b = function(index, obj) {
        return _t.updateImg(index, obj.user_pic, obj.user_id);
      };
      callback_a = function(index, obj) {
        var img;
        img = new Image();
        img.src = obj.user_pic;
        if (img.complete) {
          callback_b(index, obj);
          return;
        }
        return img.onload = function() {
          return callback_b(index, obj);
        };
      };
      this.ranArray.sort(function() {
        return 0.5 - Math.random();
      });
      _ref = this.ranArray;
      _results = [];
      for (index in _ref) {
        obj = _ref[index];
        if (index < list.length && parseInt(obj) !== 0) {
          _results.push(callback_a(obj, list[index]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    imgtmpl: function() {
      var list, str, _t;
      _t = this;
      list = {};
      str = _t.tmpl("img-tmpl", list);
      return $(".J_img_list").html(str);
    },
    loopRequest: function() {
      var callback;
      callback = function() {
        this.LOOPINDEX++;
        return this.getHeadImgbyDb(this.LOOPINDEX);
      };
      return this.loopRequestVal = setInterval($.proxy(callback, this), 5000);
    },
    updateImg: function(index, url, userid) {
      var callback_a, callback_b, obj;
      obj = $(".J_img_list").find("li").eq(index);
      obj.find("img").attr("class", "front");
      if (userid && (parseInt(userid) > 500)) {
        obj.append("<a href='https://www.facebook.com/app_scoped_user_id/" + userid + "' target='_blank'><img class='end' src='" + url + "'></a>");
      } else {
        obj.append("<img class='end' src='" + url + "'>");
      }
      callback_b = function() {
        obj.find(".front").remove();
        obj.find(".end").removeClass("end");
        return obj.removeClass("changeImg");
      };
      callback_a = function() {
        obj.addClass("changeImg");
        return setTimeout(callback_b, 1000);
      };
      return setTimeout(callback_a, 50);
    },
    pageScrollToSpot: function(obj) {
      var oT;
      oT = obj.offset().top - 30;
      return $("html,body").animate({
        "scrollTop": oT + 'px'
      }, 500);
    },
    otherEvent: function() {
      var _t;
      this.getHurryAmount();
      _t = this;
      _t.imgtmpl();
      this.animateForward();
      this.clickEvent();
      return $("html,body").animate({
        "scrollTop": '0px'
      }, 500);
    },
    checkFloat: function(str) {
      var _t;
      _t = this;
      if (str.indexOf("check=true") !== -1) {
        $("#J_india_loading").modal({
          show: true,
          backdrop: "static"
        });
        return _t.checkLogin();
      }
    },
    judegeNum: function(num) {
      if (num > 100000) {
        $(".J_head_main").addClass("head-more");
        $(".J_less_num").hide();
        return $(".J_more_num").show();
      } else {
        $(".J_head_main").removeClass("head-more");
        $(".J_less_num").show();
        return $(".J_more_num").hide();
      }
    },
    initfb: function() {
      var _t;
      _t = this;
      return window.fbAsyncInit = function() {
        var statusChangeCallback;
        FB.init({
          appId: global.appId,
          cookie: true,
          xfbml: true,
          version: 'v2.0'
        });
        _t.checkFloat(location.search);
        statusChangeCallback = function(response) {
          _t.RESPONSE = response;
          if (response.status === 'connected') {
            _t.ISLOGIN = true;
            return _t.getHeadImgbyFb(response.authResponse.accessToken);
          } else {
            _t.ISLOGIN = false;
            return _t.ISLOADOVER = true;
          }
        };
        return FB.getLoginStatus(function(response) {
          return statusChangeCallback(response);
        });
      };
    },
    animateForward: function() {
      var callback, index;
      index = 0;
      callback = function() {
        var num;
        index++;
        num = index % 3;
        if (num === 1) {
          $(".J_join").removeClass("img2").removeClass("img3");
          return $(".J_join").addClass("img1");
        } else if (num === 2) {
          $(".J_join").removeClass("img1").removeClass("img3");
          return $(".J_join").addClass("img2");
        } else if (num === 0) {
          $(".J_join").removeClass("img1").removeClass("img2");
          return $(".J_join").addClass("img3");
        }
      };
      return setInterval(callback, 300);
    }
  };

  main.init();

}).call(this);
