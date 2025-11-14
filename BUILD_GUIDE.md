# 跨平台构建指南

## Mac 上构建 Windows .exe 的方法

### ⚠️ 重要说明

**Mac 默认不能直接构建 Windows 的 .exe 文件**，因为：
- macOS 和 Windows 使用不同的可执行文件格式
- electron-builder 默认只构建当前平台的应用

### ✅ 解决方案

#### 方案 1: 使用 Wine（推荐用于本地构建）

Wine 可以在 Mac 上运行 Windows 程序，electron-builder 可以使用它来构建 Windows 应用。

**安装 Wine：**

```bash
# 使用 Homebrew 安装 Wine
brew install --cask wine-stable

# 或者安装 wine-staging（更稳定）
brew install --cask wine-staging
```

**构建 Windows 应用：**

```bash
# 在 Mac 上构建 Windows 应用
npm run build:win
```

**注意事项：**
- Wine 安装和配置可能比较复杂
- 构建速度较慢
- 某些情况下可能不稳定

#### 方案 2: 使用 GitHub Actions（推荐，免费且稳定）

这是最可靠的跨平台构建方案，完全免费。

**创建 `.github/workflows/build.yml`：**

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: dist/
```

**使用方法：**
1. 将代码推送到 GitHub
2. 创建 Release 标签（如 `v1.0.0`）
3. GitHub Actions 会自动构建 Windows 和 Mac 版本
4. 在 Releases 页面下载构建好的文件

#### 方案 3: 使用虚拟机或双系统

在 Mac 上安装 Windows 虚拟机（Parallels Desktop、VMware Fusion）或使用 Boot Camp：

1. 在 Windows 环境中安装 Node.js
2. 运行 `npm install`
3. 运行 `npm run build:win`

#### 方案 4: 使用 Docker（高级）

使用 Docker 容器来构建 Windows 应用（需要 Windows 容器支持）。

### 📦 构建命令说明

```bash
# 构建当前平台的应用（Mac 上会构建 .dmg，Windows 上会构建 .exe）
npm run build

# 只构建 Windows 应用（需要 Wine）
npm run build:win

# 只构建 Mac 应用
npm run build:mac

# 构建所有平台（需要 Wine）
npm run build:all
```

### 🎯 推荐方案

**对于个人开发者：**
- 如果只是偶尔需要构建 Windows 版本：使用 **GitHub Actions**（最简单、最可靠）
- 如果需要频繁本地构建：安装 Wine 使用方案 1

**对于团队开发：**
- 强烈推荐使用 **GitHub Actions** 或类似的 CI/CD 服务
- 自动化构建流程，无需本地配置

### 📝 快速开始（GitHub Actions）

1. 在项目根目录创建 `.github/workflows/build.yml`（参考上面的配置）
2. 提交并推送到 GitHub
3. 创建 Release 标签：`git tag v1.0.0 && git push origin v1.0.0`
4. 在 GitHub 的 Actions 页面查看构建进度
5. 构建完成后，在 Releases 页面下载

### ⚡ 其他 CI/CD 选项

- **GitLab CI**: 类似 GitHub Actions
- **CircleCI**: 提供免费额度
- **Travis CI**: 开源项目免费
- **AppVeyor**: 专门用于 Windows 构建

### 🔧 故障排除

**Wine 相关问题：**
- 如果 Wine 安装失败，尝试使用 `wine-staging`
- 确保 Wine 版本 >= 5.0
- 某些情况下需要配置 Wine 前缀：`WINEPREFIX=~/.wine npm run build:win`

**构建失败：**
- 检查所有资源文件是否存在
- 确保图标文件格式正确（Windows 需要 .ico，但 electron-builder 会自动转换 .png）
- 查看详细日志：`DEBUG=electron-builder npm run build:win`

