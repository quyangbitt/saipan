## 🚀 快速开始

环境要求：Linux、macOS 或 Windows 10/11、Python 3.10 及以上、Python `venv` 模块和 `git`。安装向导会检查 Node.js 24.16+（24.x）、26.1+（26.x）或 27+（25.x 与 26.0 不兼容）、FFmpeg、Playwright/Chromium；缺少 Node.js 时会按系统给出安装引导。

Windows 原生安装请在 PowerShell 中执行（不需要 WSL）：

```powershell
git clone https://github.com/quyangbitt/saipan.git
cd saipan
Set-ExecutionPolicy -Scope Process Bypass
.\setup.ps1
```

Windows 安装器会优先通过 `winget` 自动安装缺失的 Python 3.10+、Node.js 24.16+（24.x）、26.1+（26.x）或 27+、Git 和 FFmpeg；25.x 与 26.0 不兼容。如果系统没有 `winget`，再使用官方安装器安装并加入 PATH。随后安装器会创建项目内 `.venv`，安装 Python/Node 依赖、前端生产包和 Playwright Chromium，并使用独立的 `saipan` OpenClaw profile。



