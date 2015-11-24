var noUiSlider = require('../../node_modules/nouislider/distribute/nouislider.min.js')
var minDate, maxDate;
var startDate, endDate;
var dateSlider = document.getElementById('dateSlider');
var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];
var months = [
    "Janvier", "Février", "Mars",
    "Avril", "Mai", "Juin", "Juillet",
    "Août", "Septembre", "Octobre",
    "Novembre", "Décembre"
];
var updateHook;
module.exports = {
    setDateRange: function(min, max) {
        minDate = min;
        maxDate = max;
    },
    setDateStart: function(start, end) {
        startDate = start;
        endDate = end;
    },
    refreshSlider: function() {
        refreshSlider();
    },
    updateHook: function(fn) {
        updateHook = fn;
    }

}

function refreshSlider() {
    dateSlider.innerHTML = "";
    if (minDate.getTime() < 1230764400000 && 1230764400000 < maxDate.getTime()) {
        noUiSlider.create(dateSlider, {
            range: {
                //10% GROS HACK for my graph!
                '10%': new Date("2009/01").getTime(),
                'min': minDate.getTime(),
                'max': maxDate.getTime()
            },
            step: 32 * 24 * 60 * 60 * 1000,
            start: [startDate != "" ? startDate.getTime() : minDate.getTime(), endDate != "" ? endDate.getTime() : maxDate.getTime()],
        });
    } else {
        noUiSlider.create(dateSlider, {
            range: {
                'min': minDate.getTime(),
                'max': maxDate.getTime()
            },
            step: 32 * 24 * 60 * 60 * 1000,
            start: [startDate != "" ? startDate.getTime() : minDate.getTime(), endDate != "" ? endDate.getTime() : maxDate.getTime()],
        });
    }
    dateSlider.noUiSlider.on('update', function(values, handle) {
        dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
        updateHook(values);
    });
}

function formatDate(date) {
    return months[date.getMonth()] + " " +
        date.getFullYear();
}
