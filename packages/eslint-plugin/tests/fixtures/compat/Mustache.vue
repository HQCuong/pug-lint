<template lang="pug">
div
  p {{msg}}
  p {{   msg   }}
  p Hello {{ name }}!
  p {{ a+b }}
  p {{ 'literal' }}
  p {{ msg | capitalize }}
  p(:title="msg") {{ count * 2 }}
  p {{ this.msg }}
  p {{ obj['key'] }}
  p {{ fn( 1 ) }}
</template>

<script>
export default {
  data() {
    return { msg: 'm', name: 'n', a: 1, b: 2, count: 0, obj: {} }
  },
  methods: {
    fn(x) {
      return x
    },
  },
}
</script>
