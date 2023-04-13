import { defineStore } from 'pinia'

export const useNoticesStore = defineStore('noticesStore', {

	state: () => ({
		notices: [],
	}),

	getters: {

		getNotices() {
			return this.notices
		},

		getNoticesAmount() {
			return this.notices.length
		},

	},

	actions: {

		setNotice(notice) {
			this.notices.push(notice)
		},

	}

})
