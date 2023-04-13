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

		clearUnloadedFiles() {
			this.files = this.files.filter(file => file.loaded !== false)
		},

	}

})
