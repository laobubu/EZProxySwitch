'use strict';

var FFversion = 0;
(() => {
    var ff = /Firefox\/(\d+)/.exec(navigator.userAgent);
    if (ff) FFversion = ~~ff[1];
})();

var app;
var data = {
    tab: 0,     // Profiles, AutoRules, Misc
}

browser.runtime.sendMessage("opt:pull").then((/** @type {GOptions} */o) => {
    Object.assign(data, o);

    app = new Vue({
        data,
        el: '#app',
    });
})
