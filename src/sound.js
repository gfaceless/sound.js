// 这里先用jquery/zepto的promise
// 将来会使用bluebird或是es-shim来做
// 事实上es6和许多浏览器已经内置Promise了
// 
// ！！重要。该库依赖于jquery的promise (或zepto附带zepto-callbacks&zepto-promise)
// 并依赖Howler.js
// 以后还是考虑直接扩展howler.js
;(function($, window) {	

	/**
	 * 目前的接口主要有:
	 * var sound = new Sound(url, opts);
	 * sound.play(callback);
	 * sound.pause();
	 * sound.stop();
	 * 直接看demo里的例子比较直观
	 * 
	 * @param {[type]} src  [地址]
	 * @param {[type]} opts [是否循环等参数]
	 */
	
	// TODO: 这个自己写的，不一定正确。待进一步考证。
	var isWeChat = /MicroMessenger/ig.test(navigator.userAgent);
	var ios = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	// 安卓的微信wtf:
	var wtf = isWeChat && !ios;
	console.log(wtf);
	if(typeof Howl == 'undefined') throw new Error("we rely on Howler.js");

	function Sound(src, opts) {
		opts = opts || {};
		
		if(!wtf) {
			$.extend(opts, {
				urls: [src],
				onload: function() {
					sound.deferred.resolve();
				}, 
				// iphone的end事件有些提前，挺奇怪的
				// 是不是音乐编辑导致的？？
				// TODO: see to it
				onend: function() {
					sound.endDeferred.resolve();
				}
			});
			var	sound = new Howl(opts);
			sound.deferred = $.Deferred();
			sound.deferred.promise(sound);

			sound.endDeferred = $.Deferred();
			sound.endPromise = sound.endDeferred.promise();
			var _play = sound.play;
			// TODO: 考虑pause、重复play等情况
			sound.play = function(cb) {
				_play.apply(sound);
				cb && sound.endPromise.done(cb);
			}
			return sound;
		}
		
		var newNode = new Audio(src);
		newNode.preload = 'auto';
		newNode.loop = opts.loop || false;
		this.node = newNode;
		this._bind();		
		this.deferred = $.Deferred();
		this.deferred.promise(this);
		// the meaning of the following line is not clear to me,
		// just imitating what Howler.js does
		newNode.load();
	}

	Sound.prototype.play = function(cb) {
		var self = this;
		this.done(function() {
			self.node.play();
		});
		this.endPromise.done(function() {
			cb && cb();
			// TODO: figure out a better way
			self._refreshPromise();
		})
		return this;
	};
	Sound.prototype.pause = function() {
		this.node.pause();
		return this;
	};
	Sound.prototype.stop = function() {
		this.node.stop();
		return this;
	};

	Sound.prototype._bind = function() {
		var self = this;
		var node = this.node;
		node.addEventListener('canplaythrough', function() {
			self.deferred.resolve();
		}, false);
		node.addEventListener('error', function() {
			self.deferred.reject();
		}, false);


		node.addEventListener("ended", function() {
			self.endDeferred.resolve();
		}, false);

		this._refreshPromise();

		this.on = function(eventName, cb) {
			var _ename;
			switch (eventName) {
				case "end":
					_ename = "ended";
			}
			node.addEventListener(_ename, function() {
				cb();
			}, false);
		}

	};

	Sound.prototype._refreshPromise = function() {
		this.endDeferred = $.Deferred();
		this.endPromise = this.endDeferred.promise();
	};

	window.Sound = Sound;

})($, window);
