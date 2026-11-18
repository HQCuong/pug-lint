<template lang="pug">
section
  div(v-html="raw")
  p(v-text="msg")
  MyComp(v-html="raw")
  span(v-text="msg") inner text
  div(v-html="raw") child
</template>

<script>
export default {
  components: { MyComp: {} },
  data() {
    return { raw: '<b>x</b>', msg: 'hi' }
  },
}
</script>
