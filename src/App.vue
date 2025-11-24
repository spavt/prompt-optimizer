<template>
  <div class="app-container">
    <el-container>
      <!-- 头部 -->
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo">
            <el-icon :size="28"><Promotion /></el-icon>
            <h1>AI提示词优化大师</h1>
          </div>
          <div class="header-actions">
            <el-button @click="showSettings = true" :icon="Setting" circle />
            <el-button @click="toggleTheme" :icon="isDark ? Sunny : Moon" circle />
            <el-button @click="showHistory = true" :icon="Clock" circle>
              <el-badge v-if="historyCount > 0" :value="historyCount" class="badge" />
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="app-main">
        <MainOptimizer ref="optimizerRef" />
      </el-main>
    </el-container>

    <!-- 设置对话框 -->
    <SettingsDialog v-model="showSettings" />
    
    <!-- 历史记录抽屉 -->
    <HistoryDrawer v-model="showHistory" @apply="handleHistoryApply" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Setting, Moon, Sunny, Clock, Promotion } from '@element-plus/icons-vue'
import MainOptimizer from './components/MainOptimizer.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import HistoryDrawer from './components/HistoryDrawer.vue'
import { useHistoryStore } from './stores/history'
import { useThemeStore } from './stores/theme'

const showSettings = ref(false)
const showHistory = ref(false)
const optimizerRef = ref(null)

const historyStore = useHistoryStore()
const themeStore = useThemeStore()

const historyCount = computed(() => historyStore.items.length)
const isDark = computed(() => themeStore.isDark)

function toggleTheme() {
  themeStore.toggleTheme()
}

function handleHistoryApply(item) {
  optimizerRef.value?.applyHistoryItem?.(item)
}

onMounted(() => {
  // 初始化主题
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .el-container {
    height: 100%;
  }
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 20px;
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      h1 {
        font-size: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 600;
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.app-main {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  
  :deep(.el-badge) {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(40%, -40%);
  }
}

@media (max-width: 768px) {
  .app-header {
    .header-content {
      padding: 0 12px;
      
      .logo h1 {
        font-size: 18px;
      }
    }
  }
  
  .app-main {
    padding: 12px;
  }
}
</style>
