<template lang="pug">
div
  MyComp(
    a="1"
    b="2"
    c="3"
  ) text
  div(a="1" b="2" c="3" d="4") long
  div: span x
  p
    | multi
    | line
  div
    span a
    span b
  MyComp(a="1",
    b="2") y
  p(class="x") single {{ value }} line
  .card#main(v-show="value" :title="value")
    span.label.big text
</template>

<script>
export default {
  components: { MyComp: {} },
  data() {
    return { value: 1 }
  },
}
</script>
