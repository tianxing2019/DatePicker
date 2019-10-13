
;(function(undefined) {
    "use strict";
	var _global;
    // 工具函数
    var DatePicker = function(options) {
        return new _DatePicker(options);    
    };
    // 插件构造函数
    function _DatePicker(options){
        this.init(options);
    }
    _DatePicker.prototype = {
		options:{
			ele: "",
			cleanable: false,//是否显示清除按钮
        },
		id:'',//日期弹出层的id，存在目的是为了防止重复打开弹窗
		year: new Date().getFullYear(),//存储用户选择的年份，默认是今年
		month: new Date().getMonth()+1,//存储用户选择的月份，默认是当前的月份
		day: '',//存储用户选择的日
		checkValue:'',//已选中的日期格式为：YYYY-MM-DD
        init: function(options){ // 渲染样式和数据
            var _this = this;

			 _this.options = JSON.parse(JSON.stringify(options)); // 配置参数
            if(!_this.options.ele){
                alert("请传入'ele'参数");
                return false;
            }
			var $container = document.getElementById(_this.options.ele);
			if( !$container){
			    alert("请传入合法的'ele'参数");
                return false;
            }
			
			//为“清除图标”绑定点击事件
			_this.addHandler( $container, 'click',function(event){
				var target = event.target || event.srcElement;
				if(target.className.indexOf('suffix-i-icon') != '-1'){
					Array.prototype.forEach.call($container.children,function(item){
						if(item.tagName.toLowerCase() =='input'){
							item.value = '';
							_this.checkValue = '';
							$container.classList.remove('selectDate');
						}
					});
				}
			});
			
			//创建文档片段
			var df = document.createDocumentFragment(),
			$prefix_span = document.createElement('span'),			
			$prefix_i = document.createElement('i'),
			$input = document.createElement('input'),
			$suffix_span = document.createElement('span'),
			$suffix_i = document.createElement('i');
			
			$prefix_span.classList.add('prefix-span');
			$prefix_i.classList.add('prefix-i-icon');
			$input.classList.add('date-input');
			$input.placeholder = '请选择日期';
			$suffix_span.classList.add('suffix-span');
			$suffix_i.classList.add('suffix-i-icon');
			
			$prefix_span.appendChild($prefix_i);
			df.appendChild($prefix_span);
			df.appendChild($input);
			$suffix_span.appendChild($suffix_i);
			df.appendChild($suffix_span);
			$container.appendChild(df);
				
			//监听点击事件
			_this.addHandler($container,'click',function(event){
				_this.stopBubble(event);
				
				var target = event.target || event.srcElement;
				//点击删除图标
				if(target.tagName.toLowerCase() == 'i' && target.classList.contains('suffix-i-icon')){
				
				}
				//点击日历图标或输入框	 ==>打开选择日期的页面
				if((target.tagName.toLowerCase() == 'i' && target.classList.contains('prefix-i-icon')) || target.tagName.toLowerCase() == 'input'){
					_this.openDatePickerWindow();
				}
				
			});
			
			//点击空白区域时，关闭日期弹窗
			_this.addHandler(document,'click',function(event){
				_this.closeDatePickerWindow();
			});
        },
		//获取已选择的日期
		getCheckedValue: function(){
			return this.checkValue;
		},
		//打开“日期弹出层”
		openDatePickerWindow:function(){
			var _this = this;
			if(!_this.id){
				_this.id = _this.options.ele + '-' + Date.parse(new Date());
			
				var $div = document.createElement('div');
				$div.setAttribute('id',_this.id);
				$div.classList.add('date-iframe-container');
				var iframe = document.createElement('iframe');
				iframe.classList.add('date-iframe');
				iframe.src = './date-picker.html';
				$div.appendChild(iframe);
				document.body.appendChild($div);
	
				iframe.onload = function(){
					_this.generateDatePickerDom(iframe);
				}			
			}	
		},
		//关闭“日期弹出层”
		closeDatePickerWindow:function(){
			var _this = this;
			if(_this.id){
				var $div = document.getElementById(_this.id);
				document.body.removeChild($div);
				_this.id = '';
			}
		},
		//生成“日期弹出层”的dom
		generateDatePickerDom:function(iframe){
			var _this = this;
			//var $window = document.getElementById(_this.id).childNodes[0].contentWindow;
			var $window = iframe.contentWindow;
			var $body = $window.document.querySelector('body');			

			var $wrapper = document.createElement('div');//最外层
			$wrapper.classList.add('date-picker-wrapper');
			
			
			//总共有三种视图：选择日、选择月、选择年
			//默认绘制选择日的页面
			_this.renderDay($wrapper);
			
			//创建文档片段
			var df = document.createDocumentFragment();
			df.appendChild($wrapper);
			$body.appendChild(df);
			
			_this.initPositionAndListener(document.getElementById(_this.options.ele),document.getElementById(_this.id));
		},
		//初始化“日期弹出层”的位置和监听滚动事件
		initPositionAndListener:function(mainBox,subBox){
			//注意top是JS的保留字段，不能用作变量名
			var top1 = mainBox.getBoundingClientRect().top;  // 【元素顶部】距离【可视区域上边】的距离
			var bottom = mainBox.getBoundingClientRect().bottom; // 【元素底部】距离【可视区域上边】的距离
			
			//js无法直接获取元素的底部距离可视区域下边的距离
			//但是可以通过【可视区域的高度】减去【元素底部距离可视区域上边的距离】间接获得
			var clientHeight = document.documentElement.clientHeight;//网页可视区域的高度
			var mainBoxBottom = clientHeight - bottom;//元素的底部距离可视区域下边的距离
			
			//某个元素的上边界到body最顶部的距离 offsetTop
			if( mainBoxBottom > 0 ){//mainBox的底部显示在可视区域的上方
				if(mainBoxBottom - 10 >= subBox.offsetHeight){//mainBox下方有充足的空间够弹出层subBox定位
					subBox.style.top = (mainBox.offsetTop + mainBox.offsetHeight + 10)  +'px';//10px为间隙
				}else{
					if(mainBoxBottom >= subBox.offsetHeight/2){//mainBox下方的空间不足，但是比弹出层subBox高度的一半还要大，弹出层定位在manBox的下方，其底部与可视区域的底部重合
						subBox.style.top = (mainBox.offsetTop + mainBox.offsetHeight + mainBoxBottom - subBox.offsetHeight)  +'px';
					}else{//mainBox下方的空间严重不足，比弹出层subBox高度的一半还要小，弹出层定位在mainBox的上方
						subBox.style.top = (mainBox.offsetTop - subBox.offsetHeight - 10)  +'px';
					}
				}				
			}else{//mainBox的底部在可视区域的下方（即已经不可见）
				subBox.style.top = (mainBox.offsetTop - subBox.offsetHeight - 10)  +'px';
			}
			
			subBox.style.left = mainBox.offsetLeft +'px';
			//监听滚动条的滑动
			this.adjustPositionFollowScroll(mainBox,subBox);
		},
		//跟随滚动条的滑动调整弹出层的位置
		adjustPositionFollowScroll:function(mainBox,subBox){
			
			this.addHandler(document,'scroll',function(event){
				//为弹出层增加过渡的效果
				subBox.style.transition = 'top .2s linear';
				var mainBoxBottom = document.documentElement.clientHeight - mainBox.getBoundingClientRect().bottom;
				if(mainBoxBottom){
					if(mainBoxBottom - 10 >= subBox.offsetHeight){//mainBox下方有充足的空间够弹出层subBox定位
						subBox.style.top = (mainBox.offsetTop + mainBox.offsetHeight + 10)  +'px';//10px为间隙
					}else{
						if(mainBoxBottom >= subBox.offsetHeight/2){//mainBox下方的空间不足，但是比弹出层subBox高度的一半还要大，弹出层定位在manBox的下方，其底部与可视区域的底部重合
							subBox.style.top = (mainBox.offsetTop + mainBox.offsetHeight + mainBoxBottom - subBox.offsetHeight)  +'px';
						}else{//mainBox下方的空间严重不足，比弹出层subBox高度的一半还要小，弹出层定位在mainBox的上方
							subBox.style.top = (mainBox.offsetTop - subBox.offsetHeight - 10)  +'px';
						}
					}					
				}else{
					subBox.style.top = (mainBox.offsetTop - subBox.offsetHeight - 10)  +'px';
				}
			});		
		},
		//渲染选择日的视图
		renderDay:function($wrapper){
			var _this = this;			
			
			_this.removeAllChildren($wrapper);
			
			//整个日期选择框分为头部、内容两个部分，头部选择显示类型（年或月），内容区展示年或月
			var $datePickerHead = document.createElement('div');
			$datePickerHead.classList.add('date-picker-head');
			//上一年
			var $prev_year_span = document.createElement('span');
			var $prev_year_i = document.createElement('i');
			$prev_year_span.classList.add('prev-year');
			$prev_year_span.appendChild($prev_year_i);
			
			//上个月
			var $prev_month_span = document.createElement('span');
			var $prev_month_i = document.createElement('i');
			$prev_month_span.classList.add('prev-month');
			$prev_month_span.appendChild($prev_month_i);
			
			//年
			var $year_span = document.createElement('span');
			$year_span.classList.add('year-span');
			$year_span.innerText = _this.year + ' 年';
			//月
			var $month_span = document.createElement('span');
			$month_span.classList.add('month-span');
			$month_span.innerText = ' ' + _this.month + ' 月';
			
			//下个月
			var $next_month_span = document.createElement('span');
			var $next_month_i = document.createElement('i');
			$next_month_span.classList.add('next-month');
			$next_month_span.appendChild($next_month_i);
			
			//下一年
			var $next_year_span = document.createElement('span');
			var $next_year_i = document.createElement('i');
			$next_year_span.classList.add('next-year');
			$next_year_span.appendChild($next_year_i);
			
			$datePickerHead.appendChild($prev_year_span);
			$datePickerHead.appendChild($prev_month_span);
			$datePickerHead.appendChild($year_span);
			$datePickerHead.appendChild($month_span);
			$datePickerHead.appendChild($next_year_span);	
			$datePickerHead.appendChild($next_month_span);					
			$wrapper.appendChild($datePickerHead);
			
			var $datePickerBody = document.createElement('div');
			$datePickerBody.classList.add('date-picker-body');
			
			//绘制表头，内容：星期一至星期日
			var $table = document.createElement('table');
			$table.classList.add('wh-table');
			$table.setAttribute('cellspacing',0);
			var $thead = document.createElement('thead');
			var $thead_tr = document.createElement('tr');
			['一', '二','三','四','五','六','日'].forEach(function(item,index){
				var $th = document.createElement('th');
				$th.innerText = item;
				$thead_tr.appendChild($th);
			});
			$thead.appendChild($thead_tr);
			$table.appendChild($thead);
			
			//绘制表体，显示“日”：1-31
			var $tbody = document.createElement('tbody');
			var trs_array = [];
			for(var i=0; i < 6; i++){
				var $tr = document.createElement('tr');
				trs_array.push($tr);
				$tbody.appendChild($tr);
			}
			var days_array = [];//用于存放“日”的数组
			
			//getDay()返回0、1、2、3、4、5、6 对应：日、一、二、三、四、五、六
			var firstWeekday = _this.getFirstDayOfMonth().getDay();     //获取指定月份月的第一天属于星期几
			firstWeekday = firstWeekday == 0 ? 7: firstWeekday;
			
			var bigMonth = [1,3,5,7,8,10,12]; //大月（31天）
			
			//绘制6行7列，总计42个日子，有3个月的跨度
			//上个月
			var lastMonth = _this.month == 1 ? 12 : _this.month - 1;
			if( 2 == lastMonth){
				//判断当前年份是否是闰年
				if(_this.isLeapYear(_this.year)){
					days_array = days_array.concat(_this.generateDataByIndex(firstWeekday - 1,30 - firstWeekday));
				}else{
					days_array = days_array.concat(_this.generateDataByIndex(firstWeekday - 1,29 - firstWeekday));
				}
				
			}else{
				if(_this.contains(bigMonth,lastMonth)){
					days_array = days_array.concat(_this.generateDataByIndex(firstWeekday - 1,32 - firstWeekday));
				}else{
					days_array = days_array.concat(_this.generateDataByIndex(firstWeekday - 1,31 - firstWeekday));
				}	
			}
			var last_month_days = days_array.length;//需要绘制的上个月的天数
			
			//本月
			if( 2 == _this.month){
				//判断当前年份是否是闰年
				if(_this.isLeapYear(_this.year)){
					days_array = days_array.concat(_this.generateDataByIndex(29,0));
				}else{
					days_array = days_array.concat(_this.generateDataByIndex(28,0));
				}
			}else{
				//判断本月是否是大月
				if(_this.contains(bigMonth,_this.month)){
					days_array = days_array.concat(_this.generateDataByIndex(31,0));
				}else{
					days_array = days_array.concat(_this.generateDataByIndex(30,0));
				}
			}
		
			var next_curr_days = days_array.length ;//需要绘制的上个月 + 本月的总天数
			//下个月
			days_array = days_array.concat(_this.generateDataByIndex(42 - days_array.length,0));

			days_array.forEach(function(item,index){
				var tr = trs_array[parseInt(index / 7)];
				var $td = document.createElement('td');
				var $span = document.createElement('span');
				$span.innerText = item;
				$td.appendChild($span);

				if(index < firstWeekday - 1 ){//上个月
					$td.className = 'unavailable prevTd';
				}else if(index >= next_curr_days){//下个月
					$td.className = 'unavailable nextTd';
				}else{//本月
					if(_this.checkValue == _this.year + '-' + _this.month + '-' + _this.day && item == _this.day ){//为特定的日期增加已选中的样式
						$td.classList.add('checked');
					}else {
						var today = new Date().getDate();      //获取今日(1-31)
						if (_this.year == new Date().getFullYear() && _this.month == new Date().getMonth() +1 && index == last_month_days + today - 1){//今天
							$td.classList.add('today');
						}else{
							$td.classList.add('available');
						}	
					}
				}
				tr.appendChild($td);			
			});
			
			$table.appendChild($tbody);
			$datePickerBody.appendChild($table);
			$wrapper.appendChild($datePickerBody);			
			
			_this.addHandler($prev_year_span,'click', function(event){				
				//点击“上一年”箭头，需要重新绘制页面
				-- _this.year;
				_this.renderDay($wrapper);
			});
			_this.addHandler($prev_month_span,'click', function(event){				
				//点击“上个月”箭头，需要重新绘制页面
				if(_this.month == 1){
					-- _this.year;
					_this.month = 12;
				}else{
					--_this.month;
				}					
				_this.renderDay($wrapper);
			});
			_this.addHandler($next_month_span,'click', function(event){				
				//点击“下个月”箭头，需要重新绘制页面
				if(_this.month == 12){
					++ _this.year;
					_this.month = 1;
				}else{
					++_this.month;
				}				
				_this.renderDay($wrapper);
			});
			_this.addHandler($next_year_span,'click', function(event){				
				//点击“下一年”箭头，需要重新绘制页面
				++ _this.year;
				_this.renderDay($wrapper);
			});
			
			_this.addHandler($month_span,'click', function(event){				
				//进入到选择月份的页面，需要重新绘制页面
				_this.renderMonth($wrapper);
			});
			
			_this.addHandler($year_span,'click', function(event){				
				//进入到选择年份的页面，需要重新绘制页面
				_this.renderYear($wrapper);
			});
			
			var $container = document.getElementById(_this.options.ele);
			_this.addHandler($tbody,'click', function(event){				
				var target = event.target || event.srcElement;
				
				if(target.tagName.toLowerCase() == 'td'){
					_this.day = parseInt(target.childNodes[0].innerText) ;
				}else if(target.tagName.toLowerCase() == 'span'){					
					_this.day = parseInt(target.innerText) ;
					target = target.parentNode;
				}
				if(target.className.indexOf('prevTd') != '-1'){//点击上个月的数据
					 if(_this.month == 1){
						-- _this.year ;
						_this.month = 12;
					 }else{
						--_this.month;
					 }
				}else if(target.className.indexOf('nextTd') != '-1'){//点击下个月的数据
					 if(_this.month == 12){
						++_this.year;
						_this.month = 1;
					 }else{
						++_this.month;
					 }
				}
				
				//为目标元素增加样式名，以区分是否选择了日期
				$container.classList.add('selectDate');
				//关闭弹窗
				_this.closeDatePickerWindow();
				//显示出选择的日期
				var children = document.getElementById(_this.options.ele).children;
				//注意：如果下面代码改为 Array.prototype.forEach.apply会报错
				Array.prototype.forEach.call(children ,function(item){
					if(item.tagName.toLowerCase() == 'input'){
						var month  = (_this.month + '').length == 1 ? '0'+_this.month : _this.month;
						var day  = (_this.day + '').length == 1 ? '0'+_this.day : _this.day;
						item.value = _this.year + '-' + month + '-' + day;
						_this.checkValue = _this.year + '-' + _this.month + '-' + _this.day;
					}
				});
			});
		},
		//渲染选择月的视图
        renderMonth:function($wrapper){
			var _this = this;
			_this.removeAllChildren($wrapper);
			
			//整个日期选择框分为头部、内容两个部分，头部选择显示类型年，内容区展示月
			var $datePickerHead = document.createElement('div');
			$datePickerHead.classList.add('date-picker-head');
			
			//上一年
			var $prev_year_span = document.createElement('span');
			var $prev_year_i = document.createElement('i');
			$prev_year_span.classList.add('prev');
			$prev_year_span.appendChild($prev_year_i);
			
			//年
			var $year_span = document.createElement('span');
			$year_span.classList.add('year-span');
			$year_span.innerText = _this.year + ' 年';
			
			//下一年
			var $next_year_span = document.createElement('span');
			var $next_year_i = document.createElement('i');
			$next_year_span.classList.add('next');
			$next_year_span.appendChild($next_year_i);
			
			$datePickerHead.appendChild($prev_year_span);
			$datePickerHead.appendChild($year_span);
			$datePickerHead.appendChild($next_year_span);
			$wrapper.appendChild($datePickerHead);
			
			var $datePickerBody = document.createElement('div');
			$datePickerBody.classList.add('date-picker-body');

			var $table = document.createElement('table');
			$table.classList.add('wh-table');
			$table.setAttribute('cellspacing',0);
			var $tbody = document.createElement('tbody');

			//绘制表体，显示12个月份,三行四列
			var trs_array = [];
			for(var i=0; i < 3; i++){
				var $tr = document.createElement('tr');
				trs_array.push($tr);
				$tbody.appendChild($tr);
			}
			
			['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'].forEach(function(item,index){
				var tr = trs_array[parseInt(index / 4)];
				var td = document.createElement('td');
				//表格的上方绘制一条分界线
				if(0 == parseInt(index / 4)){
					td.classList.add('topTd');
				}
				td.classList.add('month');
				td.innerText = item;
				tr.appendChild(td);
			});
			$table.appendChild($tbody);
			$wrapper.appendChild($table);
			
			//调整弹出层的高度
			document.getElementById(_this.id).style.height= '240px';
			
			_this.addHandler($prev_year_span,'click', function(event){				
				//点击“上一年”箭头
				-- _this.year;
				$year_span.innerText = _this.year + ' 年';
			});
			
			_this.addHandler($next_year_span,'click', function(event){				
				//点击“下一年”箭头
				++ _this.year;
				$year_span.innerText = _this.year + ' 年';
			});
			
			_this.addHandler($year_span,'click', function(event){				
				//进入到选择年份的页面，需要重新绘制页面
				_this.renderYear($wrapper);
			});
			
			_this.addHandler($tbody,'click', function(event){		
				var target = event.srcElement || event.target;
				if(target.tagName.toLowerCase() == 'td'){
					['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'].forEach(function(item,index){
						if(target.innerText == item){
							_this.month = ++ index;
							return;
						}
					});		
					_this.renderDay($wrapper);
				
					//调整弹出层的高度
					document.getElementById(_this.id).style.height= '300px';
				}
			});
		},
		//渲染选择年的视图
		renderYear:function($wrapper){
			var _this = this;
			_this.removeAllChildren($wrapper);
			
			//整个日期选择框分为头部、内容两个部分，头部选择显示一个年代，内容区展示年
			var $datePickerHead = document.createElement('div');
			$datePickerHead.classList.add('date-picker-head');
			
			//上一“年代”
			var $prev_age_span = document.createElement('span');
			var $prev_age_i = document.createElement('i');
			$prev_age_span.classList.add('prev');
			$prev_age_span.appendChild($prev_age_i);
			
			var year = _this.year;
			var yearST = (_this.year+ '').substr(0,3);
			//年
			var $year_span = document.createElement('span');
			$year_span.classList.add('year-span');
			$year_span.innerText = yearST.substr(0,3)+'0' + ' 年 - ' + yearST+'9 年';
			
			var yearArray = [];
			for(var i=0 ; i < 10 ; i++){
				yearArray.push(yearST+ i);
			}
			
			//下一“年代”
			var $next_age_span = document.createElement('span');
			var $next_age_i = document.createElement('i');
			$next_age_span.classList.add('next');
			$next_age_span.appendChild($next_age_i);
			
			$datePickerHead.appendChild($prev_age_span);
			$datePickerHead.appendChild($year_span);
			$datePickerHead.appendChild($next_age_span);
			$wrapper.appendChild($datePickerHead);
			
			var $datePickerBody = document.createElement('div');
			$datePickerBody.classList.add('date-picker-body');

			var $table = document.createElement('table');
			$table.classList.add('wh-table');
			$table.setAttribute('cellspacing',0);
			var $tbody = document.createElement('tbody');
			
			//绘制表体，显示10个年份,三行四列
			var trs_array = [];
			for(var i=0; i < 3; i++){
				var $tr = document.createElement('tr');
				trs_array.push($tr);
				$tbody.appendChild($tr);
			}
			
			yearArray.forEach(function(item,index){
				var tr = trs_array[parseInt(index/4)];
				var td = document.createElement('td');
				td.innerText = item;
				td.classList.add('year');
				//表格的上方绘制一条分界线
				if(0 == parseInt(index / 4)){
					td.classList.add('topTd');
				}
				
				tr.appendChild(td);
			});
			
			$table.appendChild($tbody);
			$wrapper.appendChild($table);
			
			//调整弹出层的高度
			document.getElementById(_this.id).style.height= '240px';
			
			_this.addHandler($prev_age_span,'click', function(event){				
				//点击“上一年代”箭头
				_this.year = _this.year - 10 ;
				_this.renderYear($wrapper);
			});
			
			_this.addHandler($next_age_span,'click', function(event){				
				//点击“下一年代”箭头
				_this.year = _this.year + 10 ;
				_this.renderYear($wrapper);
			});
			
			_this.addHandler($tbody,'click', function(event){		
				var target = event.srcElement || event.target;
				if(target.tagName.toLowerCase() == 'td'){
					_this.year = parseInt(target.innerText);
					_this.renderDay($wrapper);
				
					//调整弹出层的高度
					document.getElementById(_this.id).style.height= '300px';
				}
			});
		},
		//获取当月第一天
		getFirstDayOfMonth: function() {
			var _this = this;
			var dateStr = _this.year+ '-'+ _this.month + '-' + '01';
			var date = new Date(dateStr.replace(/-/,"/"));
			return date;
		},
		//闰年能被4整除且不能被100整除，或能被400整除。
		isLeapYear:function(year){
			if(year%4==0&&year%100!=0||year%400==0){
				return true;
		　　}else{
				return false;
		　　}
		},
		contains:function(array,obj){
			return array.some(function(item,index){
				if(item == obj) {
					return true;
				}else{
					return false;
				}
			});
		},
		generateDataByIndex:function(length,initVal){
			return length == 0 ? [] : this.fill(new Array(length),'').map(function(item,index){
				return ++ index + Number(initVal);
			});
		},
		//填充数组（兼容万恶的IE）
		fill:function(array,item){
			for(var i= 0; i < array.length; i++){
				array[i]= item;
			}
			return array;
		},
		addHandler: function(element,type,handle) {
			if(element.addEventListener) {
				element.addEventListener(type,handle);
			}else if(element.attachEvent) {
				element.attachEvent("on"+type,handle);
			}else {
				element["on"+type] = handle;
			}
		},
		removeHandler: function(element,type,handle) {
			if(element.removeEventListener) {
				element.removeEventListener(type,handle);
			}else if(element.detachEvent) {
				element.detachEvent("on"+type,handle);
			}else {
				element["on"+type] = null;
			}
		},
		removeAllChildren:function(ele){
		    //childNodes返回子节点集合，包括元素节点、文本节点还有属性节点
			//children返回子节点是元素的集合
			while(ele.hasChildNodes()){
				ele.removeChild(ele.firstChild);
			}

		},
		//event指的是事件，并非dom元素
		stopBubble:function(event) { 
			//如果提供了事件对象，则这是一个非IE浏览器 
			if ( event && event.stopPropagation ) {
				//因此它支持W3C的stopPropagation()方法 
				event.stopPropagation(); 
			}else {
				//否则，我们需要使用IE的方式来取消事件冒泡 
				window.event.cancelBubble = true; 
			}
		},
    }
	
    // 最后将插件对象暴露给全局对象
    _global = (function(){ return this || (0, eval)('this'); }());	
    if (typeof module !== "undefined" && module.exports) {
        module.exports = DatePicker;
    } else if (typeof define === "function" && define.amd) {
        define(function(){return DatePicker;});
    } else {
        !('DatePicker' in _global) && (_global.DatePicker = DatePicker);
    }
}());