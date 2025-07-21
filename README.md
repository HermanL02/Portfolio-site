# 🌍 Personal Website & GitHub Profile Sync | 个人网站与GitHub资料同步

*[English](#english) | [中文](#chinese)*

---

## English

### 🚀 Personal Website & GitHub Profile Auto-Sync System

This is a Next.js personal portfolio website that automatically generates and syncs a README to your GitHub profile repository. Built with YAML-based configuration for easy content management.

#### ✨ Features

- 🌐 **Modern Next.js Website** with Tailwind CSS & ShadCN UI
- 📝 **YAML-Based Content** - Easy to edit configuration files
- 🤖 **Auto-Sync to GitHub** - Keep your GitHub profile updated automatically
- 🏷️ **Smart Project Filtering** - Filter projects by technology tags
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Real-time Updates** - Changes sync automatically via GitHub Actions
- 🌍 **Bilingual Support** - Documentation in English and Chinese

#### 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI, Lucide Icons
- **Content**: YAML configuration files
- **Automation**: GitHub Actions, Node.js scripts
- **Markdown**: React-Markdown for proper formatting

---

### 🏗️ Setup Instructions

#### 1. Clone & Install

```bash
git clone <your-repo-url>
cd your-repo-name
npm install
```

#### 2. Configure Environment Variables

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your information:

```env
# GitHub Configuration
GITHUB_USERNAME=YourGitHubUsername
GITHUB_PROFILE_REPO=YourGitHubUsername/YourGitHubUsername

# Git Configuration  
GIT_USER_NAME=Your Full Name
GIT_USER_EMAIL=your.email@example.com

# Commit Configuration
COMMIT_MESSAGE=🤖 Auto-update profile README from website
COMMIT_BRANCH=main

# Language Configuration (en/zh)
DEFAULT_LANGUAGE=en
```

#### 3. Customize Your Content

Edit the YAML files in the `config/` directory:

- **`config/intro.yaml`** - Your name, title, contact info, quote
- **`config/projects.yaml`** - Your projects with descriptions and tech tags
- **`config/experience.yaml`** - Work experience and achievements
- **`config/tech_stack.yaml`** - Technologies organized by categories
- **`config/education.yaml`** - Educational background
- **`config/current_work.yaml`** - What you're currently working on
- **`config/learning.yaml`** - What you're currently learning
- **`config/fun_facts.yaml`** - Personal fun facts
- **`config/journey.yaml`** - Your tech journey timeline

#### 4. Test Locally

```bash
# Test the setup
npm run test-sync

# Generate README from YAML
npm run generate-readme

# Run the website locally
npm run dev
```

#### 5. Setup GitHub Auto-Sync (Optional but Recommended)

##### 5.1 Create Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `Profile Sync Token`
4. Scopes: Select `repo` (full control)
5. Copy the generated token

##### 5.2 Create Profile Repository
```bash
# Create repository with your exact username
gh repo create YourUsername/YourUsername --public --clone
cd YourUsername
echo "# Hi there! 👋" > README.md
git add . && git commit -m "Initial commit" && git push
```

##### 5.3 Add Secrets to Website Repository
1. Go to your website repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `PROFILE_SYNC_TOKEN` = Your personal access token

##### 5.4 Add Variables (Optional)
Go to Settings → Secrets and variables → Actions → Variables tab:
- `GITHUB_USERNAME` = Your GitHub username
- `GITHUB_PROFILE_REPO` = YourUsername/YourUsername
- `GIT_USER_NAME` = Your display name
- `GIT_USER_EMAIL` = Your email

##### 5.5 Push and Activate
```bash
git add .
git commit -m "Setup auto-sync system"
git push origin main
```

---

### 🎯 Usage

#### Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run generate-readme  # Generate README from YAML files
npm run deploy-profile   # Deploy README to GitHub profile
npm run sync-github      # Generate + Deploy in one command
npm run test-sync        # Test all configurations
```

#### Content Management

1. **Edit YAML files** in `config/` directory
2. **Push changes** to your repository
3. **GitHub Actions automatically**:
   - Generates new README
   - Updates your GitHub profile
   - Takes 2-3 minutes

#### Manual Sync (Alternative)

```bash
# Authenticate with GitHub CLI (one-time)
gh auth login

# Sync manually
npm run sync-github
```

---

### 📁 Project Structure

```
├── config/                  # YAML configuration files
│   ├── intro.yaml          # Personal intro & contact
│   ├── projects.yaml       # Project portfolio
│   ├── experience.yaml     # Work experience
│   ├── tech_stack.yaml     # Technology skills
│   └── ...                 # Other content files
├── src/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   │   ├── sections/       # Content sections
│   │   └── ui/             # UI components
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── .github/workflows/      # GitHub Actions
├── generateReadme.js       # README generator script
├── deployToGithub.js      # GitHub sync script
├── .env                   # Environment variables
└── README.md              # This file
```

---

### 🔧 Customization

#### Adding New Content Sections

1. **Create new YAML file** in `config/`
2. **Add corresponding component** in `src/components/sections/`
3. **Update types** in `src/types/index.ts`
4. **Generator automatically detects** new files

#### Modifying Design

- **Tailwind classes** in components for styling
- **ShadCN components** for consistent UI
- **Edit layout** in `src/app/page.tsx`

#### Changing Sync Behavior

- **Modify triggers** in `.github/workflows/sync-profile-readme.yml`
- **Update commit messages** in `.env`
- **Change target repository** in environment variables

---

### 🐛 Troubleshooting

#### Common Issues

**Sync Not Working?**
```bash
npm run test-sync  # Check all configurations
gh auth status     # Verify GitHub authentication
```

**README Not Generated?**
```bash
npm run generate-readme  # Test generation locally
# Check YAML syntax in config files
```

**GitHub Actions Failing?**
1. Check Actions tab in your repository
2. Verify `PROFILE_SYNC_TOKEN` secret is set
3. Ensure target repository exists
4. Check token permissions include `repo`

---

### 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN UI Components](https://ui.shadcn.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [YAML Syntax Guide](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)

---

## Chinese

### 🚀 个人网站与GitHub资料自动同步系统

这是一个基于Next.js的个人作品集网站，能够自动生成并同步README到您的GitHub个人资料仓库。使用YAML配置文件便于内容管理。

#### ✨ 特性

- 🌐 **现代化Next.js网站** - 使用Tailwind CSS和ShadCN UI
- 📝 **基于YAML的内容管理** - 易于编辑的配置文件
- 🤖 **自动同步到GitHub** - 保持GitHub资料自动更新
- 🏷️ **智能项目筛选** - 根据技术标签筛选项目
- 📱 **响应式设计** - 支持所有设备
- 🔄 **实时更新** - 通过GitHub Actions自动同步变更
- 🌍 **双语支持** - 中英文文档

#### 🛠️ 技术栈

- **前端**: Next.js 15+, React, TypeScript, Tailwind CSS
- **UI组件**: ShadCN UI, Lucide图标
- **内容**: YAML配置文件
- **自动化**: GitHub Actions, Node.js脚本
- **Markdown**: React-Markdown用于格式化

---

### 🏗️ 设置说明

#### 1. 克隆和安装

```bash
git clone <你的仓库地址>
cd 你的仓库名称
npm install
```

#### 2. 配置环境变量

复制示例环境文件并自定义：

```bash
cp .env.example .env
```

编辑`.env`文件填入您的信息：

```env
# GitHub配置
GITHUB_USERNAME=您的GitHub用户名
GITHUB_PROFILE_REPO=您的用户名/您的用户名

# Git配置
GIT_USER_NAME=您的全名
GIT_USER_EMAIL=your.email@example.com

# 提交配置
COMMIT_MESSAGE=🤖 从网站自动更新个人资料README
COMMIT_BRANCH=main

# 语言配置 (en/zh)
DEFAULT_LANGUAGE=zh
```

#### 3. 自定义您的内容

编辑`config/`目录中的YAML文件：

- **`config/intro.yaml`** - 姓名、标题、联系信息、座右铭
- **`config/projects.yaml`** - 项目作品集及技术标签
- **`config/experience.yaml`** - 工作经历和成就
- **`config/tech_stack.yaml`** - 按类别组织的技术栈
- **`config/education.yaml`** - 教育背景
- **`config/current_work.yaml`** - 当前工作内容
- **`config/learning.yaml`** - 正在学习的内容
- **`config/fun_facts.yaml`** - 个人趣事
- **`config/journey.yaml`** - 技术成长时间线

#### 4. 本地测试

```bash
# 测试配置
npm run test-sync

# 从YAML生成README
npm run generate-readme

# 本地运行网站
npm run dev
```

#### 5. 设置GitHub自动同步（可选但推荐）

##### 5.1 创建个人访问令牌
1. 前往 GitHub设置 → 开发者设置 → 个人访问令牌 → 令牌（经典版）
2. 点击"生成新令牌（经典版）"
3. 名称：`Profile Sync Token`
4. 权限：选择`repo`（完全控制）
5. 复制生成的令牌

##### 5.2 创建个人资料仓库
```bash
# 创建与您用户名完全相同的仓库
gh repo create 您的用户名/您的用户名 --public --clone
cd 您的用户名
echo "# 你好！👋" > README.md
git add . && git commit -m "Initial commit" && git push
```

##### 5.3 为网站仓库添加密钥
1. 前往您的网站仓库 → 设置 → 密钥和变量 → Actions
2. 添加以下密钥：
   - `PROFILE_SYNC_TOKEN` = 您的个人访问令牌

##### 5.4 添加变量（可选）
前往 设置 → 密钥和变量 → Actions → 变量选项卡：
- `GITHUB_USERNAME` = 您的GitHub用户名
- `GITHUB_PROFILE_REPO` = 您的用户名/您的用户名
- `GIT_USER_NAME` = 您的显示名称
- `GIT_USER_EMAIL` = 您的邮箱

##### 5.5 推送并激活
```bash
git add .
git commit -m "设置自动同步系统"
git push origin main
```

---

### 🎯 使用方法

#### 开发命令

```bash
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run generate-readme  # 从YAML文件生成README
npm run deploy-profile   # 部署README到GitHub资料
npm run sync-github      # 生成+部署一键完成
npm run test-sync        # 测试所有配置
```

#### 内容管理

1. **编辑YAML文件** 在`config/`目录中
2. **推送更改** 到您的仓库
3. **GitHub Actions自动**：
   - 生成新的README
   - 更新您的GitHub资料
   - 需要2-3分钟

#### 手动同步（备选方案）

```bash
# 通过GitHub CLI认证（一次性）
gh auth login

# 手动同步
npm run sync-github
```

---

### 📁 项目结构

```
├── config/                  # YAML配置文件
│   ├── intro.yaml          # 个人介绍和联系方式
│   ├── projects.yaml       # 项目作品集
│   ├── experience.yaml     # 工作经历
│   ├── tech_stack.yaml     # 技术技能
│   └── ...                 # 其他内容文件
├── src/
│   ├── app/                # Next.js应用目录
│   ├── components/         # React组件
│   │   ├── sections/       # 内容区块
│   │   └── ui/             # UI组件
│   ├── lib/                # 工具函数
│   └── types/              # TypeScript类型
├── .github/workflows/      # GitHub Actions
├── generateReadme.js       # README生成脚本
├── deployToGithub.js      # GitHub同步脚本
├── .env                   # 环境变量
└── README.md              # 此文件
```

---

### 🔧 自定义

#### 添加新内容版块

1. **在`config/`中创建新YAML文件**
2. **在`src/components/sections/`中添加对应组件**
3. **更新`src/types/index.ts`中的类型**
4. **生成器自动检测**新文件

#### 修改设计

- **在组件中使用Tailwind类**进行样式设置
- **使用ShadCN组件**保持UI一致性
- **编辑布局**在`src/app/page.tsx`中

#### 更改同步行为

- **修改触发条件**在`.github/workflows/sync-profile-readme.yml`中
- **更新提交消息**在`.env`中
- **更改目标仓库**在环境变量中

---

### 🐛 故障排除

#### 常见问题

**同步不工作？**
```bash
npm run test-sync  # 检查所有配置
gh auth status     # 验证GitHub认证
```

**README未生成？**
```bash
npm run generate-readme  # 本地测试生成
# 检查config文件中的YAML语法
```

**GitHub Actions失败？**
1. 检查仓库中的Actions选项卡
2. 验证`PROFILE_SYNC_TOKEN`密钥已设置
3. 确保目标仓库存在
4. 检查令牌权限包含`repo`

---

### 📚 资源

- [Next.js文档](https://nextjs.org/docs)
- [ShadCN UI组件](https://ui.shadcn.com/)
- [GitHub Actions文档](https://docs.github.com/zh/actions)
- [YAML语法指南](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)

---

## 🤝 Contributing | 贡献

Feel free to open issues and pull requests! | 欢迎提交问题和拉取请求！

## 📄 License | 许可证

MIT License | MIT许可证

---

*Generated with ❤️ using Next.js and GitHub Actions | 使用Next.js和GitHub Actions构建*