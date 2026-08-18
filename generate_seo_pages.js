// generate_seo_pages.js — 从 trees.js 决策树自动生成 SEO 病种页
// 用法: node generate_seo_pages.js [病种id...] （不传则生成全部缺失病种）
// 输出: s/<id>.html
const fs = require('fs');
const path = require('path');

const treesSrc = fs.readFileSync(path.join(__dirname, 'trees.js'), 'utf8');
const fn = new Function(treesSrc + '\n;return {TREES:TREES, SHARED:SHARED};');
const { TREES, SHARED } = fn();

const NAMES = {
  fever:'感冒发烧', cough:'咳嗽', headache:'头痛', stomach:'肠胃不适', insomnia:'睡不着',
  constipation:'拉不出来', dysmenorrhea:'痛经', acne:'长痘痘', ulcer:'口腔溃疡', eczema:'皮肤痒/起疹',
  backpain:'腰酸背痛', rhinitis:'鼻炎/打喷嚏', hypertension:'血压高', diabetes:'血糖高/消渴',
  gallbladder:'胆结石/胆囊炎', arthralgia:'关节痛/风湿', hemorrhoids:'痔疮', gout:'痛风/尿酸高',
  thyroid:'甲状腺结节', breast:'乳腺结节/胀痛', fattyliver:'脂肪肝/转氨酶高', reflux:'反酸/烧心',
  pharyngitis:'咽炎/喉咙不适', urinary:'尿频/尿路不适', palpitation:'心慌/胸闷', fatigue:'乏力虚劳',
  irregular_menses:'月经不调'
};
const EXISTING = ['insomnia','backpain','constipation','reflux','cough','dysmenorrhea','hypertension','eczema','gallbladder','gout','fever','irregular_menses','fatigue'];

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function strip(s){ return String(s||'').replace(/<[^>]+>/g,'').replace(/"/g,'').replace(/\s+/g,' ').trim(); }

function genPage(id, name, questions, syndromes, warnings) {
  const qHtml = questions.map((q,i) => `<div class="q"><b>${i+1}. ${esc(q)}</b></div>`).join('\n');
  const dirHtml = syndromes.map(s => `<tr><td>${esc(s.split('·')[0] || s)}</td><td>${esc(s)}</td></tr>`).join('\n');
  const warnHtml = warnings.length
    ? `<div class="red"><b>⚠️ 出现以下情况请及时就医：</b><br>${esc(warnings.join('；'))}<br><br><b>另外：</b>本工具为学习参考，不是诊断，不指导用药。</div>`
    : `<div class="red"><b>⚠️ 提醒：</b>本工具为《伤寒论》经典知识的学习参考，不构成医疗建议。出现剧烈疼痛、高烧不退、呼吸困难、神志不清等急症，请直接就医。</div>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}怎么办？先搞清楚这几件事（免费自查）</title>
<meta name="description" content="${name}？免费的中医辨证自查工具帮你理清情况：${questions[0] ? strip(questions[0]) : '跟着问几个问题'},判断要不要去医院。不用注册，打开即用。">
<link rel="canonical" href="https://laoyetools.com/quanmin/s/${id}.html">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Microsoft YaHei",sans-serif;background:#f0fdf4;color:#1e293b;line-height:1.9}
.container{max-width:720px;margin:0 auto;padding:24px 20px 60px}
h1{font-size:28px;color:#166534;margin-bottom:10px}
h2{font-size:20px;color:#166534;margin:28px 0 10px;padding-left:10px;border-left:4px solid #16a34a}
p,li{font-size:15px;color:#334155}
.q{background:#fff;border-radius:12px;padding:14px 16px;margin:8px 0;font-size:15px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.q b{color:#166534}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;background:#fff}
td,th{border:1px solid #e2e8f0;padding:10px;text-align:left}
th{background:#f0fdf4;color:#166534}
.red{background:#fef2f2;border:2px solid #fecaca;border-radius:10px;padding:14px 16px;font-size:14px;color:#dc2626;margin:14px 0}
.cta{display:block;text-align:center;margin:22px auto;padding:16px;border-radius:14px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:17px;font-weight:800;text-decoration:none;max-width:340px}
.footer{text-align:center;padding-top:24px;font-size:12px;color:#94a3b8}
</style>
</head>
<body>
<div class="container">

<h1>${name}怎么办？先搞清楚这几件事</h1>
<p>${name}，很多人第一反应是硬扛或乱吃药。去医院前，先自己搞清楚这几个问题，跟医生也说得清。</p>

<h2>一、先回答这几个问题</h2>
${qHtml}

<h2>二、大概方向怎么看（学习参考）</h2>
<table>
  <tr><th>你的情况</th><th>可能方向</th></tr>
${dirHtml}
</table>
<p style="font-size:13px;color:#64748b">注：以上为经典经方思路的学习参考，不是诊断。详细问诊请用下方工具。</p>

<h2>三、什么情况别自己扛</h2>
${warnHtml}

<a class="cta" href="/quanmin/?d=${id}">用工具自查${name} → 免费·不用注册</a>

<div class="footer">全民中医 · 免费辨证自查工具 · 《伤寒论》经典知识学习参考，不构成医疗建议</div>
</div>
<script>(function(){var s=new URLSearchParams(location.search).get('src');fetch('/pv?tool=quanmin_seo'+(s?'&src='+encodeURIComponent(s):''));})();</script>
</body>
</html>
`;
}

const args = process.argv.slice(2);
const targets = args.length ? args : Object.keys(TREES).filter(id => !EXISTING.includes(id) && id !== 'symptoms' && NAMES[id]);
let gen = 0;
for (const id of targets) {
  const name = NAMES[id];
  if (!name) { console.log('skip unknown:', id); continue; }
  const tree = TREES[id];
  if (!tree || !tree.nodes) { console.log('skip no tree:', id); continue; }
  const nodes = Object.assign({}, SHARED, tree.nodes);
  const start = nodes['start'];
  const questions = (start && start.opts ? start.opts : []).map(o => o.text).slice(0, 6);
  const syndromes = Object.keys(nodes).map(k => nodes[k]).filter(n => n && n.syndrome).map(n => n.syndrome).slice(0, 6);
  // 红线：只保留"就医/检查/急症"类提示，过滤用药剂量类（如"细辛不超3g""慎用麻黄"）——普通用户页绝不出现剂量
  const warnings = Object.keys(nodes).map(k => nodes[k])
    .filter(n => n && n.warning && /就医|检查|警惕|立即|急症|马上去/.test(n.warning))
    .map(n => n.warning).slice(0, 2);
  if (!questions.length) { console.log('skip no questions:', id); continue; }
  fs.writeFileSync(path.join(__dirname, 's', id + '.html'), genPage(id, name, questions, syndromes, warnings), 'utf8');
  console.log('generated:', id, '(' + name + ')');
  gen++;
}
console.log('done, generated', gen, 'pages');
