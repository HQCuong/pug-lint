<template lang="pug">
div
  MyIcon/
  MyIcon
  input(type="text")
  img(src="a.png")
  br
  span
  i
  MyComp(prop="x")/
  textarea
</template>

<script>
export default {
  components: { MyIcon: {}, MyComp: {} },
}
</script>
