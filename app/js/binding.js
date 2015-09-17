var Vue = require('../../node_modules/vue/dist/vue.min.js');

Vue.directive('content', {
    update: function(value) {
        var valSplited = value.split("||");
        this.el.innerHTML = "";
        for (var i in valSplited) {
            var j = i > 0 ? 1 : 0;
            this.el.innerHTML += '<tspan x="0" dy="' + j + 'em">' + valSplited[i] + '</tspan>';
        }
        this.el.setAttribute("y", valSplited.length == 0 ? 4 : (-6 * (valSplited.length - 1)));
        var sibling = this.el.previousSibling;
        var dim = this.el.getBBox();
        sibling.style.width = dim.width;
        sibling.style.height = dim.height;
        sibling.style.x = dim.x;
        sibling.style.y = dim.y;
    }
});

Vue.directive('fill', {
    update: function(value) {
        this.el.style.fill = value
    }
});

Vue.directive('date', {
    twoWay: true,
    bind: function() {
        this.handler = function() {
            var d = this.el.value.split('/');
            this.set(new Date(d[1], d[0] - 1));
        }.bind(this)
        this.el.addEventListener('input', this.handler)
    },
    update: function(value) {
        if (value instanceof Date)
            this.el.value = (value.getMonth() + 1) + "/" + value.getFullYear();
    },
    unbind: function() {
        this.el.removeEventListener('input', this.handler)
    }
});