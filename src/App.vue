<template>
	<div class="" id="app">

		<div
			class="flex mx-auto w-[384px] h-[160px] border-[#616778] border-[2px] rounded-[15px] border-dashed"
			v-cloak=""
			@drop.prevent="addFile"
			@dragover.prevent=""
		></div>

		<div class="files">
			<ul>
				<li v-for="file in files" :key="file.file_data.name">

					<span>{{ file.file_data.name }} ({{ file.file_data.size | kb }} kb)</span>

					<div class="bar">
						<div
							class="progress"
							:style="{ width: file.progress + '%' }"
						></div>
					</div>

				</li>
			</ul>
		</div>

	</div>
</template>



<script setup>
import { ref } from 'vue'
import axios from 'axios'

const files = ref([])


const kb = (val) => Math.floor(val / 1024)

function addFile(e) {

	const droppedFiles = e.dataTransfer.files

	if (!droppedFiles) return

	[...droppedFiles].forEach((file, i, arr) => {

		files.value.push({
			file_data: file,
			file_sign: file.name,
			progress: 0,
			loaded: false,
			loaded_data: {},
		});

		if (arr.length - 1 === i) {
			upload()
		}

	});
}

function upload() {

	let delay = 500
	let i = 0

	let tid = setTimeout(function tick() {

		if (files.value.length != i && !files.value[i].loaded) {

			const formData = new FormData()
			formData.append("file", files.value[i].file_data)
			const file_sign = files.value[i].file_sign
			
			axios({
				method: "post",
				url: "http://localhost:5001/upload",
				data: formData,

				onUploadProgress: function (progressEvent) {

					files.value.forEach((item, i, arr) => {
						if (file_sign == item.file_sign) {
							let progress = progressEvent.loaded / (progressEvent.total / 100)
							files.value[i].progress = progress
						}
					})

				},

			})
				.then(function (resp) {

					files.value.forEach((item, i, arr) => {
						if (file_sign == item.file_sign) {
							files.value[i].loaded = true
							files.value[i].loaded_data = resp.data
						}
					})
					
				})

			i++

		} else {

			clearInterval(tid)

		}

		tid = setTimeout(tick.bind(this), delay)

	}, delay)
}

function download() {
	files.value.forEach((file, i, arr) => {})
}

</script>
