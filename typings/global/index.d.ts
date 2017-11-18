type PACResult = string;

interface Profile {
    name: string
    value: PACResult
    description: string
    color: string
    hidden: boolean  // hidden from popup.
}

interface RuleGroup {
    enabled: boolean
    name: string

    profile: number

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

/** message sent to PAC.js */
interface PACMessage {
    profile_idx: number
    profiles?: Profile[]
    ruleGroups?: RuleGroup[]
}