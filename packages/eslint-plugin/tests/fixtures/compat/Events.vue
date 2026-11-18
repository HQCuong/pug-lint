<template lang="pug">
div
  MyComp(@customEvent="onCustom" v-on:click.native="onClick")
  button(@click="onClick" @click.ctrl="onCtrl") a
  input(@keyup.13="submit" @keydown.enter="submit")
  button(v-on:click="onClick()") b
  form(@submit.prevent.prevent="submit")
  button(@click="$emit('fooBar')") emit
  button(@click="") empty
</template>

<script>
export default {
  components: { MyComp: {} },
  methods: {
    onCustom() {},
    onClick() {},
    onCtrl() {},
    submit() {
      this.$emit('submitted')
    },
  },
}
</script>
