/**
 * 对zepto的扩展，默认zepto不包含对touch的支持，引入此模块后可直接绑定tap等事件
 * 
 * <pre>
 * Zepto.js
 * (c) 2010-2013 Thomas Fuchs
 * Zepto.js may be freely distributed under the MIT license.
 * </pre>
 * 
 * <pre>
 * require("../../../mod/global/touch");  //只需要引用此模块即可，require以后，可以给节点添加tap事件
 * </pre>
 * 
 * @class touch
 * @module zepto
 * @author zawaliang
*/

// zawa: 改成CMD规范
/*define(function(require, exports, module) {
*/  
  // 微信5.0之前的版本底层注入了tap等事件,此情况不对tap等事件处理,只注册接口
  /*var weixin = navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);

  if (weixin && parseFloat(weixin[1]) < 5 && !$.browser.ie) {
    ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
      $.fn[m] = function(callback){ return this.bind(m, callback) }
    })
    return;
  }
  // end*/

 (function($){
      var touch = {},
        touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
        longTapDelay = 750,
        gesture

      function swipeDirection(x1, x2, y1, y2) {
        return Math.abs(x1 - x2) >=
          Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
      }

      function longTap() {
        longTapTimeout = null
        if (touch.last && touch.el) {
          touch.el.trigger('longTap')
          touch = {}
        }
      }

      function cancelLongTap() {
        if (longTapTimeout) clearTimeout(longTapTimeout)
        longTapTimeout = null
      }

      function cancelAll() {
        if (touchTimeout) clearTimeout(touchTimeout)
        if (tapTimeout) clearTimeout(tapTimeout)
        if (swipeTimeout) clearTimeout(swipeTimeout)
        if (longTapTimeout) clearTimeout(longTapTimeout)
        touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
        touch = {}
      }

      function isPrimaryTouch(event){
        return (event.pointerType == 'touch' ||
          event.pointerType == event.MSPOINTER_TYPE_TOUCH)
          && event.isPrimary
      }

      function isPointerEventType(e, type){
        return (e.type == 'pointer'+type ||
          e.type.toLowerCase() == 'mspointer'+type)
      }

      $(document).ready(function(){
        var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

        if ('MSGesture' in window) {
          gesture = new MSGesture()
          gesture.target = document.body
        }

        $(document)
          .bind('MSGestureEnd', function(e){
            var swipeDirectionFromVelocity =
              e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
            if (swipeDirectionFromVelocity && touch.el) {
              touch.el.trigger('swipe')
              touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
            }
          })
          .on('touchstart MSPointerDown pointerdown', function(e){
            if((_isPointerType = isPointerEventType(e, 'down')) &&
              !isPrimaryTouch(e)) return
            firstTouch = _isPointerType ? e : e.touches[0]
            if (e.touches && e.touches.length === 1 && touch.x2) {
              // Clear out touch movement data if we have it sticking around
              // This can occur if touchcancel doesn't fire due to preventDefault, etc.
              touch.x2 = undefined
              touch.y2 = undefined
            }
            now = Date.now()
            delta = now - (touch.last || now)
            touch.el = $('tagName' in firstTouch.target ?
              firstTouch.target : firstTouch.target.parentNode)
            touchTimeout && clearTimeout(touchTimeout)
            touch.x1 = firstTouch.pageX
            touch.y1 = firstTouch.pageY
            if (delta > 0 && delta <= 250) touch.isDoubleTap = true
            touch.last = now
            longTapTimeout = setTimeout(longTap, longTapDelay)
            // adds the current touch contact for IE gesture recognition
            if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
          })
          .on('touchmove MSPointerMove pointermove', function(e){
            if((_isPointerType = isPointerEventType(e, 'move')) &&
              !isPrimaryTouch(e)) return
            firstTouch = _isPointerType ? e : e.touches[0]
            cancelLongTap()
            touch.x2 = firstTouch.pageX
            touch.y2 = firstTouch.pageY

            deltaX += Math.abs(touch.x1 - touch.x2)
            deltaY += Math.abs(touch.y1 - touch.y2)
          })
          .on('touchend MSPointerUp pointerup', function(e){
            if((_isPointerType = isPointerEventType(e, 'up')) &&
              !isPrimaryTouch(e)) return
            cancelLongTap()

            // swipe
            if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
                (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

              swipeTimeout = setTimeout(function() {
                if(touch.el){
                  touch.el.trigger('swipe')
                  touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
                  touch = {}
                }                
              }, 0)

            // normal tap
            else if ('last' in touch)
              // don't fire tap when delta position changed by more than 30 pixels,
              // for instance when moving to a point and back to origin
              if (deltaX < 30 && deltaY < 30) {
                // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
                // ('tap' fires before 'scroll')
                tapTimeout = setTimeout(function() {

                  // trigger universal 'tap' with the option to cancelTouch()
                  // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
                  var event = $.Event('tap')
                  event.cancelTouch = cancelAll
                  if(touch.el){
                    touch.el.trigger(event)
                  }
                                    
                  // trigger double tap immediately
                  if (touch.isDoubleTap) {
                    if (touch.el) touch.el.trigger('doubleTap')
                    touch = {}
                  }

                  // trigger single tap after 250ms of inactivity
                  else {
                    touchTimeout = setTimeout(function(){
                      touchTimeout = null
                      if (touch.el) touch.el.trigger('singleTap')
                      touch = {}
                    }, 250)
                  }
                }, 0)
              } else {
                touch = {}
              }
              deltaX = deltaY = 0

          })
          // when the browser window loses focus,
          // for example when a modal dialog is shown,
          // cancel all ongoing events
          .on('touchcancel MSPointerCancel pointercancel', cancelAll)

        // scrolling the window indicates intention of the user
        // to scroll, not tap or swipe, so cancel all ongoing events
        $(window).on('scroll', cancelAll)
      })

      ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
        'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
        $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
      })
    })(Zepto);


  /**
   * ghostclick for fix click bug
   */
  !function(){
    // The space-time coordinates in space-time of the most recent touchend
    // event.  Because touchend doesn't itself have any coordinates, we need to
    // maintain x and y ourselves by listening on touchstart and touchmove.
    var x, y, t, taped;

    // window.addEventListener('touchstart', function (e) {
    //     x = e.touches[0].clientX;
    //     y = e.touches[0].clientY;
    // }, true);

    // window.addEventListener('touchmove', function (e) {
    //     x = e.touches[0].clientX;
    //     y = e.touches[0].clientY;
    // }, true);

    // window.addEventListener('touchend', function (e) {
    //     t = new Date();
    // }, true);

    $.each(['touchstart', 'MSPointerDown', 'pointerdown', 'touchmove', 'MSPointerMove', 'pointermove'], function(k, v) {
      window.addEventListener(v, function (e) {
          x = e.touches ? e.touches[0].clientX : e.clientX;
          y = e.touches ? e.touches[0].clientY : e.clientY;
      }, true);
    });
    $.each(['touchend', 'MSPointerUp', 'pointerup'], function(k, v) {
      window.addEventListener(v, function (e) {
          taped = 0;
          t = new Date();
      }, true);
    });
    

    // We only want to cancel the click if some javascript calls
    // .preventDefault() on the tap event (or equivalently returns false from
    // a tap event's handler).
    //
    // Due to limitations of the event model we also cancel the click if
    // javascript calls .stopPropagation(), as the event will not bubble this
    // far. That's probably fine as people rarely distinguish strongly between
    // the two.
    $(window).on('tap doubleTap', function (e) {
        taped = 1;
        if (!e.defaultPrevented) {
            t = 0;
        }
    });

    // Intercept all clicks on the document, and if they are close in spacetime
    // to a recently handled tap event, prevent them from happening.
    window.addEventListener('click', function (e) {
         // 1000ms is longer than 300ms. Google suggest 2500, but I'm not sure
         // on what basis. That seems unnecessarily long.
        var time_threshold = 1000,
            // 30px is the distance you can move your finger on the iPad before
            // the "tap" does not generate a click.
            // (it's also the threshold used by zepto before a tap becomes a
            // swipe)
            space_threshold = 30;
            
        if (taped &&
            new Date() - t <= time_threshold &&
            Math.abs(e.clientX - x) <= space_threshold &&
            Math.abs(e.clientY - y) <= space_threshold) {

            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
  }();
  
/*});*/
