<div align="center">

# PromptVault 🗃️
### *Good prompts aren't lucky guesses—they're engineered iterations.*
### *好提示词不靠玄学，靠版本记录和一次次改写。*

</div>

---

<div align="center">

**[English](#english) · [中文](#chinese)**

</div>

---

<a name="english"></a>

## What is this?

**PromptVault** is a browser-based personal prompt library: collect prompts, browse them like a tiny gallery, and **evolve** them with Google Gemini—each optimization becomes a new version you can scroll through like git history, without leaving the tab.

Data lives in **localStorage** by default (your machine, your prompts). Ship it to **GitHub Pages** and inject `API_KEY` at build time via Actions—same app, hosted.

## ✨ Features

- 🎨 **Qatchup-inspired UI** — minimal layout, plenty of whitespace, feels fast
- ✨ **Gemini-powered rewrite** — turns rough notes into structured prompts + optional system persona + short rationale (JSON schema, not vibes)
- 📜 **Version timeline** — every edit is a version; jump back when the new one isn't actually better
- 🔎 **Search & categories** — find prompts before you duplicate them for the fifth time
- ⭐ **Favorites & soft signals** — mark what you actually come back to
- 📤 **Import / export** — take your vault with you
- 📱 **Responsive** — works on a phone when inspiration strikes in line for coffee

## 🛠️ Tech Stack

```
Runtime:     React 19 · TypeScript · Vite 6
AI:          Google Gemini (@google/genai, build-time API_KEY)
Storage:     localStorage (client-side vault)
Deploy:      GitHub Actions → GitHub Pages
```

## 🚀 Local development

```bash
git clone https://github.com/Timelovers/promptvault.git
cd promptvault
npm install
```

Create `.env.local` (or export for one session) so `vite` can inline the key:

```bash
export API_KEY="your-google-genai-api-key"
npm run dev
```

Build preview:

```bash
npm run build
npm run preview
```

## 🌐 Deploy to GitHub Pages

1. Push this repo to GitHub (or use your fork).
2. **Repository secrets**: Settings → Secrets and variables → Actions → New repository secret  
   - Name: `API_KEY`  
   - Value: your Google Gemini API key (same as local).
3. **Pages**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Push to `main` — workflow **Deploy to GitHub Pages** builds with `API_KEY` and publishes `dist/`.

## 🔗 Live demo

- Pages: [timelovers.github.io/promptvault](https://timelovers.github.io/promptvault/)

## 📬 Contact

- GitHub: [@Timelovers](https://github.com/Timelovers)
- Website: [lijiaxing.com.cn](https://lijiaxing.com.cn/)

---

<a name="chinese"></a>

## 这是什么？

**PromptVault** 是跑在浏览器里的**个人提示词库**：把零散 prompt 收进来，像逛小型画廊一样浏览，并用 **Google Gemini** 做「演化」——每次优化都会留下新版本，时间线一拉就像在看微型 git log。

数据默认在 **localStorage**，本地优先。你也可以挂到 **GitHub Pages**，用 Actions 在构建阶段注入 `API_KEY`，同一套代码线上线下都能用。

## ✨ 功能亮点

- 🎨 **Qatchup 风格界面** — 极简、利落，打开就想往里塞两条 prompt
- ✨ **Gemini 智能改写** — 把一句话草稿变成结构化提示词 + 可选 system 人设 + 简短改动理由（走 JSON schema）
- 📜 **版本管理** — 每次演化都有记录，新版本不顺手就往回翻
- 🔎 **搜索与分类** — 先搜再给，少写三遍重复提示词
- ⭐ **收藏与互动** — 标出你真正会回头用的那几条
- 📤 **导入 / 导出** — 库跟着人走
- 📱 **响应式** — 手机也能随手改两条

## 🛠️ 技术栈

```
前端：    React 19 · TypeScript · Vite 6
模型：    Google Gemini（@google/genai，构建时注入 API_KEY）
存储：    浏览器 localStorage
部署：    GitHub Actions → GitHub Pages
```

## 🚀 本地运行

```bash
git clone https://github.com/Timelovers/promptvault.git
cd promptvault
npm install
```

设置 API Key 后启动开发服务器：

```bash
export API_KEY="你的-Google-GenAI-Key"
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

## 🌐 部署到 GitHub Pages

1. 代码推到 GitHub。
2. 仓库 **Settings → Secrets and variables → Actions** 新建密钥：名称 **`API_KEY`**，值为 Gemini Key。
3. **Settings → Pages**：部署来源选 **GitHub Actions**。
4. 推送到 `main`，Actions 会带密钥执行 `npm run build` 并发布 **dist**。

## 🔗 在线访问

- 演示：[timelovers.github.io/promptvault](https://timelovers.github.io/promptvault/)

## 📬 联系方式

- GitHub：[@Timelovers](https://github.com/Timelovers)
- 主页：[lijiaxing.com.cn](https://lijiaxing.com.cn/)

---

> 「铸魂于言，迭代于心。」
>
> *Shape the soul in words; iterate with intention.*

---

<div align="center">

Made with 💜 by [Sara](https://lijiaxing.com.cn/) · [@Timelovers](https://github.com/Timelovers)

</div>
