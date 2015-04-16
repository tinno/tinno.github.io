/*投票结果数据结构：
	voteName:"vote comment"
*/
var voteResult = {
	jingru:'',
	yanzi:'',
	jianya:'',
	zuer:''
};

var count = 0;

//3个以上禁选
$(":checkbox").click(function() {
	if ($(this).attr('checked') == "checked"){
		count++;
		if (count == 3) {
			$(":checkbox[checked!='checked']").attr('disabled', 'disabled');
		}
	} 
	else{
		count--;
		if (count < 3) {
			$(":checkbox[checked!='checked']").removeAttr('disabled');
		}
	}
});

//完成投票
$(".btn-vote").click(function() {
	if (count < 2) { alert("不够2人，请继续投票！")}
	else{
		$(":checkbox[checked]").each(function() {
			//投票人评论
			var comment = $(this).nextAll(":text").val();
			if (comment != "") {
				voteResult[$(this).attr("id")] = comment;
			}
		});
		var result = '';
		for (var name in voteResult) {
			result += name + ':' + voteResult[name] + '\n';
		};

		if (confirm('提交结果\n'+ result)) {
			//提交
			$(".main").removeClass('status-1').addClass('status-2');
		} else{
			return;
		}
	}
}); 
