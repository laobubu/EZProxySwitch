import Vue from 'vue'
import App from './App.vue'

browser.runtime.sendMessage("opt:pull").then((/** @type {GOptions} */o) => {
  window.data = o;
  window.app = new Vue({
    render: h => h(App),
    el: '#app',
  });
})
