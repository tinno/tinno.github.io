var link_pre = "https://chart.googleapis.com/chart?cht=qr&chs=150x150&choe=UTF-8&chld=L|1&chl=";
var mode = "single";
var default_path = "F:\\dev_branches\\ui_static";
var default_id = "tinnocui";

$(".btn-code").click(function(){
	var path = $("#input_link").val();
	$(".area-li").addClass("hide");
	$(".code-area").removeClass("hide");
	$("#code_img").attr("src",link_pre + path);
});

$(".btn-quick").click(function(){
	$(".area-li").addClass("hide");

	var rootPath = $("#param_root").val() || default_path;
	var paramId = $("#param_id").val() || default_id;
	var path = $("#input_link").val().replace(rootPath,"").replace(/\\/g,"\/");
	var link_ui = 'http://aui.tenpay.com' + path;
	var link_tid = 'http://tid.tenpay.com' + path;
	var link_ptmp = 'http://ptmp.kf0309.3g.qq.com' + path + '?pmusr=' + paramId;
	$("#link_ui a").attr("href",link_ui); 
	$("#link_ui img").attr("src",link_pre + link_ui);

	$("#link_tid a").attr("href",link_tid);
	$("#link_tid img").attr("src",link_pre + link_tid);

	$("#link_ptmp a").attr("href",link_ptmp);
	$("#link_ptmp img").attr("src",link_pre + link_ptmp);

	$(".quick-area").removeClass("hide");
});

$(".btn-many").click(function(){
	$(".area-li").addClass("hide");

	var rootPath = $("#param_root").val() || default_path;
	var paramId = $("#param_id").val() || default_id;

	var array = $("#input_many").val().split(/\n/g);
	var links_ui = "<legend>本地静态目录</legend>",
		links_tid = "<legend>TID地址</legend>",
		links_ptmp = "<legend>PTMP地址</legend>";
	var temp_link = '<p><a href="{link}" target="_blank">{link}</a></p>';
	for (var i = 0; i < array.length; i++) {	
		var path = array[i].replace(rootPath,"").replace(/\\/g,"\/");
		links_ui += temp_link.replace(/{link}/g,'http://aui.tenpay.com' + path);
		links_tid += temp_link.replace(/{link}/g,'http://tid.tenpay.com' + path);
		links_ptmp += temp_link.replace(/{link}/g,'http://ptmp.kf0309.3g.qq.com' + path + '?pmusr=' + paramId);
		//console.log(links_ui);
	}
	$(".many-area fieldset:eq(0)").html(links_ui);
	$(".many-area fieldset:eq(1)").html(links_tid);
	$(".many-area fieldset:eq(2)").html(links_ptmp);

	$(".many-area").removeClass("hide");
});

$(".btn-ex").click(function(){
	$(".btn-ex span").toggleClass('on');
	$(".area-li").addClass("hide");
	if (mode == "single") {
		$(".line-single").addClass("hide");
		$(".link-input input").addClass("hide");
		$(".line-many").removeClass("hide");
		$(".link-input textarea").removeClass("hide");
		mode = "many";
	}
	else{
		$(".line-many").addClass("hide");
		$(".link-input textarea").addClass("hide");
		$(".line-single").removeClass("hide");
		$(".link-input input").removeClass("hide");
		mode = "single";
	}
});