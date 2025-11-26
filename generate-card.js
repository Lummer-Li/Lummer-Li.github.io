const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch').default; // 用 node-fetch@2

// 配置（替换为你的用户名
const USERNAME = 'Lummer-Li'; // 必须替换成你的 GitHub 用户名（比如 Lummer-Li）
const GITHUB_TOKEN = process.env.STATS_CARD_TOKEN;
const CURRENT_YEAR = new Date().getFullYear();

// 新增 stats 文件夹（避免冲突，和现有文件夹不重名）
const statsDir = path.join(__dirname, 'stats');
if (!fs.existsSync(statsDir)) {
  fs.mkdirSync(statsDir);
}

async function fetchStats() {
  const USERNAME = 'Lummer-Li'; // 你的 GitHub 用户名（已确认正确）
  const GITHUB_TOKEN = process.env.STATS_CARD_TOKEN;
  const CURRENT_YEAR = new Date().getFullYear();

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Stats-Card-Bot', // 合法格式，已验证
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
  };

  try {
    // 1. 获取用户基础信息（仅验证接口，无需统计）
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    const userText = await userRes.text();
    if (!userRes.ok) throw new Error(`用户接口失败：${userRes.status}，${userText}`);

    // 2. 获取仓库数据 → 计算 Stars 总数
    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });
    const reposText = await reposRes.text();
    if (!reposRes.ok) throw new Error(`仓库接口失败：${reposRes.status}，${reposText}`);
    const repos = JSON.parse(reposText); // 解析 JSON 数据（关键：之前可能漏了解析）
    const totalStars = repos.length > 0 ? repos.reduce((sum, repo) => sum + repo.stargazers_count, 0) : 0;

    // 3. 获取当年提交数（search/commits 接口）
    const commitsRes = await fetch(
      `https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:${CURRENT_YEAR}-01-01..${CURRENT_YEAR}-12-31`,
      { headers }
    );
    const commitsText = await commitsRes.text();
    if (!commitsRes.ok) throw new Error(`提交接口失败：${commitsRes.status}，${commitsText}`);
    const commitsData = JSON.parse(commitsText);
    const totalCommits = commitsData.total_count || 0;

    // 4. 获取 PR 总数（search/issues 接口，type:pr）
    const prsRes = await fetch(
      `https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+state:all`,
      { headers }
    );
    const prsText = await prsRes.text();
    if (!prsRes.ok) throw new Error(`PR 接口失败：${prsRes.status}，${prsText}`);
    const prsData = JSON.parse(prsText);
    const totalPRs = prsData.total_count || 0;

    // 5. 获取 Issues 总数（search/issues 接口，type:issue）
    const issuesRes = await fetch(
      `https://api.github.com/search/issues?q=author:${USERNAME}+type:issue+state:all`,
      { headers }
    );
    const issuesText = await issuesRes.text();
    if (!issuesRes.ok) throw new Error(`Issues 接口失败：${issuesRes.status}，${issuesText}`);
    const issuesData = JSON.parse(issuesText);
    const totalIssues = issuesData.total_count || 0;

    // 6. 获取贡献仓库数（events 接口）
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const contribRes = await fetch(
      `https://api.github.com/users/${USERNAME}/events?per_page=300&since=${oneYearAgo.toISOString().split('T')[0]}`,
      { headers }
    );
    const contribText = await contribRes.text();
    if (!contribRes.ok) throw new Error(`贡献接口失败：${contribRes.status}，${contribText}`);
    const events = JSON.parse(contribText);
    const contribRepos = new Set(events.filter(e => e.repo && e.type !== 'WatchEvent').map(e => e.repo.name));
    const totalContribs = contribRepos.size;

    // 打印统计结果（方便查看日志，确认数据非空）
    console.log('获取数据成功：', {
      stars: totalStars,
      commits: totalCommits,
      prs: totalPRs,
      issues: totalIssues,
      contributions: totalContribs
    });

    // 返回完整统计数据（关键：不再返回空数据）
    return {
      stars: totalStars,
      commits: totalCommits,
      prs: totalPRs,
      issues: totalIssues,
      contributions: totalContribs
    };
  } catch (err) {
    throw new Error(`获取用户信息失败：${err.message}`);
  }
}

// 2. 计算等级（复用你的逻辑）
function calculateRank(stats) {
  const getStandardScore = (value, max) => Math.min(Math.round((value / max) * 100), 100);
  const scores = {
    commits: getStandardScore(stats.commits, 1000),
    stars: getStandardScore(stats.stars, 100),
    prs: getStandardScore(stats.prs, 50),
    issues: getStandardScore(stats.issues, 50),
    contributions: getStandardScore(stats.contributions, 20)
  };
  const totalScore = scores.commits * 0.4 + scores.stars * 0.2 + scores.prs * 0.2 + scores.issues * 0.1 + scores.contributions * 0.1;

  let rank = 'D';
  if (totalScore >= 95) rank = 'S+';
  else if (totalScore >= 90) rank = 'S';
  else if (totalScore >= 85) rank = 'A+';
  else if (totalScore >= 80) rank = 'A';
  else if (totalScore >= 70) rank = 'B+';
  else if (totalScore >= 60) rank = 'B';
  else if (totalScore >= 50) rank = 'C+';
  else if (totalScore >= 40) rank = 'C';
  else if (totalScore >= 30) rank = 'C-';

  return { rank, totalScore };
}

