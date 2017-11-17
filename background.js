'use strict';

const proxyScriptURL = 'pac.js';
const optionURL = 'options/options.html';
const popupURL = 'popup/popup.html';

/** @type {GOptions} */
var options = {
    enabled: false,
    profile_idx: -1,

    // Default profiles and ruleGroups are declared in loadOptions()
    profiles: [],
    ruleGroups: [],
};

/**
 * update the `options` with `newopt`'s data
 * 
 * @param {GOptions} newopt 
 */
function applyOptions(newopt) {
    // profile_idx
    if ('profile_idx' in newopt && typeof newopt.profile_idx === 'number' && options.profile_idx !== newopt.profile_idx) {
        options.profile_idx = newopt.profile_idx;
        if (options.enabled) {
            browser.runtime.sendMessage({ profile_idx: options.profile_idx }, { toProxyScript: true });
        }
    }

    // enabled
    if ('enabled' in newopt && newopt.enabled !== options.enabled) {
        if (options.enabled = newopt.enabled) {
            browser.proxy.register(proxyScriptURL);
        } else {
            browser.proxy.unregister();
        }
    }
}

/**
 * Tell PAC script current configuration via sendMessage
 */
function updatePACConf() {
    browser.runtime.sendMessage({
        profiles: options.profiles,
        ruleGroups: options.ruleGroups,
        profile_idx: options.profile_idx,
    }, { toProxyScript: true });
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.url === browser.extension.getURL(proxyScriptURL)) {
        if (message === 'init') updatePACConf();
        else console.log(message);

        return;
    }

    if (sender.url === browser.extension.getURL(optionURL)) {
        if (message.type === 'opt:save') {
            // update options
            let new_options = message.data;
            applyOptions(new_options);
            updatePACConf();
        }

        return;
    }

    if (sender.url === browser.extension.getURL(popupURL)) {
        if (message === 'popup:list') {
            // send popup data
            sendResponse({
                profiles: options.profiles,
                profile_idx: options.profile_idx,
            });
        } else if (message.type === 'popup:select') {
            applyOptions({ profile_idx: message.profile_idx });
            sendResponse('OK');
        } else if (message === 'popup:refresh') {
            browser.tabs.reload();
        }

        return;
    }
});

function loadOptions() {
    return browser.storage.local.get()
        .then((/** @type{GOptions} */s) => {
            // Init and set default profiles
            if (!('enabled' in s)) {
                s.enabled = true;
            }

            if (!(s.profiles instanceof Array) || !s.profiles.length) {
                s.profiles = [
                    {
                        name: "System",
                        description: "Let system detect the proxy",
                        value: null,
                        color: "#EEE",
                        hidden: false,
                    },

                    {
                        name: "Direct",
                        description: "Direct access without proxy",
                        value: "DIRECT",
                        color: "#EEE",
                        hidden: false,
                    },

                    {
                        name: "SOCK5 1080",
                        description: "A local proxy",
                        value: "SOCKS 127.0.0.1:1080;DIRECT",
                        color: "#CCF",
                        hidden: false,
                    },
                ];
            }

            if (!(s.ruleGroups instanceof Array)) {
                s.ruleGroups = [];
            }

            if (typeof s.profile_idx !== 'number') {
                s.profile_idx = options.profile_idx;
            }

            // Use as current configuration
            applyOptions(s);
            options.profiles = s.profiles;
            options.ruleGroups = s.ruleGroups;
        })
}

loadOptions();
