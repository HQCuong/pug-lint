<template lang="pug">
div.card(:class="{ admin: isAdmin }")
	img.avatar(:src="avatarUrl"   alt="")
	.body
			span.name(  @click="$emit('select')"  ) {{ userName }}
			span.badge(v-if="isAdmin" ,  title='Administrator') admin
</template>

<script setup>
defineProps({ userName: String, avatarUrl: String, isAdmin: Boolean })
defineEmits(['select'])
</script>
