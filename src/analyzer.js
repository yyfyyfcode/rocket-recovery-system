/**
 * 火箭回收深度分析模块
 * 提供更详细的回收数据分析和趋势报告
 */
import chalk from 'chalk';
import Table from 'cli-table3';
import recovery from './recovery.js';
import api from './api.js';

/**
 * 分析回收成功率趋势（按年份）
 */
async function analyzeYearlyTrend() {
  console.log(chalk.cyan.bold('\n📈 年度回收成功率趋势\n'));
  
  const recoveries = await recovery.analyzeLaunchRecovery();
  
  // 按年份分组统计
  const yearlyStats = {};
  
  for (const r of recoveries) {
    const year = new Date(r.launchDate).getFullYear();
    if (!yearlyStats[year]) {
      yearlyStats[year] = { attempts: 0, successes: 0 };
    }
    yearlyStats[year].attempts++;
    if (r.landingSuccess) {
      yearlyStats[year].successes++;
    }
  }
  
  const table = new Table({
    head: [
      chalk.cyan('年份'),
      chalk.cyan('着陆尝试'),
      chalk.cyan('成功次数'),
      chalk.cyan('成功率'),
      chalk.cyan('趋势图'),
    ],
    colWidths: [8, 12, 12, 12, 30],
  });
  
  const years = Object.keys(yearlyStats).sort();
  
  for (const year of years) {
    const stats = yearlyStats[year];
    const rate = ((stats.successes / stats.attempts) * 100).toFixed(1);
    const barLength = Math.round(parseFloat(rate) / 5);
    const bar = chalk.green('█'.repeat(barLength)) + chalk.gray('░'.repeat(20 - barLength));
    
    table.push([
      year,
      stats.attempts,
      stats.successes,
      rate + '%',
      bar,
    ]);
  }
  
  console.log(table.toString());
}

/**
 * 分析着陆方式统计
 */
async function analyzeLandingTypes() {
  console.log(chalk.cyan.bold('\n🎯 着陆方式分析\n'));
  
  const recoveries = await recovery.analyzeLaunchRecovery();
  
  const typeStats = {
    ASDS: { attempts: 0, successes: 0, name: '海上无人船' },
    RTLS: { attempts: 0, successes: 0, name: '返回发射场' },
    Ocean: { attempts: 0, successes: 0, name: '海上溅落' },
  };
  
  for (const r of recoveries) {
    const type = r.landingType || 'Ocean';
    if (typeStats[type]) {
      typeStats[type].attempts++;
      if (r.landingSuccess) {
        typeStats[type].successes++;
      }
    }
  }
  
  const table = new Table({
    head: [
      chalk.cyan('着陆方式'),
      chalk.cyan('说明'),
      chalk.cyan('尝试'),
      chalk.cyan('成功'),
      chalk.cyan('成功率'),
    ],
    colWidths: [10, 20, 10, 10, 12],
  });
  
  for (const [type, stats] of Object.entries(typeStats)) {
    if (stats.attempts > 0) {
      const rate = ((stats.successes / stats.attempts) * 100).toFixed(1);
      table.push([
        type,
        stats.name,
        stats.attempts,
        stats.successes,
        rate + '%',
      ]);
    }
  }
  
  console.log(table.toString());
  
  // 说明
  console.log(chalk.gray('\n  ASDS: Autonomous Spaceport Drone Ship（自主太空港无人船）'));
  console.log(chalk.gray('  RTLS: Return to Launch Site（返回发射场着陆）'));
}

/**
 * 分析芯级复用统计
 */
async function analyzeReuseStats() {
  console.log(chalk.cyan.bold('\n♻️  芯级复用分析\n'));
  
  const cores = await recovery.getCoreDetails();
  
  // 按复用次数分组
  const reuseDistribution = {};
  let totalReuses = 0;
  
  for (const core of cores) {
    const reuses = core.reuseCount;
    totalReuses += reuses;
    
    if (!reuseDistribution[reuses]) {
      reuseDistribution[reuses] = 0;
    }
    reuseDistribution[reuses]++;
  }
  
  console.log(chalk.yellow('  复用次数分布：\n'));
  
  const maxReuse = Math.max(...Object.keys(reuseDistribution).map(Number));
  
  for (let i = 0; i <= maxReuse; i++) {
    const count = reuseDistribution[i] || 0;
    const bar = '█'.repeat(count);
    const label = i === 0 ? '仅飞行1次' : `复用 ${i} 次`;
    console.log(`  ${label.padEnd(12)} ${chalk.cyan(bar)} ${count}`);
  }
  
  // 复用冠军榜
  console.log(chalk.yellow('\n  🏆 复用次数排行榜（前5名）：\n'));
  
  const topCores = cores
    .filter(c => c.reuseCount > 0)
    .sort((a, b) => b.reuseCount - a.reuseCount)
    .slice(0, 5);
  
  for (let i = 0; i < topCores.length; i++) {
    const core = topCores[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`  ${medal} ${chalk.white.bold(core.serial)} - 复用 ${chalk.yellow.bold(core.reuseCount)} 次（共飞行 ${core.totalFlights} 次）`);
  }
  
  // 统计摘要
  const avgReuse = (totalReuses / cores.length).toFixed(2);
  console.log(chalk.gray(`\n  平均复用次数：${avgReuse} 次/芯级`));
}

/**
 * 分析回收失败案例
 */
async function analyzeFailures() {
  console.log(chalk.cyan.bold('\n❌ 回收失败案例分析\n'));
  
  const recoveries = await recovery.analyzeLaunchRecovery();
  const failures = recoveries.filter(r => r.landingAttempt && !r.landingSuccess);
  
  if (failures.length === 0) {
    console.log(chalk.green('  没有回收失败记录！'));
    return;
  }
  
  const table = new Table({
    head: [
      chalk.cyan('任务'),
      chalk.cyan('日期'),
      chalk.cyan('着陆方式'),
      chalk.cyan('复用芯级'),
    ],
    colWidths: [35, 15, 12, 12],
  });
  
  // 显示最近的失败案例
  const recentFailures = failures.slice(-10);
  
  for (const f of recentFailures) {
    const date = new Date(f.launchDate).toLocaleDateString('zh-CN');
    table.push([
      f.launchName.substring(0, 33),
      date,
      f.landingType || '-',
      f.reused ? '是' : '否',
    ]);
  }
  
  console.log(table.toString());
  
  // 失败统计
  const totalAttempts = recoveries.filter(r => r.landingAttempt).length;
  const failureRate = ((failures.length / totalAttempts) * 100).toFixed(2);
  
  console.log(chalk.gray(`\n  总失败次数：${failures.length} / ${totalAttempts} 次尝试`));
  console.log(chalk.gray(`  失败率：${failureRate}%`));
}

/**
 * 主函数
 */
async function main() {
  console.clear();
  console.log(chalk.cyan.bold(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     📊  火箭回收深度分析报告  📊                          ║
  ║         Recovery Analysis Report                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `));
  
  try {
    await analyzeYearlyTrend();
    await analyzeLandingTypes();
    await analyzeReuseStats();
    await analyzeFailures();
    
    console.log(chalk.cyan('\n' + '═'.repeat(60)));
    console.log(chalk.gray('\n  分析完成时间：' + new Date().toLocaleString('zh-CN')));
    console.log(chalk.gray('  数据来源：SpaceX API\n'));
  } catch (error) {
    console.error(chalk.red('\n  ❌ 分析失败：' + error.message));
    console.error(chalk.gray('  请检查网络连接后重试\n'));
  }
}

main();
