(function(require, exports, module) {
    //require('../../../../../mod/global/touch');
    //var Stat = require("../../../../../mod/global/stat");
    //var Login = require("../../../../../mod/global/weixin_login");

    //var Box = require('../../../../../mod/global/box'),
    //WX = require("../../../../../mod/global/weixin"),
    var Param = null,
        Share = null,
        _transId = '';

    var el = document.createElement("div"),
        _prefixMap = {
            'webkitAnimation': 'webkit',
            'MozAnimation': 'Moz',
            'msAnimation': 'MS',
            'OAnimation': 'O',
            'OTransform': 'O'
        },
        _prefix = '';

    for (var key in _prefixMap) {
        if (undefined !== el.style[key]) {
            _prefix = _prefixMap[key];
        }
    }
    //
    var Game = {
        score: 0, // 分数
        cakeCount: 0, //月饼数
        QBCount: 0, //Q币数
        playing: false, //游戏中
        curSpeedAnim: 'down-fb', //当前掉落动画
        gameWrapper: document.getElementById('game_warpper'),
        wrapper: $('#game_warpper'),
        timer: document.getElementById('js_time'),
        qbAnim: document.getElementById('qb_anim'),
        qbStatus: 1, //-1：未加载，0：不可活的，1：可获得
        isPlayAudio: false, //是否播放音乐
        overDelay: 1500, //游戏结束动画播放时间
        _i: 0, //点击次数
        loadRes: function() {
            //图片预加载
            var preLoadImg = new Image();
            preLoadImg.onload = $.proxy(function() {
                this.gameImgLoaded = true;
                this.onGameImgLoaded && this.onGameImgLoaded();
            }, this);
            preLoadImg.src = "img/sprite_1.png";
            //
            this.bgAudio = document.getElementById('bgAudio');
            this.qbAudio = document.getElementById('qbAudio');
            this.wrAudio = document.getElementById('wrAudio');
            this.fbAudio = document.getElementById('fbAudio');

            // WX.getNetworkType($.proxy(function(state, type) {
            //     if ('success' === state && 1 === type) {
            this.loadAudio();
            this.isPlayAudio = true;
            //     }
            // }, this));
        },
        loadAudio: function(src, onload) {
            $('audio').each(function() {
                this.src = $(this).attr('data-src');
            });
            var fbAudioSrc = $(this.fbAudio).attr('data-src');
            this.touchAudios = [new Audio(fbAudioSrc), new Audio(fbAudioSrc), new Audio(fbAudioSrc)];
        },
        init: function() {
            //
            this.bindEvent();
            $('body').css({
                width: window.innerWidth,
                height: window.innerHeight
            });
            this.loadRes();
        },
        setQBStatus: function() {
            //是否有可以领取QB
            -1 === this.qbStatus && $.getJSON('/app/v1.0/cft_wx_action_pay_check.cgi', {
                oper: '1',
                act_id: '10079'
            }, $.proxy(function(data) {
                if ('0' === data.retcode) {
                    $('.cake-fb').last().removeClass('cake-fb').addClass('cake-qb');
                    this.qbStatus = 1;
                    Stat.clickStat('WXPAY_2014.MID_AUT.QB.SHOW');
                } else if ('51001000' === data.retcode) {
                    _login();
                } else {
                    this.qbStatus = 0;
                }
            }, this));
            1 === this.qbStatus && 0 === $('.cake-qb').length && $('.cake-fb').last().removeClass('cake-fb').addClass('cake-qb');
        },
        bindEvent: function() {
            $('#js_start').on('touchstart', $.proxy(this.onStart, this));
            //this.wrapper.delegate('.cake', 'touchstart', $.proxy(this.onTouch, this));
            this.gameWrapper.addEventListener('touchstart', $.proxy(this.onTouch, this), false);
            this.gameWrapper.addEventListener(_prefix + 'AnimationIteration', this.onAnimationIteration, false);
            this.gameWrapper.addEventListener(_prefix + 'AnimationStart', this.onAnimationStart, false);
            this.gameWrapper.addEventListener(_prefix + 'AnimationEnd', $.proxy(this.onAnimationEnd, this), false);
            this.qbAnim.addEventListener(_prefix + 'AnimationEnd', $.proxy(this.onQbAnimEnd, this), false);
            //按钮效果
            $('body').delegate('.btn-line', 'touchstart', function(e) {
                $(e.currentTarget).addClass('btn-line-on');
            }).delegate('.btn-line', 'touchend', function(e) {
                $(e.currentTarget).removeClass('btn-line-on');
            }).on('touchmove', function(e) { //禁止iPhone页面可以拖动
                e.preventDefault();
            });
            //
            $(document).on('resize', $.proxy(function() {
                $('body').css({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, this));
        },
        changeState: function(state) {
            $('body')
                .removeClass('show-loading')
                .removeClass('show-enter')
                .removeClass('show-over')
                .removeClass('show-result')
                .removeClass('show-pay')
                .removeClass('show-success')
                .removeClass('show-timeout')
                .addClass('show-game').addClass(state);
        },
        playAudio: function(audio) {
            this.isPlayAudio && audio && (audio.currentTime = 0, audio.play());
        },
        playTouchAudio: function() {
            this.isPlayAudio && (this.touchAudios[this._i % 3].play(), this._i++);
        },
        onStart: function(e) {
            //等待图片未加载完成
            if (!this.gameImgLoaded) {
                onGameImgLoaded = this.onStart;
                this.changeState('show-loading');
                $('#loading_text').html('准备开始..');
                return;
            }
            //重置
            this.score = 0;
            this.QBCount = 0;
            this.cakeCount = 0;
            this.changeState('show-game');
            this.playing = true;
            $('#js_time').addClass('countdown-inner');
            $('#js_score_wrap').removeClass('get-qb');
            $('.cut-fb').removeClass('cut-fb');

            var delay = 500,
                i = 0;
            var n = this.wrapper.find('.cake').length;
            setTimeout($.proxy(function() {
                this.wrapper.find('.hide').first().removeClass('hide').addClass('down-fb');
                i < n && setTimeout($.proxy(arguments.callee, this), delay);
                i++;
            }, this), delay);

            $('#js_score').html(this.score);

            //延时监听倒计时结束事件
            setTimeout($.proxy(function() {
                this.timer.addEventListener(_prefix + 'AnimationEnd', $.proxy(function() {
                    this.onOver(true);
                }, this), false);
            }, this), 100);
            //
            this.setQBStatus();
            //速度关卡
            this._timer1 && clearTimeout(this._timer1);
            this._timer2 && clearTimeout(this._timer2);
            this._timer1 = setTimeout($.proxy(function() {
                this.curSpeedAnim = 'down-fb-er'
                this.wrapper.find('.cake-wr').first().removeClass('down-fb').addClass('down-fb-er');
            }, this), 10 * 1000); //10s
            this._timer2 = setTimeout($.proxy(function() {
                this.curSpeedAnim = 'down-fb-est'
            }, this), 20 * 1000); //20s
            //
            this.playAudio(this.bgAudio);
        },
        onTouch: function(e) {
            var target = $(e.target);
            if (target.hasClass('inner')) {
                target = target.parent();
                target.hasClass('cake-fb') && target.addClass('cut-fb');
                // setTimeout($.proxy(function() {
                //     target.removeClass('hide').addClass(this.curSpeedAnim);
                // }, this), 100);
                target.hasClass('cake-fb') && (this.score++, this.cakeCount++, $('#js_score').html(this.score), this.playTouchAudio());

                if (target.hasClass('cake-qb')) {
                    target.removeClass('cake-qb').addClass('cake-fb hide');
                    this.QBCount++;
                    this.qbAudio.play();
                    $('#qb_anim').addClass('qb-move-show');
                    Stat.clickStat('WXPAY_2014.MID_AUT.QB.TAP');
                }

                target.hasClass('cake-wr') && (this.onOver(), this.isPlayAudio && this.wrAudio.play());
            }
        },
        onAnimationStart: function(e) {
            var random = parseInt(100 * Math.random());
            if (-1 !== e.animationName.indexOf('down')) {
                random < 50 ? $(e.target).css({
                    left: random + '%',
                    right: ''
                }) : $(e.target).css({
                    right: (100 - random) + '%',
                    left: ''
                });
            }
        },
        onAnimationIteration: function(e) {
            // -1 !== e.animationName.indexOf('down') && $(e.target).css({
            //     left: parseInt(width * Math.random())
            // });
        },
        onAnimationEnd: function(e) {
            'click' === e.animationName && $(e.target).parent().removeClass('cut-fb down-fb down-fb-er down-fb-est hide').addClass('hide').addClass(this.curSpeedAnim);
            setTimeout(function() {
                $(e.target).parent().removeClass('hide');
            }, 100);
        },
        onQbAnimEnd: function() {
            $('#js_score_wrap').addClass('get-qb');
            $(this.qbAnim).removeClass('qb-move-show');
        },
        stop: function() {
            this.playing = false;
            this.wrapper.find('.cake').removeClass('down-fb down-fb-er down-fb-est').addClass('hide');
            this.bgAudio.pause();
            $('#js_time').removeClass('countdown-inner');
            this.timer.removeEventListener();
            $('.js-cake-count').html(this.cakeCount);
            this.onShare && this.onShare();
        },
        onOver: function(isTimeout) {
            this.stop();
            isTimeout ? this.changeState('show-timeout') : this.changeState('show-over');

            setTimeout($.proxy(function() {
                if (this.QBCount) {
                    this.changeState('show-pay');
                } else {
                    this.changeState('show-result');
                }
            }, this), this.overDelay);
        }
    };

    //
    $(function() {
        $('.js-again').on('touchstart', function(e) {
            e.preventDefault();
            Game.onStart();
        });

        $('.js-giveup').on('touchstart', function(e) {
            e.preventDefault();
            // Box.showBox({
            //     text: '确认要放弃领取Q币的机会吗？',
            //     "btns": [
            //         ["取&nbsp;消", Box.hideBox, [], null],
            //         ["放弃",
            //             function() {
            //                 Box.hideBox();
            //                 Game.changeState('show-result');
            //             },
            //             [], null
            //         ]
            //     ]
            // });
        });


        $('.btn-share').on('touchstart', function(e) {
            e.preventDefault();
            $('#share_layer').removeClass('hide');
        });

        $('#share_layer').on('touchstart', function(e) {
            e.preventDefault();
            $('#share_layer').addClass('hide');
        });

        $('#result_layer').on('touchstart', function(e) {
            e.preventDefault();
            $('#result_layer').addClass('hide');
        });
    });

 Game.init();

}());