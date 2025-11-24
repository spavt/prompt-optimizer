/**
 * 优化策略配置
 */
export const optimizationStrategies = {
  // 清晰度优化
  clarity: {
    name: '清晰度优化',
    systemPrompt: `你是一个提示词优化专家。请将模糊的需求转化为清晰、具体的指令。
要求：
1. 明确任务目标
2. 细化具体要求
3. 消除歧义表述
4. 使用准确的术语
直接返回优化后的内容，不要解释。`,
    rules: (prompt, options) => {
      let result = prompt
      
      // 添加任务动词
      if (!result.match(/^(请|帮我|创建|生成|编写|分析|设计|实现|优化|翻译)/)) {
        result = '请' + result
      }
      
      // 明确输出要求
      if (!result.includes('输出') && !result.includes('返回') && !result.includes('生成')) {
        result += '\n\n请提供详细的输出结果。'
      }
      
      return result
    }
  },

  // 角色设定
  role: {
    name: '角色设定',
    systemPrompt: `为以下任务添加合适的角色设定，让AI扮演相关领域的专家。
直接返回包含角色设定的完整提示词。`,
    template: `## 角色设定
你是一位{domain}领域的资深专家，拥有丰富的实践经验和深厚的理论知识。

## 任务说明
{prompt}`,
    rules: (prompt, options) => {
      const domainRoles = {
        coding: '资深软件工程师',
        writing: '专业内容创作者',
        analysis: '数据分析专家',
        design: 'UI/UX设计师',
        marketing: '市场营销专家',
        education: '教育专家',
        product: '产品经理',
        general: '专业助手'
      }
      
      const role = domainRoles[options.domain] || domainRoles.general
      return `作为${role}，${prompt}`
    }
  },

  // 结构化优化
  structure: {
    name: '结构化',
    systemPrompt: `将提示词组织成清晰的结构，包含背景、目标、要求、输出格式等部分。
使用markdown格式，直接返回结构化后的提示词。`,
    rules: (prompt, options) => {
      const sections = []
      
      // 分析prompt内容，提取关键信息
      const lines = prompt.split('\n').filter(line => line.trim())
      
      sections.push('## 任务目标')
      sections.push(lines[0])
      
      if (lines.length > 1) {
        sections.push('\n## 具体要求')
        lines.slice(1).forEach((line, index) => {
          sections.push(`${index + 1}. ${line}`)
        })
      }
      
      sections.push('\n## 输出格式')
      sections.push('请以清晰、结构化的方式呈现结果')
      
      return sections.join('\n')
    }
  },

  // 思维链(CoT)优化
  cot: {
    name: '思维链',
    systemPrompt: `为提示词添加Chain-of-Thought思维链引导，让AI能够逐步思考和推理。
包含"让我们一步步思考"等引导语，并将任务分解为清晰的步骤。`,
    template: `{prompt}

让我们一步步思考这个问题：

第一步：理解和分析需求
- 明确核心目标
- 识别关键要素
- 确定约束条件

第二步：制定解决方案
- 列出可能的方案
- 评估各方案优劣
- 选择最佳方案

第三步：具体实施
- 详细展开方案
- 提供具体内容
- 确保质量标准

第四步：总结和输出
- 整理最终结果
- 检查完整性
- 优化表达方式`,
    rules: (prompt, options) => {
      return `${prompt}\n\n请逐步分析并解决这个问题，展示你的思考过程。`
    }
  },

  // 示例增强
  examples: {
    name: '示例增强',
    systemPrompt: `为提示词添加相关的输入输出示例，帮助AI更好理解期望的结果。
根据任务类型，提供1-2个具体示例。`,
    rules: (prompt, options) => {
      const domainExamples = {
        coding: '\n\n示例：\n输入：实现一个计数器功能\n输出：```javascript\nclass Counter {\n  constructor() {\n    this.count = 0;\n  }\n  increment() {\n    this.count++;\n  }\n}\n```',
        writing: '\n\n示例格式：\n标题：吸引人的标题\n引言：简短有力的开头\n正文：详细的内容展开\n结论：总结要点',
        design: '\n\n示例风格：\n- 现代简约设计\n- 清晰的视觉层次\n- 响应式布局\n- 符合用户体验原则',
        general: '\n\n请参考以下格式输出结果：\n- 清晰的结构\n- 具体的内容\n- 专业的表述'
      }
      
      const example = domainExamples[options.domain] || domainExamples.general
      return prompt + example
    }
  },

  // 约束条件
  constraints: {
    name: '约束条件',
    systemPrompt: `为提示词添加适当的约束条件和质量要求，确保输出符合预期。`,
    template: `{prompt}

## 约束条件
- 长度要求：适中，避免过于冗长
- 语言风格：专业但易懂
- 准确性：确保信息准确无误
- 完整性：覆盖所有相关方面

## 质量标准
- 逻辑清晰，条理分明
- 内容准确，有理有据
- 表述专业，易于理解
- 格式规范，便于阅读`,
    rules: (prompt, options) => {
      const constraints = [
        '\n\n要求：',
        '1. 确保内容的准确性和专业性',
        '2. 使用清晰的结构和格式',
        '3. 提供具体可执行的方案'
      ]
      
      if (options.domain === 'coding') {
        constraints.push('4. 代码需要包含注释说明')
        constraints.push('5. 遵循最佳实践和编码规范')
      } else if (options.domain === 'writing') {
        constraints.push('4. 注意语言的流畅性和可读性')
        constraints.push('5. 确保逻辑连贯，论点充分')
      }
      
      return prompt + constraints.join('\n')
    }
  }
}

/**
 * 获取领域特定的优化建议
 */
export function getDomainSpecificTips(domain) {
  const tips = {
    coding: [
      '明确编程语言和框架',
      '说明代码用途和场景',
      '指定代码风格和规范',
      '要求包含错误处理',
      '需要代码注释和文档'
    ],
    writing: [
      '明确文章类型和风格',
      '指定目标受众',
      '说明字数要求',
      '要求包含关键要素',
      '注重逻辑和结构'
    ],
    analysis: [
      '明确数据类型和来源',
      '指定分析维度',
      '要求可视化展示',
      '需要结论和建议',
      '注意数据准确性'
    ],
    design: [
      '明确设计风格',
      '指定颜色方案',
      '说明使用场景',
      '要求响应式设计',
      '注重用户体验'
    ],
    marketing: [
      '明确目标受众',
      '指定营销渠道',
      '要求数据支撑',
      '需要行动号召',
      '注重转化效果'
    ],
    education: [
      '明确学习目标',
      '指定难度级别',
      '要求循序渐进',
      '包含练习示例',
      '注重理解深度'
    ],
    product: [
      '明确产品定位',
      '指定用户画像',
      '要求数据支持',
      '需要优先级排序',
      '注重可行性'
    ],
    general: [
      '明确具体需求',
      '提供必要背景',
      '指定输出格式',
      '说明质量要求',
      '给出参考示例'
    ]
  }
  
  return tips[domain] || tips.general
}
