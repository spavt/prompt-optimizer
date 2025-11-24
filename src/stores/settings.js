import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    provider: 'local', // 'openai', 'anthropic', 'local', 'custom', 'kimi', 'mota', 'deepseek'
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
      const customProviders = ['custom', 'kimi', 'mota', 'deepseek']
      const hasCustom = customProviders.includes(provider) && (newSettings.customApiUrl || this.customApiUrl) && (newSettings.customApiKey || this.customApiKey)
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
      } else if (['custom', 'kimi', 'mota', 'deepseek'].includes(provider)) {
        const defaultModel = getDefaultModel(provider)
        this.customModel = this.customModel || defaultModel
        if (!this.customApiUrl) {
          this.customApiUrl = getDefaultApiUrl(provider) || this.customApiUrl
        }
      }
    },

    resetSettings() {
      this.$reset()
    }
  },

  persist: true
})

function getDefaultApiUrl(provider) {
  const map = {
    kimi: 'https://api.moonshot.cn/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    mota: 'https://api.mota.ai/v1/chat/completions'
  }
  return map[provider]
}

function getDefaultModel(provider) {
  const map = {
    kimi: 'moonshot-v1-8k',
    deepseek: 'deepseek-chat',
    mota: 'mota-chat'
  }
  return map[provider] || 'gpt-3.5-turbo'
}
