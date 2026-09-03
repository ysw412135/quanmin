// 全民中医 · 应用逻辑
// ==================== DISEASE LIST ====================
var allDiseases = [
  { id:"fever", icon:"🤒", name:"感冒发烧", hint:"怕冷·出汗·头痛·咳嗽", ready:true },
  { id:"cough", icon:"😤", name:"咳嗽", hint:"干咳·痰多·气喘·咽痒", ready:true },
  { id:"headache", icon:"🤕", name:"头痛", hint:"偏头痛·头顶痛·后脑勺痛·前额痛", ready:true },
  { id:"stomach", icon:"🤢", name:"肠胃不适", hint:"胃痛·反酸·呕吐·腹泻", ready:true },
  { id:"insomnia", icon:"😵", name:"睡不着", hint:"入睡难·多梦·易醒·早醒", ready:true },
  { id:"constipation", icon:"😣", name:"拉不出来", hint:"便秘·腹胀·大便干结", ready:true },
  { id:"dysmenorrhea", icon:"😖", name:"痛经", hint:"经期腹痛·腰酸·胀痛", ready:true },
  { id:"acne", icon:"😟", name:"长痘痘", hint:"青春痘·痤疮·粉刺", ready:true },
  { id:"ulcer", icon:"😬", name:"口腔溃疡", hint:"口疮·舌疮·反复发作", ready:true },
  { id:"eczema", icon:"🖐️", name:"皮肤痒/起疹", hint:"湿疹·荨麻疹·皮炎", ready:true },
  { id:"backpain", icon:"🧎", name:"腰酸背痛", hint:"腰痛·腿麻·活动受限", ready:true },
  { id:"rhinitis", icon:"🤧", name:"鼻炎/打喷嚏", hint:"鼻塞·流涕·打喷嚏", ready:true },
  { id:"hypertension", icon:"🫀", name:"血压高", hint:"头晕·头痛·心悸", ready:true },
  { id:"diabetes", icon:"🍬", name:"血糖高/消渴", hint:"口渴·多饮·多尿·消瘦", ready:true },
  { id:"gallbladder", icon:"😰", name:"胆结石/胆囊炎", hint:"右上腹痛·口苦·恶心", ready:true },
  { id:"arthralgia", icon:"🦿", name:"关节痛/风湿", hint:"膝痛·肩痛·手指痛·怕风怕冷", ready:true },
  { id:"hemorrhoids", icon:"🩸", name:"痔疮", hint:"便血·痔核脱出·肛痛", ready:true },
  { id:"gout", icon:"🦶", name:"痛风/尿酸高", hint:"脚趾红肿·关节热痛·尿酸高", ready:true },
  { id:"thyroid", icon:"🦋", name:"甲状腺结节", hint:"脖子结节·咽中堵·心慌怕热", ready:true },
  { id:"breast", icon:"🎗️", name:"乳腺结节/胀痛", hint:"乳房胀痛·结节·经前加重", ready:true },
  { id:"fattyliver", icon:"🥘", name:"脂肪肝/转氨酶高", hint:"右胁胀·口苦·油腻后不适", ready:true },
  { id:"reflux", icon:"🔥", name:"反酸/烧心", hint:"吐酸水·嗳气·胸口灼热", ready:true },
  { id:"pharyngitis", icon:"🗣️", name:"咽炎/喉咙不适", hint:"咽干·咽痛·异物感·干咳", ready:true },
  { id:"urinary", icon:"🚽", name:"尿频/尿路不适", hint:"夜尿多·尿黄热痛·小便不利", ready:true },
  { id:"premature", icon:"⏱️", name:"早泄/遗精", hint:"时间短·腰酸·怕冷·盗汗·阴囊潮湿", ready:true },
  { id:"palpitation", icon:"💓", name:"心慌/胸闷", hint:"心悸·胸闷·容易受惊·头晕", ready:true },
  { id:"fatigue", icon:"😴", name:"乏力虚劳", hint:"没精神·总想躺·出汗·怕冷", ready:true },
  { id:"irregular_menses", icon:"🌙", name:"月经不调", hint:"提前·推迟·量少·血块·经前烦", ready:true },
  { id:"symptoms", icon:"🧭", name:"找不到症状？", hint:"心慌·乏力·怕冷·出汗·口苦·尿频", ready:true },
  { id:"vertigo", icon:"🌀", name:"头晕/眩晕", hint:"天旋地转·头重脚轻·昏沉·体位性眩晕", ready:true }
];

