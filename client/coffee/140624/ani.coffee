
Controll=
 	init:()->
 		@config()
 		@runAll()
 		return
 	config:()->
 		@BORDERHEI=parseInt($(".J_border").css("height"))-30
 		#记录css动画轨迹
 		@LOGCSS= ""
 		return
 	runAll:()->	
 		@addOneBall()
 		@moveCircle()
 		
 		@clickEvent()
 		return
 	moveCircle:()->
 		_t= @
 		
 		$(".J_border").on "mousedown",(".J_circle"),(e)->
 			_thisBall= $(this)
 			offset_y = $(this)[0].offsetTop
 			mouse_y = event.pageY
 			$(this).addClass "clickCircle"
 			$(document).on "mousemove",(ev)->
 				_y = ev.pageY - mouse_y
 				now_y = (offset_y + _y ) 
 				if now_y < 0 
 					return
 				
 				if now_y >_t.BORDERHEI
 					_thisBall.css({
 						top:_t.BORDERHEI+ "px"
 					})
 					_t.changeInputHei _t.BORDERHEI,_thisBall
 					return
 				else
 					_thisBall.css({
 						top:now_y+ "px"
 					})
 					_t.changeInputHei now_y,_thisBall
 					_t.calPer now_y,_thisBall
 					
 				return
 			$(document).on "mouseup",()->
 				$(this).unbind "mousemove"
 				_thisBall.removeClass "clickCircle"

 	#根据圆球距离顶部的高度，改变输入框的高度
 	changeInputHei:(top,ball)->
 		classAtr= ball.attr("data-input")
 		$("."+classAtr).css("top",top)
 	#根据圆球距离顶部的高度，判断百分比
 	calPer:(top,ball)->
 		
 		per= parseInt(top/@BORDERHEI*100)
 		if per>99
 			return
 		ball.html per
 	#增加一个控制球
 	addOneBall:()->
 		length= $(".J_border").find(".J_circle").length;
 		cirId= length+1
 		obj=
 			cirId:cirId
 			color:@getRandomCol()
 		str= @tmpl "circle-tmpl",obj

 		str_input= @tmpl "input-tmpl",obj
 		$(".J_border").find(".J_circle").removeClass "clickCircle"
 		$(".J_border").append str
 		$(".J_inputFrm").append str_input
 		return 
 	tmpl:(name,obj)->
	    tmpl= document.getElementById name
	    tmplHtml= tmpl.innerHTML
	    doTtmpl= doT.template tmplHtml
	    return doTtmpl(obj)
 	#JS随机取得颜色值
 	getRandomCol:()->
 		return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6)
 	#点击事件
 	clickEvent:()->
 		_t= @
 		$(".J_addBtn").click(()->
 			_t.addOneBall()
 			
 		)
 		$(".J_play").click(()->
 			
 			perarr= _t.getDataByPlay()
 			_t.demo_animate perarr
 			duration= parseInt $(".J_duration").val()
 			fun= $(".J_fun").val()
 			repeatTime= $(".J_repeat").val()
 			
 			attr=
 				name:'animate'
 				duration:duration
 				timingFunction:fun
 				delay:0
 				repeat:repeatTime
 				direction:'normal'
 				fillMode:'forwards'
 				complete:()->
 					
	 		$(".J_roundBall").playKeyframe(attr)

	 		
 		)
 		$(".J_resume").click(()->
 			$(".J_roundBall").removeClass "boostKeyframe"
 			$(".J_roundBall").removeAttr "style"
 		)
 		$(".J_log").click(()->
 			alert("请打开控制台");
 			console.log _t.LOGCSS
 		)
 	#点击play按钮，获取数据
 	getDataByPlay:()->
 		perarr= []
 		_t= this;

 		$(".J_circle").each ()->
 			per= $(this).html()
 			classIn= $(this).attr "data-input"
 			classObj= $("."+classIn)
 			val= classObj.val()
 			obj= {}
 			obj.per= per

 			if val is ""
 				classObj.addClass "blood"
 				return false
 			else
 				
 				arr_b= _t.genCssArr(val)
 				obj.attr= arr_b
 				classObj.removeClass "blood"
 			
 			perarr.push obj

 		return perarr	

 	#把css样式分解成数组对象
 	genCssArr:(val)->
 		arr_a= []
 		if val.indexOf ";"!=-1
 			arr_a= val.split(";")
 		else
 			arr_a.push val
 		
 		arr_b= []
 		for index,obj of arr_a
 			if obj is ""
 				continue
 			else
 				if obj.indexOf ":" isnt -1

	 				unitObj=
	 					key:obj.split(":")[0]
	 					val:obj.split(":")[1]
	 				arr_b.push unitObj
 		return arr_b
 	demo_animate:(obj)->
 		
 		attr= [];
 		unitObj=
 			name: 'animate',
 		_t= @
 		_t.LOGCSS= ""
 		for index,con of obj
 			per= con.per+"%"

 			perObj= {}
 			css_str= ""
 			for index_b,con_b of con.attr
 				perObj[con_b.key]= con_b.val
 				css_str= css_str+con_b.key+":"+con_b.val+";"
 			_t.LOGCSS= _t.LOGCSS+per+" "+"{"+css_str+"}"+" "

 			unitObj[per]= perObj
 		_t.LOGCSS= "{"+_t.LOGCSS+"}"

 		attr.push unitObj

 		$.keyframe.define attr
		

Controll.init()