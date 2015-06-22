//重力感应
function Gravity () {
	//灵敏度：私有，默认原始档
 	var _s_array = {
 		prim:1,
 		high:2,
 		mid:5,
 		low:10
 	};
 	var _s = _s_array.prim;

 	//检测手机绕x y z旋转距离原始位置的范围：私有，默认90°
 	var _range = 90;

 	//实时旋转角度
 	var _X = 0,_Y = 0,_Z = 0;
 	var _listerFunc;

 	//开启监听重力感
 	this.startGravity = function(changeFunc){
 		var isInit = false;
 		var sourceX = 0 ,sourceY = 0, sourceZ = 0;
 		if (window.DeviceOrientationEvent) {//判断是否支持重力感应事件
 			window.addEventListener('deviceorientation', _listerFunc = function(event) {
 				if(!isInit){
 					sourceX = event.beta;
 					sourceY = event.gamma;
 					sourceZ = event.alpha;
 					isInit = true;
 				}

 				if(Math.abs(event.beta-sourceX)<_range){
 					_X = event.beta;
 				}
 				if(Math.abs(event.gamma-sourceY)<_range){
 					_Y = event.gamma;
 				}
 				if(Math.abs(event.alpha-sourceZ)<_range){
 					_Z = event.alpha;
 				}

 				changeFunc(_X/_s,_Y/_s,_Z/_s,_range);
 			});
 		}
 		else{
 			//暂无供接口使用处理
 			console.log("该浏览器不支持重力感应器检测！");
 		}
 	}

 	//关闭监听重力感
 	this.stopGravity = function(){
 		window.removeEventListener('deviceorientation',_listerFunc);
 	}
} 

//加速度感应
function Shake(){

}