// ==================== STATE ====================
var currentNode = null, diseaseId = null, visitPath = [], visitAnswers = [], popStateHandled = false;

// 相关病种推荐（结果页底部引导，提高留存）
var relatedMap = {
  fever:['cough','headache'], cough:['fever','pharyngitis'], headache:['hypertension','insomnia'],
  insomnia:['palpitation','fatigue'], palpitation:['insomnia','fatigue'], fatigue:['insomnia','palpitation'],
  backpain:['arthralgia','gout'], arthralgia:['backpain','gout'], gout:['arthralgia','urinary'],
  reflux:['stomach','ulcer'], stomach:['reflux','ulcer'], ulcer:['reflux','stomach'],
  constipation:['hemorrhoids','stomach'], hemorrhoids:['constipation','urinary'],
  dysmenorrhea:['irregular_menses'], irregular_menses:['dysmenorrhea','fatigue'],
  eczema:['acne','urinary'], acne:['eczema','ulcer'], rhinitis:['cough','pharyngitis'],
  pharyngitis:['cough','rhinitis'], hypertension:['headache','palpitation'],
  diabetes:['fatigue','urinary'], gallbladder:['reflux','fattyliver'], fattyliver:['gallbladder','reflux'],
  thyroid:['palpitation','breast'], breast:['thyroid','irregular_menses'],
  urinary:['gout','hemorrhoids','premature'], premature:['fatigue','urinary'], symptoms:['fatigue','palpitation'],
  vertigo:['hypertension','fatigue','palpitation']
};
function diseaseName(id) {
  for (var i = 0; i < allDiseases.length; i++) { if (allDiseases[i].id === id) return allDiseases[i].name; }
  return '';
}