function generateSVG(stats, rankInfo) {
  const { rank, totalScore } = rankInfo;
  const circumference = 2 * Math.PI * 30; // 圆环半径30（小尺寸）
  const finalDashoffset = circumference - (totalScore / 100) * circumference;

  return `
<svg width="580" height="380" viewBox="0 0 580 380" xmlns="http://www.w3.org/2000/svg">
  <!-- 主卡片：白色圆角+柔和阴影 -->
  <rect x="20" y="20" width="540" height="340" rx="20" fill="#ffffff" stroke="#f0f5ff" stroke-width="1" filter="drop-shadow(0 8px 16px rgba(22,93,255,0.06))"/>
  
  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#165DFF" stop-opacity="0.9"/><stop offset="100%" stop-color="#4080FF" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="itemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E8F1FF" stop-opacity="0.9"/><stop offset="100%" stop-color="#F0F5FF" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <!-- 标题区：左上角 Logo + 标题 -->
  <g>
    <g fill="#165DFF" transform="translate(40, 50) scale(0.9)">
      <rect x="0" y="0" width="28" height="28" rx="3"/>
      <rect x="7" y="7" width="6" height="14" rx="1" fill="#ffffff"/>
      <rect x="15" y="7" width="6" height="10" rx="1" fill="#ffffff"/>
    </g>
    <text x="80" y="65" font-size="22" font-weight="600" fill="#165DFF" font-family="Arial,sans-serif">GitHub Stats</text>
    <text x="80" y="90" font-size="14" fill="#86909C" font-family="Arial,sans-serif">@${USERNAME}</text>
  </g>

  <!-- 右上角圆环（小尺寸+无Rank文字+动态填充） -->
  <g transform="translate(500, 70)">
    <circle cx="0" cy="0" r="30" fill="none" stroke="#F0F5FF" stroke-width="8"/>
    <circle cx="0" cy="0" r="30" fill="none" stroke="url(#circleGradient)" stroke-width="8" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}">
      <animate attributeName="stroke-dashoffset" from="${circumference}" to="${finalDashoffset}" dur="1.8s" calcMode="ease-out" fill="freeze"/>
    </circle>
    <text x="0" y="5" font-size="22" font-weight="700" fill="#165DFF" text-anchor="middle" font-family="Arial,sans-serif">${rank}</text>
  </g>

  <!-- 统计项区：Logo和文字垂直对齐，动态填充数据 -->
  <g font-family="Arial,sans-serif">
    <!-- Stars（星星Logo） -->
    <rect x="40" y="130" width="220" height="50" rx="12" fill="url(#itemGradient)"/>
    <path d="M55 160 L58 154 L65 154 L60 149 L62 143 L55 147 L48 143 L50 149 L45 154 L52 154 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <text x="75" y="160" font-size="14" fill="#4E5969">Total Stars</text>
    <text x="230" y="160" font-size="18" font-weight="600" fill="#165DFF" text-anchor="end">${stats.stars}</text>
    
    <!-- Commits（代码分支Logo） -->
    <rect x="280" y="130" width="220" height="50" rx="12" fill="url(#itemGradient)"/>
    <path d="M295 160 L305 160 L305 153 L300 153 L300 148 L295 148 L295 153 L290 153 L290 167 L295 167 Z M300 160 L308 160 L310 163 L305 163 L305 168 L300 168 L300 163 L295 163 L297 160 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <text x="315" y="160" font-size="14" fill="#4E5969">${CURRENT_YEAR} Commits</text>
    <text x="470" y="160" font-size="18" font-weight="600" fill="#165DFF" text-anchor="end">${stats.commits}</text>
    
    <!-- PRs（合并箭头Logo） -->
    <rect x="40" y="200" width="220" height="50" rx="12" fill="url(#itemGradient)"/>
    <path d="M55 230 L65 230 L55 240 L58 230 L52 230 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <rect x="57" y="227" width="8" height="6" fill="#165DFF"/>
    <text x="75" y="230" font-size="14" fill="#4E5969">Total PRs</text>
    <text x="230" y="230" font-size="18" font-weight="600" fill="#165DFF" text-anchor="end">${stats.prs}</text>
    
    <!-- Issues（感叹号Logo） -->
    <rect x="280" y="200" width="220" height="50" rx="12" fill="url(#itemGradient)"/>
    <rect x="295" y="225" width="6" height="10" fill="#165DFF"/>
    <rect x="297" y="239" width="2" height="4" fill="#165DFF"/>
    <text x="315" y="230" font-size="14" fill="#4E5969">Total Issues</text>
    <text x="470" y="230" font-size="18" font-weight="600" fill="#165DFF" text-anchor="end">${stats.issues}</text>
    
    <!-- Contributions（仓库Logo） -->
    <rect x="40" y="270" width="460" height="50" rx="12" fill="url(#itemGradient)"/>
    <rect x="55" y="295" width="12" height="8" fill="#165DFF" rx="1"/>
    <rect x="52" y="290" width="18" height="5" fill="#165DFF" rx="1"/>
    <text x="75" y="300" font-size="14" fill="#4E5969">Contributed Repos (Last Year)</text>
    <text x="470" y="300" font-size="18" font-weight="600" fill="#165DFF" text-anchor="end">${stats.contributions}</text>
  </g>
</svg>
  `.trim().replace(/\n\s+/g, ' ');
}

// 4. 保存到 stats 文件夹
async function main() {
  try {
    const stats = await fetchStats();
    const rankInfo = calculateRank(stats);
    const svg = generateSVG(stats, rankInfo);
    const svgPath = path.join(statsDir, 'stats-card.svg'); // 保存到 stats 文件夹
    fs.writeFileSync(svgPath, svg);
    console.log('SVG 生成成功：', svgPath);
  } catch (err) {
    console.error('生成失败：', err.message);
    process.exit(1);
  }
}

main();
