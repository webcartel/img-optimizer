import { defineStore } from 'pinia'

export const useFilesStore = defineStore('filesStore', {

	state: () => ({
		files: [],
	}),

	getters: {

		getFiles() {
			return this.files
		},

		getFilesAmount() {
			return this.files.length
		},

		getFilesForZip() {
			return this.files.map(file => {
				return {
					file_real_name: file.file_sign,
					file_server_name: file.loaded_data.filename
				}
			})
		},

	},

	actions: {

		setFile(file) {
			this.files.push(file)
		},

		deleteFile(filename) {
			this.files = this.files.filter(file => file.loaded_data.filename !== filename)
		},

		setFileLoadingStatus(filename, status = false, data = null, error_message = '') {
			this.files = this.files.map(file => {
				if ( file.file_sign === filename ) {
					file.loaded = status
					file.loaded_data = data ?? {}
					file.error_message = error_message
				}
				return file
			})
		},

	}

})