function inferPattern(node, nodeKey) {
  var syn = node.syndrome || '';
  var text = syn + ' ' + (node.symptoms || '') + ' ' + (node.warning || '');

  // === 六经方向 — 四级推断链 ===
  // L1: 显式 channel 元数据（未来可加）
  var liujing = node.channel || '';

  // L2: 从方证名解析（覆盖 95%+ 节点）
  if (!liujing) {
    var parts = [];
    if (syn.indexOf('太阳') >= 0) parts.push('太阳');
    if (syn.indexOf('阳明') >= 0) parts.push('阳明');
    if (syn.indexOf('少阳') >= 0) parts.push('少阳');
    if (syn.indexOf('太阴') >= 0) parts.push('太阴');
    if (syn.indexOf('少阴') >= 0) parts.push('少阴');
    if (syn.indexOf('厥阴') >= 0) parts.push('厥阴');
    if (parts.length > 0) liujing = parts.join('') + '方向';
  }

  // L3: nodeKey→channel 映射（方证名不含经名的边缘节点）
  if (!liujing && nodeKey) {
    var keyMap = {
      zhuyeshigao:'阳明', huangqiguizhiwuwu:'太阳',
      lingguizhugan:'太阴', suanzao:'少阴',
      zhenwu_sym:'少阴', zhibaidihuang_sym:'少阴',
      sym_guipi:'太阴', sym_ganmai:'太阴',
      sym_banxiahoupo:'太阴', sym_banxiabaizhu:'太阴',
      maimen_sym:'阳明', wuling_sym:'太阳太阴',
      sym_dan:'少阳', dachaihu_sym:'少阳阳明', sym_daochi:'太阳'
    };
    var mapped = keyMap[nodeKey];
    if (mapped) liujing = mapped + '方向';
  }

  // L4: 全文扫描兜底
  if (!liujing) {
    if (text.indexOf('太阳') >= 0) liujing = '太阳方向';
    else if (text.indexOf('阳明') >= 0) liujing = '阳明方向';
    else if (text.indexOf('少阳') >= 0) liujing = '少阳方向';
    else if (text.indexOf('太阴') >= 0) liujing = '太阴方向';
    else if (text.indexOf('少阴') >= 0) liujing = '少阴方向';
    else if (text.indexOf('厥阴') >= 0) liujing = '厥阴方向';
    else liujing = '结合问答路径综合判断';
  }

  // === 表里推断 ===
  var biaoLi = '结合症状综合判断';
  var hasBiao = /怕冷|怕风|头痛|项强|鼻塞|发热|身痛|骨节|关节痛/.test(text);
  var hasLi = /便秘|腹痛|腹胀|恶心|呕吐|腹泻|下利|小便|口渴|烦|口苦|胸闷/.test(text);
  if (hasBiao && !hasLi) biaoLi = '偏表或表证未解';
  else if (!hasBiao && hasLi) biaoLi = '偏里或内在不适';
  else if (hasBiao && hasLi) biaoLi = '表里同见';

  // === 寒热推断 ===
  var hanRe = '寒热需结合症状继续判断';
  var hasHan = /怕冷|四肢冷|手脚冷|清稀|喜温|不渴|少阴|太阴|厥阴|寒/.test(text);
  var hasRe = /发烧|发热|高烧|热|口渴|黄|烦|臭|阳明|红肿|灼热|火/.test(text);
  if (hasHan && !hasRe) hanRe = '偏寒';
  else if (!hasHan && hasRe) hanRe = '偏热';
  else if (hasHan && hasRe) hanRe = '寒热错杂';

  // === 虚实推断 ===
  var xuShi = '虚实夹杂或需继续观察';
  var hasXu = /虚|没力气|气短|自汗|汗出不止|少气|喜按|少阴|太阴|困|累|乏力|隐痛|空痛|酸软|萎靡/.test(text);
  var hasShi = /实|便秘|胀痛|硬痛|拒按|痰多|瘀血|刺痛|红肿|结石|结节|烦躁|谵语/.test(text);
  if (hasXu && !hasShi) xuShi = '偏虚';
  else if (!hasXu && hasShi) xuShi = '偏实';
  else if (hasXu && hasShi) xuShi = '虚实夹杂';

  return { liujing: liujing, biaoLi: biaoLi, hanRe: hanRe, xuShi: xuShi };
}

function makeDoctorText(node) {
  var dName = '';
  for (var i = 0; i < allDiseases.length; i++) { if (allDiseases[i].id === diseaseId) { dName = allDiseases[i].name; break; } }
  var symptoms = (node.symptoms || '').replace(/<[^>]+>/g, '');
  var syndrome = (node.syndrome || '').replace(/（.*?）/g, '');
  var answers = visitAnswers.length ? '我刚才选择的症状是：' + visitAnswers.join('；') + '。' : '';
  return '我主要想咨询' + (dName || '身体不适') + '。' + answers + '目前表现为：' + symptoms + '。工具按六经八纲问诊整理后，更接近“' + syndrome + '”这个学习参考方向。请医生结合面诊、舌脉和必要检查判断。';
}

function renderAnswerTrail() {
  if (!visitAnswers.length) return '';
  var html = '<div class="r-section"><h4>刚才的问诊选择</h4><div class="r-compare">';
  for (var i = 0; i < visitAnswers.length; i++) {
    html += (i + 1) + '. ' + visitAnswers[i] + '\n';
  }
  html += '</div></div>';
  return html;
}

function copyDoctorText() {
  var el = document.getElementById('doctorText');
  var text = el ? el.textContent : '';
  if (!text) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function(){ alert('病情描述已复制，可以发给家人或就诊时参考。'); });
  } else {
    alert(text);
  }
}

