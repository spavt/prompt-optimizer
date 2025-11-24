<template>
  <el-dialog
    v-model="visible"
    title="设置"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="settings" label-width="120px">
      <el-form-item label="AI服务提供商">
        <el-radio-group v-model="settings.provider">
          <el-radio value="openai">OpenAI</el-radio>
          <el-radio value="anthropic">Anthropic Claude</el-radio>
          <el-radio value="kimi">Kimi（月之暗面）</el-radio>
          <el-radio value="deepseek">DeepSeek</el-radio>
          <el-radio value="mota">魔塔</el-radio>
          <el-radio value="custom">自定义API</el-radio>
          <el-radio value="local">本地优化（无需API）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="settings.provider !== 'local'" label="API密钥">
        <el-input
          v-model="apiKeyComputed"
          type="password"
          placeholder="请输入API密钥"
          show-password
        >
          <template #append>
            <el-button @click="testConnection" :loading="testing">
              测试连接
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="settings.provider === 'openai'" label="模型选择">
        <el-select v-model="settings.model">
          <el-option label="GPT-4" value="gpt-4" />
          <el-option label="GPT-4 Turbo" value="gpt-4-turbo" />
          <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="settings.provider === 'anthropic'" label="模型选择">
        <el-select v-model="settings.model">
          <el-option label="Claude 3 Opus" value="claude-3-opus" />
          <el-option label="Claude 3 Sonnet" value="claude-3-sonnet" />
          <el-option label="Claude 3 Haiku" value="claude-3-haiku" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="settings.provider === 'kimi'" label="模型选择">
        <el-select v-model="settings.customModel">
          <el-option
            v-for="item in providerConfigs.kimi.models"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="settings.provider === 'deepseek'" label="模型选择">
        <el-select v-model="settings.customModel">
          <el-option
            v-for="item in providerConfigs.deepseek.models"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="settings.provider === 'mota'" label="模型选择">
        <el-select v-model="settings.customModel">
          <el-option
            v-for="item in providerConfigs.mota.models"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="customProviders.includes(settings.provider)" label="API地址">
        <el-input
          v-model="settings.customApiUrl"
          :placeholder="getApiUrlPlaceholder(settings.provider)"
        />
        <small class="helper-text">未填写时会自动使用默认地址</small>
      </el-form-item>

      <el-form-item v-if="customProviders.includes(settings.provider)" label="API密钥">
        <el-input
          v-model="settings.customApiKey"
          type="password"
          placeholder="请输入自定义API密钥"
          show-password
        >
          <template #append>
            <el-button @click="testConnection" :loading="testing">
              测试连接
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="customProviders.includes(settings.provider)" label="模型名称">
        <el-input
          v-model="settings.customModel"
          placeholder="请输入要使用的模型名称"
        />
      </el-form-item>

      <el-divider />

      <el-form-item label="优化偏好">
        <el-checkbox v-model="settings.preferences.autoSave">
          自动保存优化历史
        </el-checkbox>
        <el-checkbox v-model="settings.preferences.showSteps">
          显示优化步骤
        </el-checkbox>
        <el-checkbox v-model="settings.preferences.useCache">
          使用缓存加速
        </el-checkbox>
      </el-form-item>

      <el-form-item label="默认优化策略">
        <el-checkbox-group v-model="settings.defaultStrategies">
          <el-checkbox label="clarity">清晰度优化</el-checkbox>
          <el-checkbox label="cot">思维链</el-checkbox>
          <el-checkbox label="examples">示例增强</el-checkbox>
          <el-checkbox label="structure">结构化</el-checkbox>
          <el-checkbox label="role">角色设定</el-checkbox>
          <el-checkbox label="constraints">约束条件</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="界面设置">
        <el-checkbox v-model="settings.ui.darkMode">深色模式</el-checkbox>
        <el-checkbox v-model="settings.ui.compactView">紧凑视图</el-checkbox>
      </el-form-item>

      <el-form-item label="语言">
        <el-select v-model="settings.language">
          <el-option label="简体中文" value="zh-CN" />
          <el-option label="English" value="en-US" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="resetSettings">恢复默认</el-button>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveSettings">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const settingsStore = useSettingsStore()
