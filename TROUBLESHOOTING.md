# Windows 11 故障排除指南

## 已修复的问题

1. ✅ **缺少 preload.js 文件** - 已创建
2. ✅ **electron-store 导入问题** - 已改为使用 require
3. ✅ **文件路径检查** - 添加了图标和 preload.js 的存在性检查
4. ✅ **错误处理** - 添加了更完善的错误处理和日志
5. ✅ **废弃的 API** - 移除了 enableRemoteModule

## 如果应用仍然无法打开

### 方法 1: 检查控制台错误

1. 在项目目录下运行：
```bash
npm start
```

2. 查看终端输出的错误信息，常见错误包括：
   - 模块加载失败
   - 文件路径错误
   - 权限问题

### 方法 2: 检查依赖

确保所有依赖都已正确安装：

```bash
cd fake-ad-app
npm install
```

### 方法 3: 检查 Windows 11 特定问题

#### 3.1 防病毒软件拦截
- Windows Defender 或其他安全软件可能拦截应用
- 尝试将应用添加到白名单

#### 3.2 管理员权限
- 尝试以管理员身份运行

#### 3.3 路径问题
- 确保应用路径中没有中文字符或特殊字符
- 路径不要太长（Windows 路径长度限制）

### 方法 4: 重新构建应用

如果是从源码运行，尝试重新构建：

```bash
cd fake-ad-app
npm run build
```

然后从 `dist` 目录运行生成的安装包。

### 方法 5: 检查 Electron 版本兼容性

当前使用的 Electron 版本是 31.0.1，确保与 Windows 11 兼容。

如果问题持续，可以尝试：
1. 更新 Electron 到最新版本
2. 检查 Windows 11 系统更新

### 方法 6: 查看详细日志

在 `main.js` 中已经添加了详细的错误日志。如果应用启动失败，检查：

1. 控制台输出
2. Windows 事件查看器（Event Viewer）
3. 应用数据目录中的日志文件（如果有）

## 常见错误及解决方案

### 错误: "Cannot find module 'electron-store'"
**解决方案**: 运行 `npm install`

### 错误: "Failed to load preload script"
**解决方案**: 已创建 preload.js 文件，如果仍有问题，检查文件路径

### 错误: "Application failed to start"
**解决方案**: 
- 检查 Node.js 版本（建议 16+）
- 检查是否有其他 Electron 应用正在运行
- 重启计算机

### 错误: 窗口打开后立即关闭
**解决方案**: 
- 检查控制台错误信息
- 确保所有资源文件（assets）都存在
- 检查网络连接（如果加载在线 URL）

## 联系支持

如果以上方法都无法解决问题，请提供：
1. Windows 11 版本号
2. Node.js 版本
3. 完整的错误日志
4. 应用启动方式（npm start 还是运行安装包）

