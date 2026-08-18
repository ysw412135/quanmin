// PWA — install banner + iOS guidance
(function(){
  var u=navigator.userAgent, ios=/iPad|iPhone|iPod/.test(u)&&!window.MSStream,
      adr=/Android/.test(u), st=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone;

  // Hide APK link on iOS, show iOS install tip instead
  if(ios){
    var apkLink = document.querySelector('.apk-link');
    if(apkLink) apkLink.style.display='none';
    var iosTip = document.querySelector('.ios-install-tip');
    if(iosTip) iosTip.style.display='block';
  }

  // Install banner
  var b=document.getElementById("installBanner");
  if(!b) return;
  var t=b.querySelector("span"), n=document.getElementById("installBtn"), c=b.querySelector(".ib-close");

  if(st){b.style.display="none";return}

  var huawei=/HUAWEI|HONOR|HarmonyOS/i.test(u);
  var edge=/Edg\//.test(u);
  var guide="";

  if(ios){
    t.textContent="📱 点分享 → 添加到主屏幕"; n.textContent="查看演示";
    guide="【iPhone/iPad】\n1.点 Safari 底部「分享」图标（方框↑箭头）\n2.往下滑找到「添加到主屏幕」\n3.点右上角「添加」\n✅ 完成！桌面出现「全民中医」图标，点开就是全屏App\n\n💡 如果找不到分享按钮，可能是用微信/其他App打开的。请用 Safari 打开此页面。";
  }else if(huawei&&!edge){
    t.textContent="📱 点底部中间 ☰ → 添加至桌面"; n.textContent="添加演示";
    guide="【华为浏览器】\n1.点底部中间「☰」菜单\n2.找到「添加至桌面」\n3.点「添加」\n✅ 完成！桌面出现图标\n\n注：如菜单无此选项，请用Edge浏览器打开";
  }else{
    var m=edge?"底部 ··· 菜单":"右上角 ⋮ 菜单";
    t.textContent="📱 点"+m+" → 添加到主屏幕"; n.textContent="添加演示";
    guide="【Android】\n1.点浏览器"+m+"\n2.找到「添加到主屏幕」或「安装应用」\n3.点「添加」\n✅ 完成！桌面图标全屏打开";
  }

  b.style.display="flex";

  n.addEventListener("click",function(){
    if(window._pd){
      window._pd.prompt();
      window._pd.userChoice.then(function(r){if(r.outcome==="accepted"){b.style.display="none"}window._pd=null});
      return;
    }
    alert(guide);
  });
  c.addEventListener("click",function(){b.style.display="none"});
  window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window._pd=e;n.textContent="⚡一键安装"});
})();
