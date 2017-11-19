namespace PAC {
  type Result = string | Array<FFProxy>;
  type Profile = Array<[RegExp, Result]>;     // Only used in pac.js
  type ProfileSerializable = Array<[string, Result]>;     // Only used when background script sends to pac.js

  type RuleTester = (path: string, host: string) => boolean;

  interface RuleGroup {   // Tend to use in pac.js, but not. Closure is enough.
    path_regexs_n: RegExp[]
    path_regexs_p: RegExp[]
    host_regexs_n: RegExp[]
    host_regexs_p: RegExp[]

    profile: Profile
  }

  interface RuleGroupSerializable {   // Only used when background script sends to pac.js
    path_regexs_n: string[]
    path_regexs_p: string[]
    host_regexs_n: string[]
    host_regexs_p: string[]

    profile: number
  }

  /** message from background to pac.js */
  interface SysConfig {
    profile_idx: number
    profiles?: ProfileSerializable[]
    ruleGroups?: RuleGroupSerializable[]
    debugging?: boolean         // Send messages to background.js
  }
}

type ProfileProtocol = "" | "http" | "https" | "ftp";

interface FFProxy {
  type: "http" | "https" | "socks4" | "socks" | "direct"
  host: string
  port: string

  username?: string // SOCKS only
  password?: string // SOCKS only
  proxyDNS?: boolean
  failoverTimeout?: number
}

interface Profile {
  name: string
  values: Array<[ProfileProtocol, FFProxy[]]>
  description: string
  color: string
  hidden: boolean  // hidden from popup.
}

interface RuleGroup {
  enabled: boolean
  name: string
  description: string
  color: string

  profile: number
  subscribe: {
    last_update: number,
    obfs: string,       // "", "base64" etc
    url: string,
  }

  /** @see DOCUMENT.md */
  ruletype: number
  rules: string[]
}

interface GOptions {
  enabled: boolean

  profiles: Profile[]
  ruleGroups: RuleGroup[]

  /**
   * Current using profile index.
   *
   * >=0      Using a profile
   * -1       Using rules
   */
  profile_idx: number
}
