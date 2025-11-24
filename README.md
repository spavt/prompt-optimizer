# AI提示词优化大师 (Prompt Optimizer)

一个智能的AI提示词优化系统，帮助用户将简单的需求转化为高质量的AI提示词，大幅提升AI的理解能力和输出质量。

## ✨ 特性

- 🚀 **智能优化** - 多种优化策略，自动提升提示词质量
- 🎯 **领域专精** - 针对不同领域的专业优化
- 📊 **质量评分** - 实时评估优化效果
- 💾 **历史记录** - 保存和管理优化历史
- 🔄 **对比分析** - 直观展示优化前后差异
- 🎨 **优雅界面** - 现代化的UI设计
- 📱 **响应式** - 完美适配各种设备
- 🔒 **隐私安全** - 数据本地存储，支持离线使用

## 🛠️ 技术栈

- **前端框架:** Vue 3 + Composition API
- **UI组件:** Element Plus
- **状态管理:** Pinia
- **构建工具:** Vite
- **样式:** SCSS
- **持久化:** LocalStorage

## 📦 安装

### 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/prompt-optimizer.git
cd prompt-optimizer
```

2. 安装依赖
```bash
npm install
# 或者
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或者
yarn dev
```

4. 打开浏览器访问
```
http://localhost:5173
```

## 🚀 使用指南

### 基础使用

1. **输入原始需求** - 在左侧输入框中输入您的简单需求
2. **选择优化策略** - 勾选需要的优化选项（清晰度、思维链、示例等）
3. **选择专业领域** - 选择适合的领域以获得更精准的优化
4. **点击优化** - 系统将自动优化您的提示词
5. **查看结果** - 右侧显示优化后的结果和评分

### 高级功能

#### API配置（可选）
如果您想使用AI驱动的优化，可以配置API：
1. 点击设置按钮
2. 选择AI服务提供商（OpenAI/Anthropic）
3. 输入API密钥
4. 选择模型

#### 本地优化模式
无需API密钥也可使用：
- 系统提供基于规则的本地优化
- 适合大多数常见场景
- 完全免费，无限制使用

### 优化策略说明

| 策略 | 描述 | 适用场景 |
|------|------|----------|
| 清晰度优化 | 让指令更明确具体 | 所有场景 |
| 思维链(CoT) | 添加逐步思考引导 | 复杂推理任务 |
| 示例增强 | 添加输入输出示例 | 格式要求严格的任务 |
| 结构化 | 优化提示词组织结构 | 长文本生成 |
| 角色设定 | 为AI设定专业角色 | 专业领域任务 |
| 约束条件 | 添加输出限制 | 精确控制输出 |

## 📂 项目结构

```
prompt-optimizer/
├── src/
│   ├── components/        # Vue组件
│   │   ├── MainOptimizer.vue      # 主优化器
│   │   ├── SettingsDialog.vue     # 设置对话框
│   │   ├── HistoryDrawer.vue      # 历史记录
│   │   └── ComparisonDialog.vue   # 对比视图
│   ├── composables/       # 组合式函数
│   │   └── usePromptOptimizer.js  # 优化逻辑
│   ├── stores/           # 状态管理
│   │   ├── settings.js   # 设置存储
│   │   ├── history.js    # 历史存储
│   │   └── theme.js      # 主题存储
│   ├── utils/            # 工具函数
│   │   ├── optimizationStrategies.js  # 优化策略
│   │   ├── evaluator.js              # 质量评估
│   │   └── templates.js              # 快速模板
│   ├── styles/           # 样式文件
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── public/              # 静态资源
├── index.html          # HTML模板
├── vite.config.js      # Vite配置
├── package.json        # 项目配置
└── README.md           # 说明文档
```

## 🔧 配置

### 环境变量
创建 `.env` 文件（可选）：
```env
VITE_OPENAI_API_KEY=your_api_key_here
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### 构建生产版本
```bash
npm run build
# 或者
yarn build
```

构建产物将生成在 `dist` 目录中。

### 预览生产版本
```bash
npm run preview
# 或者
yarn preview
```

## 🌟 特色功能

### 1. 智能优化引擎
- 多轮迭代优化
- 自适应策略选择
- 领域特定优化

### 2. 快速模板
预设了多个领域的优化模板：
- UI设计
- 代码生成
- 文章写作
- 数据分析
- 翻译任务

### 3. 质量评估系统
- 清晰度评分
- 完整性评分
- 结构性评分
- 改进度分析

### 4. 历史管理
- 自动保存优化历史
- 搜索和筛选功能
- 导入导出支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情



**如果这个项目对您有帮助，请给个 ⭐ Star 支持一下！**
