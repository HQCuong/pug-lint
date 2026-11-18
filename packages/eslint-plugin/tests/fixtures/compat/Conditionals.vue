<template lang="pug">
div
  p(v-if="a") one
  p(v-else-if="a") dup
  p(v-else) three
  span(v-else) orphan
  div(v-if="b" v-else) both
  template(v-if="c") c
  template
    span lone
  div(style="color: red") styled
  //no space comment
  //-   spaced comment
  div(ref="unused") r
  div(v-if="") empty
  div(v-show) noval
</template>

<script>
export default {
  data() {
    return { a: 1, b: 2, c: 3 }
  },
}
</script>
