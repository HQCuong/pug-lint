<template lang="pug">
div
  p {{ myProp }}
  button(@click="myProp = 'x'") mutate
  ChildComp(:someValue="myProp" some-other="1" :list="list")
  p {{ undefinedThing }}
</template>

<script>
export default {
  components: { ChildComp: {} },
  props: {
    myProp: String,
    'other-prop': { type: Number },
    flag: Boolean,
    list: { type: Array, default: [] },
    raw: {},
  },
  data: { a: 1 },
  computed: {
    c() {
      this.a = 2
      return 1
    },
    unusedComputed() {
      return 2
    },
  },
}
</script>
