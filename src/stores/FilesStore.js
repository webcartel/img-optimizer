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

	},

	actions: {

		setFile(file) {
			this.files.push(file)
		},

	}

})