const settings = ref({ ...settingsStore.$state })
const testing = ref(false)
const customProviders = ['custom']
const presetProviders = ['openai', 'anthropic', 'kimi', 'deepseek', 'mota']
const providerConfigs = {
  kimi: {
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { label: 'moonshot-v1-8k', value: 'moonshot-v1-8k' },
      { label: 'moonshot-v1-32k', value: 'moonshot-v1-32k' },
      { label: 'moonshot-v1-128k', value: 'moonshot-v1-128k' }
    ],
    defaultModel: 'moonshot-v1-8k'
  },
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: [
      { label: 'deepseek-chat', value: 'deepseek-chat' },
      { label: 'deepseek-coder', value: 'deepseek-coder' }
    ],
    defaultModel: 'deepseek-chat'
  },
  mota: {
    apiUrl: 'https://api.mota.ai/v1/chat/completions',
    models: [
      { label: 'mota-chat', value: 'mota-chat' },
      { label: 'mota-pro', value: 'mota-pro' }
    ],
    defaultModel: 'mota-chat'
  }
}

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const apiKeyComputed = computed({
  get() {
    return isPreset(settings.value.provider) ? settings.value.apiKey : settings.value.customApiKey
  },
  set(val) {
    if (isPreset(settings.value.provider)) {
      settings.value.apiKey = val
    } else {
      settings.value.customApiKey = val
    }
  }
})

// 监听设置变化
watch(() => settingsStore.$state, (newSettings) => {
  settings.value = { ...newSettings }
}, { deep: true })

// 监听 provider 以填充默认地址/模型
watch(() => settings.value.provider, (provider) => {
  ensureProviderDefaults(provider)
})

function ensureProviderDefaults(provider) {
  if (customProviders.includes(provider)) {
    if (!settings.value.customApiUrl) {
      settings.value.customApiUrl = getApiUrlPlaceholder(provider)
    }
    if (!settings.value.customModel) {
      settings.value.customModel = settings.value.model || 'gpt-3.5-turbo'
    }
  }
}

// 测试API连接
async function testConnection() {
  const provider = settings.value.provider
  const isCustomLike = customProviders.includes(provider)
  const apiKey = isCustomLike ? settings.value.customApiKey : settings.value.apiKey
  const apiUrl = isCustomLike ? (settings.value.customApiUrl || getApiUrlPlaceholder(provider)) : getApiUrlPlaceholder(provider)
  const model = (() => {
    if (provider === 'openai' || provider === 'anthropic') return settings.value.model
    if (isCustomLike) return settings.value.customModel || 'gpt-3.5-turbo'
    return settings.value.customModel || settings.value.model
  })()

  if (provider === 'local') {
    ElMessage.success('本地优化模式，无需API连接')
    return
  }

  if (provider === 'custom' && !apiUrl) {
    ElMessage.warning('请先填写自定义API地址')
    return
  }

  if (!apiKey) {
    ElMessage.warning('请先输入API密钥')
    return
  }

  testing.value = true
  try {
    await performRealTest({ provider, apiKey, apiUrl, model })
    const suffix = provider === 'custom' ? `（模型：${model}）` : ''
    ElMessage.success(`API连接成功${suffix}`)
  } catch (error) {
    const message = error?.message || '连接失败'
    ElMessage.error(`API连接失败：${message}`)
  } finally {
    testing.value = false
  }
}

async function performRealTest({ provider, apiKey, apiUrl, model }) {
  const headers = { 'Content-Type': 'application/json' }
  let url = apiUrl
  let body = {}

  if (provider === 'openai') {
    url = 'https://api.openai.com/v1/chat/completions'
    headers.Authorization = `Bearer ${apiKey}`
    body = {
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5
    }
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/messages'
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
    body = {
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 32,
      messages: [{ role: 'user', content: 'ping' }]
    }
  } else if (provider === 'custom') {
    url = apiUrl
    headers.Authorization = `Bearer ${apiKey}`
    body = {
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5
    }
  } else if (['kimi', 'deepseek', 'mota'].includes(provider)) {
    url = apiUrl
    headers.Authorization = `Bearer ${apiKey}`
    body = {
      model: model || providerConfigs[provider]?.defaultModel || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 5
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`状态码 ${res.status}`)
  }

  // 简单读取返回以防止未捕获的 JSON 错误
  await res.text()
}

function getApiUrlPlaceholder(provider) {
  const map = {
    kimi: 'https://api.moonshot.cn/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    mota: 'https://api.mota.ai/v1/chat/completions',
    custom: 'https://your-endpoint/v1/chat/completions'
  }
  return map[provider] || map.custom
}

function isPreset(provider) {
  return presetProviders.includes(provider)
}

// 保存设置
function saveSettings() {
  settingsStore.updateSettings(settings.value)
  ElMessage.success('设置已保存')
  visible.value = false
}

// 重置设置
function resetSettings() {
  ElMessageBox.confirm(
    '确定要恢复默认设置吗？这将清除您的所有自定义配置。',
    '恢复默认设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    settingsStore.resetSettings()
    settings.value = { ...settingsStore.$state }
    ElMessage.success('已恢复默认设置')
  }).catch(() => {})
}
</script>

<style scoped>
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.el-form-item {
  margin-bottom: 24px;
}
</style>
