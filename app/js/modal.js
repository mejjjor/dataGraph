var $ = require('../../node_modules/jquery/dist/jquery.min.js');

module.exports = {
    closeModal: function() {
        $('#modalNode').css('opacity', 0);
        $('#modalNode').css('pointer-events', 'none');
    },

    openModal: function(x, y) {
        $('#modalNode').css('opacity', 1);
        $('#modalNode').css('pointer-events', 'auto');
        if ($('#modalNode').css('left') == "0px") {
            $('#modalNode').css('left', x + "px");
            $('#modalNode').css('top', y + "px");
        }
    }
}

var dm = document.getElementById('modalNode');
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
