<template lang="pug">
div
  MyInput(v-model="value" :foo.sync="bar")
  input(v-model="value" :value="value")
  div(v-model="value")
  input(v-model.trim.trim="text")
  input(:disabled="true" :title="'static'")
  span(:class="'static-class'")
  input(v-model="items[0]")
  input(v-model:foo="text")
  Transition
    div(v-show="x") t
  button(:type="'button'") b
</template>

<script>
export default {
  components: { MyInput: {} },
  data() {
    return { value: '', bar: 1, text: '', items: [], x: true }
  },
}
</script>
