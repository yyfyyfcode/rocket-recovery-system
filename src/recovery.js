/**
 * 火箭回收分析模块
 * 分析芯级回收数据，计算成功率和复用统计
 */
import api from './api.js';

/**
 * 着陆类型说明
 */
export const LANDING_TYPES = {
  ASDS: '海上无人船着陆（Autonomous Spaceport Drone Ship）',
  RTLS: '返回发射场着陆（Return to Launch Site）',
  Ocean: '海上溅落（不回收）',
};

/**
 * 分析芯级回收统计数据
 */
export async function analyzeRecoveryStats() {
  const cores = await api.getCores();
  
  const stats = {
    total: cores.length,                    // 芯级总数
    active: 0,                              // 活跃芯级
    retired: 0,                             // 退役芯级
    lost: 0,                                // 损失芯级
    totalFlights: 0,                        // 总飞行次数
    totalLandingAttempts: 0,                // 着陆尝试次数
    totalLandingSuccesses: 0,               // 着陆成功次数
    maxReuse: 0,                            // 最大复用次数
    mostReusedCore: null,                   // 复用最多的芯级
  };

  for (const core of cores) {
    // 统计状态
    if (core.status === 'active') stats.active++;
    else if (core.status === 'retired') stats.retired++;
    else if (core.status === 'lost') stats.lost++;

    // 统计飞行和着陆（API 使用 rtls/asds 分开统计）
    stats.totalFlights += core.reuse_count + 1;
    const attempts = (core.rtls_attempts || 0) + (core.asds_attempts || 0);
    const landings = (core.rtls_landings || 0) + (core.asds_landings || 0);
    stats.totalLandingAttempts += attempts;
    stats.totalLandingSuccesses += landings;

    // 找出复用最多的芯级
    if (core.reuse_count > stats.maxReuse) {
      stats.maxReuse = core.reuse_count;
      stats.mostReusedCore = core;
    }
  }

  // 计算成功率
  stats.landingSuccessRate = stats.totalLandingAttempts > 0
    ? ((stats.totalLandingSuccesses / stats.totalLandingAttempts) * 100).toFixed(2)
    : 0;

  return stats;
}

/**
 * 获取着陆平台统计
 */
export async function analyzeLandpadStats() {
  const landpads = await api.getLandpads();
  
  return landpads.map(pad => ({
    id: pad.id,
    name: pad.name,
    fullName: pad.full_name,
    type: pad.type,                         // RTLS 或 ASDS
    locality: pad.locality,                 // 位置
    region: pad.region,
    landingAttempts: pad.landing_attempts,
    landingSuccesses: pad.landing_successes,
    successRate: pad.landing_attempts > 0
      ? ((pad.landing_successes / pad.landing_attempts) * 100).toFixed(2)
      : 0,
    status: pad.status,
  }));
}

/**
 * 获取芯级详细信息列表
 */
export async function getCoreDetails() {
  const cores = await api.getCores();
  
  return cores.map(core => ({
    id: core.id,
    serial: core.serial,                    // 芯级编号，如 B1051
    status: core.status,
    reuseCount: core.reuse_count,           // 复用次数
    totalFlights: core.reuse_count + 1,     // 总飞行次数
    landingAttempts: (core.rtls_attempts || 0) + (core.asds_attempts || 0),
    landingSuccesses: (core.rtls_landings || 0) + (core.asds_landings || 0),
    rtlsAttempts: core.rtls_attempts || 0,
    rtlsLandings: core.rtls_landings || 0,
    asdsAttempts: core.asds_attempts || 0,
    asdsLandings: core.asds_landings || 0,
    lastUpdate: core.last_update,
  }));
}

/**
 * 分析发射任务中的回收情况
 */
export async function analyzeLaunchRecovery() {
  const launches = await api.getPastLaunches();
  
  const recoveryData = [];
  
  for (const launch of launches) {
    if (!launch.cores || launch.cores.length === 0) continue;
    
    for (const core of launch.cores) {
      if (core.landing_attempt) {
        recoveryData.push({
          launchName: launch.name,
          launchDate: launch.date_utc,
          coreId: core.core,
          flightNumber: core.flight,
          gridfins: core.gridfins,          // 是否使用栅格翼
          legs: core.legs,                  // 是否使用着陆腿
          reused: core.reused,              // 是否为复用芯级
          landingAttempt: core.landing_attempt,
          landingSuccess: core.landing_success,
          landingType: core.landing_type,   // ASDS/RTLS/Ocean
          landpadId: core.landpad,
        });
      }
    }
  }
  
  return recoveryData;
}

export default {
  LANDING_TYPES,
  analyzeRecoveryStats,
  analyzeLandpadStats,
  getCoreDetails,
  analyzeLaunchRecovery,
};
