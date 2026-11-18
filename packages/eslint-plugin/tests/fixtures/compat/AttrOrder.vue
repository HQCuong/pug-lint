<template lang="pug">
div
  MyButton(@click="onClick", :fooBar="x", title='hi', v-if="show") Save
  input(v-model="name"   type="text" :class="[a,b]"  id='name')
  my-input(v-bind:value="val" v-on:input="val = $event" ref="input" key="k")
  a(href="#"   v-bind:title="title") link
  span(class="b"  :class="{ active: isActive }" v-show="visible") text
  img(alt="x" src="a.png" :data-fooBar="x")
  a(href = "#" title= "t") eq
</template>

<script>
export default {
  name: 'AttrOrder',
  components: { MyButton: {}, MyInput: {} },
  data() {
    return { x: 1, show: true, name: '', a: 'a', b: 'b', val: '', title: 't', isActive: false, visible: true }
  },
  methods: {
    onClick() {},
  },
}
</script>
