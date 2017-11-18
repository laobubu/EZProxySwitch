var opt2pac = {
  /**
   * Convert `FFProxy[]` to `PAC.Result`
   *
   * @param {FFProxy[]} values
   * @returns {PAC.Result}
   */
  toPACResult(values) {
    var retval = [];

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      let type = value.type;
      if (type === 'direct') retval.push('DIRECT');
      else retval.push(type.toUpperCase() + " " + value.host + ":" + value.port);
    }

    return retval.join(';');
  },

  /**
   * Escape strings so that they can be regexp. then, concate with '|'
   * Since a regexp shall not be too long, we separate it to multi RegExps.
   *
   * @param {string[]} strs pieces of strings.
   * @param {number} maxlen max length of a regexp
   *
   * @returns {string[]}
   */
  strs2regex(strs, maxlen = 128) {
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
  },

  /**
   * parse AutoProxy rule lines,
   * generate a `PAC.RuleGroupSerializable` without `profile` field.
   *
   * @param {string[]} rules
   * @returns {PAC.RuleGroupSerializable}
   */
  autoProxyCvt(rules) {
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

    /** @type {PAC.RuleGroupSerializable} */
    var retval = {
      path_regexs_p: strs2regex(included.contains).map(str => new RegExp(str)).concat(
        strs2regex(included.startsWith).map(str => new RegExp("^(?:" + str + ")")),
        strs2regex(included.endsWith).map(str => new RegExp("(?:" + str + ")$"))
      ),
      host_regexs_p: strs2regex(included.domain).map(str => new RegExp("^[-\w\.]*(?:" + str + ")$")),

      path_regexs_n: strs2regex(excluded.contains).map(str => new RegExp(str)).concat(
        strs2regex(excluded.startsWith).map(str => new RegExp("^(?:" + str + ")")),
        strs2regex(excluded.endsWith).map(str => new RegExp("(?:" + str + ")$"))
      ),
      host_regexs_n: strs2regex(excluded.domain).map(str => new RegExp("^[-\w\.]*(?:" + str + ")$")),

      profile: 0
    };
    return retval;
  },

  pproto2regex: {
    http: "^(?:ws|http):",
    https: "^(?:ws|http)s:",
    ftp: "^ftp:"
  },
};

(function () {
  var FFversion = 0;
  var ff = /Firefox\/(\d+)/.exec(navigator.userAgent);
  if (ff) FFversion = ~~ff[1];

  // Since Firefox 57, PAC may return an object.
  // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/proxy
  if (FFversion >= 57) {
    opt2pac.toPACResult = function (values) { return values; }
  }
})();

/**
 * Providing functions, generate `PAC.SysConfig` from `GOptions`
 *
 * @param {GOptions} options
 * @returns {PAC.SysConfig}
 */
function genPACSysConfig(options) {
  const d1 = opt2pac.pproto2regex;

  /** @type {PAC.ProfileSerializable[]} */
  var profiles = options.profiles.map(profile => profile.values.map(v => {
    return [
      v[0] && d1[v[0]] || "",
      opt2pac.toPACResult(v[1])
    ];
  }));

  /** @type {PAC.RuleGroupSerializable[]} */
  var ruleGroups = options.ruleGroups.map(ruleGroup => {
    /** @type {PAC.RuleGroupSerializable} */
    var retval = null;

    switch (ruleGroup.ruletype) {
      case 0: retval = opt2pac.autoProxyCvt(ruleGroup.rules); break;
      default: retval = { host_regexs_n: [], host_regexs_p: [], path_regexs_n: [], path_regexs_p: [] };
    }

    retval.profile = ruleGroup.profile;
    return retval;
  });

  /** @type {PAC.SysConfig} */
  var retval = {
    profiles,
    profile_idx: options.profile_idx,
    ruleGroups,
  }

  return retval;
}

export default genPACSysConfig;
