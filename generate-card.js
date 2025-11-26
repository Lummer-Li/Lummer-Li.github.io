const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch').default; // 用 node-fetch@2

// 配置（替换为你的用户名）
const USERNAME = '你的GitHub用户名'; 
// 原代码：const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_TOKEN = process.env.STATS_CARD_TOKEN; // 改为读取新的 Secrets
const CURRENT_YEAR = new Date().getFullYear();

// 新增 stats 文件夹（避免冲突，和现有文件夹不重名）
const statsDir = path.join(__dirname, 'stats');
if (!fs.existsSync(statsDir)) {
  fs.mkdirSync(statsDir);
}

// 1. 调用 GitHub API 获取数据（逻辑不变）
async function fetchStats() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': `${USERNAME} (GitHub Stats Card)`, // 必需：添加 User-Agent（用用户名或仓库名）
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
  };

  // 1. 仅测试「用户信息接口」（注释其他接口，排除干扰）
  try {
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    // 打印完整响应信息（状态码 + 响应体）
    const responseText = await userRes.text(); // 获取响应体内容
    if (!userRes.ok) {
      throw new Error(`用户信息请求失败：状态码 ${userRes.status}，响应体：${responseText}`);
    }
    console.log('用户信息请求成功！响应体：', responseText);
    return { stars: 0, commits: 0, prs: 0, issues: 0, contributions: 0 }; // 临时返回空数据
  } catch (err) {
    throw new Error(`获取用户信息失败：${err.message}`);
  }

  // 获取用户信息
  const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
  if (!userRes.ok) throw new Error('获取用户信息失败');

  // 获取仓库数据（Stars 总数）
  const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });
  if (!reposRes.ok) throw new Error('获取仓库数据失败');
  const repos = await reposRes.json();
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  // 获取当年提交数
  const commitsRes = await fetch(
    `https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:${CURRENT_YEAR}-01-01..${CURRENT_YEAR}-12-31`,
    { headers }
  );
  if (!commitsRes.ok) throw new Error('获取提交数据失败');
  const commitsData = await commitsRes.json();
  const totalCommits = commitsData.total_count || 0;

  // 获取 PR 总数
  const prsRes = await fetch(
    `https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+state:all`,
    { headers }
  );
  if (!prsRes.ok) throw new Error('获取 PR 数据失败');
  const prsData = await prsRes.json();
  const totalPRs = prsData.total_count || 0;

  // 获取 Issues 总数
  const issuesRes = await fetch(
    `https://api.github.com/search/issues?q=author:${USERNAME}+type:issue+state:all`,
    { headers }
  );
  if (!issuesRes.ok) throw new Error('获取 Issues 数据失败');
  const issuesData = await issuesRes.json();
  const totalIssues = issuesData.total_count || 0;

  // 获取贡献仓库数
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const contribRes = await fetch(
    `https://api.github.com/users/${USERNAME}/events?per_page=300&since=${oneYearAgo.toISOString().split('T')[0]}`,
    { headers }
  );
  if (!contribRes.ok) throw new Error('获取贡献数据失败');
  const events = await contribRes.json();
  const contribRepos = new Set(events.filter(e => e.repo && e.type !== 'WatchEvent').map(e => e.repo.name));

  return {
    stars: totalStars,
    commits: totalCommits,
    prs: totalPRs,
    issues: totalIssues,
    contributions: contribRepos.size
  };
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

// 3. 生成 SVG 卡片
function generateSVG(stats, rankInfo) {
  const { rank, totalScore } = rankInfo;
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (totalScore / 100) * circumference;

  return `
<svg width="500" height="300" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="300" rx="12" fill="#ffffff" stroke="#f0f0f0" stroke-width="1"/>
  <rect x="0" y="0" width="4" height="300" rx="2" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#165DFF"/>
      <stop offset="100%" stop-color="#4080FF"/>
    </linearGradient>
  </defs>
  <text x="20" y="40" font-size="18" font-weight="600" fill="#165DFF">GitHub Stats</text>
  <text x="20" y="65" font-size="12" fill="#86909C">@${USERNAME}</text>
  <text x="20" y="100" font-size="14" fill="#4E5969">Total Stars Earned: </text>
  <text x="220" y="100" font-size="14" font-weight="500" fill="#1D2129">${stats.stars}</text>
  <text x="20" y="130" font-size="14" fill="#4E5969">Total Commits (${CURRENT_YEAR}): </text>
  <text x="220" y="130" font-size="14" font-weight="500" fill="#1D2129">${stats.commits}</text>
  <text x="20" y="160" font-size="14" fill="#4E5969">Total PRs: </text>
  <text x="220" y="160" font-size="14" font-weight="500" fill="#1D2129">${stats.prs}</text>
  <text x="20" y="190" font-size="14" fill="#4E5969">Total Issues: </text>
  <text x="220" y="190" font-size="14" font-weight="500" fill="#1D2129">${stats.issues}</text>
  <text x="20" y="220" font-size="14" fill="#4E5969">Contributed to (last year): </text>
  <text x="220" y="220" font-size="14" font-weight="500" fill="#1D2129">${stats.contributions}</text>
  <circle cx="400" cy="120" r="42" fill="none" stroke="#E8F3FF" stroke-width="8"/>
  <circle cx="400" cy="120" r="42" fill="none" stroke="#165DFF" stroke-width="8" stroke-linecap="round" transform="rotate(-90 400 120)" stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"/>
  <text x="400" y="125" font-size="24" font-weight="700" fill="#165DFF" text-anchor="middle">${rank}</text>
  <text x="400" y="180" font-size="12" fill="#86909C" text-anchor="middle">Academic Rank</text>
</svg>
  `.trim();
}

// 4. 保存到 stats 文件夹
async function main() {
  try {
    const stats = await fetchStats();
    const rankInfo = calculateRank(stats);
    const svg = generateSVG(stats, rankInfo);
    const svgPath = path.join(statsDir, 'stats-card-auto.svg'); // 保存到 stats 文件夹
    fs.writeFileSync(svgPath, svg);
    console.log('SVG 生成成功：', svgPath);
  } catch (err) {
    console.error('生成失败：', err.message);
    process.exit(1);
  }
}

main();
