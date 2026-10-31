#!/bin/bash

# PromptVault GitHub 部署脚本

echo "🚀 PromptVault GitHub 部署助手"
echo ""

# 检查是否已配置远程仓库
if git remote -v | grep -q "origin"; then
    echo "✅ 已检测到远程仓库配置"
    git remote -v
    echo ""
    echo "正在推送到 GitHub..."
    git push -u origin main
    echo ""
    echo "✅ 代码已成功推送到 GitHub！"
    echo ""
    echo "📝 接下来的步骤："
    echo "1. 前往你的 GitHub 仓库页面"
    echo "2. 进入 Settings > Pages"
    echo "3. 确保 Source 设置为 'GitHub Actions'"
    echo "4. 等待几分钟，GitHub Actions 会自动构建并发布网站"
    echo "5. 构建不再需要 API_KEY。每位用户在网页「设置」里填写自己的 Gemini Key，只保存在自己的浏览器中。"
    echo "   如果仓库里还留着旧的 API_KEY secret，可以删掉，工作流已经不再读取它。"
else
    echo "❌ 尚未配置远程仓库"
    echo ""
    echo "请按照以下步骤操作："
    echo ""
    echo "1. 在 GitHub 上创建一个新仓库（https://github.com/new）"
    echo "   - 仓库名称建议：promptvault"
    echo "   - 选择 Public 或 Private"
    echo "   - 不要初始化 README、.gitignore 或 license（我们已经有了）"
    echo ""
    echo "2. 创建仓库后，复制仓库的 URL（例如：https://github.com/你的用户名/promptvault.git）"
    echo ""
    echo "3. 运行以下命令连接远程仓库："
    echo "   git remote add origin <你的仓库URL>"
    echo "   git push -u origin main"
    echo ""
    echo "或者，如果你已经创建了仓库，请告诉我仓库 URL，我可以帮你连接。"
fi
