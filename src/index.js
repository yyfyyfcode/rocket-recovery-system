/**
 * SpaceX 火箭回收系统 - 主入口
 * 
 * 功能：
 * - 实时获取 SpaceX 火箭芯级回收数据
 * - 分析回收成功率和复用统计
 * - 追踪着陆平台使用情况
 * 
 * 使用方法：
 *   npm start        - 显示快速概览
 *   npm run dashboard - 显示完整仪表盘
 *   npm run analyze   - 显示深度分析报告
 */
import chalk from 'chalk';
import recovery from './recovery.js';

async function quickOverview() {
  console.log(chalk.cyan.bold('\n🚀 SpaceX 火箭回收系统 - 快速概览\n'));
  
  try {
    // 获取回收统计
    const stats = await recovery.analyzeRecoveryStats();
    
    console.log(chalk.white('━'.repeat(50)));
    console.log('');
    console.log(`  📦 芯级总数：${chalk.bold(stats.total)}`);
    console.log(`  ✅ 活跃芯级：${chalk.green.bold(stats.active)}`);
    console.log(`  🎯 着陆成功率：${chalk.green.bold(stats.landingSuccessRate + '%')}`);
    console.log(`  ♻️  最大复用次数：${chalk.yellow.bold(stats.maxReuse)} 次`);
    
    if (stats.mostReusedCore) {
      console.log(`  🏆 复用冠军：${chalk.magenta.bold(stats.mostReusedCore.serial)}`);
    }
    
    console.log('');
    console.log(chalk.white('━'.repeat(50)));
    
    console.log(chalk.gray('\n  更多命令：'));
    console.log(chalk.gray('    npm run dashboard  - 完整仪表盘'));
    console.log(chalk.gray('    npm run analyze    - 深度分析报告\n'));
    
  } catch (error) {
    console.error(chalk.red('  ❌ 获取数据失败：' + error.message));
    console.error(chalk.gray('  请检查网络连接\n'));
  }
}

quickOverview();
