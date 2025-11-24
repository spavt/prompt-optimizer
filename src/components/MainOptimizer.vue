<template>
  <div class="main-optimizer">
    <el-row :gutter="20">
      <!-- 左侧输入区 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon><Edit /></el-icon>
                输入原始需求
              </span>
              <el-dropdown @command="handleQuickTemplate">
                <el-button text>
                  快速模板 <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="ui">UI设计</el-dropdown-item>
                    <el-dropdown-item command="code">代码生成</el-dropdown-item>
                    <el-dropdown-item command="article">文章写作</el-dropdown-item>
                    <el-dropdown-item command="data">数据分析</el-dropdown-item>
                    <el-dropdown-item command="translate">翻译任务</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

          <div class="input-section">
            <el-input
              v-model="userInput"
              type="textarea"
              :rows="6"
              placeholder="请输入您的需求，例如：帮我写一个登录页面、分析销售数据、生成产品介绍..."
              maxlength="1000"
              show-word-limit
            />

            <!-- 优化选项 -->
            <div class="options-section">
              <h4>优化策略</h4>
              <div class="option-grid">
                <el-checkbox v-model="options.clarity" checked>
                  <el-tooltip content="让指令更清晰具体">
                    清晰度优化
                  </el-tooltip>
                </el-checkbox>
                <el-checkbox v-model="options.cot" checked>
                  <el-tooltip content="添加逐步思考的引导">
                    思维链(CoT)
                  </el-tooltip>
                </el-checkbox>
                <el-checkbox v-model="options.examples">
                  <el-tooltip content="添加输入输出示例">
                    示例增强
                  </el-tooltip>
                </el-checkbox>
                <el-checkbox v-model="options.structure" checked>
                  <el-tooltip content="优化提示词结构">
                    结构化
                  </el-tooltip>
                </el-checkbox>
                <el-checkbox v-model="options.role" checked>
                  <el-tooltip content="添加角色设定">
                    角色扮演
                  </el-tooltip>
                </el-checkbox>
                <el-checkbox v-model="options.constraints">
                  <el-tooltip content="添加输出约束">
                    约束条件
                  </el-tooltip>
                </el-checkbox>
              </div>

              <div class="domain-select">
                <span>专业领域：</span>
                <el-select v-model="options.domain" placeholder="选择领域">
                  <el-option label="通用" value="general" />
                  <el-option label="编程开发" value="coding" />
                  <el-option label="创意写作" value="writing" />
                  <el-option label="数据分析" value="analysis" />
                  <el-option label="UI/UX设计" value="design" />
                  <el-option label="市场营销" value="marketing" />
                  <el-option label="教育培训" value="education" />
                  <el-option label="产品管理" value="product" />
                </el-select>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="actions">
              <el-button
                type="primary"
                size="large"
                @click="handleOptimize"
                :loading="isOptimizing"
                :disabled="!userInput.trim()"
                :icon="MagicStick"
              >
                {{ isOptimizing ? '优化中...' : '开始优化' }}
              </el-button>
              <el-button
                size="large"
                @click="handleClear"
                :icon="Delete"
                :disabled="!userInput && !optimizedPrompt"
              >
                清空
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧结果区 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span class="title">
                <el-icon><DocumentCopy /></el-icon>
                优化结果
              </span>
              <div v-if="optimizedPrompt" class="result-actions">
                <el-button text @click="copyResult" :icon="CopyDocument">
                  复制
                </el-button>
                <el-button text @click="showComparison = true" :icon="View">
                  对比
                </el-button>
                <el-button text @click="saveToHistory" :icon="Star">
                  收藏
                </el-button>
              </div>
            </div>
          </template>

          <div class="result-section">
            <!-- 优化步骤展示 -->
            <el-timeline v-if="optimizationSteps.length > 0" class="optimization-timeline">
              <el-timeline-item
                v-for="(step, index) in optimizationSteps"
                :key="index"
                :color="step.status === 'success' ? '#67c23a' : '#409eff'"
              >
                <div class="timeline-content">
                  <h4>{{ step.name }}</h4>
                  <p>{{ step.description }}</p>
                  <div v-if="step.improvements" class="improvements">
                    <el-tag
                      v-for="item in step.improvements"
                      :key="item"
                      size="small"
                      type="success"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <!-- 最终结果 -->
            <div v-if="optimizedPrompt" class="final-result">
              <el-alert
                title="优化完成"
                type="success"
                :closable="false"
                show-icon
                class="mb-2"
              />
              <div class="result-content">
                <h4>优化后的提示词</h4>
                <pre>{{ optimizedPrompt }}</pre>
              </div>

              <div
                v-if="finalOutput && finalOutput !== optimizedPrompt"
                class="result-content mt-2"
              >
                <h4>模型输出</h4>
                <pre>{{ finalOutput }}</pre>
              </div>

              <!-- 评分展示 -->
              <div class="score-display" v-if="qualityScore">
                <h4>质量评分</h4>
                <el-progress
                  :percentage="qualityScore.total"
                  :stroke-width="10"
                  :color="scoreColor"
                >
                  <span>{{ qualityScore.total }}分</span>
                </el-progress>
                <div class="score-details">
                  <div class="score-item">
                    <span>清晰度</span>
                    <el-rate v-model="qualityScore.clarity" disabled />
                  </div>
                  <div class="score-item">
                    <span>完整性</span>
                    <el-rate v-model="qualityScore.completeness" disabled />
                  </div>
                  <div class="score-item">
                    <span>结构性</span>
                    <el-rate v-model="qualityScore.structure" disabled />
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="!optimizedPrompt && !isOptimizing"
              description="优化结果将在这里显示"
              :image-size="200"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比对话框 -->
    <ComparisonDialog
      v-model="showComparison"
      :original="userInput"
      :optimized="optimizedPrompt"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  DocumentCopy,
  MagicStick,
  Delete,
  ArrowDown,
  CopyDocument,
  View,
  Star
} from '@element-plus/icons-vue'
import { usePromptOptimizer } from '@/composables/usePromptOptimizer'
import { useHistoryStore } from '@/stores/history'
import { useSettingsStore } from '@/stores/settings'
import ComparisonDialog from './ComparisonDialog.vue'
import { quickTemplates } from '@/utils/templates'

