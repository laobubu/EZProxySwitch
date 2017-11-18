/* exported FindProxyForURL */
'use strict';

/** @type {PACResult} */
var cur_profile;

/** @type {number} */
var profile_idx;

/** @type {PACResult[]} */
var profiles;

/** @type {{tester: AutoProxyTester, value: PACResult}[]} */
var ruleGroups;

/////////////////////////////////////////////////////////////////////////////////////////
///

/**
 * Escape strings, concate with '|'
 *
 * @param {string[]} strs pieces of strings.
 * @param {number} maxlen max length of a regexp
 *
 * @returns {string[]}
 */
function strs2regex(strs, maxlen = 128) {
    var buffer = "";
    var retval = [];
    for (let i = 0; i < strs.length; i++) {
        let str = strs[i];
        str = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

        buffer += "|" + str;
        if (buffer.length > maxlen) {
            retval.push(buffer.substr(1));
            buffer = "";
        }
    }

    if (buffer.length) {
        retval.push(buffer.substr(1));
    }

    return retval;
}

class AutoProxyTester {
    /**
     * @param {string[]} rules
     */
    constructor(rules) {
        var included = {
            contains: [],
            endsWith: [],
            startsWith: [],
            domain: [],
        };

        var excluded = {
            contains: [],
            endsWith: [],
            startsWith: [],
            domain: [],
        };

        // populate `included` and `excluded`
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i].trim();
            if (!rule.length || rule[0] === '!') continue;

            let target = included;
            if (rule.substr(0, 2) === '@@') {
                target = excluded;
                rule = rule.substr(2);
            }

            if (rule.substr(0, 2) === '||') {
                target.domain.push(rule.substr(2));
            } else if (rule[0] === '|') {
                target.startsWith.push(rule.substr(1));
            } else if (rules.slice(-1) === '|') {
                target.endsWith.push(rule.slice(0, -1));
            } else {
                target.contains.push(rule);
            }
        }

        // construct regexp
        this.path_regexs_p = strs2regex(included.contains).map(str => new RegExp(str)).concat(
            strs2regex(included.startsWith).map(str => new RegExp("^(?:" + str + ")")),
            strs2regex(included.endsWith).map(str => new RegExp("(?:" + str + ")$"))
        );
        this.host_regexs_p = strs2regex(included.domain).map(str => new RegExp("^[-\w\.]*(?:" + str + ")$"));

        this.path_regexs_n = strs2regex(excluded.contains).map(str => new RegExp(str)).concat(
            strs2regex(excluded.startsWith).map(str => new RegExp("^(?:" + str + ")")),
            strs2regex(excluded.endsWith).map(str => new RegExp("(?:" + str + ")$"))
        );
        this.host_regexs_n = strs2regex(excluded.domain).map(str => new RegExp("^[-\w\.]*(?:" + str + ")$"));
    }

    /**
     *
     * @param {string} path
     * @param {string} host
     * @returns {boolean}
     */
    test(path, host) {
        var r1 = this.path_regexs_n;
        for (let i = 0; i < r1.length; i++) if (r1[i].test(path)) return false;

        r1 = this.host_regexs_n;
        for (let i = 0; i < r1.length; i++) if (r1[i].test(host)) return false;

        r1 = this.path_regexs_p;
        for (let i = 0; i < r1.length; i++) if (r1[i].test(path)) return true;

        r1 = this.host_regexs_p;
        for (let i = 0; i < r1.length; i++) if (r1[i].test(host)) return true;

        return false;
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
///

if (typeof NOT_PAC === 'undefined') {

    browser.runtime.onMessage.addListener((/** @type {PACMessage} */ message) => {
        if ('profiles' in message) {
            profiles = message.profiles.map(p => p.value);
        }

        if ('ruleGroups' in message) {
            let r1 = message.ruleGroups;
            ruleGroups = [];
            for (let i = 0; i < r1.length; i++) {
                const rule = r1[i];
                let tester = null;
                switch (rule.ruletype) {
                    case 0: //AutoProxy
                        tester = new AutoProxyTester(rule.rules);
                        break;
                    default:
                        throw new Error("Not supported RuleType " + rule.ruletype + ". Found at RuleGroup #" + i);
                }

                ruleGroups.push({
                    tester,
                    value: profiles[rule.profile],   // TODO: support cascaded RuleGroup
                });
            }
        }

        if ('profile_idx' in message) {
            profile_idx = message.profile_idx;
            if (profile_idx >= 0) cur_profile = profiles[profile_idx];
            else cur_profile = null;
        }

    });

    cur_profile = null;
    profile_idx = 0;
    browser.runtime.sendMessage("init");
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
    browser.runtime.sendMessage(`Checking ${path}, host ${host}, pfidx = ${profile_idx}, curval = ${JSON.stringify(cur_profile)}`)

    if (profile_idx === -1) {
        for (let i = 0; i < ruleGroups.length; i++) {
            const rg = ruleGroups[i];
            if (rg.tester.test(path, host)) return rg.value;
        }

        // None of group matches. Let system detect.
        return null;
    }

    return cur_profile;
}
