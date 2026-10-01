#!/bin/bash
# ==============================================================================
# 🚀 FoFo 个人工作台 (FoFo Personal Workstation) - macOS 一键启动脚本
# 双击此脚本即可在 Mac 上直接启动 FoFo，无需手动输入终端命令
# ==============================================================================

# 自动切换到当前脚本所在的绝对目录
cd "$(dirname "$0")"

echo "--------------------------------------------------------"
echo "  🚀 正在启动 FoFo 个人工作台 (macOS)..."
echo "--------------------------------------------------------"

# 检测系统 Python 3 环境
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null && python --version 2>&1 | grep -q "Python 3"; then
    PYTHON_CMD="python"
else
    echo "❌ 未检测到 Python 3 环境！"
    echo "💡 提示: 请前往 https://www.python.org/downloads/ 下载安装 Python 3，或在终端输入 'brew install python3'。"
    echo ""
    echo "按任意键退出..."
    read -n 1
    exit 1
fi

echo "🟢 检测到 Python 3 环境: $($PYTHON_CMD --version)"
echo "📡 正在启动本地服务并唤起默认浏览器 (Safari / Chrome / Arc)..."
echo "💡 个人数据自动保存在当前目录下的 data/ 文件夹中。"
echo "--------------------------------------------------------"
echo "提示: 关闭此终端窗口即可退出 FoFo 服务。"
echo "--------------------------------------------------------"

$PYTHON_CMD server.py
