<template>
  <div class="PEValue">
    <select v-model="data.type">
      <option value="direct">Direct</option>
      <option value="http">HTTP</option>
      <option value="https">HTTPS</option>
      <option value="socks4">SOCKS4</option>
      <option value="socks">SOCKS5</option>
    </select>

    <template v-if="data.type!=='direct'">
      <input v-model="data.host">
      <input v-model="data.port">
    </template>
  </div>
</template>

<script>
// Designed to edit `FFProxy` interface

export default {
  props: ["data"]
}
</script>

<style>

</style>
