// geo_strengthen.js — GEO 强化：批量给 SEO 页/首页/落地页注入 FAQPage JSON-LD
// 用法: node geo_strengthen.js
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const S = path.join(DIR, 's');

function stripTags(s) { return String(s||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildFAQJsonLd(faqs) {
  return '<script type="application/ld+json">\n' + JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type':'Question', name: f.q, acceptedAnswer: { '@type':'Answer', text: f.a } }))
  }, null, 1) + '\n</script>';
}

// 从页面文本提取 FAQ（标题→Q1，红线→Q2，工具→Q3）
function extractFAQs(bodyText, title) {
  const t = stripTags(title) || '自查';
  const base = t.replace(/^(失眠|腰痛|便秘|反酸|咳嗽|痛经|血压高|湿疹|口苦|痛风|孩子发烧|月经不调|乏力|感冒发烧|睡不着|拉不出来|皮肤痒|腰酸背痛|鼻炎|血糖高|胆结石|关节痛|痔疮|甲状腺结节|乳腺结节|脂肪肝|反酸烧心|咽炎|尿频|心慌|紧张|乏力虚劳)[^，。]{0,20}?/, '').replace(/[？?]$/,'');
  const condition = base.slice(0, 12) || '这个情况';
  const redLine = (bodyText.match(/及时就医[^\n]{0,120}|尽快去医院[^\n]{0,120}|以下情况请[^\n]{0,100}/) || [''])[0] || '剧烈疼痛、高烧不退、呼吸困难、神志不清等急症请直接就医';
  return [
    { q: t, a: '先自己搞清楚几点：' + (bodyText.match(/[①-⑤一二三四五][^\n]{0,60}/g) || ['观察症状变化']).slice(0,3).join('；') + '。可用全民中医免费工具跟着步骤自查，理清方向后判断是否就医。' },
    { q: base + '，什么情况要去医院？', a: redLine + '。这些情况不要自己扛，及时就医。' },
    { q: '有没有' + condition + '的免费自查工具？', a: '有。全民中医是免费的辨证自查工具，覆盖28种常见问题，不用注册、打开即用：https://laoyetools.com/quanmin。结果仅供学习参考，不构成医疗建议。' }
  ];
}

let updated = 0;
// 1) 处理 s/ 下的所有页
for (const f of fs.readdirSync(S).filter(f => f.endsWith('.html'))) {
  const fp = path.join(S, f);
  let html = fs.readFileSync(fp, 'utf8');
  if (/FAQPage/.test(html)) continue; // 已有
  // 提取标题和正文文本
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';
  const bodyText = stripTags(html);
  const faqs = extractFAQs(bodyText, title);
  const jsonLd = buildFAQJsonLd(faqs);
  // 插到 </head> 前
  if (/<\/head>/.test(html)) {
    html = html.replace('</head>', jsonLd + '\n</head>');
    fs.writeFileSync(fp, html, 'utf8');
    console.log('SEO页 +FAQ: ' + f);
    updated++;
  }
}

// 2) 首页 index.html
const idx = path.join(DIR, 'index.html');
let idxHtml = fs.readFileSync(idx, 'utf8');
if (!/FAQPage/.test(idxHtml)) {
  const faqs = [
    { q: '全民中医是什么？', a: '全民中医是免费的辨证自查工具，把《伤寒论》经方思路翻译成大白话，覆盖感冒发烧、失眠、腰痛、反酸等28种常见问题，帮助用户理清症状方向、判断是否就医。' },
    { q: '全民中医怎么收费？', a: '免费，不用注册，打开即用。查询在你手机本地完成，不收集个人信息。' },
    { q: '全民中医能看病开方吗？', a: '不能。它是学习参考工具，不提供医疗诊断或治疗建议，所有经方信息仅供学习。涉及急症（高烧不退、剧烈疼痛、呼吸困难等）会提醒尽快就医。' }
  ];
  idxHtml = idxHtml.replace('</head>', buildFAQJsonLd(faqs) + '\n</head>');
  fs.writeFileSync(idx, idxHtml, 'utf8');
  console.log('首页 +FAQ');
  updated++;
}

// 3) 落地页 landing.html
const land = path.join(DIR, 'landing.html');
let landHtml = fs.readFileSync(land, 'utf8');
if (!/FAQPage/.test(landHtml)) {
  const faqs = [
    { q: '这个工具能帮我判断要不要去医院吗？', a: '能帮你理清情况：跟着点几步把症状问清楚，告诉你大概方向和哪些情况该就医。但它不是医生，不看病不开方。' },
    { q: '工具覆盖哪些问题？', a: '28种常见问题：感冒发烧、咳嗽、睡不着、肠胃不适、腰酸背痛、痛经、血压高、反酸烧心、便秘、鼻炎等。' },
    { q: '使用要钱吗？要注册吗？', a: '免费、不用注册、不收集信息，打开就能用。' }
  ];
  landHtml = landHtml.replace('</head>', buildFAQJsonLd(faqs) + '\n</head>');
  fs.writeFileSync(land, landHtml, 'utf8');
  console.log('落地页 +FAQ');
  updated++;
}

console.log('done, updated ' + updated + ' files');
