<template lang="pug">
MyList
  template(v-slot:header="props") {{ props.title }}
  template(#default="{ item }") {{ item }}
  template(slot="footer") foot
  div(slot-scope="s") {{ s }}
  template(v-slot:extra="unused") extra
  template(v-slot:other) other
</template>

<script>
export default {
  components: { MyList: {} },
}
</script>
