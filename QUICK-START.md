# 🚀 Quick Start Guide | 快速开始指南

*Get your personal website and GitHub profile sync running in 5 minutes! | 5分钟内让您的个人网站和GitHub资料同步运行起来！*

---

## 🇺🇸 English Quick Start

### Step 1: Setup Environment (30 seconds)
```bash
# Clone and install
git clone <your-repo>
cd your-repo
npm install

# Setup environment
cp .env.example .env
# Edit .env with your GitHub username
```

### Step 2: Customize Content (2 minutes)
Edit these key files in `config/` folder:
- `intro.yaml` - Your name and contact
- `projects.yaml` - Add your projects
- `experience.yaml` - Add work experience

### Step 3: Test Locally (30 seconds)
```bash
npm run dev          # Start website at localhost:3000
npm run test-sync    # Test sync configuration
```

### Step 4: Setup GitHub Sync (2 minutes)
1. Create GitHub token: GitHub Settings → Developer settings → Personal access tokens
2. Create profile repo: `YourUsername/YourUsername`
3. Add `PROFILE_SYNC_TOKEN` secret to your website repo
4. Push changes - auto-sync activates!

### Step 5: Done! 🎉
Your website runs at localhost:3000 and GitHub profile updates automatically!

---

## 🇨🇳 中文快速开始

### 第一步：环境设置 (30秒)
```bash
# 克隆和安装
git clone <你的仓库>
cd 你的仓库
npm install

# 设置环境
cp .env.example .env
# 编辑.env填入您的GitHub用户名
```

### 第二步：自定义内容 (2分钟)
编辑`config/`文件夹中的关键文件：
- `intro.yaml` - 您的姓名和联系方式
- `projects.yaml` - 添加您的项目
- `experience.yaml` - 添加工作经历

### 第三步：本地测试 (30秒)
```bash
npm run dev          # 启动网站 localhost:3000
npm run test-sync    # 测试同步配置
```

### 第四步：设置GitHub同步 (2分钟)
1. 创建GitHub令牌：GitHub设置 → 开发者设置 → 个人访问令牌
2. 创建资料仓库：`您的用户名/您的用户名`
3. 为网站仓库添加`PROFILE_SYNC_TOKEN`密钥
4. 推送更改 - 自动同步激活！

### 第五步：完成！🎉
您的网站运行在localhost:3000，GitHub资料会自动更新！

---

## 🔗 Essential Commands | 必要命令

```bash
npm run dev              # Development server | 开发服务器
npm run build            # Build for production | 构建生产版本
npm run generate-readme  # Generate README | 生成README
npm run sync-github      # Sync to GitHub | 同步到GitHub
npm run test-sync        # Test configuration | 测试配置
```

## 📁 Key Files to Edit | 需要编辑的关键文件

```
config/
├── intro.yaml      # Name, title, contact | 姓名、标题、联系方式
├── projects.yaml   # Your projects | 您的项目
├── experience.yaml # Work experience | 工作经历
├── tech_stack.yaml # Technologies | 技术栈
└── education.yaml  # Education | 教育背景
```

## 🆘 Need Help? | 需要帮助？

- 📖 Full documentation in `README.md` | 完整文档请查看`README.md`
- 🧪 Test your setup: `npm run test-sync` | 测试设置：`npm run test-sync`
- 🔧 Troubleshooting in main README | 故障排除请查看主README

---

*Happy coding! | 编码愉快！* 🚀