#!/bin/bash

echo "🚀 AI提示词优化系统 - 部署脚本"
echo "================================"

# 检查Node.js版本
echo "📦 检查环境..."
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js版本: $node_version"
else
    echo "❌ 未检测到Node.js，请先安装Node.js (https://nodejs.org/)"
    exit 1
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 启动开发服务器
echo ""
echo "🎯 启动开发服务器..."
echo "================================"
echo "📌 访问地址: http://localhost:5173"
echo "📌 按 Ctrl+C 停止服务器"
echo "================================"
echo ""

npm run dev
