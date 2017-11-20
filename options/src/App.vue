<template>
  <div id="app">
    <aside class="app-aside">
      <div class="actions">
        <button :disabled="!changed" @click="save()">Save Changes</button>
      </div>

      <div class="title">Profiles</div>

      <div class="profiles">
        <div class="item" @click="toProfile(i)" :class="{active: profile_idx===i}" v-for="(profile, i) in opt.profiles" :key="'profile-'+i">
          <div class="color" :style="`background: ${profile.color}`"></div>
          <span class="name" v-text="profile.name"></span>
        </div>
        <div class="item" @click="addProfile()">
          New...
        </div>
      </div>

      <div class="title">Rule Groups</div>

      <div class="ruleGroups">
        <div class="item" @click="toRG(i)" :class="{active: rg_idx===i, disabled: !rg.enabled}" v-for="(rg, i) in opt.ruleGroups" :key="'rg-'+i">
          <div class="color" :style="`background: ${rg.color}`"></div>
          <span class="name" v-text="rg.name"></span>
        </div>
        <div class="item" @click="addRG()">
          New...
        </div>
      </div>

      <div class="title">Misc</div>

      <div class="item" @click="toTab(2)" :class="{active: tab_idx===2}">
        Debugger
      </div>
    </aside>

    <ProfileEdit :profile="profile" v-if="profile" @delete="delProfile" :readonly="profile_idx<=1" />
    <RGEdit :rg="rg" :profiles="opt.profiles" v-if="rg" @delete="delRG" />
    <XDebugger v-if="tab_idx==2" />
  </div>
</template>

<script>
import ProfileEdit from "./ProfileEdit.vue";
import RGEdit from "./RGEdit.vue";
import XDebugger from "./XDebugger.vue";

export default {
  name: "app",
  components: {
    ProfileEdit,
    RGEdit,
    XDebugger
  },
  data() {
    return {
      changed: false,

      tab_idx: -1, // -1 welcome. 0 Profile Editor. 1 RuleGroup Editor . 2 Debugger
      profile_idx: -1,
      rg_idx: -1, // rulegroup

      hl_rgs: {}, // highlight rulegroups. key is the index.

      opt: window.data
    };
  },
  mounted() {
    this.toProfile(0);
    this.$watch("opt", () => (this.changed = true), { deep: true });
    window.onbeforeunload = e => {
      if (!this.changed) return;

      const msg = "You might forget to click Save Changes before closing.";
      e = e || window.event;

      if (e) e.returnValue = msg;
      return msg;
    };
  },
  computed: {
    profile() {
      var i = this.profile_idx;
      return (i >= 0 && this.tab_idx === 0 && this.opt.profiles[i]) || null;
    },
    rg() {
      var i = this.rg_idx;
      return (i >= 0 && this.tab_idx === 1 && this.opt.ruleGroups[i]) || null;
    }
  },
  methods: {
    save() {
      this.changed = false;
      browser.runtime
        .sendMessage({
          type: "opt:save",
          data: this.opt
        })
        .then(res => {
          if (res !== true) {
            alert(res);
            this.changed = true;
          }
        });
    },

    toProfile(i) {
      this.toTab(0);
      this.profile_idx = i;
    },

    toRG(i) {
      this.toTab(1);
      this.rg_idx = i;
    },

    toTab(i) {
      this.tab_idx = i;
      this.profile_idx = this.rg_idx = -1;
    },

    addProfile() {
      /** @type {Profile[]} */
      var pfs = this.opt.profiles;
      pfs.push({
        name: "Profile #" + (pfs.length + 1),
        description: "",
        values: [["", [{ type: "direct", host: "", port: "" }]]],
        color: "#DDD",
        hidden: false
      });
      this.toProfile(pfs.length - 1);

      this.$nextTick(function() {
        document.querySelector(".profile-edit .p-name").select();
      });
    },

    delProfile() {
      var i = this.profile_idx;
      if (i <= 1) {
        alert("You can't delete built-in profiles.");
        return;
      }

      /** @type {RuleGroup[]} */ var rgs = this.opt.ruleGroups;
      /** @type {number[]} */ var bad_rgs = [];
      rgs.forEach(rg => {
        if (rg.profile < i) return;
        else if (rg.profile === i) {
          bad_rgs.push(i);
          this.hl_rgs[i] = true;
        } else rg.profile--;
      });

      if (bad_rgs.length) {
        alert(
          `Found ${bad_rgs.length} ruleGroups affected. Please correct them manually.`
        );
      }

      /** @type {Profile[]} */
      var pfs = this.opt.profiles;
      pfs.splice(i, 1);
      this.toProfile(i >= pfs.length ? pfs.length - 1 : i);
    },

    addRG() {
      /** @type {RuleGroup[]} */
      var rgs = this.opt.ruleGroups;
      rgs.push({
        name: "RuleGroup #" + (rgs.length + 1),
        description: "",
        color: "#DDD",

        enabled: true,
        profile: 0,

        ruletype: 0, // AutoProxy
        rules: []
      });
      this.toRG(rgs.length - 1);

      this.$nextTick(function() {
        document.querySelector(".rg-edit .p-name").select();
      });
    },

    delRG() {
      var i = this.rg_idx;
      /** @type {RuleGroup[]} */
      var pfs = this.opt.ruleGroups;
      pfs.splice(i, 1);
      this.toRG(i >= pfs.length ? pfs.length - 1 : i);
    }
  }
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  height: 100%;
  font-size: 15px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 120%;
}

input,
select,
textarea {
  box-sizing: border-box;
}

hr {
  border: 0;
  border-bottom: 1px solid #999;
}

// some useful stuff.

.w100 {
  width: 100%;
  display: block;
}

.input-thin {
  border: 1px solid transparent;
  &:hover,
  &:focus {
    border-color: #999;
  }
}

////////////////////////////////////

$aside-width: 250px;
#app {
  min-height: 100%;
  margin-left: $aside-width;
  padding: 5px;
  box-sizing: border-box;
}

.app-aside {
  overflow: auto;
  box-sizing: border-box;
  width: $aside-width;
  left: 0;
  top: 0;
  position: fixed;
  height: 100%;
  border-right: 1px solid #999;

  .actions {
    margin-top: 10px;
    text-align: center;
    button {
      padding: 3px 5px;
    }
  }

  .title {
    margin-top: 1em;
    padding: 5px;
    color: #999;
  }

  .item {
    padding: 5px;
    padding-left: calc(5px + 1em);
    border-bottom: 1px solid #eee;
    color: #666;
    cursor: pointer;

    &:hover,
    &:focus {
      background-color: #eee;
    }

    &.active {
      background-color: #eef;
      color: #000;
    }

    &.disabled {
      .name {
        text-decoration: line-through;
        font-style: italic;
      }

      &:after {
        content: " (disabled)";
        color: #999;
      }
    }

    .color {
      display: inline-block;
      margin-left: -0.7em;
      width: 0.7em;
      height: 0.7em;
      vertical-align: baseline;
      border-radius: 100%;
    }
  }
}
</style>