// ==================== INIT ====================
function init() {
  var grid = document.getElementById('diseaseGrid'), html = '';
  for (var i = 0; i < allDiseases.length; i++) {
    var d = allDiseases[i];
    html += '<div class="disease-card" onclick="selectDisease(\'' + d.id + '\')"><div class="icon">' + d.icon + '</div><div class="name">' + d.name + '</div><div class="hint">' + d.hint + '</div></div>';
  }
  grid.innerHTML = html;
  // 搜索过滤
  var si = document.getElementById('searchInput');
  if (si) {
    si.addEventListener('input', function() {
      var kw = this.value.trim().toLowerCase();
      var cards = document.querySelectorAll('.disease-card');
      var shown = 0;
      for (var i = 0; i < cards.length; i++) {
        var ok = !kw || cards[i].textContent.toLowerCase().indexOf(kw) >= 0;
        cards[i].style.display = ok ? '' : 'none';
        if (ok) shown++;
      }
      // 无结果提示（引导留言提病种）
      var tip = document.getElementById('searchEmptyTip');
      if (kw && shown === 0) {
        if (!tip) {
          tip = document.createElement('div');
          tip.id = 'searchEmptyTip';
          tip.style.cssText = 'background:#fffbeb;border:1.5px solid #fcd34d;border-radius:12px;padding:14px;margin-bottom:12px;font-size:13px;color:#92400e;line-height:1.7;text-align:center;';
          tip.innerHTML = '🔍 没搜到「' + kw + '」<br>想查的病种这里还没有？<br><b>留言告诉我</b>（页面底部），我每周更新病种';
          si.parentNode.insertBefore(tip, si.nextSibling);
        }
        tip.style.display = 'block';
      } else if (tip) { tip.style.display = 'none'; }
    });
  }
  // 支持 ?d=病种id 直达（SEO/落地页链接用）
  try {
    var qp = new URLSearchParams(location.search);
    var direct = qp.get('d');
    if (direct && getTree(direct)) { selectDisease(direct); return; }
  } catch (e) {}
  if (!window.history.state || !window.history.state.page) {
    window.history.replaceState({page:'home'}, '', '#');
    window.history.pushState({page:'home_guard'}, '', '#');
  }
  if (window.history.state && window.history.state.page === 'quiz') restoreState(window.history.state);
}

// ==================== HISTORY ====================
function pushState(page, disease, node, hash) {
  popStateHandled = true;
  window.history.pushState({page:page, disease:disease, node:node}, '', hash || '#');
  setTimeout(function(){ popStateHandled = false; }, 100);
}
window.addEventListener('popstate', function(e) {
  if (popStateHandled) return;
  var s = e.state;
  if (!s || s.page === 'home' || s.page === 'home_guard') { goHome(); return; }
  if (s.page === 'quiz' && s.disease) { diseaseId = s.disease; currentNode = s.node || 'start'; visitPath = []; visitAnswers = []; showNode(); return; }
  if (s.page === 'result' && s.disease && s.node) { diseaseId = s.disease; currentNode = s.node; var t = getTree(diseaseId); if (t && t.nodes[currentNode] && t.nodes[currentNode].syndrome) showResult(t.nodes[currentNode]); }
});
function restoreState(state) {
  if (!state) return;
  if (state.page === 'quiz' && state.disease) { diseaseId = state.disease; currentNode = state.node || 'start'; showNode(); }
  else if (state.page === 'result' && state.disease && state.node) { diseaseId = state.disease; currentNode = state.node; var t = getTree(diseaseId); if (t && t.nodes[currentNode] && t.nodes[currentNode].syndrome) showResult(t.nodes[currentNode]); }
}

