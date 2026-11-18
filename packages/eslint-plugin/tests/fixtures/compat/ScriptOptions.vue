<template lang="pug">
div
  p {{ total }} {{ total() }}
  button(@click="save") save
</template>

<script>
import Vue from 'vue'

Vue.config.keyCodes.f1 = 112

export default {
  name: 'button',
  props: {
    msg: String,
    flag: { type: Boolean, default: true },
    kind: { type: [String, Boolean] },
    size: { type: 'Number' },
    count: { type: Number, required: true, default: 1 },
    data: String,
    key: String,
    items: {
      type: Array,
      default() {
        return this.msg
      },
    },
  },
  emits: {
    save() {},
  },
  model: { prop: 'value' },
  data() {
    return { msg: 1, now: this.total }
  },
  computed: {
    total() {
      return 1
    },
    async later() {
      return 1
    },
    nothing() {},
  },
  watch: {
    msg: () => {},
  },
  methods: {
    save() {
      this.$on('x', () => {})
      this.$emit('fooBar', 1, 2)
      this.$nextTick(() => {})
      this.$nextTick
    },
    total() {},
  },
  beforeRouteEnter() {
    this.msg = 1
  },
  render() {},
  mehtods: {},
}
</script>
