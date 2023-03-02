<template>
	<div>

		<div class="h-[100px]"></div>

		<div
			class="flex flex-col justify-center items-center mx-auto mb-[35px] w-[384px] h-[160px] border-[#616778] border-[2px] rounded-[15px] border-dashed"
			@drop.prevent="addFile"
			@dragover.prevent=""
		>
			<Icon :icon="mdiUploadMultiple" fill="#616778" class="mb-[10px] w-[60px]" />
			<div>Перетащите файлы сюда</div>
		</div>

		<div class="mx-auto max-w-[600px]">
			<ul>
				<li
					class="group px-[20px] pt-[6px] pb-[14px] hover:bg-[#eee] transition-all rounded-md"
					v-for="file in filesStore.getFiles"
					:key="file.file_data.name">

					<div class="flex justify-between">
						<div class="mb-[3px] text-[15px]">{{ file.file_data.name }}</div>
						<div class="text-[14px] font-semibold">{{ file.progress }}%</div>
					</div>

					<div class="w-full h-[6px] bg-[#eeeeee] rounded-[3px]">
						<div
							class="w-full h-[6px] bg-[#8FCB60] rounded-[3px] transition-all duration-150"
							:style="{ width: file.progress + '%' }"
						></div>
					</div>
					
					<div class="flex justify-between relative">
						<div class="text-[14px] text-[#9B9B9B]">{{ kb(file.file_data.size) }}</div>
						<div class="hidden absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 group-hover:flex">
							<Icon :icon="mdiDownloadBoxOutline" fill="#616778" class="mb-[10px] w-[29px]" />
							<Icon :icon="mdiCloseBoxOutline" fill="#616778" class="mb-[10px] w-[29px]" />
						</div>
						<div class="text-[14px] text-[#5d9b2c]">{{ progressAndResultSize(file) }}</div>
					</div>

				</li>
			</ul>
		</div>

	</div>
</template>



<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useFilesStore } from './stores/FilesStore'
import { mdiUploadMultiple, mdiDownloadBoxOutline, mdiCloseBoxOutline } from '@mdi/js'
import Icon from '@/components/Icon.vue'

const filesStore = useFilesStore()
const token = ref(generateRandomString(64))

function addFile(e) {
	
	const droppedFiles = e.dataTransfer.files

	if (!droppedFiles) return

	[...droppedFiles].forEach((file, i, arr) => {

		filesStore.setFile({
			file_data: file,
			file_sign: file.name,
			progress: 0,
			loaded: false,
			loaded_data: {},
		})

		if (arr.length - 1 === i) {
			upload()
		}

	});
}

function upload() {

	let delay = 500
	let i = 0

	let tid = setTimeout(function tick() {

		if (filesStore.getFilesAmount != i && !filesStore.getFiles[i].loaded) {

			const formData = new FormData()
			formData.append('token', token.value)
			formData.append('file', filesStore.getFiles[i].file_data)
			const file_sign = filesStore.getFiles[i].file_sign
			
			axios({
				method: "post",
				url: "http://localhost:5001/upload",
				data: formData,

				onUploadProgress: function (progressEvent) {

					filesStore.getFiles.forEach((item, i, arr) => {
						if (file_sign == item.file_sign) {
							let progress = progressEvent.loaded / (progressEvent.total / 100)
							filesStore.getFiles[i].progress = progress
						}
					})

				},

			})
				.then(function (resp) {

					filesStore.getFiles.forEach((item, i, arr) => {
						if (file_sign == item.file_sign) {
							filesStore.getFiles[i].loaded = true
							filesStore.getFiles[i].loaded_data = resp.data
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

function kb(val) {
	if (val >= 1048576) {
		return (val / 1048576).toFixed(1) + " MB";
	} else {
		return (val / 1024).toFixed(1) + " KB";
	}
}


function progressAndResultSize(file) {
	if ( Object.keys(file.loaded_data).length !== 0 ) {
		return kb(file.loaded_data.fileSizeInBytes)
	}
	else {
		return `${Math.round(file.progress)} %`
	}
}

function generateRandomString(length) {
	var result = ''
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}

	return result
}

</script>
