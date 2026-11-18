<template lang="pug">
div
  Foo(:a="[1,2]" :b="{a:1}" :c="x==1" :d="obj['key']" :e="'a' + 'b'" :f="fn( 1 )" :g="cond ? 'x':'y'")
  button(@click="count++") inc
  button(@click="handle()") call
  button(@click="() => handle()") arrow
  input(:value="text" @input="text = $event.target.value")
  Foo(:h="[ 1, 2 ]" :i="{ a: 1, }" :j="a||b" :k="!!flag")
</template>

<script>
export default {
  components: { Foo: {} },
  data() {
    return { x: 1, obj: {}, cond: true, count: 0, text: '', a: 1, b: 2, flag: false }
  },
  methods: {
    fn(v) {
      return v
    },
    handle() {},
  },
}
</script>
