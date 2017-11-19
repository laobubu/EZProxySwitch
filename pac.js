/* exported FindProxyForURL */
'use strict';

/** @type {PAC.Profile} */
var cur_profile;

/** @type {number} */
var profile_idx;

/** @type {PAC.Profile} */
var profiles;

/** @type {{test: PAC.RuleTester, profile: PAC.Profile}[]} */
var ruleGroups;

/** Send message to background.js */
var debugging = false;

/////////////////////////////////////////////////////////////////////////////////////////
///

if (typeof NOT_PAC === 'undefined') {

    browser.runtime.onMessage.addListener((/** @type {PAC.SysConfig} */ message) => {
        if ('profiles' in message) {
            profiles = message.profiles.map(profile => profile.map(p => [
                (p[0] && new RegExp(p[0]) || null),
                (p[1])
            ]));
        }

        if ('ruleGroups' in message) {
            function toRegExp(str) { return new RegExp(str) }

            ruleGroups = message.ruleGroups.map(rg => {
                var path_regexs_n = rg.path_regexs_n.map(toRegExp);
                var host_regexs_n = rg.host_regexs_n.map(toRegExp);
                var path_regexs_p = rg.path_regexs_p.map(toRegExp);
                var host_regexs_p = rg.host_regexs_p.map(toRegExp);

                return {
                    test(path, host) {
                        var r1 = path_regexs_n;
                        var i;

                        for (i = 0; i < r1.length; i++) if (r1[i].test(path)) return false;

                        r1 = host_regexs_n;
                        for (i = 0; i < r1.length; i++) if (r1[i].test(host)) return false;

                        r1 = path_regexs_p;
                        for (i = 0; i < r1.length; i++) if (r1[i].test(path)) return true;

                        r1 = host_regexs_p;
                        for (i = 0; i < r1.length; i++) if (r1[i].test(host)) return true;

                        return false;
                    },
                    profile: profiles[rg.profile]
                }
            });
        }

        if ('profile_idx' in message) {
            profile_idx = message.profile_idx;
            if (profile_idx >= 0) cur_profile = profiles[profile_idx];
            else cur_profile = null;
        }

        if ('debugging' in message) {
            debugging = !!message.debugging;
        }

        if (debugging) {
            browser.runtime.sendMessage(JSON.stringify(profiles));
            browser.runtime.sendMessage(JSON.stringify(ruleGroups));
            browser.runtime.sendMessage(JSON.stringify(profile_idx));
        }
    });

    cur_profile = null;
    profile_idx = 0;
    browser.runtime.sendMessage("pac:init");
}

/**
 * PAC Handler
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_%28PAC%29_file#Return_value_format
 *
 * @param {string} path  See the URL above, something like "https://laobubu.net" by default.
 * @param {string} host  Hostname without scheme and port number.
 */
function FindProxyForURL(path, host) {
    if (debugging) {
        browser.runtime.sendMessage(`Checking ${path}, host ${host}, pfidx = ${profile_idx}, curval = ${JSON.stringify(cur_profile)}`)
    }

    /** @type {PAC.Profile} */
    var retval = null;

    if (profile_idx === -1) {
        for (let i = 0; i < ruleGroups.length; i++) {
            const rg = ruleGroups[i];
            if (rg.test(path, host)) {
                retval = rg.profile;
                break;
            }
        }
    } else {
        retval = cur_profile;
    }

    if (!retval) return null;

    for (let i = 0; i < retval.length; i++) {
        const li = retval[i];
        const rule = li[0];
        if (!rule || rule.test(path)) return li[1];
    }

    return null; // Mess up
}
