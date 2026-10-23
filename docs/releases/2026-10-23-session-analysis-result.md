# 录音分析结果仅保留已完成与失败

用户确认录音列表的分析结果只有“已完成”和“失败”。上传、转写、模型分析属于处理过程，不得加入该字段的筛选选项或作为分析结果显示。

本次同步修正筛选、列表、详情及导出。没有明确结果的记录显示“—”，保留关联ID及原始处理信息，不将其归为已完成或失败。旧链接定位到这类记录时不再回填隐藏的处理状态筛选；无效ID仍显示未找到记录。

共享详情脚本和四个已发布入口的缓存版本更新为 `20261023-session-analysis-result-v1`。厂端未发布的统一数据接入不在本次范围内。

## 回归验证

入口及依赖检查不需要安装依赖：

```sh
node --test tests/dashboard-release.test.cjs
```

实际DOM回归需要 `linkedom`。可将依赖装到独立临时目录，不修改项目依赖：

```sh
aiqc_test_deps=$(mktemp -d)
npm install --prefix "$aiqc_test_deps" --no-save linkedom@0.18.13
AIQC_DOM_MODULE="$aiqc_test_deps/node_modules/linkedom" node --test tests/session-analysis-result.test.cjs
```

覆盖两项结果选项、三种处理过程记录的列表与导出、原始完成和失败结果、详情、旧链接及重置；确认共享处理状态未被改写。离线DOM检查不代替真实浏览器验收。本次修改前已做25项相关检查及独立浏览器核对，导出通过拦截提交验证数据，未声称完成Excel客户端验收。
