<template>
	<div>

		<div class="h-[100px]"></div>

		<div
			class="flex justify-center items-center mx-auto mb-[80px] w-[384px] h-[160px] border-[#616778] border-[2px] rounded-[15px] border-dashed"
			v-cloak=""
			@drop.prevent="addFile"
			@dragover.prevent=""
		>Перетащите файлы сюда</div>

		<div class="mx-auto max-w-[600px]">
			<ul>
				<li
					class="flex h-[56px]"
					v-for="file in files"
					:key="file.file_data.name">

					<div class="relative top-[17px] mr-[10px] text-[13px] text-[#9B9B9B]">{{ kb(file.file_data.size) }} kb</div>

					<div class="flex-auto">
						<div class="mb-[3px] text-[15px]">{{ file.file_data.name }}</div>
	
						<div class="w-full h-[6px] bg-[#eeeeee] rounded-[3px]">
							<div
								class="w-full h-[6px] bg-[#8FCB60] rounded-[3px] transition-all duration-300"
								:style="{ width: file.progress + '%' }"
							></div>
						</div>
					</div>

					<div class="relative top-[17px] ml-[10px] text-[13px]">{{ kb(file.file_data.size) }} kb</div>

				</li>
			</ul>
		</div>

	</div>
</template>



<script setup>
import { ref } from 'vue'
import axios from 'axios'

const files = ref([])


const kb = (val) => (val / 1024).toFixed(1);

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
