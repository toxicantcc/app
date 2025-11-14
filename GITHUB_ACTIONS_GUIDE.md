# GitHub Actions 构建 Windows EXE 指南

本指南将帮助你在 Mac 上使用 GitHub Actions 自动构建 Windows 可执行文件（.exe）。

## 📋 前置条件

1. 项目已推送到 GitHub 仓库
2. 确保 `package.json` 中已配置好 `electron-builder` 和构建脚本

## 🚀 使用方法

### 方法 1: 通过 Git Tag 触发构建（推荐）

当你创建并推送一个版本标签时，GitHub Actions 会自动构建并创建 Release：

```bash
# 1. 提交所有更改
git add .
git commit -m "准备发布 v1.0.0"

# 2. 创建版本标签
git tag v1.0.0

# 3. 推送代码和标签
git push origin main
git push origin v1.0.0
```

构建完成后：
- 在 GitHub 仓库的 **Actions** 标签页查看构建进度
- 构建成功后，在 **Releases** 页面下载 `.exe` 文件

### 方法 2: 手动触发构建

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签页
3. 选择 **Build Windows Executable** workflow
4. 点击 **Run workflow** 按钮
5. 选择分支（通常是 `main` 或 `master`）
6. 点击 **Run workflow** 开始构建

构建完成后，在 **Actions** 页面下载构建产物（Artifacts）。

## 📁 构建产物

构建完成后，你可以在以下位置找到文件：

1. **GitHub Releases**（如果使用 Tag 触发）：
   - 进入仓库的 **Releases** 页面
   - 下载 `.exe` 安装程序

2. **GitHub Actions Artifacts**：
   - 进入 **Actions** 页面
   - 点击对应的 workflow run
   - 在页面底部下载 `windows-installer` 和 `windows-dist` 压缩包

## ⚙️ Workflow 配置说明

Workflow 文件位置：`.github/workflows/build-windows.yml`

### 触发条件

- **自动触发**：当推送以 `v` 开头的标签时（如 `v1.0.0`）
- **手动触发**：在 GitHub Actions 页面手动运行

### 构建环境

- **操作系统**：Windows Latest
- **Node.js 版本**：18
- **构建命令**：`npm run build:win`

## 🔧 故障排除

### 构建失败

1. **检查依赖**：确保 `package.json` 中所有依赖都正确
2. **查看日志**：在 Actions 页面查看详细的构建日志
3. **检查图标文件**：确保 `assets/images/icon.png` 存在

### 找不到构建产物

1. 检查 `dist` 目录是否在 `.gitignore` 中（应该在）
2. 查看构建日志确认构建是否成功
3. 检查 `package.json` 中的 `build` 配置

### Release 未自动创建

- 确保使用的是以 `v` 开头的标签（如 `v1.0.0`，不是 `1.0.0`）
- 检查仓库是否有创建 Release 的权限
- 查看 Actions 日志中的错误信息

## 📝 自定义配置

如果需要修改构建配置，可以编辑 `.github/workflows/build-windows.yml`：

- 修改 Node.js 版本
- 修改构建命令
- 添加额外的构建步骤
- 修改产物上传路径

## 💡 提示

- 构建过程通常需要 5-10 分钟
- 首次构建可能需要更长时间（下载依赖）
- 可以同时配置多个平台的构建（Windows、macOS、Linux）
- 建议使用语义化版本号（如 v1.0.0, v1.1.0）

## 🔗 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

