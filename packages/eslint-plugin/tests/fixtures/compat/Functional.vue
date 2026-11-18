<template lang="pug" functional>
div
  p {{ props.msg }}
</template>

<script>
export default {
  props: { msg: String },
}
</script>
