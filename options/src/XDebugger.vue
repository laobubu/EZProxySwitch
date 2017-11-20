<template>
  <div>
    <div v-if="loading">Loading...</div>
  </div>
</template>

<script>
window.NOT_PAC = true;

export default {
  data() {
    return {
      loading: true
    };
  },
  mounted() {
    var script = document.createElement("script");
    script.src = "/pac.js";
    script.onload = () => {
      var pac = new PACIns();
      window.$pac = this.$pac = pac;
      browser.runtime.sendMessage("opt:dbg").then(sysCfg => {
        pac.loadSysConfig(sysCfg);
        this.loading = false;
      });
    };
    document.body.appendChild(script);
    this.$pacScript = script;
  },
  beforeDestroy(){
    document.body.removeChild(this.$pacScript);
  }
};
</script>

<style>

</style>
