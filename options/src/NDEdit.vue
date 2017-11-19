<template>
  <div class="ndedit">
    <div class="part1">
      <label title="Change Color" class="color input-thin" :style="`background: ${target.color}`"><input type="color" v-model="target.color"></label>
      <input type="text" v-model="target.name" class="w100 input-thin p-name" placeholder="Name">
      <input type="text" v-model="target.description" class="w100 input-thin p-desc" placeholder="Description">
    </div>
    <div class="actions"><slot/></div>
  </div>
</template>

<script>
// Edit Name and Description

export default {
  props: ["target"]
};
</script>

<style lang="scss">
.ndedit {
  $name-height: 48px;
  $name-margin: 5px;

  .part1 {
    position: relative;
    min-height: $name-height;
    margin-left: $name-height+$name-margin;

    .p-name {
      font-size: 16px;
      padding: 5px;
    }

    .p-desc {
      color: #999;
      padding: 0 5px;
    }

    .color {
      display: block;
      cursor: pointer;
      position: absolute;
      left: - $name-height - $name-margin;
      top: 50%;
      margin-top: - $name-height/2;
      height: $name-height;
      width: $name-height;
      border-radius: 100%;

      input {
        display: none;
      }
    }
  }

  .actions {
    margin-left: $name-height+$name-margin;
    padding: 5px;

    label {
      font-size: 0.89em;
    }
  }
}
</style>
