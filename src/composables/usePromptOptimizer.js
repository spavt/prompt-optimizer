import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { optimizationStrategies } from '@/utils/optimizationStrategies'
import { evaluatePromptQuality } from '@/utils/evaluator'

export function usePromptOptimizer() {
  const settings = useSettingsStore()
  const isOptimizing = ref(false)
  const optimizedPrompt = ref('')

  const hasAIConfig = () => {
    if (settings.provider === 'local') return false
    const customProviders = ['custom', 'kimi', 'mota', 'deepseek']
    if (customProviders.includes(settings.provider)) {
      return !!(settings.customApiUrl && settings.customApiKey)
    }
    return !!settings.apiKey
  }

  /**
   * 主优化函数
   */
  async function optimizePrompt(userInput, options = {}, hooks = {}) {
    const { onStep } = hooks
    isOptimizing.value = true
    const steps = []
    optimizedPrompt.value = ''
    let finalOutput = ''
    let modelOutputAttempted = false
    let modelOutputReason = ''

    try {
      // Step 1: 基础清晰度优化
      let currentPrompt = userInput
      if (options.clarity) {
        const clarityResult = await applyStrategy('clarity', currentPrompt, options)
        currentPrompt = clarityResult.result
        steps.push({
          name: '清晰度优化',
          description: '让指令更加明确和具体',
          improvements: ['明确任务目标', '细化要求', '消除歧义'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // Step 2: 添加角色设定
      if (options.role) {
        const roleResult = await applyStrategy('role', currentPrompt, options)
        currentPrompt = roleResult.result
        steps.push({
          name: '角色设定',
          description: '为AI设定专业角色，提升回答质量',
          improvements: ['专业角色定义', '能力边界设定'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // Step 3: 结构化优化
      if (options.structure) {
        const structureResult = await applyStrategy('structure', currentPrompt, options)
        currentPrompt = structureResult.result
        steps.push({
          name: '结构化组织',
          description: '优化提示词的组织结构',
          improvements: ['逻辑分段', '要点列举', '格式规范'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // Step 4: 思维链优化
      if (options.cot) {
        const cotResult = await applyStrategy('cot', currentPrompt, options)
        currentPrompt = cotResult.result
        steps.push({
          name: '思维链(CoT)',
          description: '添加逐步思考的引导',
          improvements: ['步骤分解', '推理过程', '逻辑链条'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // Step 5: 示例增强
      if (options.examples) {
        const exampleResult = await applyStrategy('examples', currentPrompt, options)
        currentPrompt = exampleResult.result
        steps.push({
          name: '示例增强',
          description: '添加输入输出示例',
          improvements: ['参考案例', '期望格式', '质量标准'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // Step 6: 约束条件
      if (options.constraints) {
        const constraintResult = await applyStrategy('constraints', currentPrompt, options)
        currentPrompt = constraintResult.result
        steps.push({
          name: '约束条件',
          description: '添加输出限制和要求',
          improvements: ['格式要求', '长度限制', '质量标准'],
          status: 'success'
        })
        onStep?.(steps, currentPrompt)
      }

      // 评估优化质量
      const score = evaluatePromptQuality(userInput, currentPrompt)
      optimizedPrompt.value = currentPrompt

      const wantModelOutput = settings.preferences?.autoGenerateOutput !== false
      const canCallModel = hasAIConfig()

      // 如果有可用的模型配置，再用优化后的提示词生成最终输出
      if (wantModelOutput && canCallModel) {
        modelOutputAttempted = true
        try {
          const raw = await callAI({
            messages: [
              { role: 'system', content: '请直接输出结果，不要加入解释、寒暄或确认语。' },
              { role: 'user', content: currentPrompt }
            ]
          })
          finalOutput = sanitizeModelOutput(raw)
        } catch (error) {
          console.warn('模型输出调用失败，使用优化提示词作为输出:', error)
          finalOutput = currentPrompt
          modelOutputReason = error?.message || '模型调用失败'
        }
      } else {
        finalOutput = currentPrompt
        if (wantModelOutput && !canCallModel) {
          modelOutputReason = '未检测到有效的API配置，未生成模型输出'
        }
      }

      return {
        original: userInput,
        optimizedPrompt: currentPrompt,
        finalOutput,
        modelOutputAttempted,
        modelOutputReason,
        steps,
        score
      }
    } catch (error) {
      console.error('优化过程出错:', error)
      throw error
    } finally {
      isOptimizing.value = false
    }
  }

  /**
   * 应用特定优化策略
   */
  async function applyStrategy(strategyName, prompt, options) {
    const strategy = optimizationStrategies[strategyName]
    if (!strategy) {
      return { result: prompt }
    }

    // 如果配置了API，使用AI优化
    if (hasAIConfig()) {
      return await applyAIStrategy(strategy, prompt, options)
    }

    // 否则使用本地规则优化
    return applyLocalStrategy(strategy, prompt, options)
  }

  /**
   * AI优化策略
   */
  async function applyAIStrategy(strategy, prompt, options) {
    try {
      const response = await callAI({
        messages: [
          {
            role: 'system',
            content: strategy.systemPrompt
          },
          {
            role: 'system',
            content: '请仅返回优化后的提示词本身，使用JSON格式 {"optimized_prompt": "..."}，不要包含解释、寒暄或额外文字。'
          },
          {
            role: 'user',
            content: `请优化以下提示词：\n\n${prompt}\n\n领域：${options.domain || 'general'}`
          }
        ]
      })

      return { result: sanitizeModelOutput(response) }
    } catch (error) {
      console.warn('AI优化失败，使用本地策略:', error)
      if (settings.provider === 'custom') {
        // 自定义接口失败时直接抛出，避免误以为使用了默认结果
        throw error
      }
      return applyLocalStrategy(strategy, prompt, options)
    }
  }

  /**
   * 本地规则优化策略
   */
  function applyLocalStrategy(strategy, prompt, options) {
    let result = prompt

    // 应用策略规则
    if (strategy.rules) {
      result = strategy.rules(result, options)
    }

    // 应用模板
    if (strategy.template) {
      result = strategy.template.replace('{prompt}', result)
        .replace('{domain}', options.domain || 'general')
    }

    return { result }
  }

  /**
   * 调用AI API
   */
  async function callAI({ messages }) {
    const provider = settings.provider
    const customProviders = ['custom', 'kimi', 'mota', 'deepseek']
    const apiKey = customProviders.includes(provider) ? settings.customApiKey : settings.apiKey
    const apiUrl = customProviders.includes(provider) ? (settings.customApiUrl || getDefaultApiUrl(provider)) : undefined
    const model = customProviders.includes(provider)
      ? (settings.customModel || getDefaultModel(provider) || settings.model || 'gpt-3.5-turbo')
      : settings.model

    if (provider !== 'local' && !apiKey) {
      throw new Error(provider === 'custom' ? '请先配置自定义API密钥' : '请先配置API密钥')
    }

    if (customProviders.includes(provider)) {
      if (!apiUrl) {
        throw new Error('请先配置自定义API地址')
      }
      if (!model) {
        throw new Error('请先配置自定义模型')
      }
      const url = apiUrl || getDefaultApiUrl(provider)
      return callCustomApi({ messages, apiUrl: url, apiKey, model })
    }

    // 模拟API调用（实际项目中需要真实的API调用）
    // 这里使用本地优化作为演示
    return simulateAIOptimization(messages[messages.length - 1].content)
  }

  function sanitizeModelOutput(raw) {
    if (!raw) return ''

    // 如果是对象尝试读取常见字段
    if (typeof raw === 'object') {
      const content = raw.optimized_prompt || raw.result || raw.content || raw.message || ''
      if (content) raw = content
      else raw = JSON.stringify(raw)
    }

    let text = String(raw)

    // 提取代码块中的内容
    const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (codeMatch) {
      text = codeMatch[1]
    }

    // 尝试解析 JSON，读取 optimized_prompt
    try {
      const parsed = JSON.parse(text)
      if (parsed && parsed.optimized_prompt) {
        text = parsed.optimized_prompt
      }
    } catch (_) {
      // 非 JSON 忽略
    }

    // 去除常见开头客套语
    const fillers = [
      /^\s*我(理解|已经了解|明白).*?(?:[:,，。]|$)/i,
      /^\s*好的.*?(?:[:,，。]|$)/i,
      /^\s*让我.*?(?:[:,，。]|$)/i,
      /^\s*Sure.*?(?:[:,，. ]|$)/i,
      /^\s*Okay.*?(?:[:,，. ]|$)/i
    ]
    fillers.forEach((re) => {
      text = text.replace(re, '').trim()
    })

    // 去除多余的“优化后的提示词”标签
    text = text.replace(/^优化后的提示词[:：]\s*/i, '').trim()

    return text.trim()
  }

  async function callCustomApi({ messages, apiUrl, apiKey, model }) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages
      })
    })

    if (!response.ok) {
      throw new Error(`自定义API请求失败：${response.status}`)
    }

    const data = await response.json()
    // 优先兼容 OpenAI 风格的返回
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content
    }

    // 兼容简单文本返回
    if (typeof data === 'string') {
      return data
    }

    // 兼容常见的 { result: '' } 形式
    if (data?.result) {
      return data.result
    }

    throw new Error('未能从自定义API解析到文本结果')
  }

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
    return map[provider]
  }

  /**
   * 模拟AI优化（用于演示）
   */
  function simulateAIOptimization(prompt) {
    // 提取原始提示词
    const match = prompt.match(/请优化以下提示词：\n\n(.+?)\n\n领域：/s)
    const originalPrompt = match ? match[1] : prompt

    // 模拟优化结果
    const optimized = `## 角色设定
你是一位经验丰富的专业助手，精通相关领域的知识和最佳实践。

## 任务目标
${originalPrompt}

## 具体要求
1. 确保输出内容准确、专业、易于理解
2. 结构清晰，逻辑严密
3. 提供具体、可执行的方案
4. 考虑实际应用场景和限制

## 输出格式
- 使用清晰的标题和分段
- 关键信息用列表或表格呈现
- 包含必要的示例和说明

## 质量标准
- 完整性：覆盖所有相关方面
- 准确性：信息准确无误
- 实用性：可直接应用于实践`

    return optimized
  }

  return {
    optimizePrompt,
    isOptimizing
  }
}
