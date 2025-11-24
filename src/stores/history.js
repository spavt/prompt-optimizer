import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [],
    maxItems: 100 // 最多保存100条历史记录
  }),

  getters: {
    sortedItems: (state) => {
      return [...state.items].sort((a, b) => b.timestamp - a.timestamp)
    },

    recentItems: (state) => {
      return state.sortedItems.slice(0, 10)
    },

    itemsByDomain: (state) => {
      return (domain) => state.items.filter(item => item.domain === domain)
    }
  },

  actions: {
    addItem(item) {
      const newItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        domain: item.domain || 'general',
        ...item
      }

      // 添加到开头
      this.items.unshift(newItem)

      // 限制数量
      if (this.items.length > this.maxItems) {
        this.items = this.items.slice(0, this.maxItems)
      }
    },

    removeItem(id) {
      const index = this.items.findIndex(item => item.id === id)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateItem(id, updates) {
      const item = this.items.find(item => item.id === id)
      if (item) {
        Object.assign(item, updates)
      }
    },

    clearHistory() {
      this.items = []
    },

    importHistory(data) {
      try {
        const importedItems = JSON.parse(data)
        if (Array.isArray(importedItems)) {
          this.items = [...this.items, ...importedItems].slice(0, this.maxItems)
          return true
        }
      } catch (error) {
        console.error('导入历史记录失败:', error)
      }
      return false
    }
  },

  persist: true
})
