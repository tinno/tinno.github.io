/*中英文对照*/
var nameList = {
	jingru:"梁静茹",
	yanzi:"孙燕姿",
	jianya:"蔡健雅",
	zuer:"容祖儿"
}

/*投票结果数据结构：
	voteName:["vote comment"]
*/
var voteResultSum = {
	jingru:["评语很无力","评语很无力"],
	yanzi:["评语很无力","评语很给力","评语很给力"],
	jianya:["评语很给力","评语很给力"],
	zuer:[]
};

var voteNum = {
	jingru:0,
	yanzi:0,
	jianya:0,
	zuer:0
}

/*	读出所有候选人评论
	<!--.voter : "" | show-comment -->
	<div class="voter" data-votename="">
		<div class="voter-line">
			<span class="ico-tag"><span class="ico-tag-1"></span><span class="ico-tag-2"></span></span>
			<span class="vote-name"><!--姓名--></span>
			<span class="vote-num">0</span>
		</div>
		<dl>
			<dt><!--评语列表--></dt>
			<!--dd:"" | check-pass | check-nopass -->
			<dd>
				<p><!--评语--></p>
				<div class="btn-line">
					<button class="btn-ok">通过</button>
					<button class="btn-redo">撤销</button>
					<button class="btn-del">删除</button>
				</div>
			</dd>
		</dl>
	</div>
*/

function readVoteComment (voteResultSum,nameList,container) {
	var sumComments = "",
		singleComment = "";
	for (var name in voteResultSum) {
		if (voteResultSum[name].length != 0) {	
			singleComment = '<div class="voter" data-votename="'+ name +'"><div class="voter-line"><span class="ico-tag"><span class="ico-tag-1"></span><span class="ico-tag-2"></span></span><span class="vote-name">'+ nameList[name] +'</span><span class="vote-num">0</span></div><dl><dt><!--评语列表--></dt>';
			for (var i = voteResultSum[name].length - 1; i >= 0; i--) {
				singleComment += '<dd><p>'+ voteResultSum[name][i] + '</p><div class="btn-line"><button class="btn-ok">通过</button><button class="btn-redo">撤销</button><button class="btn-del">删除</button></div></dd>'
			}
			singleComment += '</dl></div>';
			sumComments += singleComment;
		}
	}
	container.html(sumComments);
}

//初始化数据
function initData () {

	//读出所有的投票评论情况
	readVoteComment (voteResultSum,nameList,$(".all-votes"));

	//每个人的评语展开或闭合
	$(".voter-line").click(function() {
		$(this).closest(".voter").toggleClass('show-comment');
	});

	//绑定“通过”按钮
	$(".btn-ok").click(function() {
		var voteName = $(this).closest(".voter").attr('data-votename');
		voteNum[voteName]++;
		$(this).closest(".voter").find('.vote-num').html(voteNum[voteName]);
		$(this).closest("dd").addClass('check-pass');

	});

	//绑定“删除”按钮
	$(".btn-del").click(function() {
		$(this).closest("dd").addClass('check-nopass');
	});

	//绑定“撤销”按钮
	$(".btn-redo").click(function() {
		var parentNode = $(this).closest("dd");
		if (parentNode.hasClass('check-pass')) {
			var voteName = $(this).closest('.voter').attr('data-votename');
			voteNum[voteName]--;
			$(this).closest(".voter").find('.vote-num').html(voteNum[voteName]);
			parentNode.removeClass('check-pass');
		} else{
			parentNode.removeClass('check-nopass');
		}
	});

	//绑定“统计结果”按钮
	$(".btn-sum").click(function() {
		var topNum = 0;
		var flag = true;
		var winners = [];
		for (var name in voteNum) {
			if (flag){
				topNum = voteNum[name];
				flag = false;
			}
			if (topNum < voteNum[name]){
				winners = [];
				winners.push(name);
				topNum = voteNum[name];
			}
			else {
				if (topNum == voteNum[name]) {
					winners.push(name);
				}
			}
		}
		var string = winners.join(",");
		string += '(共' + topNum + '票)';
		$("#vote_winners").text(string);
	});
}

//截至投票，进入结果筛选
$(".btn-stop").click(function() {
	$(".main").removeClass('status-1').addClass('status-2');
	initData();
});