Sound.js (v0.0.3)
============

简介
--------
主要解决mobile上声音的各种兼容问题。包括ios和chrome必须需要用户交互才能播放声音的hack。

依赖`howler.js`。(已不再返回`promise`)

尝试过`buzz`等库，发现对ios支持最好的就是`howler.js`。

最理想的就是直接fork `howler.js`，研究其源码，解决微信多音乐播放时的bug。但其源码有些复杂，需要精通webAudio才能有可能搞懂。目前精力有限，我们只是对android微信重写了一个声音库，对其他平台直接交给`howler`

api
----------
为了统一性，api和`howler`保持一致。另外增加了`toggle`、`then`、`done`、`fail`

另外，构建函数可以由
`var s = new Sound({src: ['someurl']});`
简化至
```javascript
var s = new Sound('someurl');
```

已知**bug**:
-----------
目前`sound.on('load')`须在`sound` intance化之后直接声明，否则可能没有效果。(不一定是bug。好像`howler.js`也是这样)

changelog
----------
v0.0.3
移除了`jquery/zepto`和`deferred`等依赖。添加了`then`接口

其他
---------
**直接看demo比较方便**，注意插耳机

**NOTE:**刚开始，api可能变化比较频繁