// ==================== NAVIGATION ====================
function selectDisease(id) {
  var d = null;
  for (var i = 0; i < allDiseases.length; i++) { if (allDiseases[i].id === id) { d = allDiseases[i]; break; } }
  if (d && d.ready === false) { alert('这个病种还在整理中，敬请期待！'); return; }
  var tree = getTree(id);
  if (!tree) { alert('这个病种即将上线！敬请期待。'); return; }
  // 查询埋点（运营数据：哪个病种被查最多）
  try { fetch('/pv?tool=quanmin&d=' + encodeURIComponent(id)); } catch (e) {}
  diseaseId = id; currentNode = 'start'; visitPath = []; visitAnswers = [];
  showNode();
  document.getElementById('diseaseSelector').style.display = 'none';
  document.getElementById('questionArea').classList.add('active');
  pushState('quiz', id, 'start', '#q/' + id);
}
function goHome() {
  document.getElementById('diseaseSelector').style.display = '';
  document.getElementById('questionArea').classList.remove('active');
  document.getElementById('resultArea').classList.remove('active');
  diseaseId = null; currentNode = null; visitPath = []; visitAnswers = [];
  var kcs = document.querySelectorAll('.knowledge-card');
  for (var i = 0; i < kcs.length; i++) kcs[i].classList.remove('show');
  pushState('home', null, null, '#');
}
function goBack() {
  // 问答中：回退一题（配合浏览器返回键行为一致）
  if (document.getElementById('questionArea').classList.contains('active')) {
    if (visitPath.length > 0) {
      currentNode = visitPath.pop();
      visitAnswers.pop();
      showNode();
      return;
    }
    goHome();
    return;
  }
  // 结果页：回到问答最后一步
  if (document.getElementById('resultArea').classList.contains('active')) {
    if (visitPath.length > 0) {
      currentNode = visitPath.pop();
      visitAnswers.pop();
      document.getElementById('resultArea').classList.remove('active');
      showNode();
      return;
    }
    goHome();
    return;
  }
  goHome();
}

function showNode() {
  if (!diseaseId) return;
  var tree = getTree(diseaseId);
  if (!tree) return;
  var node = tree.nodes[currentNode];
  if (!node) return;
  if (node.syndrome) { showResult(node); return; }
  var dName = '';
  for (var i = 0; i < allDiseases.length; i++) { if (allDiseases[i].id === diseaseId) { dName = allDiseases[i].name; break; } }
  var html = '<div class="question-box"><div class="q-num">全民中医 · ' + dName + '</div><div class="q-text">' + node.q + '</div>';
  for (var i = 0; i < node.opts.length; i++) {
    var opt = node.opts[i];
    html += '<button class="option-btn" data-next="' + opt.next + '"><span class="opt-icon">' + (opt.icon||'') + '</span>' + opt.text + '</button>';
  }
  html += '</div>';
  if (node.hint) { html += '<div class="knowledge-card show"><div class="k-title">📖 学一点中医</div>' + node.hint + '</div>'; }
  document.getElementById('questionContent').innerHTML = html;
  document.getElementById('questionArea').classList.add('active');
  document.getElementById('resultArea').classList.remove('active');
  // 返回按钮：第一题显示"返回首页"，后续显示"上一题"
  var bb = document.querySelector('#questionArea .back-btn');
  if (bb) bb.textContent = visitPath.length > 0 ? '← 上一题' : '← 返回首页';
  pushState('quiz', diseaseId, currentNode, '#q/' + diseaseId + '/' + currentNode);
  var buttons = document.querySelectorAll('.option-btn');
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].addEventListener('click', function() {
      var next = this.getAttribute('data-next');
      if (next) {
        visitPath.push(currentNode);
        visitAnswers.push(this.textContent.replace(/\s+/g, ' ').trim());
        currentNode = next;
        showNode();
      }
    });
  }
}

