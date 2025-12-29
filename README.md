# 🚀 SpaceX 火箭回收系统

基于 [SpaceX API](https://github.com/r-spacex/SpaceX-API) 的火箭回收数据分析系统。

## 功能特性

- 📊 **回收统计概览** - 芯级数量、着陆成功率、复用统计
- 🎯 **着陆平台分析** - ASDS（海上无人船）和 RTLS（返回发射场）数据
- ♻️ **复用追踪** - 芯级复用次数排行和分布
- 📈 **趋势分析** - 年度回收成功率变化
- ❌ **失败案例** - 回收失败记录分析

## 快速开始

```bash
# 安装依赖
cd rocket-recovery-system
npm install

# 运行快速概览
npm start

# 运行完整仪表盘
npm run dashboard

# 运行深度分析
npm run analyze
```

## 项目结构

```
rocket-recovery-system/
├── src/
│   ├── api.js        # SpaceX API 客户端
│   ├── recovery.js   # 回收数据分析模块
│   ├── dashboard.js  # 终端仪表盘
│   ├── analyzer.js   # 深度分析报告
│   └── index.js      # 主入口
├── package.json
└── README.md
```

## API 端点

系统使用以下 SpaceX API 端点：

| 端点 | 说明 |
|------|------|
| `/cores` | 火箭芯级数据 |
| `/landpads` | 着陆平台数据 |
| `/launches` | 发射任务数据 |
| `/rockets` | 火箭型号数据 |

## 术语说明

- **ASDS** - Autonomous Spaceport Drone Ship（自主太空港无人船）
- **RTLS** - Return to Launch Site（返回发射场着陆）
- **芯级（Core）** - 火箭第一级，是回收的主要目标
- **复用（Reuse）** - 同一芯级多次飞行

## 数据来源

数据来自 [r-spacex/SpaceX-API](https://github.com/r-spacex/SpaceX-API)，这是一个开源的 SpaceX 数据 API。

> ⚠️ 本项目与 SpaceX 公司无官方关联。
