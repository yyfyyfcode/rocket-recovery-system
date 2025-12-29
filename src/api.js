/**
 * SpaceX API 客户端
 * 封装所有与火箭回收相关的 API 调用
 */
import axios from 'axios';

const BASE_URL = 'https://api.spacexdata.com/v4';

// 创建 axios 实例
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * 获取所有火箭芯级数据
 * 芯级是火箭的第一级，也是回收的主要目标
 */
export async function getCores() {
  const response = await client.get('/cores');
  return response.data;
}

/**
 * 获取单个芯级详情
 */
export async function getCore(coreId) {
  const response = await client.get(`/cores/${coreId}`);
  return response.data;
}

/**
 * 获取所有着陆平台数据
 * 包括陆地着陆区（LZ）和海上无人船（ASDS）
 */
export async function getLandpads() {
  const response = await client.get('/landpads');
  return response.data;
}

/**
 * 获取单个着陆平台详情
 */
export async function getLandpad(landpadId) {
  const response = await client.get(`/landpads/${landpadId}`);
  return response.data;
}

/**
 * 获取所有发射数据
 */
export async function getLaunches() {
  const response = await client.get('/launches');
  return response.data;
}

/**
 * 获取过去的发射（已完成）
 */
export async function getPastLaunches() {
  const response = await client.get('/launches/past');
  return response.data;
}

/**
 * 获取即将进行的发射
 */
export async function getUpcomingLaunches() {
  const response = await client.get('/launches/upcoming');
  return response.data;
}

/**
 * 获取所有火箭型号数据
 */
export async function getRockets() {
  const response = await client.get('/rockets');
  return response.data;
}

export default {
  getCores,
  getCore,
  getLandpads,
  getLandpad,
  getLaunches,
  getPastLaunches,
  getUpcomingLaunches,
  getRockets,
};
