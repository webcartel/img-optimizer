<template>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path
			:fill="fill"
			:d="icon"
		/>
	</svg>
</template>



<script setup>

const { icon } = defineProps({
	icon: String,
	fill: String
})

</script>



<style lang="scss" scoped>

</style>
