/**
 * SpaceX 火箭回收系统 - 前端应用
 */

// API 基础地址
const API_BASE = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
});

// 加载所有数据
async function loadAllData() {
  try {
    await Promise.all([
      loadStats(),
      loadLandpads(),
      loadCores(),
      loadRecoveries(),
    ]);
    updateTime();
  } catch (error) {
    console.error('加载数据失败:', error);
  }
}

// 加载统计概览
async function loadStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  const stats = await res.json();
  
  document.getElementById('totalCores').textContent = stats.total;
  document.getElementById('activeCores').textContent = stats.active;
  document.getElementById('successRate').textContent = stats.landingSuccessRate + '%';
  document.getElementById('maxReuse').textContent = stats.maxReuse + '次';
}

// 加载着陆平台数据
async function loadLandpads() {
  const res = await fetch(`${API_BASE}/api/landpads`);
  const landpads = await res.json();
  
  const tbody = document.querySelector('#landpadsTable tbody');
  tbody.innerHTML = landpads.map(pad => `
    <tr>
      <td><strong>${pad.name}</strong></td>
      <td>${pad.type}</td>
      <td>${pad.locality || '-'}</td>
      <td>${pad.landingAttempts}</td>
      <td>${pad.landingSuccesses}</td>
      <td>${pad.successRate}%</td>
      <td><span class="badge ${pad.status === 'active' ? 'badge-success' : 'badge-secondary'}">${pad.status === 'active' ? '活跃' : '退役'}</span></td>
    </tr>
  `).join('');
}

// 加载芯级数据并渲染图表
async function loadCores() {
  const res = await fetch(`${API_BASE}/api/cores`);
  const cores = await res.json();
  
  // 按复用次数排序，取前15
  const topCores = cores
    .filter(c => c.reuseCount > 0 || c.status === 'active')
    .sort((a, b) => b.reuseCount - a.reuseCount)
    .slice(0, 15);
  
  const tbody = document.querySelector('#coresTable tbody');
  tbody.innerHTML = topCores.map((core, index) => {
    const rankClass = index < 3 ? `rank-${index + 1}` : '';
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1;
    const statusBadge = core.status === 'active' 
      ? '<span class="badge badge-success">活跃</span>'
      : core.status === 'retired'
      ? '<span class="badge badge-secondary">退役</span>'
      : '<span class="badge badge-danger">损失</span>';
    
    return `
      <tr>
        <td><span class="rank ${rankClass}">${medal}</span></td>
        <td><strong>${core.serial}</strong></td>
        <td>${core.totalFlights}</td>
        <td>${core.reuseCount}</td>
        <td>${core.landingSuccesses}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

// 加载回收任务数据并渲染图表
async function loadRecoveries() {
  const res = await fetch(`${API_BASE}/api/recoveries`);
  const recoveries = await res.json();
  
  // 渲染最近任务表格
  const recent = recoveries.slice(-15).reverse();
  const tbody = document.querySelector('#recoveriesTable tbody');
  tbody.innerHTML = recent.map(r => {
    const date = new Date(r.launchDate).toLocaleDateString('zh-CN');
    const resultBadge = r.landingSuccess
      ? '<span class="badge badge-success">✓ 成功</span>'
      : '<span class="badge badge-danger">✗ 失败</span>';
    const reusedBadge = r.reused
      ? '<span class="badge badge-warning">是</span>'
      : '<span class="badge badge-secondary">否</span>';
    
    return `
      <tr>
        <td>${r.launchName}</td>
        <td>${date}</td>
        <td>${r.landingType || '-'}</td>
        <td>${reusedBadge}</td>
        <td>${resultBadge}</td>
      </tr>
    `;
  }).join('');
  
  // 渲染图表
  renderYearlyChart(recoveries);
  renderLandingTypeChart(recoveries);
}

// 渲染年度趋势图表
function renderYearlyChart(recoveries) {
  const yearlyStats = {};
  
  recoveries.forEach(r => {
    const year = new Date(r.launchDate).getFullYear();
    if (!yearlyStats[year]) {
      yearlyStats[year] = { attempts: 0, successes: 0 };
    }
    yearlyStats[year].attempts++;
    if (r.landingSuccess) {
      yearlyStats[year].successes++;
    }
  });
  
  const years = Object.keys(yearlyStats).sort();
  const rates = years.map(y => 
    ((yearlyStats[y].successes / yearlyStats[y].attempts) * 100).toFixed(1)
  );
  const attempts = years.map(y => yearlyStats[y].attempts);
  
  const ctx = document.getElementById('yearlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        {
          label: '着陆尝试次数',
          data: attempts,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: '成功率 (%)',
          data: rates,
          type: 'line',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#8b8b9a' } }
      },
      scales: {
        x: { ticks: { color: '#8b8b9a' }, grid: { color: '#2a2a3a' } },
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#8b8b9a' },
          grid: { color: '#2a2a3a' },
          title: { display: true, text: '尝试次数', color: '#8b8b9a' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          ticks: { color: '#22c55e' },
          grid: { display: false },
          title: { display: true, text: '成功率 (%)', color: '#22c55e' }
        }
      }
    }
  });
}

// 渲染着陆方式饼图
function renderLandingTypeChart(recoveries) {
  const typeStats = { ASDS: 0, RTLS: 0, Ocean: 0 };
  
  recoveries.forEach(r => {
    const type = r.landingType || 'Ocean';
    if (typeStats[type] !== undefined) {
      typeStats[type]++;
    }
  });
  
  const ctx = document.getElementById('landingTypeChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['海上无人船 (ASDS)', '返回发射场 (RTLS)', '海上溅落'],
      datasets: [{
        data: [typeStats.ASDS, typeStats.RTLS, typeStats.Ocean],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(139, 139, 154, 0.8)',
        ],
        borderColor: '#12121a',
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8b8b9a', padding: 20 }
        }
      }
    }
  });
}

// 更新时间
function updateTime() {
  const now = new Date().toLocaleString('zh-CN');
  document.getElementById('updateTime').textContent = `更新时间：${now}`;
}
