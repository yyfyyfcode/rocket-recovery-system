/**
 * 火箭回收系统仪表盘
 * 在终端中展示回收统计数据
 */
import chalk from 'chalk';
import Table from 'cli-table3';
import recovery from './recovery.js';

/**
 * 显示分隔线
 */
function printDivider(title) {
  console.log('\n' + chalk.cyan('═'.repeat(60)));
  if (title) {
    console.log(chalk.cyan.bold(`  🚀 ${title}`));
    console.log(chalk.cyan('═'.repeat(60)));
  }
}

/**
 * 显示回收统计概览
 */
async function showRecoveryOverview() {
  printDivider('火箭回收系统 - 统计概览');
  
  const stats = await recovery.analyzeRecoveryStats();
  
  console.log('\n' + chalk.yellow.bold('📊 芯级统计：'));
  console.log(`   总芯级数量：${chalk.white.bold(stats.total)}`);
  console.log(`   活跃芯级：${chalk.green.bold(stats.active)}`);
  console.log(`   退役芯级：${chalk.gray(stats.retired)}`);
  console.log(`   损失芯级：${chalk.red(stats.lost)}`);
  
  console.log('\n' + chalk.yellow.bold('🎯 回收统计：'));
  console.log(`   总飞行次数：${chalk.white.bold(stats.totalFlights)}`);
  console.log(`   着陆尝试：${chalk.white(stats.totalLandingAttempts)}`);
  console.log(`   着陆成功：${chalk.green.bold(stats.totalLandingSuccesses)}`);
  console.log(`   着陆成功率：${chalk.green.bold(stats.landingSuccessRate + '%')}`);
  
  console.log('\n' + chalk.yellow.bold('🏆 复用记录：'));
  console.log(`   最大复用次数：${chalk.magenta.bold(stats.maxReuse)} 次`);
  if (stats.mostReusedCore) {
    console.log(`   冠军芯级：${chalk.magenta.bold(stats.mostReusedCore.serial)}`);
  }
}

/**
 * 显示着陆平台统计
 */
async function showLandpadStats() {
  printDivider('着陆平台统计');
  
  const landpads = await recovery.analyzeLandpadStats();
  
  const table = new Table({
    head: [
      chalk.cyan('名称'),
      chalk.cyan('类型'),
      chalk.cyan('位置'),
      chalk.cyan('尝试'),
      chalk.cyan('成功'),
      chalk.cyan('成功率'),
      chalk.cyan('状态'),
    ],
    colWidths: [25, 8, 20, 8, 8, 10, 10],
  });
  
  for (const pad of landpads) {
    const statusColor = pad.status === 'active' ? chalk.green : chalk.gray;
    const rateColor = parseFloat(pad.successRate) >= 90 ? chalk.green : 
                      parseFloat(pad.successRate) >= 70 ? chalk.yellow : chalk.red;
    
    table.push([
      pad.name,
      pad.type,
      pad.locality || '-',
      pad.landingAttempts,
      pad.landingSuccesses,
      rateColor(pad.successRate + '%'),
      statusColor(pad.status),
    ]);
  }
  
  console.log('\n' + table.toString());
}

/**
 * 显示活跃芯级列表
 */
async function showActiveCores() {
  printDivider('活跃芯级列表');
  
  const cores = await recovery.getCoreDetails();
  const activeCores = cores.filter(c => c.status === 'active');
  
  const table = new Table({
    head: [
      chalk.cyan('编号'),
      chalk.cyan('总飞行'),
      chalk.cyan('复用次数'),
      chalk.cyan('着陆尝试'),
      chalk.cyan('着陆成功'),
      chalk.cyan('状态'),
    ],
    colWidths: [12, 10, 12, 12, 12, 10],
  });
  
  // 按复用次数排序
  activeCores.sort((a, b) => b.reuseCount - a.reuseCount);
  
  for (const core of activeCores) {
    table.push([
      chalk.white.bold(core.serial),
      core.totalFlights,
      chalk.yellow(core.reuseCount),
      core.landingAttempts,
      chalk.green(core.landingSuccesses),
      chalk.green('活跃'),
    ]);
  }
  
  console.log('\n' + table.toString());
  console.log(chalk.gray(`\n   共 ${activeCores.length} 个活跃芯级`));
}

/**
 * 显示最近的回收任务
 */
async function showRecentRecoveries() {
  printDivider('最近回收任务');
  
  const recoveries = await recovery.analyzeLaunchRecovery();
  
  // 取最近 10 次回收尝试
  const recent = recoveries.slice(-10).reverse();
  
  const table = new Table({
    head: [
      chalk.cyan('任务名称'),
      chalk.cyan('日期'),
      chalk.cyan('着陆方式'),
      chalk.cyan('复用'),
      chalk.cyan('结果'),
    ],
    colWidths: [30, 15, 12, 8, 10],
  });
  
  for (const r of recent) {
    const date = new Date(r.launchDate).toLocaleDateString('zh-CN');
    const result = r.landingSuccess 
      ? chalk.green.bold('✓ 成功') 
      : chalk.red.bold('✗ 失败');
    const reused = r.reused ? chalk.yellow('是') : '否';
    
    table.push([
      r.launchName.substring(0, 28),
      date,
      r.landingType || '-',
      reused,
      result,
    ]);
  }
  
  console.log('\n' + table.toString());
}

/**
 * 主函数 - 运行仪表盘
 */
async function main() {
  console.clear();
  console.log(chalk.cyan.bold(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     🚀  SpaceX 火箭回收系统  🚀                           ║
  ║         Rocket Recovery System                            ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `));
  
  try {
    await showRecoveryOverview();
    await showLandpadStats();
    await showActiveCores();
    await showRecentRecoveries();
    
    printDivider('');
    console.log(chalk.gray('\n  数据来源：SpaceX API (api.spacexdata.com)'));
    console.log(chalk.gray('  更新时间：' + new Date().toLocaleString('zh-CN')));
    console.log('');
  } catch (error) {
    console.error(chalk.red('\n  ❌ 获取数据失败：' + error.message));
    console.error(chalk.gray('  请检查网络连接后重试\n'));
  }
}

main();
