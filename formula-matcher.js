(function(){
'use strict';
// Matching rules are engineering heuristics, not calibrated clinical probabilities.
var features=[
 ['chill','怕冷/恶寒',/怕冷|恶寒|发冷|chills?/i],
 ['clear_sputum','清稀白痰',/痰[^，。；]{0,5}(?:清稀|清有沫|白稀|泡沫)|(?:清稀|白稀|泡沫)[^，。；]{0,5}痰|clear sputum/i],
 ['clear_nose','清水鼻涕',/清涕|清鼻涕|鼻涕[^，。；]{0,5}(?:清稀|水)|清水鼻涕|watery (?:nasal|runny)/i],
 ['cough','咳嗽',/咳嗽|咳喘|咳不停|cough/i],
 ['dry_cough','干咳少痰',/干咳|无痰|少痰|dry cough/i],
 ['yellow','黄稠分泌物',/黄痰|黄稠|痰黄|yellow (?:sputum|phlegm)/i],
 ['no_sweat','无汗',/无汗|不出汗|没有汗|no sweat/i],
 ['sweat','有汗',/有汗|出汗|sweating/i],
 ['fever','发热',/发热|发烧|fever/i],
 ['back_cold','背部发凉',/背[^，。；]{0,5}(?:冷|凉)/],
 ['thirst','口渴',/口渴|thirst/i],
 ['reflux','反酸',/反酸|酸水|acid reflux/i],
 ['burn','烧心/灼热',/烧心|烧灼|heartburn/i],
 ['nausea','恶心',/恶心|想吐|nausea/i],
 ['bloat','腹胀/痞满',/腹胀|胃胀|胀满|痞满|bloat/i],
 ['insomnia','失眠',/失眠|睡不着|insomnia/i],
 ['ache','身痛',/身痛|骨节酸痛|全身酸痛|body ache/i]
];
function positive(text,re){return String(text||'').split(/[，。；;,.!?！?]/).some(function(part){var m=re.exec(part);if(!m)return false;return !/(?:不|没有|无|否认|not |no |without )[^，。；]{0,3}$/i.test(part.slice(0,m.index));});}
function facts(opening,session){var out={};features.forEach(function(f){if(positive(opening,f[2]))out[f[0]]=true;});
 (session.turns||[]).forEach(function(t){if(t.questionId==='q_sputum'){out.clear_sputum=t.answer==='clear';out.yellow=t.answer==='yellow';out.dry_cough=t.answer==='none';out.cough=true;}
 if(t.questionId==='q_fever_chill'){out.chill=['chill','both'].includes(t.answer);out.fever=['fever','both'].includes(t.answer);}
 if(t.questionId==='q_nose_discharge'){out.clear_nose=t.answer==='clear';}
 if(t.questionId==='q_pattern_sweat'){out.no_sweat=t.answer==='no';out.sweat=t.answer==='yes';}
 });return out;}
var sweat={id:'q_pattern_sweat',factKey:'pattern_sweat',prompt:'为区分外寒相关方证：这次不适发作时，出汗情况怎样？',kind:'discriminator',burden:0.5,reliability:0.8,decisionImpact:0.8,userAnswerable:true,options:[{value:'no',label:'没有汗',signals:[]},{value:'yes',label:'有汗',signals:[]},{value:'unsure',label:'不清楚',signals:[]}]};
function next(session,treeId){if(!['cough','rhinitis','fever'].includes(treeId))return null;var ids=treeId==='rhinitis'?['q_nose_discharge','q_fever_chill','q_pattern_sweat']:['q_sputum','q_fever_chill','q_pattern_sweat'];var id=ids.find(function(id){return !session.turns.some(function(t){return t.questionId===id;});});return id?(id===sweat.id?sweat:FDE.getQuestion(id)):null;}
function rank(treeId,opening,session){if(session.status==='urgent_handoff'||!window.TREES||!TREES[treeId])return[];var f=facts(opening,session),nodes=TREES[treeId].nodes,rows=[];
 Object.keys(nodes).forEach(function(key){var n=nodes[key];if(!n.syndrome)return;var support=[],score=0;features.forEach(function(item){if(f[item[0]]&&positive(n.symptoms,item[2])){support.push(item[1]);score+=['clear_sputum','clear_nose','dry_cough','yellow'].includes(item[0])?3:1;}});
 if(f.no_sweat&&positive(n.symptoms,/有汗|出汗/))score-=4;if(f.yellow&&positive(n.symptoms,/清稀|白稀/))score-=4;
 var isXql=/小青龙汤(?:证|（|$)/.test(n.syndrome)&&!/加石膏/.test(n.syndrome),missing=[],against=[];
 if(isXql){support=[];score=0;[['chill','怕冷/恶寒',3],['clear_sputum','清稀白痰',5],['clear_nose','清水鼻涕',2],['no_sweat','无汗',2],['cough','咳嗽',1],['back_cold','背部发凉',1]].forEach(function(x){if(f[x[0]]){support.push(x[1]);score+=x[2];}});
 if(!f.chill)missing.push('外寒线索未确认');if(!f.clear_sputum)missing.push('清稀痰饮线索未确认');if(!f.no_sweat)missing.push('无汗线索未确认');
 if(f.yellow)against.push('已报告黄稠痰');if(f.dry_cough)against.push('已报告干咳或几乎无痰');
 if(against.length||!(f.clear_sputum||f.clear_nose))return;
 }
 if(score>0)rows.push({key:key,node:n,score:score,support:support,missing:missing,against:against,priority:isXql&&f.chill&&f.clear_sputum&&f.no_sweat,ingredients:isXql?'麻黄、桂枝、芍药、干姜、细辛、半夏、五味子、炙甘草':'',source:isXql?'https://xww.bucm.edu.cn/xzdj/9567.htm':'',differential:isXql?'重点复核痰的质地、寒热与汗出；黄稠痰或干咳少痰会改变排序。':''});
 });rows.sort(function(a,b){return Number(b.priority)-Number(a.priority)||b.score-a.score;});var seen=new Set();return rows.filter(function(x){var name=(x.node.syndrome.split(' · ')[1]||x.node.syndrome).split(/[证（(]/)[0];if(seen.has(name))return false;seen.add(name);return true;}).slice(0,3);}
window.FormulaMatcher={rank:rank,facts:facts,next:next,getQuestion:function(id){return id===sweat.id?sweat:null;}};
})();
