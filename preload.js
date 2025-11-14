/*
 * @Author: heweidong 17521287703@163.com
 * @Date: 2025-11-14 14:54:12
 * @LastEditors: heweidong 17521287703@163.com
 * @LastEditTime: 2025-11-14 14:55:18
 * @FilePath: /QuickPeekTV/fake-ad-app/preload.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
}) 