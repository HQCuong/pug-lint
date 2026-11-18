<template lang="pug">
div
  div(class=cond ? "b a" : "c")
  div(class=["b", "a"])
  div(:class=`b ${cls}`)
  input(value=val disabled=flag :title=`t ${val}`)
  a(href=url target="_blank") link
</template>

<script>
export default {
  data() {
    return { cond: true, cls: 'x', val: '', flag: false, url: '/' }
  },
}
</script>
