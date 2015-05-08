/*sound-control v0.0.1*/

/**
 * 将来会用velocity来处理动画，解决不自然的转换的效果
 * 因为可能会有很大改动
 * 暂时未写说明，请看demo
 */

// TODO: rotate css here?
;(function (window) {
	'use strict';

	var defaults = {className: "rotate"}

	function SControl (opts) {
		var self = this;
		$.extend(opts, defaults);
		this.opts = opts;
		this.sound = new Sound(opts.sound);
		this.btn = $(opts.btn.el);
		this._bind();
	}

	SControl.prototype._bind = function() {
		var self = this;
		var className = this.opts.className;
		var tapSupport = $.fn.tap;
		this.btn[tapSupport ? "tap" : "click"](function(e) {
			self.sound.toggle();
		});
		this.sound.on('play', function() {
			console.log('play event');
			self.btn.addClass(className);
		})
		this.sound.on('end', function() {
			console.log('end event');
			self.btn.removeClass(className);
		})
		this.sound.on('pause', function() {
			console.log('pause event');
			self.btn.removeClass(className);
		})
	};

	window.SControl = SControl;

})(window); 