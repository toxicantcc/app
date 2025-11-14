const { app, BrowserWindow, ipcMain, BrowserView } = require('electron');
const path = require('path');
const fs = require('fs');

let Store;
let mainWindow;
let settingsWindow;
let view; // BrowserView 实例
let originalBounds = null; // 用于标记是否处于"应用内全屏"状态

// 修复 electron-store 导入问题，使用 require 而不是动态 import
try {
    Store = require('electron-store');
} catch (error) {
    console.error('Failed to load electron-store:', error);
    // 如果 electron-store 加载失败，使用简单的内存存储作为后备
    Store = class {
        constructor() {
            this.data = {};
        }
        get(key, defaultValue) {
            return this.data[key] !== undefined ? this.data[key] : defaultValue;
        }
        set(key, value) {
            this.data[key] = value;
        }
    };
}

function createWindow() {
    const store = new Store();
    const lastWindowState = store.get('windowBounds', { width: 1000, height: 750 });

    // 检查图标文件是否存在
    const iconPath = path.join(__dirname, 'assets/images/icon.png');
    const iconExists = fs.existsSync(iconPath);
    
    // 检查 preload.js 是否存在
    const preloadPath = path.join(__dirname, 'preload.js');
    const preloadExists = fs.existsSync(preloadPath);

    mainWindow = new BrowserWindow({
        x: lastWindowState.x,
        y: lastWindowState.y,
        width: lastWindowState.width,
        height: lastWindowState.height,
        frame: false,
        ...(iconExists && { icon: iconPath }), // 只有图标存在时才设置
        webPreferences: {
            ...(preloadExists && { preload: preloadPath }), // 只有 preload.js 存在时才设置
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');

    // 在主窗口上监听 'resize' 事件
    mainWindow.on('resize', () => {
        // 如果处于"应用内全屏"模式，则始终让 BrowserView 填满窗口
        if (originalBounds) {
            const [width, height] = mainWindow.getContentSize();
            view.setBounds({ x: 0, y: 0, width, height });
        }
    });

    // 保存窗口位置
    mainWindow.on('close', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            try {
                store.set('windowBounds', mainWindow.getBounds());
            } catch (error) {
                console.error('Failed to save window bounds:', error);
            }
        }
    });

    // 添加错误处理
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    mainWindow.on('unresponsive', () => {
        console.warn('Window became unresponsive');
    });

    mainWindow.on('responsive', () => {
        console.log('Window became responsive again');
    });

    // 创建 BrowserView
    try {
        view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            }
        });

        // 诊断结束，移除背景色
        // view.setBackgroundColor('#FF00FF');

        mainWindow.setBrowserView(view);
        view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
    } catch (error) {
        console.error('Failed to create BrowserView:', error);
        // 如果 BrowserView 创建失败，应用仍然可以运行，只是没有内置浏览器功能
    }

    // 监听 BrowserView 的全屏事件
    if (view && !view.webContents.isDestroyed()) {
        view.webContents.on('enter-html-full-screen', () => {
            if (view && !view.webContents.isDestroyed()) {
                originalBounds = view.getBounds();
                view.setAutoResize({ width: false, height: false });
                const [width, height] = mainWindow.getContentSize();
                view.setBounds({ x: 0, y: 0, width, height });
            }
        });

        view.webContents.on('leave-html-full-screen', () => {
            if (view && !view.webContents.isDestroyed() && originalBounds) {
                view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true });
                view.setBounds(originalBounds);
                originalBounds = null;
            }
        });
    }

    // 从 store 加载 URL 和缩放设置
    if (!view || view.webContents.isDestroyed()) {
        console.error('BrowserView is not available');
        return;
    }

    const settings = store.get('settings', { url: 'https://www.baidu.com', zoom: 1.0 });
    try {
        view.webContents.loadURL(settings.url);
    } catch (error) {
        console.error('Failed to load URL:', error);
        // 如果 URL 加载失败，尝试加载默认页面
        try {
            view.webContents.loadURL('https://www.baidu.com');
        } catch (fallbackError) {
            console.error('Failed to load fallback URL:', fallbackError);
        }
    }
    if (view && !view.webContents.isDestroyed()) {
        view.webContents.on('did-finish-load', () => {
            if (view && !view.webContents.isDestroyed()) {
                const currentSettings = store.get('settings', { zoom: 1.0 });
                view.webContents.setZoomFactor(currentSettings.zoom);

        // 【重新启用】终极版"播放器净化"脚本 V5 - 野蛮模式
        const isolationScript = `
            (function() {
                setTimeout(() => {
                    try {
                        const selectors = 'video[src], iframe, #player, #player-container, .player-container, #video-player, .video-player, #video, #videoContainer, .txp_player_root';
                        const candidates = Array.from(document.querySelectorAll(selectors));
                        let mainPlayer = null;
                        let maxArea = 0;

                        for (const el of candidates) {
                            const rect = el.getBoundingClientRect();
                            if (rect.width * rect.height > maxArea && rect.width > 200) {
                                maxArea = rect.width * rect.height;
                                mainPlayer = el;
                            }
                        }

                        if (!mainPlayer) return;

                        // 隐藏所有其他元素
                        Array.from(document.body.children).forEach(child => {
                            if(child !== mainPlayer && !child.contains(mainPlayer)) {
                                child.style.setProperty('display', 'none', 'important');
                            }
                        });
                        
                        // 暴力撕扯：直接将播放器附加到body，脱离原始父容器
                        document.body.appendChild(mainPlayer);
                        document.body.style.setProperty('overflow', 'hidden', 'important');
                        document.documentElement.style.setProperty('overflow', 'hidden', 'important');

                        // 强制播放器占据整个视口
                        Object.assign(mainPlayer.style, {
                            position: 'fixed',
                            top: '0', left: '0',
                            width: '100vw', height: '100vh',
                            zIndex: '2147483647',
                            border: 'none', margin: '0', padding: '0'
                        });

                        // 强制内部video/iframe标签完美填充
                        const innerMedia = mainPlayer.matches('video, iframe') ? mainPlayer : mainPlayer.querySelector('video, iframe');
                        if (innerMedia) {
                            // 终极强化：注入CSS样式并持续监控
                            const styleId = 'player-override-style';
                            if (!document.getElementById(styleId)) {
                                const styleElement = document.createElement('style');
                                styleElement.id = styleId;
                                styleElement.innerHTML = 'video, iframe { width: 100% !important; height: 100% !important; object-fit: cover !important; }';
                                document.head.appendChild(styleElement);
                            }

                            const forceFill = (media) => {
                                media.style.setProperty('width', '100%', 'important');
                                media.style.setProperty('height', '100%', 'important');
                                media.style.setProperty('object-fit', 'cover', 'important');
                            };

                            forceFill(innerMedia);

                            const observer = new MutationObserver(() => {
                                const currentMedia = mainPlayer.querySelector('video, iframe');
                                if (currentMedia) {
                                    forceFill(currentMedia);
                                }
                            });
                            observer.observe(mainPlayer, { attributes: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] });
                        }

                    } catch (e) { console.error('Isolation script V5 failed:', e); }
                }, 2500);
            })();
        `;
                view.webContents.executeJavaScript(isolationScript).catch(err => {
                     if (err) console.error('Failed to execute script:', err);
                });
            }
        });
    }
}

function createSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.focus();
        return;
    }
    settingsWindow = new BrowserWindow({
        width: 450,
        height: 250,
        parent: mainWindow,
        modal: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // enableRemoteModule 在新版本 Electron 中已废弃，移除它
        }
    });
    settingsWindow.loadFile('settings.html');
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

app.whenReady().then(() => {
    try {
        createWindow();
    } catch (error) {
        console.error('Failed to create window:', error);
        // 显示错误对话框
        const { dialog } = require('electron');
        dialog.showErrorBox('启动错误', `应用启动失败: ${error.message}`);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC ---

ipcMain.on('toggle-always-on-top', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
        const isAlwaysOnTop = win.isAlwaysOnTop();
        win.setAlwaysOnTop(!isAlwaysOnTop);
        event.reply('always-on-top-status', !isAlwaysOnTop);
    }
});

ipcMain.on('update-view-bounds', (event, bounds) => {
    if (view && !view.webContents.isDestroyed() && mainWindow) {
        const { x, y, width, height } = bounds;
        const [winWidth, winHeight] = mainWindow.getContentSize();

        if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > winWidth + 5 || y + height > winHeight + 5) {
            return;
        }
        
        const newBounds = { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };

        if (originalBounds) {
            originalBounds = newBounds;
            return;
        }
        
        view.setBounds(newBounds);
    }
});

ipcMain.on('open-settings-window', () => {
    createSettingsWindow();
});

// 更新设置的辅助函数
function updateSettings(newSettings = null) {
    const store = new Store();
    // 如果提供了新设置，使用它；否则从 store 读取
    const settings = newSettings || store.get('settings');
    
    console.log('updateSettings called with:', settings);
    
    if (!settings || !settings.url) {
        console.error('Settings or URL is missing:', settings);
        return;
    }
    
    if (view && !view.webContents.isDestroyed()) {
        const currentURL = view.webContents.getURL();
        let newURL = settings.url.trim();
        
        // 确保 URL 包含协议
        if (newURL && !newURL.match(/^https?:\/\//i)) {
            newURL = 'https://' + newURL;
        }
        
        // 规范化 URL 进行比较（移除尾部斜杠）
        const normalizeURL = (url) => {
            if (!url) return '';
            return url.replace(/\/$/, '').toLowerCase();
        };
        
        const normalizedCurrent = normalizeURL(currentURL);
        const normalizedNew = normalizeURL(newURL);
        
        // 如果 URL 不同，加载新 URL
        if (normalizedCurrent !== normalizedNew) {
            console.log('URL changed from', currentURL, 'to', newURL);
            try {
                view.webContents.loadURL(newURL);
                
                // 等待加载完成后再设置缩放
                view.webContents.once('did-finish-load', () => {
                    if (view && !view.webContents.isDestroyed()) {
                        view.webContents.setZoomFactor(settings.zoom || 1.0);
                        console.log('Zoom factor set to:', settings.zoom);
                    }
                });
            } catch (error) {
                console.error('Failed to load URL:', error);
            }
        } else {
            // URL 没有变化，直接设置缩放
            console.log('URL unchanged, updating zoom only');
            view.webContents.setZoomFactor(settings.zoom || 1.0);
            console.log('Zoom factor set to:', settings.zoom);
        }
    } else {
        console.error('BrowserView is not available or destroyed');
    }
    
    // 关闭设置窗口
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.close();
    }
}

// --- 为设置窗口添加 IPC 监听器 ---

// 处理从设置窗口获取当前设置的请求
ipcMain.handle('get-settings', async () => {
    const store = new Store();
    return store.get('settings', { url: 'https://v.qq.com', zoom: 1.0 });
});

// 处理保存新设置的请求
ipcMain.on('set-settings', (event, settings) => {
    console.log('Settings received:', settings);
    const store = new Store();
    store.set('settings', settings);
    // 直接传递设置参数，避免从 store 读取可能存在的时序问题
    updateSettings(settings);
});

// 处理关闭设置窗口的请求
ipcMain.on('close-settings-window', () => {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.close();
    }
}); 