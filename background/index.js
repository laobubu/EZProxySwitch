'use strict';

const proxyScriptURL = 'pac.js';
const optionURL = 'options/options.html';
const popupURL = 'popup/popup.html';

const iconTitle = 'EZ Proxy Switch: ';
const iconNormal = 'icons/basic.svg';
const iconGen = new IconGen('icons/connect.svg', '#F00', 24);

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

            if (options.profile_idx >= 0) {
                let profile = options.profiles[options.profile_idx];
                browser.browserAction.setTitle({ title: iconTitle + profile.name });
                iconGen.generate(profile.color).then(icon => browser.browserAction.setIcon({ imageData: icon }));
            } else {
                browser.browserAction.setTitle({ title: iconTitle + "Automatic" });
                browser.browserAction.setIcon({ path: iconNormal });
            }
        }
    }

    // enabled
    if ('enabled' in newopt && newopt.enabled !== options.enabled) {
        if (options.enabled = newopt.enabled) {
            browser.proxy.register(proxyScriptURL);
        } else {
            browser.proxy.unregister();
            browser.browserAction.setIcon({ path: iconNormal });
        }
    }
}

/**
 * Tell PAC script current configuration via sendMessage
 */
function updatePACConf() {
    browser.runtime.sendMessage(genPACSysConfig(options), { toProxyScript: true });
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
            options.profiles = new_options.profiles;
            options.ruleGroups = new_options.ruleGroups;
            applyOptions(new_options);
            updatePACConf();
        } else if (message === 'opt:pull') {
            // load options
            sendResponse(options);
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
                        values: [
                            ["", []],
                        ],
                        type: "classic",
                        color: "#C0C0C0",
                        hidden: false,
                    },

                    {
                        name: "Direct",
                        description: "Direct access without proxy",
                        values: [
                            ["", [
                                { type: 'direct' },
                            ]],
                        ],
                        type: "classic",
                        color: "#C0C0C0",
                        hidden: false,
                    },

                    {
                        name: "SOCK5 1080",
                        description: "A local proxy",
                        values: [
                            ["", [
                                { type: 'socks', host: '127.0.0.1', port: '1080' },
                                { type: 'direct' },
                            ]],
                        ],
                        type: "classic",
                        color: "#408080",
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
            options.profiles = s.profiles;
            options.ruleGroups = s.ruleGroups;
            applyOptions(s);
        })
}

loadOptions();
