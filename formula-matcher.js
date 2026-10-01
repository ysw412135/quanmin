(function(){
'use strict';
// Matching rules are engineering heuristics, not calibrated clinical probabilities.
// V2 adds a neutral evidence-question layer: clarify position, reaction strength, thermal tendency and course before formula-pattern differences.
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

var EVIDENCE_Q={
 q_ev_cold_heat:{id:'q_ev_cold_heat',factKey:'ev_cold_heat',prompt:'从这次不适的整体感觉看，冷热变化最接近哪一种？',kind:'discriminator',burden:0.55,reliability:0.82,decisionImpact:0.9,userAnswerable:true,options:[
  {value:'cold',label:'明显怕冷或怕风，想盖暖一些',signals:['ev_cold']},
  {value:'heat',label:'明显怕热，想凉快一些',signals:['ev_heat']},
  {value:'alternating',label:'一阵冷一阵热，反复交替',signals:['ev_alternating']},
  {value:'neither',label:'冷热都不明显',signals:['ev_neutral']},
  {value:'unsure',label:'说不清楚',signals:[]}
 ]},
 q_ev_thirst:{id:'q_ev_thirst',factKey:'ev_thirst',prompt:'这次不适时，口干口渴和喝水的情况最接近哪一种？',kind:'discriminator',burden:0.5,reliability:0.8,decisionImpact:0.75,userAnswerable:true,options:[
  {value:'cold_much',label:'很渴，想一次喝较多凉水',signals:['ev_thirst_heat']},
  {value:'warm',label:'想喝水，但更喜欢温水',signals:['ev_thirst_warm']},
  {value:'sip',label:'口干，但只想小口喝一点',signals:['ev_thirst_sip']},
  {value:'dry_no_thirst',label:'口干，但并不太想喝水',signals:['ev_dry_no_thirst']},
  {value:'none',label:'不怎么口干口渴',signals:['ev_no_thirst']},
  {value:'unsure',label:'说不清楚',signals:[]}
 ]},
 q_ev_energy:{id:'q_ev_energy',factKey:'ev_energy',prompt:'和平时相比，这次不适时的精神和体力更接近哪一种？',kind:'discriminator',burden:0.5,reliability:0.78,decisionImpact:0.8,userAnswerable:true,options:[
  {value:'agitated',label:'比较烦躁、坐立不安或精神偏亢',signals:['ev_agitated']},
  {value:'normal',label:'精神体力变化不大',signals:['ev_energy_normal']},
  {value:'tired',label:'明显疲乏、没精神，想躺着休息',signals:['ev_tired']},
  {value:'sleepy',label:'很困倦，容易睡或总想睡',signals:['ev_sleepy']},
  {value:'unsure',label:'说不清楚',signals:[]}
 ]},
 q_ev_transition:{id:'q_ev_transition',factKey:'ev_transition',prompt:'这次不适有没有下面这类表现同时出现？',kind:'discriminator',burden:0.55,reliability:0.76,decisionImpact:0.88,userAnswerable:true,options:[
  {value:'strong',label:'口苦/咽干、胸胁不舒服、恶心或食欲下降中有两项以上',signals:['ev_transition_cluster']},
  {value:'one',label:'只有其中一项比较明显',signals:['ev_transition_partial']},
  {value:'none',label:'这些表现基本没有',signals:['ev_transition_absent']},
  {value:'unsure',label:'说不清楚',signals:[]}
 ]},
 q_ev_course:{id:'q_ev_course',factKey:'ev_course',prompt:'这些症状从开始到现在，先后变化更接近哪一种？',kind:'discriminator',burden:0.6,reliability:0.72,decisionImpact:0.82,userAnswerable:true,options:[
  {value:'same',label:'从一开始到现在基本是同一组表现',signals:['ev_course_same']},
  {value:'outside_to_inside',label:'先是怕冷/发热/头身不适，后来胃肠或口渴等内部症状更突出',signals:['ev_course_inward']},
  {value:'outside_to_transition',label:'先像外感，后来出现一阵冷一阵热、口苦、恶心或胸胁不适',signals:['ev_course_transition']},
  {value:'mixed_start',label:'一开始就同时有几组不同部位的表现',signals:['ev_course_mixed']},
  {value:'unsure',label:'说不清楚',signals:[]}
 ]}
};

function answerLabel(session,turn){var q=EVIDENCE_Q[turn.questionId]||(window.FDE&&FDE.getQuestion&&FDE.getQuestion(turn.questionId));if(!q)return String(turn.answer||'');var o=(q.options||[]).find(function(x){return x.value===turn.answer;});return o?o.label:String(turn.answer||'');}
function narrative(opening,session){return String(opening||'')+' '+(session.turns||[]).map(function(t){return answerLabel(session,t);}).join(' ');}
function answered(session,id){return (session.turns||[]).some(function(t){return t.questionId===id;});}

// Internal evidence axes. These are not diagnosis probabilities and are not exposed as named schools or classifications.
function patternAxes(opening,session){
 var text=narrative(opening,session),score={surface_active:0,surface_low:0,interior_active:0,interior_low:0,transition_active:0,transition_low:0},support={surface_active:[],surface_low:[],interior_active:[],interior_low:[],transition_active:[],transition_low:[]};
 function add(k,n,label){score[k]+=n;if(label&&support[k].indexOf(label)<0)support[k].push(label);}
 if(/怕冷|恶寒|恶风/.test(text)){add('surface_active',3,'怕冷/恶寒');add('surface_low',2,'怕冷/恶寒');}
 if(/发热|发烧/.test(text))add('surface_active',1,'发热');
 if(/头项|项背|身痛|全身酸痛/.test(text))add('surface_active',1,'头项/身痛');
 if(/明显疲乏|没精神|很困倦|总想睡/.test(text)){add('surface_low',3,'反应偏弱/嗜卧');add('interior_low',1,'疲乏');add('transition_low',1,'虚弱');}
 if(/明显怕热/.test(text)){add('interior_active',3,'明显怕热');add('transition_active',1,'阳性热象');}
 if(/很渴.*凉水|口渴.*冷水|大渴/.test(text))add('interior_active',2,'渴喜凉饮');
 if(/便秘|大便干|干结/.test(text))add('interior_active',2,'大便干结');
 if(/腹满|腹胀/.test(text)){add('interior_active',1,'腹满');add('interior_low',1,'腹满');}
 if(/稀便|水样|下利|腹泻/.test(text))add('interior_low',3,'下利/稀便');
 if(/食欲差|不欲饮食|食欲下降/.test(text)){add('interior_low',1,'食欲下降');add('transition_active',1,'食欲下降');}
 if(/温水|喜温|热敷.*舒服/.test(text))add('interior_low',2,'喜温');
 if(/一阵冷一阵热|寒热.*交替|往来寒热/.test(text))add('transition_active',4,'寒热反复');
 if(/口苦/.test(text))add('transition_active',2,'口苦');
 if(/胸胁|两肋/.test(text))add('transition_active',2,'胸胁不适');
 if(/恶心|想吐|喜呕/.test(text)){add('transition_active',1,'恶心/欲呕');add('interior_low',1,'呕逆');}
 if(/口苦\/咽干.*两项以上|胸胁不舒服.*两项以上/.test(text))add('transition_active',3,'过渡区证候群');
 if(/口干.*不太想喝|只想小口/.test(text)){add('transition_low',1,'津液不足线索');add('interior_low',1,'饮水偏少');}
 if(/手足.*冷|四肢.*冷|厥冷/.test(text)){add('transition_low',2,'四肢厥冷');add('surface_low',1,'寒象');}
 if(/上.*热.*下.*寒|寒热错杂|饥.*不欲食/.test(text))add('transition_low',3,'寒热错杂线索');
 return Object.keys(score).map(function(k){return {id:k,score:score[k],support:support[k]};}).sort(function(a,b){return b.score-a.score;});
}

function nextEvidence(session){
 var order=['q_ev_cold_heat','q_ev_thirst','q_ev_energy','q_ev_transition','q_ev_course'];
 if(answered(session,'q_temperature_cluster')||answered(session,'q_fever_chill'))order=order.filter(function(x){return x!=='q_ev_cold_heat';});
 if(answered(session,'q_thirst_drinking'))order=order.filter(function(x){return x!=='q_ev_thirst';});
 if(answered(session,'q_course'))order=order.filter(function(x){return x!=='q_ev_course';});
 var extraCount=(session.turns||[]).filter(function(t){return /^q_ev_/.test(t.questionId);}).length;
 if(extraCount>=3)return null;
 var id=order.find(function(x){return !answered(session,x);});
 return id?EVIDENCE_Q[id]:null;
}

function next(session,treeId){
 var eq=nextEvidence(session);if(eq)return eq;
 if(!['cough','rhinitis','fever'].includes(treeId))return null;
 var ids=treeId==='rhinitis'?['q_nose_discharge','q_fever_chill','q_pattern_sweat']:['q_sputum','q_fever_chill','q_pattern_sweat'];
 var id=ids.find(function(id){return !session.turns.some(function(t){return t.questionId===id;});});return id?(id===sweat.id?sweat:FDE.getQuestion(id)):null;
}

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

window.FormulaMatcher={rank:rank,facts:facts,next:next,getQuestion:function(id){return id===sweat.id?sweat:(EVIDENCE_Q[id]||null);},patternAxes:patternAxes,narrative:narrative,EVIDENCE_Q:EVIDENCE_Q};
})();