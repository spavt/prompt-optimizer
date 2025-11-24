/**
 * 评估提示词质量
 */
export function evaluatePromptQuality(original, optimized) {
  const scores = {
    clarity: evaluateClarity(optimized),
    completeness: evaluateCompleteness(optimized),
    structure: evaluateStructure(optimized),
    specificity: evaluateSpecificity(optimized),
    improvement: evaluateImprovement(original, optimized)
  }

  // 计算总分（百分制）
  const weights = {
    clarity: 0.25,
    completeness: 0.25,
    structure: 0.20,
    specificity: 0.20,
    improvement: 0.10
  }

  const total = Object.entries(scores).reduce((sum, [key, value]) => {
    return sum + (value * weights[key] * 20)
  }, 0)

  return {
    total: Math.round(total),
    clarity: scores.clarity,
    completeness: scores.completeness,
    structure: scores.structure,
    details: {
      specificity: scores.specificity,
      improvement: scores.improvement
    }
  }
}

/**
 * 评估清晰度
 */
function evaluateClarity(prompt) {
  let score = 3 // 基础分

  // 检查是否有明确的任务动词
  const actionVerbs = /^(请|帮我|创建|生成|编写|分析|设计|实现|优化|解释|总结|翻译)/
  if (actionVerbs.test(prompt)) {
    score += 0.5
  }

  // 检查是否避免了模糊词汇
  const vagueWords = /(一些|某些|可能|大概|也许|好像|似乎)/g
  const vagueCount = (prompt.match(vagueWords) || []).length
  if (vagueCount === 0) {
    score += 0.5
  } else if (vagueCount > 2) {
    score -= 0.5
  }

  // 检查句子长度（避免过长的句子）
  const sentences = prompt.split(/[。！？\n]/).filter(s => s.trim())
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
  if (avgLength < 50) {
    score += 0.5
  }

  // 检查是否使用了专业术语
  const technicalTerms = /(输出|格式|参数|要求|规范|标准|结构|逻辑)/g
  if (technicalTerms.test(prompt)) {
    score += 0.5
  }

  return Math.min(5, Math.max(1, score))
}

/**
 * 评估完整性
 */
function evaluateCompleteness(prompt) {
  let score = 2 // 基础分
  const components = {
    hasRole: /角色|作为|你是/.test(prompt),
    hasTask: /任务|目标|需要|要求/.test(prompt),
    hasContext: /背景|场景|情况|环境/.test(prompt),
    hasFormat: /格式|输出|返回|生成|结果/.test(prompt),
    hasConstraints: /要求|限制|条件|标准|规范/.test(prompt),
    hasExamples: /例如|示例|比如|举例|参考/.test(prompt)
  }

  // 每个组件加分
  Object.values(components).forEach(hasComponent => {
    if (hasComponent) score += 0.5
  })

  // 如果包含所有核心组件，额外加分
  if (components.hasTask && components.hasFormat) {
    score += 0.5
  }

  return Math.min(5, Math.max(1, score))
}

/**
 * 评估结构性
 */
function evaluateStructure(prompt) {
  let score = 3 // 基础分

  // 检查是否有清晰的段落结构
  const paragraphs = prompt.split('\n\n').filter(p => p.trim())
  if (paragraphs.length > 1) {
    score += 0.5
  }

  // 检查是否使用了标题或标记
  const hasHeaders = /^#{1,3}\s+.+$/m.test(prompt) || /^【.+】$/m.test(prompt)
  if (hasHeaders) {
    score += 1
  }

  // 检查是否使用了列表
  const hasList = /^\d+\.|^[-*]\s+/m.test(prompt)
  if (hasList) {
    score += 0.5
  }

  // 检查是否有清晰的开头和结尾
  const hasIntro = /^(角色|背景|任务|目标)/i.test(prompt)
  const hasOutro = /(输出|要求|注意|总结)[:：]/i.test(prompt)
  if (hasIntro && hasOutro) {
    score += 0.5
  }

  // 检查逻辑连接词的使用
  const connectors = /(首先|其次|然后|最后|第一|第二|另外|此外|因此|所以)/g
  if (connectors.test(prompt)) {
    score += 0.5
  }

  return Math.min(5, Math.max(1, score))
}

/**
 * 评估具体性
 */
function evaluateSpecificity(prompt) {
  let score = 3

  // 检查是否包含具体数字或度量
  if (/\d+/.test(prompt)) {
    score += 0.5
  }

  // 检查是否有具体的领域或技术栈
  const specificTerms = /(JavaScript|Python|React|Vue|HTML|CSS|SQL|API|JSON|Excel|PPT)/i
  if (specificTerms.test(prompt)) {
    score += 0.5
  }

  // 检查是否有明确的质量标准
  const qualityTerms = /(准确|详细|专业|完整|清晰|简洁|高质量)/
  if (qualityTerms.test(prompt)) {
    score += 0.5
  }

  // 检查细节程度
  if (prompt.length > 200) {
    score += 0.5
  }

  return Math.min(5, Math.max(1, score))
}

/**
 * 评估改进程度
 */
function evaluateImprovement(original, optimized) {
  // 长度改进
  const lengthRatio = optimized.length / original.length
  let score = 3

  if (lengthRatio > 1.5 && lengthRatio < 5) {
    score += 1
  } else if (lengthRatio > 5) {
    score += 0.5 // 过长可能不好
  }

  // 结构改进
  const originalParagraphs = original.split('\n').length
  const optimizedParagraphs = optimized.split('\n').length
  if (optimizedParagraphs > originalParagraphs) {
    score += 0.5
  }

  // 关键词增加
  const keywords = ['任务', '要求', '输出', '格式', '目标', '步骤']
  const originalKeywords = keywords.filter(k => original.includes(k)).length
  const optimizedKeywords = keywords.filter(k => optimized.includes(k)).length
  if (optimizedKeywords > originalKeywords) {
    score += 0.5
  }

  return Math.min(5, Math.max(1, score))
}

/**
 * 生成改进建议
 */
export function generateSuggestions(scores) {
  const suggestions = []

  if (scores.clarity < 4) {
    suggestions.push('可以进一步明确任务目标，使用更具体的动词和术语')
  }

  if (scores.completeness < 4) {
    suggestions.push('建议添加更多上下文信息、示例或约束条件')
  }

  if (scores.structure < 4) {
    suggestions.push('可以优化段落结构，使用标题、列表等格式化元素')
  }

  if (scores.details.specificity < 4) {
    suggestions.push('增加具体的细节、数据或技术要求')
  }

  if (suggestions.length === 0) {
    suggestions.push('提示词已经优化得很好了！')
  }

  return suggestions
}
