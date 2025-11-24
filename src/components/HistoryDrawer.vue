<template>
  <el-drawer
    v-model="visible"
    title="优化历史"
    direction="rtl"
    size="40%"
    :close-on-click-modal="false"
  >
    <div class="history-container">
      <!-- 搜索和筛选 -->
      <div class="history-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索历史记录..."
          :prefix-icon="Search"
          clearable
        />
        <el-select v-model="filterDomain" placeholder="所有领域" clearable>
          <el-option label="通用" value="general" />
          <el-option label="编程开发" value="coding" />
          <el-option label="创意写作" value="writing" />
          <el-option label="数据分析" value="analysis" />
          <el-option label="UI/UX设计" value="design" />
        </el-select>
      </div>

      <!-- 历史列表 -->
      <div class="history-list">
        <el-timeline v-if="filteredHistory.length > 0">
          <el-timeline-item
            v-for="item in filteredHistory"
            :key="item.id"
            :timestamp="formatTime(item.timestamp)"
            placement="top"
          >
            <el-card>
              <div class="history-item">
                <div class="item-header">
                  <el-tag size="small">{{ getDomainLabel(item.domain) }}</el-tag>
                  <div class="item-actions">
                    <el-button
                      text
                      :icon="View"
                      @click="viewDetail(item)"
                    />
                    <el-button
                      text
                      :icon="DocumentCopy"
                      @click="applyToEditor(item)"
                    />
                    <el-button
                      text
                      :icon="Delete"
                      type="danger"
                      @click="deleteItem(item.id)"
                    />
                  </div>
                </div>
                
                <div class="item-content">
                  <div class="original-text">
                    <strong>原始内容：</strong>
                    <p>{{ truncate(item.original, 100) }}</p>
                  </div>
                  
                  <div class="score-display" v-if="item.score">
                    <el-progress
                      :percentage="item.score.total"
                      :stroke-width="6"
                      :color="getScoreColor(item.score.total)"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-empty
          v-else
          description="暂无历史记录"
          :image-size="200"
        />
      </div>

      <!-- 底部操作 -->
      <div class="history-footer">
        <el-button @click="exportHistory" :icon="Download">
          导出历史
        </el-button>
        <el-button @click="clearHistory" type="danger" :icon="Delete">
          清空历史
        </el-button>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetail"
      title="优化详情"
      width="70%"
      append-to-body
    >
      <div v-if="currentItem" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentItem.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="优化领域">
            {{ getDomainLabel(currentItem.domain) }}
          </el-descriptions-item>
          <el-descriptions-item label="质量评分">
            <el-progress
              :percentage="currentItem.score?.total || 0"
              :stroke-width="8"
              :color="getScoreColor(currentItem.score?.total)"
            />
          </el-descriptions-item>
        </el-descriptions>

        <div class="comparison-view">
          <div class="comparison-side">
            <h3>原始内容</h3>
            <div class="content-box">{{ currentItem.original }}</div>
          </div>
          <div class="comparison-side">
            <h3>优化后的提示词</h3>
            <div class="content-box">{{ currentItem.optimizedPrompt || currentItem.optimized }}</div>
          </div>
        </div>

        <div
          v-if="currentItem.finalOutput && currentItem.finalOutput !== (currentItem.optimizedPrompt || currentItem.optimized)"
          class="comparison-view"
        >
          <div class="comparison-side">
            <h3>模型输出</h3>
            <div class="content-box">{{ currentItem.finalOutput }}</div>
          </div>
        </div>

        <div class="detail-actions">
          <el-button @click="copyOptimized(currentItem)" :icon="CopyDocument">
            复制优化结果
          </el-button>
          <el-button @click="showDetail = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  View,
  DocumentCopy,
  Delete,
  Download,
  CopyDocument
} from '@element-plus/icons-vue'
import { useHistoryStore } from '@/stores/history'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'apply'])

const historyStore = useHistoryStore()
const searchKeyword = ref('')
const filterDomain = ref('')
const showDetail = ref(false)
const currentItem = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 筛选后的历史记录
const filteredHistory = computed(() => {
  let items = [...historyStore.items].sort((a, b) => b.timestamp - a.timestamp)

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item => {
      const original = item.original?.toLowerCase() || ''
      const optimized = (item.optimizedPrompt || item.optimized || '').toLowerCase()
      const finalOutput = (item.finalOutput || '').toLowerCase()
      return original.includes(keyword) || optimized.includes(keyword) || finalOutput.includes(keyword)
    })
  }

  // 领域筛选
  if (filterDomain.value) {
    items = items.filter(item => item.domain === filterDomain.value)
  }

  return items
})

// 格式化时间
function formatTime(timestamp) {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 截断文本
function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// 获取领域标签
function getDomainLabel(domain) {
  const labels = {
    general: '通用',
    coding: '编程开发',
    writing: '创意写作',
    analysis: '数据分析',
    design: 'UI/UX设计',
    marketing: '市场营销',
    education: '教育培训',
    product: '产品管理'
  }
  return labels[domain] || '其他'
}

// 获取评分颜色
function getScoreColor(score) {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 查看详情
function viewDetail(item) {
  currentItem.value = item
  showDetail.value = true
}

// 应用到编辑器
function applyToEditor(item) {
  emit('apply', item)
  visible.value = false
  ElMessage.success('已应用到编辑器')
}

// 复制优化结果
async function copyOptimized(item) {
  try {
    const text = item.optimizedPrompt || item.optimized || item.finalOutput || ''
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 删除记录
function deleteItem(id) {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyStore.removeItem(id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

// 导出历史
function exportHistory() {
  const data = JSON.stringify(historyStore.items, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-history-${dayjs().format('YYYY-MM-DD')}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('历史记录已导出')
}

// 清空历史
function clearHistory() {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？此操作不可恢复。',
    '清空历史',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    historyStore.clearHistory()
    ElMessage.success('历史记录已清空')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.history-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.history-header {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
  
  .el-input {
    flex: 1;
  }
  
  .el-select {
    width: 150px;
  }
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.history-item {
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .item-actions {
    display: flex;
    gap: 4px;
  }
  
  .item-content {
    .original-text {
      margin-bottom: 12px;
      
      strong {
        color: #606266;
        font-size: 14px;
      }
      
      p {
        margin: 4px 0 0;
        color: #909399;
        font-size: 13px;
        line-height: 1.5;
      }
    }
    
    .score-display {
      .el-progress {
        width: 100%;
      }
    }
  }
}

.history-footer {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
}

.detail-content {
  .comparison-view {
    margin: 20px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .comparison-side {
      h3 {
        margin-bottom: 12px;
        color: #303133;
      }
      
      .content-box {
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        min-height: 200px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.6;
        font-size: 14px;
      }
    }
  }
  
  .detail-actions {
    text-align: center;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .detail-content .comparison-view {
    grid-template-columns: 1fr;
  }
}
</style>
