var sensor = {};

//重力感应
sensor.gravity = (function() {
	//灵敏度：私有，默认原始档
 	var _s_array = {
 		prim:1,
 		high:2,
 		mid:5,
 		low:10
 	};
 	var _s = _s_array.prim;

 	//检测手机绕x y z旋转距离原始位置的范围：私有，默认45°
 	var _range = 45;

 	//实时旋转角度
 	var _X = 0,_Y = 0,_Z = 0;
 	var _listerFunc;
 	var _isOpen = false;

 	//开启监听重力感
 	var startgravity = function(changeFunc){
 		/*var isInit = false;
 		var sourceX = 0 ,sourceY = 0, sourceZ = 0;*/
 		if (window.DeviceOrientationEvent) {//判断是否支持重力感应事件
 			if(!_isOpen){
 				_isOpen = true;
	 			window.addEventListener('deviceorientation', _listerFunc = function(event) {
	 				//记录初始值
	 				/*if(!isInit){
	 					sourceX = event.beta;
	 					sourceY = event.gamma;
	 					sourceZ = event.alpha;
	 					isInit = true;
	 				}*/
	 				if(Math.abs(event.beta)<_range){
	 					_X = Math.round(event.beta);
	 				}
	 				if(Math.abs(event.gamma)<_range){
	 					_Y = Math.round(event.gamma);
	 				}
	 				
	 				//处理成右旋转正值，左旋转负值
	 				var tempZ = (event.alpha > 180)?(event.alpha -360):event.alpha;
	 				if(Math.abs(tempZ) <_range){
	       				_Z = Math.round(tempZ);
	 				}
	 				changeFunc(_X,_Y,_Z,_range);
	 			});
 			}
 		}
 		else{
 			return false;
 		}
 	}

 	//关闭监听重力感
 	var stopgravity = function(){
 		if(_isOpen){
	 		window.removeEventListener('deviceorientation',_listerFunc);
	 	}
 	}
	return {
		startgravity:startgravity,
		stopgravity:stopgravity
	};
})();


//加速度感应
sensor.accelerate = (function() {
	//开启摇一摇
 	var startshark = function(){

 	}
})();