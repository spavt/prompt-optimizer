import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
    },

    setTheme(isDark) {
      this.isDark = isDark
      this.applyTheme()
    },

    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.style.colorScheme = 'dark'
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.style.colorScheme = 'light'
      }
    }
  },

  persist: true
})
