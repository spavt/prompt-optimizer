<template>
  <el-dialog
    v-model="visible"
    title="优化前后对比"
    width="80%"
    top="5vh"
  >
    <div class="comparison-container">
      <div class="comparison-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="长度提升" :value="lengthIncrease" suffix="%" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="结构改善" :value="structureScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="清晰度" :value="clarityScore" suffix="分" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总体评分" :value="totalScore" suffix="分" />
          </el-col>
        </el-row>
      </div>

      <el-tabs v-model="activeTab" class="comparison-tabs">
        <el-tab-pane label="并排对比" name="side-by-side">
          <div class="side-by-side-view">
            <div class="compare-side">
              <h3>
                <el-icon><Document /></el-icon>
                原始内容
              </h3>
              <div class="content-wrapper">
                <pre class="content">{{ original }}</pre>
                <div class="stats">
                  <span>字数：{{ originalLength }}</span>
                  <span>段落：{{ originalParagraphs }}</span>
                </div>
              </div>
            </div>
            
            <div class="compare-divider"></div>
            
            <div class="compare-side">
              <h3>
                <el-icon><DocumentChecked /></el-icon>
                优化结果
              </h3>
              <div class="content-wrapper">
                <pre class="content">{{ optimized }}</pre>
                <div class="stats">
                  <span>字数：{{ optimizedLength }}</span>
                  <span>段落：{{ optimizedParagraphs }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="差异高亮" name="diff">
          <div class="diff-view">
            <div class="diff-legend">
              <span class="added">新增内容</span>
              <span class="removed">删除内容</span>
              <span class="modified">修改内容</span>
            </div>
            <div class="diff-content" v-html="diffContent"></div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="改进分析" name="analysis">
          <div class="analysis-view">
            <h4>主要改进</h4>
            <el-timeline>
              <el-timeline-item
                v-for="improvement in improvements"
                :key="improvement.type"
                :color="improvement.color"
              >
                <div class="improvement-item">
                  <strong>{{ improvement.title }}</strong>
                  <p>{{ improvement.description }}</p>
                  <el-tag
                    v-for="tag in improvement.tags"
                    :key="tag"
                    size="small"
                    type="success"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="comparison-actions">
        <el-button @click="copyOptimized" :icon="CopyDocument">
          复制优化结果
        </el-button>
        <el-button @click="exportComparison" :icon="Download">
          导出对比报告
        </el-button>
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  DocumentChecked,
  CopyDocument,
  Download
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  original: String,
  optimized: String
})

const emit = defineEmits(['update:modelValue'])

const activeTab = ref('side-by-side')

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 统计数据
const originalLength = computed(() => props.original?.length || 0)
const optimizedLength = computed(() => props.optimized?.length || 0)
const originalParagraphs = computed(() => (props.original?.split('\n\n') || []).length)
const optimizedParagraphs = computed(() => (props.optimized?.split('\n\n') || []).length)

const lengthIncrease = computed(() => {
  if (!originalLength.value) return 0
  return Math.round(((optimizedLength.value - originalLength.value) / originalLength.value) * 100)
})

// 评分（模拟）
const structureScore = computed(() => {
  const hasSections = props.optimized?.includes('##') || props.optimized?.includes('步骤')
  const hasList = props.optimized?.includes('\n-') || props.optimized?.includes('\n1.')
  return hasSections && hasList ? 85 : hasSections ? 70 : 50
})

const clarityScore = computed(() => {
  const hasRole = props.optimized?.includes('角色') || props.optimized?.includes('你是')
  const hasTask = props.optimized?.includes('任务') || props.optimized?.includes('目标')
  return hasRole && hasTask ? 90 : hasRole || hasTask ? 70 : 50
})

const totalScore = computed(() => {
  return Math.round((structureScore.value + clarityScore.value) / 2)
})

