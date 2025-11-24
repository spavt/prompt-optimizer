import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    provider: 'local', // 'openai', 'anthropic', 'local', 'custom'
    apiKey: '',
    model: 'gpt-3.5-turbo',
    // 自定义 API 配置
    customApiUrl: '',
    customApiKey: '',
    customModel: '',
    useAI: false,
    preferences: {
      autoSave: true,
      showSteps: true,
      useCache: true
    },
    defaultStrategies: ['clarity', 'structure', 'role'],
    ui: {
      darkMode: false,
      compactView: false
    },
    language: 'zh-CN'
  }),

  actions: {
    updateSettings(newSettings) {
      Object.assign(this.$state, newSettings)
      const provider = newSettings.provider || this.provider
      const hasCustom = provider === 'custom' && (newSettings.customApiUrl || this.customApiUrl) && (newSettings.customApiKey || this.customApiKey)
      this.useAI = provider !== 'local' && (hasCustom || !!(newSettings.apiKey || this.apiKey))
    },

    setApiKey(key) {
      this.apiKey = key
      this.useAI = !!key
    },

    setProvider(provider) {
      this.provider = provider
      // 根据提供商设置默认模型
      if (provider === 'openai') {
        this.model = 'gpt-3.5-turbo'
      } else if (provider === 'anthropic') {
        this.model = 'claude-3-sonnet'
      } else if (provider === 'custom') {
        this.model = this.customModel || 'gpt-3.5-turbo'
      }
    },

    resetSettings() {
      this.$reset()
    }
  },

  persist: true
})
