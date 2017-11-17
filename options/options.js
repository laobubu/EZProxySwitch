'use strict';

browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.url !== browser.extension.getURL("background.js")) return;
    if (message["to"] !== "options") return;

    console.log(message);
});

browser.runtime.sendMessage("opt:pull");
