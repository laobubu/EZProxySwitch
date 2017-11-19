<template>
  <div class="profile-edit">
    <NDEdit :target="profile">
      <button v-if="!readonly" @click="$emit('delete')">Delete</button>
      <label><input type="checkbox" v-model="profile.hidden">Hide from popup</label>
    </NDEdit>

    <hr>

  <div  v-if="readonly">
    This Profile is read-only.
  </div>
  <div v-else>

    <div v-for="v in profile.values">
      <div v-if="0">
        For
        <select v-model="v[0]">
          <option value="">all connection</option>
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
          <option value="ftp">FTP</option>
        </select>
      </div>

      <ol>
        <li v-for="FFProxy in v[1]"><PEValue :data="FFProxy" /></li>
        <div><button title="Add an alternative connection method" @click="addFFProxy(v[1])">Add</button></div>
      </ol>

    </div>
  </div>
  </div>
</template>

<script>
// Events: "delete"

import NDEdit from "./NDEdit.vue";
import PEValue from "./PEValue.vue";

export default {
  props: ["profile", "readonly"],
  components: {
    NDEdit,
    PEValue
  },
  methods: {
    addFFProxy(list) {
      list.push({
        type: "direct",
        host: "",
        port: "",

        username: "", // SOCKS only
        password: "", // SOCKS only
        proxyDNS: false,
        failoverTimeout: 15000
      });
    }
  }
};
</script>

<style lang="scss">
.profile-edit {
}
</style>
