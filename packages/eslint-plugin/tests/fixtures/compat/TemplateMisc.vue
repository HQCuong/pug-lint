<template lang="pug">
div
  template(key="k") keyed
  MyList
    template(scope="s") {{ s }}
  table
    tr(is="my-row")
    tr(v-is="'my-row'")
  div(:foo="a" foo="b") dup
  div(class="b a a") classes
  div(:class="[{ a: x }, { b: y }]") objects
  a(href="http://example.com" target="_blank") out
  textarea {{ msg }}
  div(v-for="msg in list" :key="msg") {{ msg }}
  div(v-if="a") a
  div(v-else v-for="x in list" :key="x") b
  template(class="x") y
  div(v-if="!a") neg
  div(v-else) pos
  MyComp(v-if="a")
  MyComp(v-else)
  div(v-bind:foo) nobind
  div(v-cloak="x") cloak
  div(v-else-if="x") orphan
  div(v-html) nohtml
  div(v-memo) nomemo
  div(v-once="x") once
  div(v-pre="x") pre
  div(v-text) notext
  div(v-is) nois
  div(v-slot="x") badslot
  Transition
    div plain
  div(class="forbidden" title="t") restricted
  MyComp(:show="true")
  MyComp(:modelValue="msg" @update:modelValue="msg = $event")
  button(@click="console.log(1)") log
  div(v-if="true") constant
  p(:a="foo_bar" :b="[1,,2]" :c="9007199254740993" :d="!a ? 1 : 2" :e="{ b: b }" :f="'x' + y")
  p(:g="! a" @click="()=>go()" @dblclick="() => {go()}" @mousedown="go ()" :h="(a)" :i="{ a: 1, b: 2 }")
  div(v-for="{} in list") empty
  slot(name="foo_bar")
  //
    multi
      line comment
</template>

<script>
export default {
  components: { MyList: {}, MyComp: {} },
  data() {
    return { a: 1, b: 2, x: 1, y: 2, msg: '', list: [], foo_bar: 1 }
  },
  methods: {
    go() {},
  },
}
</script>
