# 本地验证与提交检查

## 安装和自动化检查

在仓库根目录使用 Node.js 22 或更新版本：

```sh
npm ci --ignore-scripts
npm run validate
```

`package-lock.json` 固定 DOM 测试依赖。`validate` 依次检查资源缓存版本、导航和工牌事件图标、充电坞中文输入，再执行全部 `tests/*.test.cjs`。测试目录、测试夹具和业务口径文档 `CONTEXT.md` 必须随功能一起提交。

版本检查只识别资源 URL 和 Version 常量，不改写业务 ID、导出时间戳或历史字段设置的迁移版本。`node scripts/sync-versions.js --dry-run` 可预览旧测试常量；修改前仍应核对实际入口和运行时是否指向同一发布版本。

## 浏览器验收

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

用独立浏览器会话访问对应页面。共享导航、数据、筛选或样式变化，应覆盖受影响入口、筛选和重置、关联跳转、导出、键盘焦点及桌面和窄屏布局。自动化 DOM 检查不代表真实浏览器或实体设备验收。

## 提交范围

- 对照本次功能清单逐项检查完整差异；同一文件内的多个功能也需核对，不能只提交其中一个片段就视为整页已发布。
- 检查 `git status --short` 和 `git ls-files --others --exclude-standard`，确保新增源码、依赖、测试及业务文档均已纳入。
- 提交前从暂存树生成干净副本，运行 `npm ci --ignore-scripts` 和 `npm run validate`；浏览器应验证该副本，防止依赖未提交文件。
- 截图、下载结果和临时验证文件放在被忽略的 `output/` 或系统临时目录；`.playwright-cli/`、`test-results/`、`playwright-report/` 不进入提交。正式导航 SVG 属于运行时资源，需保留。
- 推送后核对 GitHub `main` 的提交 SHA 与本地一致，并检查工作区是否仍有遗漏的业务改动。
