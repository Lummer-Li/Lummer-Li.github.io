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
  const circumference = 2 * Math.PI * 30; // 圆环半径保持30（缩小后仍清晰）
  const finalDashoffset = circumference - (totalScore / 100) * circumference;

  return `
<svg width="500" height="330" viewBox="0 0 500 330" xmlns="http://www.w3.org/2000/svg">
  <!-- 主卡片：缩小尺寸 + 加重阴影（opacity从0.06→0.12） -->
  <rect x="15" y="15" width="470" height="300" rx="18" fill="#ffffff" stroke="#f0f5ff" stroke-width="1" filter="drop-shadow(0 6px 12px rgba(22,93,255,0.12))"/>
  
  <!-- 渐变定义（不变） -->
  <defs>
    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#165DFF" stop-opacity="0.9"/><stop offset="100%" stop-color="#4080FF" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="itemGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E8F1FF" stop-opacity="0.9"/><stop offset="100%" stop-color="#F0F5FF" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <!-- 标题区：同步缩小坐标和字号 -->
  <g>
    <g fill="#165DFF" transform="translate(35, 45) scale(0.85)">
      <rect x="0" y="0" width="28" height="28" rx="3"/>
      <rect x="7" y="7" width="6" height="14" rx="1" fill="#ffffff"/>
      <rect x="15" y="7" width="6" height="10" rx="1" fill="#ffffff"/>
    </g>
    <text x="70" y="58" font-size="20" font-weight="600" fill="#165DFF" font-family="Arial,sans-serif">GitHub Stats</text>
    <text x="70" y="78" font-size="13" fill="#86909C" font-family="Arial,sans-serif">@${USERNAME}</text>
  </g>

  <!-- 右上角圆环：位置同步缩小，尺寸不变（保证清晰） -->
  <g transform="translate(440, 60)">
    <circle cx="0" cy="0" r="30" fill="none" stroke="#F0F5FF" stroke-width="8"/>
    <circle cx="0" cy="0" r="30" fill="none" stroke="url(#circleGradient)" stroke-width="8" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}">
      <animate attributeName="stroke-dashoffset" from="${circumference}" to="${finalDashoffset}" dur="1.8s" calcMode="ease-out" fill="freeze"/>
    </circle>
    <text x="0" y="5" font-size="20" font-weight="700" fill="#165DFF" text-anchor="middle" font-family="Arial,sans-serif">${rank}</text>
  </g>

  <!-- 统计项区：同步缩小尺寸、坐标和字号，保持比例 -->
  <g font-family="Arial,sans-serif">
    <!-- Stars -->
    <rect x="35" y="110" width="190" height="45" rx="10" fill="url(#itemGradient)"/>
    <path d="M50 138 L53 132 L60 132 L55 127 L57 121 L50 125 L43 121 L45 127 L40 132 L47 132 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <text x="68" y="138" font-size="13" fill="#4E5969">Total Stars</text>
    <text x="200" y="138" font-size="16" font-weight="600" fill="#165DFF" text-anchor="end">${stats.stars}</text>
    
    <!-- Commits -->
    <rect x="240" y="110" width="190" height="45" rx="10" fill="url(#itemGradient)"/>
    <path d="M255 138 L265 138 L265 131 L260 131 L260 126 L255 126 L255 131 L250 131 L250 145 L255 145 Z M260 138 L268 138 L270 141 L265 141 L265 146 L260 146 L260 141 L255 141 L257 138 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <text x="273" y="138" font-size="13" fill="#4E5969">${CURRENT_YEAR} Commits</text>
    <text x="405" y="138" font-size="16" font-weight="600" fill="#165DFF" text-anchor="end">${stats.commits}</text>
    
    <!-- PRs -->
    <rect x="35" y="170" width="190" height="45" rx="10" fill="url(#itemGradient)"/>
    <path d="M50 200 L60 200 L50 210 L53 200 L47 200 Z" fill="#165DFF" transform="translate(0, -1)"/>
    <rect x="52" y="197" width="7" height="5" fill="#165DFF"/>
    <text x="68" y="200" font-size="13" fill="#4E5969">Total PRs</text>
    <text x="200" y="200" font-size="16" font-weight="600" fill="#165DFF" text-anchor="end">${stats.prs}</text>
    
    <!-- Issues -->
    <rect x="240" y="170" width="190" height="45" rx="10" fill="url(#itemGradient)"/>
    <rect x="255" y="195" width="5" height="9" fill="#165DFF"/>
    <rect x="257" y="208" width="2" height="3" fill="#165DFF"/>
    <text x="273" y="200" font-size="13" fill="#4E5969">Total Issues</text>
    <text x="405" y="200" font-size="16" font-weight="600" fill="#165DFF" text-anchor="end">${stats.issues}</text>
    
    <!-- Contributions -->
    <rect x="35" y="230" width="400" height="45" rx="10" fill="url(#itemGradient)"/>
    <rect x="50" y="252" width="11" height="7" fill="#165DFF" rx="1"/>
    <rect x="48" y="248" width="15" height="4" fill="#165DFF" rx="1"/>
    <text x="68" y="255" font-size="13" fill="#4E5969">Contributed Repos (Last Year)</text>
    <text x="405" y="255" font-size="16" font-weight="600" fill="#165DFF" text-anchor="end">${stats.contributions}</text>
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