// 状态
const userInput = ref('')
const optimizedPrompt = ref('')
const finalOutput = ref('')
const optimizationSteps = ref([])
const qualityScore = ref(null)
const showComparison = ref(false)
const isOptimizing = ref(false)

// 优化选项
const options = ref({
  clarity: true,
  cot: true,
  examples: false,
  structure: true,
  role: true,
  constraints: false,
  domain: 'general'
})

// 使用组合式函数
const { optimizePrompt } = usePromptOptimizer()
const historyStore = useHistoryStore()
const settingsStore = useSettingsStore()

// 计算属性
const scoreColor = computed(() => {
  const score = qualityScore.value?.total || 0
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
})

// 处理优化
async function handleOptimize() {
  if (!userInput.value.trim()) {
    ElMessage.warning('请输入需要优化的内容')
    return
  }

  isOptimizing.value = true
  optimizationSteps.value = []
  optimizedPrompt.value = ''
  finalOutput.value = ''
  qualityScore.value = null

  try {
    const result = await optimizePrompt(userInput.value, options.value)
    
    optimizedPrompt.value = result.optimizedPrompt
    finalOutput.value = result.finalOutput
    optimizationSteps.value = result.steps
    qualityScore.value = result.score
    
    // 自动保存到历史
    if (settingsStore.preferences?.autoSave !== false) {
      historyStore.addItem({
        original: userInput.value,
        optimizedPrompt: optimizedPrompt.value,
        finalOutput: finalOutput.value,
        options: { ...options.value },
        score: qualityScore.value,
        domain: options.value.domain
      })
    }
    
    ElMessage.success('优化完成！')
  } catch (error) {
    console.error('优化失败:', error)
    ElMessage.error('优化失败，请检查设置或稍后重试')
  } finally {
    isOptimizing.value = false
  }
}

// 复制结果
async function copyResult() {
  try {
    await navigator.clipboard.writeText(finalOutput.value || optimizedPrompt.value)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动选择复制')
  }
}

// 保存到历史
function saveToHistory() {
  historyStore.addItem({
    original: userInput.value,
    optimizedPrompt: optimizedPrompt.value,
    finalOutput: finalOutput.value,
    options: { ...options.value },
    score: qualityScore.value,
    domain: options.value.domain
  })
  ElMessage.success('已保存到历史记录')
}

// 清空内容
function handleClear() {
  ElMessageBox.confirm('确定要清空所有内容吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userInput.value = ''
    optimizedPrompt.value = ''
    finalOutput.value = ''
    optimizationSteps.value = []
    qualityScore.value = null
  }).catch(() => {})
}

// 供历史记录应用时调用
function applyHistoryItem(item) {
  userInput.value = item.original || ''
  optimizedPrompt.value = item.optimizedPrompt || item.optimized || ''
  finalOutput.value = item.finalOutput || optimizedPrompt.value
  optimizationSteps.value = item.steps || []
  qualityScore.value = item.score || null
}

defineExpose({
  applyHistoryItem
})

// 使用快速模板
function handleQuickTemplate(command) {
  const template = quickTemplates[command]
  if (template) {
    userInput.value = template.example
    options.value.domain = template.domain
    ElMessage.success(`已加载${template.name}模板`)
  }
}
</script>

<style scoped lang="scss">
.main-optimizer {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.input-card,
.result-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  
  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }
}

.input-section {
  .options-section {
    margin-top: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    
    h4 {
      margin: 0 0 12px 0;
      color: #606266;
      font-size: 14px;
    }
    
    .option-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .domain-select {
      display: flex;
      align-items: center;
      gap: 12px;
      
      span {
        color: #606266;
        font-size: 14px;
      }
      
      .el-select {
        flex: 1;
        max-width: 200px;
      }
    }
  }
  
  .actions {
    margin-top: 20px;
    display: flex;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
  }
}

.result-section {
  .optimization-timeline {
    margin-bottom: 20px;
    
    .timeline-content {
      h4 {
        margin: 0 0 8px 0;
        color: #303133;
      }
      
      p {
        margin: 0 0 8px 0;
        color: #606266;
        font-size: 14px;
      }
      
      .improvements {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }
  }
  
  .final-result {
    .result-content {
      margin: 16px 0;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #303133;
        font-size: 14px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
    }
    
    .score-display {
      margin-top: 20px;
      padding: 16px;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #303133;
      }
      
      .score-details {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .score-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          span {
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }
  }
}

.result-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .main-optimizer {
    .el-col {
      margin-bottom: 20px;
    }
  }
  
  .input-card,
  .result-card {
    height: auto;
    min-height: 400px;
  }
}
</style>
