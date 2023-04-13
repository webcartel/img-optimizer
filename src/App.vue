<template>
	<div>
		<div class="h-[100px]"></div>

		<div
			class="flex flex-col justify-center items-center mx-auto mb-[35px] w-[384px] h-[160px] border-[#616778] border-[2px] rounded-[15px] border-dashed"
			@drop.prevent="addFile"
			@dragover.prevent=""
		>
			<Icon
				:icon="mdiUploadMultiple"
				fill="#616778"
				class="mb-[10px] w-[60px]"
			/>
			<div>Перетащите файлы сюда</div>
		</div>

		<div class="flex justify-center mb-[20px]" v-if="filesStore.getFilesAmount > 1">
			<div
				@click="downloadZip()"
				class="flex items-center px-10 py-2 text-[16px] border-[2px] border-[#616778] hover:border-[#8bb754] transition-[border-color] duration-200 rounded-[40px] cursor-pointer"
			>
				<Icon
					:icon="mdiPackageDown"
					fill="#616778"
					class="mr-[6px] w-[38px]"
				/>
				<span>Скачать как ZIP архив</span>
			</div>
		</div>

		<div class="mx-auto max-w-[600px]">
			<TransitionGroup name="files" tag="ul">
				<li
					v-for="file in filesStore.getFiles" :key="file.file_data.name"
				>
					<div class="group px-[20px] pt-[6px] pb-[14px] hover:bg-[#eee] transition-[background-color] duration-150 rounded-md">
						<div class="flex justify-between">
							<div class="mb-[3px] text-[15px]">
								{{ file.file_data.name }}
							</div>
							<div class="text-[14px] font-semibold">
								{{ progress(file.progress) }}
							</div>
						</div>

						<div class="w-full h-[6px] bg-[#eeeeee] rounded-[3px]">
							<div
								class="w-full h-[6px] bg-[#8FCB60] rounded-[3px] transition-all duration-150"
								:style="{ width: file.progress + '%' }"
							></div>
						</div>

						<div class="flex justify-between relative">
							<div class="text-[14px] text-[#9B9B9B]">
								{{ kb(file.file_data.size) }}
							</div>
							<div
								class="hidden absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 group-hover:flex"
							>
								<a :href="`${baseUrl}/download/${settingsStore.token}/${file.loaded_data.filename}/${file.file_sign}`" target="_blank">
									<Icon
										:icon="mdiDownloadBoxOutline"
										fill="#616778"
										class="mb-[10px] w-[29px]"
									/>
								</a>
								<button @click="deleteFile(file.loaded_data.filename)">
									<Icon
										:icon="mdiCloseBoxOutline"
										fill="#616778"
										class="mb-[10px] w-[29px]"
									/>
								</button>
							</div>
							<div class="group-hover:hidden" v-html="diff(file)"></div>
							<div class="text-[14px] text-[#5d9b2c]" v-html="resultSize(file)"></div>
						</div>
					</div>
				</li>
			</TransitionGroup>
		</div>

		<div class="fixed right-[20px] top-[20px] bottom-[20px] p-[10px] w-full max-w-[400px] z-10">
			<Notice v-for="(notice, index) in noticesStore.getNotices" :message="notice.message" :type="notice.type" :key="index" />
		</div>
	</div>
</template>



<script setup>
import { onMounted, ref } from 'vue'
import axios, { Axios } from 'axios'
import { useFilesStore } from './stores/FilesStore'
import { useSettingsStore } from './stores/SettingsStore'
import { useNoticesStore } from './stores/NoticesStore'
import { mdiUploadMultiple, mdiDownloadBoxOutline, mdiCloseBoxOutline, mdiPackageDown } from '@mdi/js'
import Icon from '@/components/Icon.vue'
import Notice from './components/Notice.vue';

const filesStore = useFilesStore()
const settingsStore = useSettingsStore()
const noticesStore = useNoticesStore()
const baseUrl = ref()


onMounted(() => {
	settingsStore.setToken(generateRandomString(64))
	baseUrl.value = location.hostname === 'localhost' ? 'http://localhost:5001' : ''
})


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
			formData.append('token', settingsStore.token)
			formData.append('file', filesStore.getFiles[i].file_data)
			const file_sign = filesStore.getFiles[i].file_sign
			
			axios({
				method: 'post',
				url: `${baseUrl.value}/upload`,
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
				.then(resp => {

					filesStore.getFiles.forEach((item, i, arr) => {
						if (file_sign == item.file_sign) {
							filesStore.getFiles[i].loaded = true
							filesStore.getFiles[i].loaded_data = resp.data
						}
					})
					
				})
				.catch(err => {
					if ( err.response.data.hasOwnProperty('error') ) {
						if ( err.response.data.error.code === 1 ) {
							noticesStore.setNotice({
								message: `<p><strong>Ошибка загркзки</strong><br><p>${err.response.data.error.filename}</p></p><p>Файлы этого типа не принимаются</p>`,
								type: 'error'
							})
						}
					}
				})

			i++

		} else {

			clearInterval(tid)
			filesStore.clearUnloadedFiles()

		}

		tid = setTimeout(tick.bind(this), delay)

	}, delay)
}

function deleteFile(filename) {
	axios({
		method: 'post',
		url: `${baseUrl.value}/delete`,
		data: {
			token: settingsStore.token,
			filename: filename
		}
	})
		.then(res => {
			if ( res.status === 200 ) {
				filesStore.deleteFile(res.data.filename)
			}
		})
}

function kb(val) {
	if (val >= 1048576) {
		return (val / 1048576).toFixed(1) + " MB";
	} else {
		return (val / 1024).toFixed(1) + " KB";
	}
}

function resultSize(file) {
	if ( Object.keys(file.loaded_data).length !== 0 ) {
		return kb(file.loaded_data.fileSizeInBytes)
	}
	else {
		return `-----`
	}
}

function diff(file) {
	if ( Object.keys(file.loaded_data).length !== 0 ) {
		const diff = ((file.file_data.size - file.loaded_data.fileSizeInBytes) / (file.file_data.size / 100)).toFixed(1)
		return `<span class="font-bold text-[13px] text-[#999]">-${diff}%</span>`
	}
	else {
		return ''
	}
}

function progress(progress) {
	return `${Math.round(progress)}%`
}

function generateRandomString(length) {
	var result = ''
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}

	return result
}

function downloadZip() {
	axios({
		method: 'post',
		url: `${baseUrl.value}/download-zip`,
		data: {
			token: settingsStore.token,
			files: filesStore.getFilesForZip
		},
		responseType: 'arraybuffer',
	})
		.then(res => {
			const blob = new Blob([res.data], { type: 'application/zip' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			const now = new Date()
			const timestamp = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}__${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
			link.download = `optimized_files__${timestamp}.zip`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		})
}

</script>



<style>
.files-enter-active,
.files-leave-active {
	transition: all 0.2s ease;
}

.files-enter-from {
	opacity: 0;
	transform: translateX(0);
}

.files-leave-to {
	opacity: 0;
	transform: translateX(20%);
}
</style>