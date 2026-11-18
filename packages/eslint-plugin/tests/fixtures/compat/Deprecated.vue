<template lang="pug">
div
  p {{ $listeners }}
  p {{ $scopedSlots.default }}
  MyComp(v-bind="$attrs" v-on="$listeners")
  router-link(to="/a" tag="button") go
  div(inline-template) x
  MyComp(v-bind:prop.sync="value")
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  components: { MyComp: {} },
  data() {
    return { value: 1 }
  },
  beforeDestroy() {},
  destroyed() {
    this.$set(this, 'a', 1)
  },
})
</script>
