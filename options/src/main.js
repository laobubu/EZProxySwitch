import Vue from 'vue'
import App from './App.vue'

/** @type {Vue} */
var app;
var data = {
    tab: 0,     // Profiles, AutoRules, Misc
};

window.app = app;
window.data = data;

browser.runtime.sendMessage("opt:pull").then((/** @type {GOptions} */o) => {
  Object.assign(data, o);

  app = new Vue({
    render: h => h(App),
    el: '#app',
  });
})
