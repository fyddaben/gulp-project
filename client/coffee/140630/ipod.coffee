
#工具类
Util=
	#element:动画展现的元素
	#type:AnimationStart|AnimationIteration|AnimationEnd
	PrefixedEvent:(element, type, callback)->
		
		pfx = ["webkit", "moz", "MS", "o", ""]	
		for index,obj of pfx
			if !obj
				type= type.toLowerCase()
			
			element[0].addEventListener(obj+type,callback,false)
#主流
MainPro=
	#配置
	config:()->
		console.log "config"
	#初始化方法
	init:()->
		@config()
		@streamline()
	streamline:()->
		#首先检查浏览器的支持
		
		if AC.Detector.isCSSAvailable "animation"
			Page.showMobile()
		else
			$(".J_piclist").addClass "pb-opend"
		#绑定点击事件
		$(".J_btn").click ()->
			str= $(this).html()
			if str is "out"
				Page.exitMobile()
			else if str is "enter"
				Page.enterMobile()
#页面的操作
Page=
	#添加css，显示机器
	showMobile:()->
		_t= this
		anim= $(".J_piclist")
		anim.addClass "pb-open"
		_t.OPENINDEX= 0
		_t.PBLGENGTH= anim.find("li").length
		anim.find("li").each ()->
			Util.PrefixedEvent $(this),"AnimationEnd",$.proxy(_t.animationEndEvent,_t)
		return
	#监听开场动画结束事件
	animationEndEvent:(e)->
		_t= this		
		if e.animationName.indexOf("open-") isnt -1
			_t.OPENINDEX++
			 
			if _t.OPENINDEX is _t.PBLGENGTH
				$(".J_piclist").removeClass("pb-open").addClass("pb-opend")
		if e.animationName is 'exit-left'
			e.target.className= 'status_hide'
			e.target.className= e.target.className.replace 'status_exit',''
			_t.EXITINDEX++

			if _t.EXITINDEX is _t.EXITLENGTH
				$(".J_btn").html "enter"
		
		if e.animationName is 'enter-left'
			
			e.target.className= e.target.className.replace('status_hide','')
			e.target.className= e.target.className.replace 'status_enter',''
			_t.ENTERINDEX++
			if _t.ENTERINDEX is _t.ENTERLENGTH
				$(".J_btn").html "out"
	#添加css，让所有的手机飞出 
	exitMobile:()->
		_t= this;
		anim= $(".J_piclist").find("li")
		anim.addClass 'status_exit'
		_t.EXITINDEX= 0
		_t.EXITLENGTH= anim.length
	enterMobile:()->
		_t= this
		anim= $(".J_piclist").find("li")
		anim.addClass 'status_enter'
		_t.ENTERINDEX= 0
		_t.ENTERLENGTH= anim.length
$ ()->
	MainPro.init()








