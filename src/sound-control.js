/*sound-control v0.0.2*/

/**
 * **注意**
 * ios端不要使用autoplay: true
 * 请手动播放，详见demo
 * 另外，ios如果用代码play()，再用btn，会有重复声音
 * 这些目前都为bug。正在解决中
 * 我们的案例中，简单的按钮+背景音乐不存在上述问题
 */

/**
 * 依赖 `jquery/zepto`, 依赖`sound.js-hdx`
 * 将来会用`velocity`来处理动画，解决不自然的转换的效果
 * （对velocity的存在进行判断，然后有默认的旋转效果）
 * 另外，我觉得把rotate的css放在这里比较好
 * 因为可能会有很大改动 暂时未写说明，请看demo
 */

/**
 * changelog
 * ---------
 * v0.0.2 added ios support
 */


;(function(window) {
	'use strict';

	var defaults = {
		playingClass: "playing",
		readyClass: "ready",
		playOnFirstTouch: true
	}

	function SControl(opts) {
		var self = this;
		opts = $.extend({},  defaults, opts);

		this.opts = opts;
		this.sound = new Sound(opts.sound);
		this.$btn = $(opts.btn);
		this._bind();
	}

	SControl.prototype._bind = function() {
		var self = this;
		var playingClass = this.opts.playingClass;
		var tapSupport = $.fn.tap;
		var s = this.sound;
		var $btn = this.$btn;
		$btn[tapSupport ? "tap" : "click"](function(e) {
			s.toggle();
		});
		s.on('play', function() {
			console.log('play event');
			$btn.addClass(playingClass);
		})
		s.on('end', function() {
			console.log('end event');
			$btn.removeClass(playingClass);
		})
		s.on('pause', function() {
			console.log('pause event');
			$btn.removeClass(playingClass);
		})
		s.on('load', function() {
			console.log('loaded');
			$btn.show();
			$btn.addClass(self.opts.readyClass);
		})
	};

	window.SControl = SControl;

})(window);
