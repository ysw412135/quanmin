(function(){
'use strict';
var BOOKS=['《伤寒论》','《金匮要略》'];
function allowed(node){
 if(!node||!node.syndrome)return true;
 var src=String(node.original||'');
 return BOOKS.some(function(book){return src.indexOf(book)>=0;});
}
var blocked=[];
if(window.TREES){
 Object.keys(window.TREES).forEach(function(treeId){
  var tree=window.TREES[treeId],nodes=tree&&tree.nodes;
  if(!nodes)return;
  Object.keys(nodes).forEach(function(key){
   var node=nodes[key];
   if(node&&node.syndrome&&!allowed(node)){
    blocked.push({treeId:treeId,key:key,syndrome:node.syndrome,original:node.original||''});
    delete nodes[key];
   }
  });
 });
}
window.ClassicSourcePolicy={
 books:BOOKS.slice(),
 allowed:allowed,
 blocked:blocked,
 rule:'公开经典方剂候选仅允许来源于《伤寒论》《金匮要略》；未核实出处的方证默认不展示。'
};
if(blocked.length&&window.console&&console.info){
 console.info('[全民经方中医] 已隐藏 '+blocked.length+' 个未满足仲景两书来源规则的方证节点。');
}
})();