function showResult(node) {
  currentResultNode = node;
  document.getElementById('questionArea').classList.remove('active');
  document.getElementById('resultArea').classList.add('active');
  var pattern = inferPattern(node, currentNode);
  var doctorText = makeDoctorText(node);
  var html = '<div class="report-card"><div class="r-title">六经八纲问诊整理</div>';
  html += '<div class="r-syndrome">' + node.syndrome + '</div>';
  html += '<div class="r-warning"><h4>⚠️ 先看是否需要及时就医</h4>发烧超过3天不退 · 呼吸困难 · 胸痛 · 神志不清 · 抽搐 · 剧烈腹痛 · 年龄小于1岁 · 孕妇';
  if (node.warning) html += '<br><br>' + node.warning;
  html += '</div>';
  html += '<div class="r-path"><strong>按六经八纲整理：</strong><div class="path-grid"><div class="path-item"><b>六经方向</b>' + pattern.liujing + '</div><div class="path-item"><b>表里</b>' + pattern.biaoLi + '</div><div class="path-item"><b>寒热</b>' + pattern.hanRe + '</div><div class="path-item"><b>虚实</b>' + pattern.xuShi + '</div></div></div>';
  html += '<div class="r-doctor"><h4>给医生看的描述</h4><div id="doctorText">' + doctorText + '</div><div class="copy-line">可以复制这段，就诊或和家人沟通时参考。</div></div>';
  html += renderAnswerTrail();
  html += '<div class="r-section"><h4>老叶精华速查表</h4><p>下面内容来自原有六经辨证速查表，是《伤寒论》经典知识学习参考，不等于诊断或处方。</p></div>';
  html += '<div class="r-symptoms"><strong>典型表现：</strong>' + node.symptoms + '</div>';
  html += '<div class="r-section"><h4>📜 《伤寒论》原文</h4><div class="r-original">' + (node.original || '原文待补充') + '</div></div>';
  html += '<div class="r-section"><h4>🌿 经方组成（经典学习参考）</h4><p>' + node.formula + '</p></div>';
  html += '<div class="r-section"><h4>🔥 煎煮方法</h4><p>' + node.method + '</p></div>';
  if (node.hulao) html += '<div class="r-section"><h4>🎓 胡希恕先生要点</h4><div class="r-original" style="border-left:4px solid #f59e0b;">' + node.hulao + '</div></div>';
  if (node.otc) html += '<div class="r-section"><h4>💊 家中常备中成药参考</h4><div class="r-otc">' + node.otc + '</div></div>';
  if (node.combo) html += '<div class="r-section"><h4>🔗 组合方案</h4><div class="r-otc" style="background:#eff6ff;color:#1e40af;">' + node.combo + '</div></div>';
  if (node.compare) html += '<div class="r-section"><h4>🤔 相似情况如何区分？</h4><div class="r-compare">' + node.compare + '</div></div>';
  if (node.rhyme) html += '<div class="r-section"><h4>🎵 辨证口诀</h4><div class="r-rhyme">' + node.rhyme + '</div></div>';
  html += '<p style="font-size:12px;color:#94a3b8;margin-top:12px;">以上为《伤寒论》经典知识的学习参考，不构成医疗建议。如需用药，请咨询执业中医师。</p></div>';
  html += '<div class="report-actions"><button class="btn-save" onclick="copyDoctorText()">📋 复制病情描述</button><button class="btn-share" onclick="genShareCard()">🖼️ 生成分享卡片</button><button class="btn-share" onclick="shareReport()">📤 一键转发</button></div>';
  // 相关病种推荐（提高留存和传播）
  var relIds = relatedMap[diseaseId] || [];
  if (relIds.length) {
    var relHtml = '<div class="r-related"><div class="r-related-title">🤔 你还可能想查</div><div class="r-related-grid">';
    for (var ri = 0; ri < relIds.length; ri++) {
      var rn = diseaseName(relIds[ri]);
      if (rn) relHtml += '<button class="related-btn" onclick="selectDisease(\'' + relIds[ri] + '\')">' + rn + '</button>';
    }
    relHtml += '</div></div>';
    html += relHtml;
  }
  html += '<div style="text-align:center;margin-bottom:16px;"><button class="btn-donate" onclick="showDonate()">☕ 请老叶喝杯咖啡</button></div>';
  document.getElementById('reportContent').innerHTML = html;
  // 结果页返回按钮：显示"← 上一步"
  var rbb = document.querySelector('#resultArea .back-btn');
  if (rbb) rbb.textContent = visitPath.length > 0 ? '← 上一步' : '← 返回首页';
  pushState('result', diseaseId, currentNode, '#r/' + diseaseId + '/' + currentNode);
}

