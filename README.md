# transparent

下载直接引用即可
```
<script src="transparent.js"> </script>
```

####  预览图
![](./11.gif '预览图')

在移动端web中有很多应用的场景就是上下滑动页面顶部的 header 会随着滑动的高度而变换透明度，为了让页面内容进来有更多的展示，在这种情况下还是很多见的。
下面来分析一下这里做这效果的简单思路，我们首先要取到 header 的背景色，注意最好是要 rgba 格式的 background ，不然还得要多做一个不必要的颜色转换，然后再通过 getComputedStyle() 方法获取 dom 的样式，获取样式找到 backgroundColor 的 rgba，通过正则匹配找到最后的那个数字 0 ，再就是计算滑动高度和透明度值得函数计算的到新的数值，最后在 touchmove 的时候实时添加给 header 的rgba 上，大致就是这样的。

本代码参考mui框架做了小的改动处理。
具体调用方法：
```
new ZYTransparent({
    element: document.querySelector('.header'),
    top: 0,              // 距离顶部高度(到达该高度即触发)
    offset: 150,         // 滚动透明距离档设定top值后offset也会随着top向下延伸
    duration: 15         // 过渡时间
})
```

