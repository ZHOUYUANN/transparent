(function (window) {
    "use strict";
    var ZYTransparent = function(params) {
        this.extend(this.params, params);
        this.scrollByElem = window;

        if (!this.scrollByElem) {
            throw new Error("监听滚动的元素不存在");
        }
        this.isNativeScroll = false;
        if (this.scrollByElem === window) {
            this.isNativeScroll = true;
        }
        this._style = this.params.element.style;
        this._bgColor = this._style.backgroundColor;
        var color = this.getColor(this.getStyles(this.params.element, 'backgroundColor'));
        if (color.length) {
            this._R = color[0];
            this._G = color[1];
            this._B = color[2];
            this._A = parseFloat(color[3]);
            this.lastOpacity = this._A;
            this._bufferFn = this.buffer(this.handleScroll, this.params.duration, this);
            this.init();
        } else {
            throw new Error("元素背景颜色必须为RGBA");
        }
    };

    ZYTransparent.prototype = {
        params: {
            element: false,
            top: 0,         // 距离顶部高度(到达该高度即触发)
            offset: 150,    // 滚动透明距离档设定top值后offset也会随着top向下延伸
            duration: 16,   // 过渡时间
            afterScroll: function () {}
        },
        init: function() {
            var self = this;
            if(!self.params.element){
                return;
            }
            this.scrollByElem.addEventListener('scroll', this._bufferFn);
            if (this.isNativeScroll) { //原生scroll
                this.scrollByElem.addEventListener('touchmove', this._bufferFn);
            }
        },
        handleScroll: function(e) {
            var y = window.scrollY;
            if (!this.isNativeScroll && e && e.detail) {
                y = -e.detail.y;
            }
            var opacity = (y - this.params.top) / this.params.offset + this._A;
            opacity = Math.min(Math.max(this._A, opacity), 1);
            this._style.backgroundColor = 'rgba(' + this._R + ',' + this._G + ',' + this._B + ',' + opacity + ')';
            if(this.params.offset < y){
                this.params.afterScroll.call(this, this.params.element)
            }
            if (this.lastOpacity !== opacity) {
                this.trigger(this.params.element, 'alpha', {
                    alpha: opacity
                });
                this.lastOpacity = opacity;
            }
        },
        trigger: function(element, eventType, eventData) {
            element.dispatchEvent(new CustomEvent(eventType, {
                detail: eventData,
                bubbles: true,
                cancelable: true
            }));
            return this;
        },
        buffer: function(fn, ms, context) {
            var timer;
            var lastStart = 0;
            var lastEnd = 0;
            var ms = ms || 150;
            var that = this;
            function run() {
                if (timer) {
                    timer.cancel();
                    timer = 0;
                }
                lastStart = +new Date();
                fn.apply(context || this, arguments);
                lastEnd = +new Date();
            }

            return this.extend(function() {
                if (
                    (!lastStart) || // 从未运行过
                    (lastEnd >= lastStart && +new Date() - lastEnd > ms) || // 上次运行成功后已经超过ms毫秒
                    (lastEnd < lastStart && +new Date() - lastStart > ms * 8) // 上次运行或未完成，后8*ms毫秒
                ) {
                    run();
                } else {
                    if (timer) {
                        timer.cancel();
                    }
                    timer = that.later(run, ms, null, arguments);
                }
            }, {
                stop: function() {
                    if (timer) {
                        timer.cancel();
                        timer = 0;
                    }
                }
            });
        },
        later: function(fn, when, context, data) {
            var that = this;
            when = when || 0;
            var m = fn;
            var d = data;
            var f;
            var r;

            if (typeof fn === 'string') {
                m = context[fn];
            }

            f = function() {
                m.apply(context, d instanceof Array ? d : [d]);
            };

            r = setTimeout(f, when);

            return {
                id: r,
                cancel: function() {
                    clearTimeout(r);
                }
            };
        },
        getStyles: function(element, property) {
            var styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
            if (property) {
                return styles.getPropertyValue(property) || styles[property];
            }
            return styles;
        },
        getColor: function(colorStr) {
            var rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/;
            var matches = colorStr.match(rgbaRegex);
            if (matches && matches.length === 5) {
                return [
                    matches[1],
                    matches[2],
                    matches[3],
                    matches[4]
                ];
            }
            return [];
        },
        extend: function (a, b) {   // a 代表默认参数， b 代表传的参数
            for (var key in b) {
                if (b.hasOwnProperty(key)) {
                    a[key] = b[key];
                }
            }
            return a;
        }
    };
    window.ZYTransparent = ZYTransparent;
})(window);
