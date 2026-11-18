<template lang="pug">
div
  my-component(foo="1")
  MyComponent(foo="2")
  router-link(to="/" tag="li") Home
  Transition
    div(v-if="open") hi
  component(is="MyComponent")
  table
    tr(is="vue:my-row")
  UnknownThing
  button Click
  keep-alive
    MyComponent
  Teleport(to="body")
    span t
</template>

<script>
import MyComponent from './MyComponent.vue'
import Unused from './Unused.vue'

export default {
  name: 'components',
  components: { MyComponent, Unused },
  data() {
    return { open: false }
  },
}
</script>
