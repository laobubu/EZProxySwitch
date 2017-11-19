<template>
  <div class="rg-edit">
    <NDEdit :target="rg">
      <label><input type="checkbox" v-model="rg.enabled">Enabled</label>
      <span style="width: 50px; display:inline-block"></span>
      <button @click="$emit('delete')">Delete</button>
    </NDEdit>

    <hr>

    <div>
      <p><label>Target: <select v-model.number="rg.profile">
        <option v-for="(profile, i) in profiles" :value="i">{{ profile.name }}</option>
        </select></label></p>
      <p><label>Type: <select v-model.number="rg.ruletype">
        <option value="0">AutoProxy</option>
        </select></label></p>
      <textarea spellcheck="false" class="w100 rawlines"
                v-text="rg.rules.join('\n')" @change="ev=>updateRules(ev.target.value)"></textarea>
      <p>
        <label>Subscribe: <input v-model="rg.subscribe.url" style="width:70%"></label>
        <button @click="updateSubscribe()">Update</button>
      </p>
    </div>
  </div>
</template>

<script>
// rg == rule group
// Events: "delete"

import NDEdit from "./NDEdit.vue";

export default {
  props: ["rg", "profiles"],
  components: {
    NDEdit
  },
  methods: {
    updateRules(str) {
      var lines = str.trim().split(/\n/g);
      this.rg.rules = lines;
    },
    updateSubscribe() {
      var subscribe = this.rg.subscribe;
      fetch(subscribe.url)
        .then(s => s.text())
        .then(t => {
          subscribe.last_update = +new Date();

          const B64RegEx = /^(?:[A-Za-z0-9+/]{4}\s*)*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
          if (B64RegEx.test(t.trim())) {
            // ouch, base64
            t = atob(t);
          }

          this.updateRules(t);
        });
    }
  }
};
</script>

<style lang="scss">
.rg-edit {
  .rawlines {
    height: 12em;
    resize: vertical;
  }
}
</style>
