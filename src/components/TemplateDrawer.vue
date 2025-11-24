<template>
  <el-drawer
    v-model="visible"
    title="提示词模板"
    size="50%"
    direction="rtl"
    :close-on-click-modal="false"
  >
    <div class="template-drawer">
      <div class="template-actions">
        <el-button type="primary" @click="showCreate = true" :icon="Plus">
          新建模板
        </el-button>
        <el-input
          v-model="keyword"
          placeholder="搜索模板名称/描述"
          clearable
          :prefix-icon="Search"
        />
      </div>

      <div class="template-grid">
        <el-card
          v-for="item in filteredTemplates"
          :key="item.id"
          class="template-card"
          shadow="hover"
        >
          <div class="card-header">
            <div class="title">
              <el-tag size="small" :type="item.builtIn ? 'info' : 'success'">
                {{ item.builtIn ? '内置' : '自定义' }}
              </el-tag>
              <span>{{ item.name }}</span>
            </div>
            <div class="actions">
              <el-button text size="small" :icon="View" @click="view(item)">
                查看
              </el-button>
              <el-button text size="small" @click="copy(item)">
                复制
              </el-button>
              <el-button
                v-if="!item.builtIn"
                text
                size="small"
                :icon="Delete"
                type="danger"
                @click="remove(item.id)"
              />
            </div>
          </div>

          <p class="description">{{ item.description || '暂无描述' }}</p>

          <div class="content-preview">
            <pre>{{ truncate(item.content, 360) }}</pre>
          </div>
        </el-card>
      </div>
    </div>

    <el-dialog
      v-model="showCreate"
      title="新建模板"
      width="500px"
      append-to-body
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="模板名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" placeholder="一句话描述" />
        </el-form-item>
        <el-form-item label="领域">
          <el-select v-model="form.domain" placeholder="选择领域">
            <el-option label="通用" value="general" />
            <el-option label="代码" value="coding" />
            <el-option label="写作" value="writing" />
            <el-option label="数据分析" value="analysis" />
            <el-option label="设计" value="design" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="此处待填写"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="createTemplate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="preview.visible"
      title="模板内容预览"
      width="600px"
      append-to-body
    >
      <div v-if="preview.item">
        <p><strong>名称：</strong>{{ preview.item.name }}</p>
        <p><strong>描述：</strong>{{ preview.item.description || '暂无描述' }}</p>
        <div class="content-preview full">
          <pre>{{ preview.item.content }}</pre>
        </div>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Plus, Search, View, Delete } from '@element-plus/icons-vue'
import { useTemplatesStore } from '@/stores/templates'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const templatesStore = useTemplatesStore()
const keyword = ref('')
const showCreate = ref(false)
const preview = ref({
  visible: false,
  item: null
})
const form = ref({
  name: '',
  description: '',
  domain: 'general',
  content: '此处待填写'
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filteredTemplates = computed(() => {
  const kw = keyword.value.toLowerCase()
  return templatesStore.allTemplates.filter(t => {
    if (!kw) return true
    return (
      t.name.toLowerCase().includes(kw) ||
      (t.description || '').toLowerCase().includes(kw) ||
      (t.content || '').toLowerCase().includes(kw)
    )
  })
})

function truncate(text, len) {
  if (!text) return ''
  return text.length > len ? `${text.slice(0, len)}...` : text
}

function createTemplate() {
  templatesStore.addTemplate(form.value)
  ElMessage.success('已保存自定义模板')
  showCreate.value = false
  form.value = {
    name: '',
    description: '',
    domain: 'general',
    content: '此处待填写'
  }
}

function remove(id) {
  templatesStore.removeTemplate(id)
  ElMessage.success('已删除模板')
}

async function copy(template) {
  try {
    await navigator.clipboard.writeText(template.content || '')
    ElMessage.success('已复制到剪贴板')
  } catch (_) {
    ElMessage.error('复制失败，请手动选择内容')
  }
}

function view(item) {
  preview.value = {
    visible: true,
    item
  }
}
</script>

<style scoped lang="scss">
.template-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.template-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding-right: 6px;
}

.template-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 4px;
    }
  }

  .description {
    color: #606266;
    font-size: 13px;
    margin: 0;
  }

  .content-preview {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 10px;
    flex: 1;
    overflow: hidden;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12px;
      color: #303133;
    }
  }
}

.content-preview.full {
  max-height: 60vh;
  overflow: auto;
}
</style>
