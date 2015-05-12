;(function(window) {
	// NOTE 安卓微信不支持多音乐同时播放
	// ios或chrome支持

	/**
	 * 目前的api尽量和`howler.js`同步
	 * var sound = new Sound(url, opts);	 
	 * 直接看demo里的例子比较直观
	 * 
	 * @param {[type]} src  [地址]
	 * @param {[type]} opts [是否循环等参数]
	 */

	// TODO: 这个自己写的，不一定正确。待进一步考证。
	var isWeChat = /MicroMessenger/i.test(navigator.userAgent);

	var ios = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	// 安卓的微信wtf:
	var wtf = isWeChat && !ios;
	Sound.info = {
		isWeChat: isWeChat,
		ios: ios,
		wtf: wtf
	}
	if (typeof Howl == 'undefined') throw new Error("we rely on Howler.js");

	/*var iosTouched;
	function _tmp (e) {
		iosTouched = true;
		document.removeEventListener('touchstart', _tmp);
	}
	document.addEventListener('touchstart', _tmp, false);*/
	// tmp
	Howl.prototype.toggle = function() {
		
		this.playing() ? this.pause() : this.play();
	};
	thenable(Howl);

	// debugging:
	// wtf = true;

	function Sound(src, opts) {

		if (typeof src == 'object') {
			opts = src;
		} else if (typeof src == 'string') {
			opts = opts || {};
			opts.src = src;
		}
		var sound;

		// ios上的微信或mobile chrome etc:		
		if (!wtf) {
			opts.src = [opts.src];
			opts.onload = function(done) {
				// atm sound._loaded is already set to true in `howler`
				sound._done && sound._done();
			};
			opts.onloaderror = function(fail) {
				sound._failed = true;
				sound._fail && sound._fail();
			};
			// iphone的end事件有些提前，挺奇怪的
			// 是不是音乐编辑导致的？？
			// TODO: see to it
			opts.onend = function() {
				// sound.endDeferred.resolve();
			}

			sound = new Howl(opts);
			return sound;
		}

		var node = new Audio(opts.src);
		node.preload = 'auto';
		node.loop = opts.loop || false;
		this.node = node;
		this._bind();
		// the meaning of the following line is not clear to me,
		// just imitating what Howler.js does
		node.load();
		if (opts.autoplay) {
			this.play();
		}
	}

	// TODO: unify return value
	Sound.prototype.play = function(cb) {
		var self = this;

		// we cannot use this because `thennable` is not implemented right
		this.done(function() {
			self.node.play();
		});
	
		return this;
		// makeshift: (should use done())
		if(this._loaded) {
			this.node.play();
			return this;
		}
		this.node.addEventListener('canplaythrough', function() {
			this.play();
		});
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

	Sound.prototype.toggle = function() {
		this.node.paused ? this.node.play() : this.node.pause();
	};

	Sound.prototype._bind = function() {
		var self = this;
		var node = this.node;
		node.addEventListener('canplaythrough', function() {
			self._loaded = true;
			self._done && self._done();
		}, false);
		node.addEventListener('error', function() {

			self._failed = true;
			self._fail && self._fail();
		}, false);
	};

	Sound.prototype.on = function(eventName, cb) {
		var _ename;
		switch (eventName) {
			case "loaderror":
				_ename = "error";
				break;
			case "load":
				_ename = "canplaythrough";
				break;
			case "end":
				_ename = "ended";
				break;
			case "pause":
				_ename = "pause";
				break;
			case "play":
				_ename = "playing";
				break;
			default:
				_ename = "";
		}
		if (!_ename) return;
		this.node.addEventListener(_ename, cb, false);
	}

	function thenable(obj) {
		function then(done, fail) {

			// TODO: think of a better way to organize these two:
			this._dones = this._dones || [];
			this._fails = this._fails || [];

			if(done) this._dones.push(done);
			if(fail) this._fails.push(fail);

			if (this._loaded) {
				this._dones.forEach(function (done, i) {
					done();
				});
				this._dones = [];
				return;
			}
			if (this._failed) {
				this._fails.forEach(function (fail, i) {
					fail();
				});
				this._fails = [];
				return;
			}
			
			return this;
		};

		obj.prototype.then = then;
		obj.prototype.done = function (done) {
			this.then(done, undefined);
			return this;
		};
		obj.prototype.fail = function (fail) {
			this.then(undefined, fail);
			return this;
		};;
	}
	thenable(Sound);
	window.Sound = Sound;

})(window);
