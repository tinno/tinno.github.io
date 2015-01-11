/*
	@hasDataStart : Number 监听程序开启标记
	0:服务关闭 | 1:服务开启
*/
localStorage.setItem("hasDataStart",0);

/*
	@hasStaticStart :重构模式开启标记
	0:服务关闭 | 1:服务开启
*/
localStorage.setItem("hasStaticStart",0);

/*
	[预留模块]点击流筛选参数
	@isTagModeOn  : Boolean 点击流筛选模式开启，仅供背景页使用
	@delDataArray : Array 过滤点击流数据
	@tagDataArray : Array 标记点击流名称数据

*/
var isTagModeOn = false;
var delDataArray = ["TENPAY_V2.BROWSER.STAT.STORAGE"];
var markDataArray = [{"dataName":"TENPAY_V2.BROWSER.STAT.STORAGE","tagName":"用户登录"}];

//数据检测服务开启
function dataCheckOpen (argument) {
	localStorage.setItem("hasDataStart",1);
	sendDataAll("start");
	/*chrome.webRequest.onBeforeSendHeaders.addListener(function(detail){
		alert("请继续");
	},{urls:*});*/
	chrome.webRequest.onBeforeSendHeaders.addListener(statDataCheck,{urls: ["*://sdc.tenpay.com/*","*://pingtcss.qq.com/*","*://pingtas.qq.com/*"]});
}

//数据检测服务关闭
function dataCheckClose (argument) {
	localStorage.setItem("hasDataStart",0);
	chrome.webRequest.onCompleted.removeListener(statDataCheck);
	sendDataAll("end");
}

//检测页面点击流
function statDataCheck(detail){
	var datas = [],dataTemp = {};
	var url = detail.url;
	var currentTab = detail.tabId;
	
	var dmValue = getPara("dm",url),
		rdmValue = getPara("rdm",url),
		hottagValue = getPara("hottag",url),
		argValue = getPara("arg",url),
		urlValue = getPara("url",url),
		rurlValue = getPara("rurl",url),
		adtValue = getPara("adt",url);

	if(dmValue.match(".hot")){

		//点击流筛选项预留功能，检测delDataArray，markDataArray 是否已包含，作分支处理
		if (isTagModeOn){
			if(delDataArray.length!=0){
				for(var i in delDataArray){
					if(delDataArray[i] == hottagValue){
						return;
					}
				}
			}
			if(markDataArray.length!=0){
				for(var i in markDataArray){
					if(markDataArray[i]["dataName"] == hottagValue){
						hottagValue = "[" + markDataArray[i]["tagName"] + "]" + hottagValue;
						break;
					}
				}
			}
		}

		//点击流统计
		dataTemp.type = "点击流";
		dataTemp.name = hottagValue;
		datas.push(dataTemp);
		sendData(datas,currentTab);
	}
	else if(dmValue != ""){
		datas.push({type:"页面PV统计",name:dmValue + "" + urlValue});
		
		if(rdmValue != "-"&&rdmValue != ""){

			if (rdmValue == "ADTAG") {
				dataTemp.name = /*"[ADTAG]" + */rurlValue;
				//来源统计页面统计
				dataTemp.type = "页面来源统计";
				datas.push(dataTemp);
			}
			else {
				//dataTemp.name = "[LINK]" + rdmValue + "" + rurlValue;
			}
		}
		
		sendData(datas,currentTab);
	}

	for(var i in datas){
		console.log(datas[i]);
	}
}

//向当前标签页传输数据
function sendData (datas,currentTab) {
  	chrome.tabs.sendMessage(currentTab,datas);
}

//向所有标签页传输数据
function sendDataAll (datas) {
	if (datas == "staticStart") {
		localStorage.setItem("hasStaticStart",1);
	}
	if (datas == "staticStop") {
		localStorage.setItem("hasStaticStart",0);
	}	

  	chrome.tabs.query({url:"*://*.tenpay.com/*"},function(tabs){
		for(var i in tabs){
			chrome.tabs.sendMessage(tabs[i].id,datas);
		}
	});
}

//获取url的参数值
function getPara(name,url){
  var params = url.split("?")[1].split("&");
  for (var i = 0; i < params.length; i++) {
    var array = params[i].split("=");
    var a = array[0],b = array[1];
    if (a.match(name)!=null){
      return b;
    }
  };
  return "";
}