// 差异内容（简化版）
const diffContent = computed(() => {
  if (!props.original || !props.optimized) return ''
  
  // 简单的差异展示逻辑
  const originalLines = props.original.split('\n')
  const optimizedLines = props.optimized.split('\n')
  
  let html = ''
  optimizedLines.forEach((line, index) => {
    if (index < originalLines.length && line === originalLines[index]) {
      html += `<div class="unchanged">${escapeHtml(line)}</div>`
    } else if (index >= originalLines.length) {
      html += `<div class="added">${escapeHtml(line)}</div>`
    } else {
      html += `<div class="modified">${escapeHtml(line)}</div>`
    }
  })
  
  return html
})

// 改进分析
const improvements = computed(() => [
  {
    type: 'structure',
    title: '结构优化',
    description: '添加了清晰的段落结构和层次',
    color: '#409eff',
    tags: ['段落划分', '逻辑层次', '格式规范']
  },
  {
    type: 'clarity',
    title: '清晰度提升',
    description: '明确了任务目标和具体要求',
    color: '#67c23a',
    tags: ['任务明确', '要求具体', '表述准确']
  },
  {
    type: 'completeness',
    title: '完整性增强',
    description: '补充了必要的上下文和约束条件',
    color: '#e6a23c',
    tags: ['上下文', '约束条件', '输出格式']
  }
])

// 工具函数
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 复制优化结果
async function copyOptimized() {
  try {
    await navigator.clipboard.writeText(props.optimized)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 导出对比报告
function exportComparison() {
  const report = `
# 提示词优化对比报告

## 统计数据
- 长度提升：${lengthIncrease.value}%
- 结构评分：${structureScore.value}分
- 清晰度评分：${clarityScore.value}分
- 总体评分：${totalScore.value}分

## 原始内容
${props.original}

## 优化结果
${props.optimized}

## 主要改进
${improvements.value.map(item => `- ${item.title}：${item.description}`).join('\n')}

---
生成时间：${new Date().toLocaleString()}
`

  const blob = new Blob([report], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompt-comparison-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('报告已导出')
}
</script>

<style scoped lang="scss">
.comparison-container {
  .comparison-stats {
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
  
  .comparison-tabs {
    min-height: 400px;
  }
}

.side-by-side-view {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  
  .compare-side {
    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #303133;
    }
    
    .content-wrapper {
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      overflow: hidden;
      
      .content {
        padding: 16px;
        margin: 0;
        min-height: 300px;
        max-height: 500px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.6;
        background: white;
      }
      
      .stats {
        padding: 8px 16px;
        background: #f5f7fa;
        border-top: 1px solid #e4e7ed;
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .compare-divider {
    width: 1px;
    background: #dcdfe6;
  }
}

.diff-view {
  .diff-legend {
    margin-bottom: 16px;
    display: flex;
    gap: 20px;
    
    span {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      
      &.added {
        background: #e1f3d8;
        color: #67c23a;
      }
      
      &.removed {
        background: #fde2e2;
        color: #f56c6c;
      }
      
      &.modified {
        background: #fdf6ec;
        color: #e6a23c;
      }
    }
  }
  
  .diff-content {
    padding: 16px;
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    max-height: 500px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.6;
    
    :deep(.added) {
      background: #e1f3d8;
      padding: 2px 4px;
      margin: 2px 0;
    }
    
    :deep(.removed) {
      background: #fde2e2;
      text-decoration: line-through;
      padding: 2px 4px;
      margin: 2px 0;
    }
    
    :deep(.modified) {
      background: #fdf6ec;
      padding: 2px 4px;
      margin: 2px 0;
    }
    
    :deep(.unchanged) {
      padding: 2px 4px;
      margin: 2px 0;
    }
  }
}

.analysis-view {
  h4 {
    margin-bottom: 16px;
    color: #303133;
  }
  
  .improvement-item {
    strong {
      display: block;
      margin-bottom: 8px;
      color: #303133;
    }
    
    p {
      margin: 0 0 8px;
      color: #606266;
      font-size: 14px;
    }
    
    .el-tag {
      margin-right: 8px;
    }
  }
}

.comparison-actions {
  margin-top: 24px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
  .side-by-side-view {
    grid-template-columns: 1fr;
    
    .compare-divider {
      display: none;
    }
  }
  
  .comparison-stats .el-col {
    margin-bottom: 12px;
  }
}
</style>
