'use strict';

var FFversion = 0;
(() => {
    var ff = /Firefox\/(\d+)/.exec(navigator.userAgent);
    if (ff) FFversion = ~~ff[1];

    // Since Firefox 57, PAC may return an object.
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/proxy
    if (FFversion < 57) {
        let select = document.querySelector('#ptype');
        select.removeChild(select.children[1]);
    }
})();

/** @type {GOptions} */
var options = null;

var profileName = $$change('#pname', name => profileList.updateMV(options.profiles, { name }));
var profileColor = $$change('#pcolor', color => profileList.updateMV(options.profiles, { color }));
var profileDescription = $$change('#pdescription', description => profileList.updateMV(options.profiles, { description }));
var profileType = $$change("#ptype", type => description => profileList.updateMV(options.profiles, { type }));

var profileList = new ListRenderer(document.querySelector('#profiles .itemlist'));
profileList.updateChild = function (c, o, i) {
    c.firstElementChild.setAttribute('style', `color: ${o.color}`);
    c.lastChild.textContent = o.name;
};
profileList.onActive = function (idx) {
    var profile = options.profiles[idx];

    document.querySelector('#profiles main').style.display = profile ? '' : 'none';
    if (!profile) return;

    profileName.value = profile.name;
    profileColor.value = profile.color;
    profileDescription.value = profile.description;
    profileType.value = profile.type;
};

browser.runtime.sendMessage("opt:pull").then((/** @type {GOptions} */o) => {
    options = o;

    profileList.render(options.profiles);
    profileList.active(0);
})
