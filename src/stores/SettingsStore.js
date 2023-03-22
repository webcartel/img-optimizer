import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settingsStore', {

	state: () => ({
		token: null,
	}),

	actions: {

		setToken(token) {
			this.token = token
		},

	}

})
