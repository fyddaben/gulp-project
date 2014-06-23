main=
  config:()->
    #服务器地址
    # @SERVERURL="http://10.237.36.185:8666/in/"
    @SERVERURL=global.serverurl
    #@SERVERURL="http://hd.global.mi.com/in/"
    #目标数量
    @TARGET=  100000
    #进度条长度
    @LOADWIDTH= 1024
    #循环次数
    @LOOPINDEX= 1
    #用于存储头像数组
    @HEADARR=[]
    #加油数量
    @HURRYNUM= 0
    #是否是新注册
    @ISNEW= false
    @INDEXFLAG= 0
    #是否返回用户名和ID
    @ISLOADOVER=false
    #是否CLICK登录
    @ISCLICKLOGIN= false
    #是否登录
    @ISLOGIN= false
  init:()->

    @config()
    @runAll()
  runAll:()->
    @initfb()

    @otherEvent()
  #jsonp方法
  jsonp:(url,param,callback)->
    $.ajax({
      url:url,
      dataType:"jsonp",
      data:param,
      jsonp:"jsonpcallback",
      success:callback
    })
  #fb登陆
  login:()->
    _t= @
    # FB.login((response)->
    #   $("#J_india_loading").modal("hide");
    #   if response.status is 'connected'
    #     _t.getHeadImgbyFb  response.authResponse.accessToken;
    #   else
    #     #alert("login error");

    # )
    redirectUrl= global.locationUrl+"?check=true"
    url= "https://www.facebook.com/dialog/oauth?client_id="+global.appId+"&redirect_uri="+redirectUrl

    location.href= url

  #通过数据修改浮层元素
  updateModal:(modal)->
    _t= @
    url= @SERVERURL+"cheer/addcheer"
    param=
      user_id:modal.userid
      user_pic:modal.img
      access_token:modal.token
    callback=(data)->

        if data.code is "300" or data.code is "200"
          str= data.index

          $(".J_fb_info").html str
          $(".J_fb_username").html modal.username
          $(".J_fb_userHead").attr("src",modal.img)
          #如果点击过
          if _t.ISCLICKLOGIN
            $("#J_india_loading").modal("hide");
            $("#J_india_modal").modal({show: true,backdrop:"static"});
          _t.ISLOADOVER= true
          if data.code is "200"
            _t.ISNEW= true
          else
            _t.ISNEW= false
        else
          $("#J_india_loading").modal("hide");
          _t.ISNEW= false

          alert data.info
    @jsonp(url,param,callback)

  #获取用户名，头像和userid
  getHeadImgbyFb:(accessToken)->
    _t= @
    url_a= "https://graph.facebook.com/v2.0/me/picture?redirect=false&width=200&height=200&method=GET&format=json&suppress_http_code=1&access_token="+accessToken
    url_b= "https://graph.facebook.com/v2.0/me?method=GET&format=json&suppress_http_code=1&access_token="+accessToken
    userid= ""
    username= ""

    callback= ()->
      $.get(url_a,(data)->

        modalData=
          username:username
          img:data.data.url
          userid:userid
          token:accessToken
        _t.updateModal modalData

      )
    $.get(url_b,(data)->
      userid= data.id
      username= data.name
      callback()
    )
  #检查fb登陆
  checkLogin:()->
    _t= @
    response= _t.RESPONSE
    if _t.ISLOGIN
      _t.getHeadImgbyFb  response.authResponse.accessToken
    else
      _t.login(response)
  #fb 分享
  shareFb:()->
    FB.ui({
            method: 'feed',
            name: shareInfo.name,
            caption: shareInfo.caption,
            description: shareInfo.description,
            link: shareInfo.link,
            picture:shareInfo.picture
          });
  clickEvent:()->
    _t= @
    $("body").on("click",".J_fb_login",()->
      $("#J_india_loading").modal({show: true,backdrop: "static"})
      #_t.checkLogin()
      _t.ISCLICKLOGIN= true
      #判断是否加载完附框
      if _t.ISLOADOVER
        #然后判断是否登录
        if _t.ISLOGIN
          $('#J_india_modal').on('shown.bs.modal',()->
            $("#J_india_loading").modal("hide")
            )
          $("#J_india_modal").modal({show: true,backdrop: "static"}).trigger('shown')

        else
          _t.login()
      )

    $(".J_fb_share").click(()->
      _t.shareFb()
      )
    $(".J_india_modal_close").click(()->
      num= $(".J_load_num").attr "data-num"
      $("#J_india_modal").modal("hide")
      if num> _t.HURRYNUM
        _t.changeLoading num
      #修改第一个头像
      if _t.ISNEW
        url= $(".J_fb_userHead").attr("src");
        _t.updateImg 0,url

     )
    scrollIndex= 0
    scrollCallback=()->
      scrollIndex++
      if scrollIndex is 1
        attr= $(".J_join").attr("href").substring(1)
        _t.pageScrollToSpot $("."+attr)
        $(".J_join").fadeOut(200)


        #获得第一页的头像图片
        _t.getHeadImgbyDb(1)
    $(".J_join").click(()->
      scrollCallback()
    )
    document.onmousewheel= scrollCallback
    document.addEventListener('DOMMouseScroll',scrollCallback,false)

  #根据加油数量，改变进度条
  changeLoading:(num)->

    num= parseInt num

    _t= @

    _t.judegeNum num

    width= Math.round(num*@LOADWIDTH/100000)

    $(".J_load_bar").css "width",width

    strnum= (num+"").replace( /\B(?=(?:\d{3})+$)/g, ',' )
    $(".J_load_num").html strnum
    $(".J_load_num").attr "data-num",num
    $(".J_load_num").addClass "xm-animate-swing"
    callback= ()->
      $(".J_load_num").removeClass "xm-animate-swing"
    setTimeout(callback,1000)
  #请求获得加油数量
  getHurryAmount:()->
    _t= @
    url= @SERVERURL+"cheer/getcheeramount"
    param= {}

    callback= (data)->
      if data.code is "200"
        if data.amount> _t.HURRYNUM
          _t.HURRYNUM= data.amount
          _t.changeLoading data.amount
      else
        alert data.info

    callback_a= ()->
      _t.jsonp url,param,callback

    setInterval callback_a,2000

    callback_a()

  #请求获得用户头像
  getHeadImgbyDb:(cur_page)->
    url= @SERVERURL+"cheer/getcheeruserinfo"
    param=
      cur_page:cur_page
    _t= @
    callback= (data)->
      if data.code is "200"
        if cur_page is 1
          _t.calHeadImg data.user_list
        else
          _t.changeHeadImg data.user_list

        if data.user_list.length is 0

          clearInterval _t.loopRequestVal

      else
        alert data.info
    @jsonp url,param,callback

  tmpl:(name,obj)->
    tmpl= document.getElementById name
    tmplHtml= tmpl.innerHTML
    doTtmpl= doT.template tmplHtml

    return doTtmpl(obj)
  #处理所有头像
  calHeadImg:(list)->
    _t= @
    _t.ranArray= []
    for index,obj of list
      _t.ranArray.push index
    str= _t.tmpl "img-tmpl-b",list
    $(".J_img_list").html str
    _t.loopRequest()
  #循环切换头像图片
  changeHeadImg:(list)->
    _t= @
    callback_b= (index,obj)->

      _t.updateImg index,obj.user_pic,obj.user_id
    callback_a= (index,obj)->

      img = new Image()
      img.src = obj.user_pic
      if img.complete
        callback_b(index,obj)
        return
      img.onload =()->
        callback_b(index,obj)

    @ranArray.sort(()->
     return 0.5 - Math.random()
    )

    for index,obj of @ranArray
      if index< list.length&& parseInt(obj) isnt 0
        callback_a obj,list[index]

  #渲染头像模板
  imgtmpl:()->
    _t= @
    list= {}
    str= _t.tmpl "img-tmpl",list

    $(".J_img_list").html str

  #循环访问
  loopRequest:()->
    callback= ()->
      @LOOPINDEX++

      @getHeadImgbyDb @LOOPINDEX

    @loopRequestVal= setInterval($.proxy(callback,@),5000)
  #修改图片，
  updateImg:(index,url,userid)->

    obj= $(".J_img_list").find("li").eq(index)
    obj.find("img").attr("class","front")

    if userid&&(parseInt(userid)>500)

      obj.append("<a href='https://www.facebook.com/app_scoped_user_id/"+userid+"' target='_blank'><img class='end' src='"+url+"'></a>");
    else
      obj.append("<img class='end' src='"+url+"'>");
    callback_b=()->
      obj.find(".front").remove();
      obj.find(".end").removeClass("end");
      obj.removeClass("changeImg");

    callback_a= ()->
      obj.addClass("changeImg");
      setTimeout callback_b,1000
    setTimeout(callback_a,50)
    

  pageScrollToSpot:(obj)->
    oT= obj.offset().top-30
    $("html,body").animate({"scrollTop":oT+'px'},500)

  otherEvent:()->
    #获得加油数量
    @getHurryAmount()
    _t= @
    #放置dom空间
    _t.imgtmpl()
    #动画效果
    @animateForward()
    @clickEvent()
    $("html,body").animate({"scrollTop":'0px'},500)
  #获取参数，假设有check=true，则检查登陆，
  checkFloat:(str)->
    _t = @
    if str.indexOf("check=true") isnt -1
      $("#J_india_loading").modal({show: true,backdrop: "static"})
      _t.checkLogin()

  #判断，如果大于10万，修改dom显示
  judegeNum:(num)->
    # num= 100000+1
    if num>100000
      $(".J_head_main").addClass "head-more"
      $(".J_less_num").hide()
      $(".J_more_num").show()
    else
      $(".J_head_main").removeClass "head-more"
      $(".J_less_num").show()
      $(".J_more_num").hide()

  initfb:()->
    _t= @
    window.fbAsyncInit = ()->
        FB.init({
            appId      : global.appId,
            cookie     : true,
            xfbml      : true,
            version    : 'v2.0'
        })
        _t.checkFloat location.search

        statusChangeCallback=(response)->
          _t.RESPONSE= response

          if response.status is 'connected'
            _t.ISLOGIN= true
            _t.getHeadImgbyFb  response.authResponse.accessToken;
          else
            _t.ISLOGIN= false
            _t.ISLOADOVER= true
        FB.getLoginStatus((response)->
          statusChangeCallback(response)
        )
  #變化动画
  animateForward:()->
    index= 0
    callback= ()->
      index++
      num= index %3
      if num is 1
        $(".J_join").removeClass("img2").removeClass("img3")
        $(".J_join").addClass "img1"
      else if num is 2
        $(".J_join").removeClass("img1").removeClass("img3")
        $(".J_join").addClass "img2"
      else if num is 0
        $(".J_join").removeClass("img1").removeClass("img2")
        $(".J_join").addClass "img3"
    setInterval(callback,300)

main.init()