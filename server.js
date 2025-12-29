/**
 * SpaceX 火箭回收系统 - Web 服务器
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import recovery from './src/recovery.js';
import api from './src/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由：获取回收统计概览
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await recovery.analyzeRecoveryStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 路由：获取着陆平台数据
app.get('/api/landpads', async (req, res) => {
  try {
    const landpads = await recovery.analyzeLandpadStats();
    res.json(landpads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 路由：获取芯级数据
app.get('/api/cores', async (req, res) => {
  try {
    const cores = await recovery.getCoreDetails();
    res.json(cores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 路由：获取回收任务数据
app.get('/api/recoveries', async (req, res) => {
  try {
    const recoveries = await recovery.analyzeLaunchRecovery();
    res.json(recoveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 路由：获取发射数据
app.get('/api/launches', async (req, res) => {
  try {
    const launches = await api.getPastLaunches();
    res.json(launches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 火箭回收系统已启动: http://localhost:${PORT}`);
});
