var $ = require('../../node_modules/jquery/dist/jquery.min.js');

module.exports = {
    closeModal: function() {
        $('#modal').css('opacity', 0);
        $('#modal').css('pointer-events', 'none');
    },

    openModal: function(x, y) {
        var modal = $('#modal');
        modal.css('opacity', 1);
        modal.css('pointer-events', 'auto');
        if (modal.css('left') == "0px" || modal.css('left')== 0) {
            var h = $( window ).height();
            var w = $( window ).width();
            if (y+80 > h)
                y=h-80;
            if (x+80 > w)
                x=w-80;
            modal.css('left', x + "px");
            modal.css('top', y + "px");
        }
    }
}

var dm = document.getElementById('modal');
var handle = document.getElementById('ModalHandle');
var target = false;

function drag_start(event) {
    if (handle.contains(target)) {

        var style = window.getComputedStyle(event.target, null);
        event.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
    } else {
        e.preventDefault();
    }
}

function drag_over(event) {
    event.preventDefault();
    return false;
}

function drop(event) {
    var offset = event.dataTransfer.getData("text/plain").split(',');
    dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
    dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    event.preventDefault();
    return false;
}


dm.onmousedown = function(e) {
    target = e.target;
}

dm.ondragstart = function(e) {
    if (handle.contains(target)) {
        var style = window.getComputedStyle(e.target, null);
        e.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - e.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - e.clientY));
    } else {
        e.preventDefault();
    }
}

document.body.addEventListener('dragover', drag_over, false);
document.body.addEventListener('drop', drop, false);


$('#btnCloseModal').click(module.exports.closeModal);
$('#modal').click(function(e) {
    e.stopPropagation();
});
$(document).click(module.exports.closeModal);