// ==================== REPORT ACTIONS ====================
function showDonate(){ var p=document.getElementById("donatePanel"); p.classList.toggle("show"); if(p.classList.contains("show")){ p.scrollIntoView({behavior:"smooth"}); } }

function saveReport() {
  if (navigator.share) { navigator.share({ title:'全民中医', text:'跟着六经八纲，把症状一步步理清楚→', url:'https://laoyetools.com/quanmin' }).catch(function(){}); }
  else if (navigator.clipboard) { navigator.clipboard.writeText('🌿 全民中医\n跟着六经八纲，把症状一步步理清楚\n\n打开即用，不用注册：https://laoyetools.com/quanmin'); alert('链接已复制！'); }
  else { alert('复制链接发给朋友吧：\n\nhttps://laoyetools.com/quanmin'); }
}
function shareReport() {
  if (navigator.share) { navigator.share({ title:'全民中医', text:'跟着六经八纲，把症状一步步理清楚→', url:'https://laoyetools.com/quanmin' }).catch(function(){}); }
  else { alert('复制链接发给朋友吧：\n\nhttps://laoyetools.com/quanmin'); }
}

// ==================== SHARE CARD ====================
var currentResultNode = null;
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  var chars = String(text || '').split('');
  var line = '', lines = 0;
  for (var i = 0; i < chars.length; i++) {
    line += chars[i];
    if (ctx.measureText(line).width > maxWidth) {
      ctx.fillText(line.slice(0, -1), x, y);
      y += lineHeight; lines++;
      line = chars[i];
      if (maxLines && lines >= maxLines) { return { y: y, truncated: true }; }
    }
  }
  if (line) { ctx.fillText(line, x, y); lines++; }
  return { y: y + (maxLines ? 0 : 0), truncated: false };
}
function genShareCard() {
  var node = currentResultNode;
  if (!node) { alert('请先完成一次辨证查询'); return; }
  var dName = '';
  for (var i = 0; i < allDiseases.length; i++) { if (allDiseases[i].id === diseaseId) { dName = allDiseases[i].name; break; } }
  var W = 750, H = 1180;
  var c = document.createElement('canvas');
  c.width = W; c.height = H;
  var ctx = c.getContext('2d');
  ctx.fillStyle = '#f0fdf4'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  roundRectPath(ctx, 30, 36, W - 60, H - 72, 28); ctx.fill();
  ctx.strokeStyle = '#86efac'; ctx.lineWidth = 3;
  roundRectPath(ctx, 30, 36, W - 60, H - 72, 28); ctx.stroke();

  // 顶部品牌
  ctx.fillStyle = '#166534'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🌿 全民中医 · 辨证参考', W / 2, 110);
  ctx.fillStyle = '#94a3b8'; ctx.font = '22px sans-serif';
  ctx.fillText('跟着六经八纲，把症状一步步理清楚', W / 2, 150);

  // 分隔线
  ctx.strokeStyle = '#dcfce7'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, 185); ctx.lineTo(W - 80, 185); ctx.stroke();

  // 病种
  ctx.fillStyle = '#64748b'; ctx.font = '26px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('查的是：' + (dName || '身体不适'), W / 2, 235);

  // 辨证方向（大字，居中换行）
  ctx.fillStyle = '#166534'; ctx.font = 'bold 44px sans-serif';
  var synLines = wrapText(ctx, node.syndrome || '', 60, 300, W - 120, 60, 3);
  ctx.fillStyle = '#16a34a'; ctx.font = 'bold 26px sans-serif';
  var pat = inferPattern(node, currentNode);
  ctx.fillText(pat.liujing + ' · ' + pat.hanRe, W / 2, synLines.y + 40);

  // 分隔线
  ctx.strokeStyle = '#dcfce7'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(80, synLines.y + 75); ctx.lineTo(W - 80, synLines.y + 75); ctx.stroke();

  // 典型表现
  var yy = synLines.y + 115;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#166534'; ctx.font = 'bold 28px sans-serif';
  ctx.fillText('典型表现', 70, yy);
  ctx.fillStyle = '#475569'; ctx.font = '28px sans-serif';
  var symWrap = wrapText(ctx, (node.symptoms || '').replace(/<[^>]+>/g, ''), 70, yy + 40, W - 140, 42, 5);
  ctx.fillStyle = '#94a3b8'; ctx.font = '22px sans-serif';
  if (symWrap.truncated) ctx.fillText('……（更多见工具内完整版）', 70, symWrap.y);

  // 就医红线
  var ry = symWrap.y + 50;
  ctx.fillStyle = '#fef2f2';
  roundRectPath(ctx, 60, ry, W - 120, 170, 16); ctx.fill();
  ctx.fillStyle = '#dc2626'; ctx.font = 'bold 26px sans-serif';
  ctx.fillText('⚠️ 以下情况请及时就医', 90, ry + 45);
  ctx.font = '24px sans-serif';
  wrapText(ctx, '发烧超3天 · 呼吸困难 · 胸痛 · 神志不清 · 抽搐 · 剧烈腹痛 · 年龄小于1岁 · 孕妇', 90, ry + 90, W - 180, 36, 2);

  // 底部品牌
  ctx.fillStyle = '#16a34a'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('laoyetools.com/quanmin', W / 2, H - 120);
  ctx.fillStyle = '#94a3b8'; ctx.font = '20px sans-serif';
  ctx.fillText('免费自查小工具 · 打开即用 · 不用注册', W / 2, H - 82);
  ctx.fillText('《伤寒论》经典知识学习参考，不构成医疗建议', W / 2, H - 48);

  c.toBlob(function(blob) {
    try {
      var file = new File([blob], 'quanmin-card.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: '全民中医 · 辨证参考' }).catch(function(){ showCardPreview(c); });
      } else { showCardPreview(c); }
    } catch (e) { showCardPreview(c); }
  }, 'image/png');
}
function showCardPreview(c) {
  var img = document.getElementById('cardPreviewImg');
  if (!img) return;
  img.src = c.toDataURL('image/png');
  document.getElementById('cardPreview').classList.add('show');
}
function hideCardPreview() { document.getElementById('cardPreview').classList.remove('show'); }

// ==================== FEEDBACK ====================
function submitFeedback() {
  var msg = document.getElementById('fbMsg').value.trim();
  if (!msg) { alert('请输入你想查的病种名称'); return; }
  var contact = document.getElementById('fbContact').value.trim();
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/quanmin/feedback', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    var r = document.getElementById('fbResult');
    if (xhr.status === 200) { r.style.display = 'block'; r.textContent = '已收到！老叶会尽快更新。也可直接微信 laoye_jingfang'; document.getElementById('fbMsg').value = ''; document.getElementById('fbContact').value = ''; }
    else { r.style.display = 'block'; r.style.color = '#dc2626'; r.textContent = '发送失败，请直接微信 laoye_jingfang'; }
  };
  xhr.send(JSON.stringify({ msg: msg, contact: contact || '' }));
}

// ==================== STARTUP ====================
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/quanmin/sw.js', {scope:'/quanmin/'}).then(function(reg){ console.log('[PWA] SW registered:', reg.scope); if(reg.waiting){reg.waiting.postMessage('skipWaiting')} }).catch(function(e){ console.log('[PWA] SW failed:', e); }); }
init();
