(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&l(n)}).observe(document,{childList:!0,subtree:!0});function u(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(e){if(e.ep)return;e.ep=!0;const s=u(e);fetch(e.href,s)}})();const i=[{num:1,phrases:["大展宏图","信用得固","无边福界","可获成功"],result:"吉"},{num:2,phrases:["根基不固","遥遥欲坠","一盛一衰","劳而无功"],result:"凶"},{num:3,phrases:["根深蒂固","蒸蒸日上","如意吉祥","白事顺逐"],result:"吉"},{num:4,phrases:["坎坷前途","苦难折磨","非有毅力","难望成功"],result:"凶"},{num:5,phrases:["阴阳合和","生意欣荣","名利双收","后福重重"],result:"吉"},{num:6,phrases:["万宝云集","天降幸运","立志奋发","可成大功"],result:"吉"},{num:7,phrases:["专心经营","和气致祥","排除万难","必获成功"],result:"吉"},{num:8,phrases:["努力发达","贯彻志望","不忘进退","成功可期"],result:"吉"},{num:9,phrases:["虽抱奇才","有才无命","独营无力","财力无望"],result:"凶"},{num:10,phrases:["乌云遮月","暗淡无光","空费心力","徒劳无功"],result:"凶"},{num:11,phrases:["草木逢春","枯叶沾露","稳健著实","必得人望"],result:"吉"},{num:12,phrases:["薄弱无力","孤立无摇","外祥内苦","谋事难成"],result:"凶"},{num:13,phrases:["天赋吉运","能得人望","善用智慧","必获成功"],result:"吉"},{num:14,phrases:["忍得苦难","必有后福","是成是败","唯靠坚毅"],result:"中"},{num:15,phrases:["谦恭做事","必得人和","大事成就","一定兴隆"],result:"吉"},{num:16,phrases:["能获众望","成就大业","名利双收","盟主四方"],result:"吉"},{num:17,phrases:["排除万难","有贵人助","把握时机","可获成功"],result:"吉"},{num:18,phrases:["经商做事","顺利昌隆","如能慎始","白事亨通"],result:"吉"},{num:19,phrases:["成功虽早","慎防亏空","内外不合","障碍重重"],result:"凶"},{num:20,phrases:["智高志大","历尽艰难","焦心忧劳","进退两难"],result:"凶"},{num:21,phrases:["专心经营","善用智慧","霜雪梅花","春来怒放"],result:"吉"},{num:22,phrases:["秋草逢霜","怀才不遇","忧愁怨苦","事不如意"],result:"凶"},{num:23,phrases:["旭日升天","名显四方","渐次进展","终成大业"],result:"吉"},{num:24,phrases:["锦绣前程","须靠自力","多用智谋","能奏大功"],result:"吉"},{num:25,phrases:["天时地利","再得人格","讲信修睦","即可成功"],result:"吉"},{num:26,phrases:["波澜起伏","千变万化","凌驾万难","方可成功"],result:"中"},{num:27,phrases:["一成一败","一盛一衰","唯靠谨慎","可守成功"],result:"中"},{num:28,phrases:["鱼临旱池","难逃厄运","此数大凶","不如更换"],result:"凶"},{num:29,phrases:["如龙得云","青云直上","智谋奋进","才略奏功"],result:"吉"},{num:30,phrases:["吉凶参半","得失相伴","投机取巧","如赛一样"],result:"凶"},{num:31,phrases:["此数大吉","名利双收","渐进向上","大业成就"],result:"吉"},{num:32,phrases:["池中之龙","风云际会","一跃上天","成功可望"],result:"吉"},{num:33,phrases:["不可意气","善用智慧","如能慎始","必可昌隆"],result:"吉"},{num:34,phrases:["灾难不绝","难望成功","此数大凶","不如更换"],result:"凶"},{num:35,phrases:["中吉之数","进退保守","生意安稳","成就可期"],result:"吉"},{num:36,phrases:["波澜重叠","常陷穷困","动不如静","有才无命"],result:"凶"},{num:37,phrases:["逢凶化吉","吉人天相","风调雨顺","生意兴隆"],result:"吉"},{num:38,phrases:["名虽可得","利却难获","艺界发展","可望成功"],result:"中"},{num:39,phrases:["云开见月","虽有劳碌","光明坦途","指日可期"],result:"吉"},{num:40,phrases:["一盛一衰","浮沉不定","知难而退","自获天佑"],result:"中"},{num:41,phrases:["天赋吉运","德望兼备","继续努力","前途无限"],result:"吉"},{num:42,phrases:["事业不专","十九不成","专心进取","可望成功"],result:"中"},{num:43,phrases:["雨夜之花","外祥内苦","忍耐自重","转凶为吉"],result:"中"},{num:44,phrases:["虽用心计","事难遂愿","贪功好进","比招失败"],result:"凶"},{num:45,phrases:["杨柳遇春","绿叶发枝","冲破难关","一举成名"],result:"吉"},{num:46,phrases:["坎坷不平","艰难重重","若无耐心","难忘有成"],result:"凶"},{num:47,phrases:["有贵人助","可成大业","虽遇不幸","沉浮不大"],result:"吉"},{num:48,phrases:["梅花逢时","鹤立鸡群","名利俱全","繁荣富贵"],result:"吉"},{num:49,phrases:["遇吉则吉","遇凶则凶","唯靠谨慎","逢凶化吉"],result:"中"},{num:50,phrases:["吉凶互见","一成一败","凶中有吉","吉中有凶"],result:"中"},{num:51,phrases:["一盛一衰","浮沉不常","自重自处","可保平安"],result:"中"},{num:52,phrases:["草木逢春","雨过天晴","渡过难关","即获成功"],result:"吉"},{num:53,phrases:["盛衰参半","外祥内苦","先吉后凶","先凶后吉"],result:"中"},{num:54,phrases:["虽倾全力","难望成功","次数大凶","最好更改"],result:"凶"},{num:55,phrases:["外观昌隆","内隐忧患","克服难关","开出泰运"],result:"中"},{num:56,phrases:["事与愿违","终难成功","欲速不达","有始无终"],result:"凶"},{num:57,phrases:["努力经营","时来运转","旷野枯草","春来开花"],result:"吉"},{num:58,phrases:["半凶半吉","沉浮多端","始凶终吉","能保成功"],result:"中"},{num:59,phrases:["遇事犹疑","难望成事","大刀阔斧","始可有成"],result:"凶"},{num:60,phrases:["黑暗无光","心谜意乱","出尔反尔","难定方针"],result:"凶"},{num:61,phrases:["云遮半月","百隐风波","应自谨慎","始保平安"],result:"中"},{num:62,phrases:["烦闷懊恼","事事难展","自防灾祸","始免困境"],result:"凶"},{num:63,phrases:["万物化育","繁荣之象","专心一意","可获成功"],result:"吉"},{num:64,phrases:["见异思迁","十九不成","徒劳无功","不如更换"],result:"凶"},{num:65,phrases:["吉运自来","能享盛名","把握时机","必获成功"],result:"吉"},{num:66,phrases:["黑夜慢长","进退维谷","内外不合","信用缺乏"],result:"凶"},{num:67,phrases:["时来运转","事事如意","功成名就","富贵自来"],result:"吉"},{num:68,phrases:["思虑周详","计划力行","不失先机","可望成功"],result:"吉"},{num:69,phrases:["动摇不安","常陷逆境","不得时运","难得利润"],result:"凶"},{num:70,phrases:["惨淡经营","难免贫困","此数不及","最好改换"],result:"凶"},{num:71,phrases:["吉凶参半","惟赖勇气","贯彻力行","始可成功"],result:"中"},{num:72,phrases:["厉害混淆","凶多吉少","得而复失","难以安顿"],result:"凶"},{num:73,phrases:["安乐自来","自然吉祥","力行不懈","终必成功"],result:"吉"},{num:74,phrases:["利不及费","坐食山空","如无智谋","难忘成功"],result:"凶"},{num:75,phrases:["吉中带凶","欲速不达","进不如守","可保安详"],result:"中"},{num:76,phrases:["此数大凶","破产之象","宜速更该","以避厄运"],result:"凶"},{num:77,phrases:["先苦后甘","先甘后苦","如能守成","不致失败"],result:"中"},{num:78,phrases:["有得有失","华而不实","需防劫材","始保平安"],result:"中"},{num:79,phrases:["如走夜路","前途无光","希望不大","劳而无功"],result:"凶"},{num:80,phrases:["得而复失","枉费心机","守成无贪","可保安稳"],result:"中"},{num:81,phrases:["最极之数","还本归元","能得繁业","发达成功"],result:"吉"}];function d(r){const t=Number(r);if(!Number.isFinite(t))return 1;const u=(t%81+81)%81;return u===0?81:u}function f(r){const t=d(r);return i[t-1]}const b=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>`,g=document.querySelector("#app");function v(){const r="lucky-input",t="lucky-result",u="lucky-result-detail",e="./number.svg";g.innerHTML=`
    <header class="header">
      <div class="header-row">
        <div class="header-title-group">
          <a href="https://neilhan.github.io/static" class="home-link" title="Back to Home" aria-label="Back to Home">
            <span class="home-icon" aria-hidden="true">${b}</span>
          </a>
          <span class="breadcrumb-separator">/</span>
          <img src="${e}" alt="Lucky number icon" width="32" height="32" class="header-app-icon" />
          <h1>Lucky Number Lookup</h1>
        </div>
      </div>
      <p class="subtitle">Enter a number; it will be reduced modulo 81 (1–81) and looked up in the table below.</p>
    </header>

    <section class="lookup-section">
      <label for="${r}">Number (digits only)</label>
      <input
        id="${r}"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="e.g. 12345"
        autocomplete="off"
      />
      <div id="${t}" class="result-box" aria-live="polite"></div>
      <div id="${u}" class="result-detail" aria-live="polite"></div>
    </section>

    <section class="table-section">
      <h2>Lookup table (1–81)</h2>
      <div class="table-wrapper">
        <table class="lookup-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Phrases</th>
              <th scope="col">Result</th>
              <th scope="col">#</th>
              <th scope="col">Phrases</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            ${y()}
          </tbody>
        </table>
      </div>
    </section>
  `;const s=document.getElementById(r),n=document.getElementById(t),c=document.getElementById(u);function h(){const o=s.value.replace(/\D/g,"");if(o===""){n.textContent="",n.className="result-box",c.innerHTML="";return}const a=Number(o);if(!Number.isFinite(a)||a<0){n.textContent="Enter a valid number.",n.className="result-box result-error",c.innerHTML="";return}const p=f(a),m=d(a);n.textContent=`Number ${a} → ${m} → ${p.phrases.join(" ")} 【${p.result}】`,n.className=`result-box result-${p.result}`,c.innerHTML=`
      <p><strong>Index:</strong> ${m}</p>
      <p><strong>Phrases:</strong> ${p.phrases.join(" · ")}</p>
      <p><strong>Result:</strong> ${p.result}</p>
    `}s.addEventListener("input",()=>{s.value=s.value.replace(/\D/g,""),h()}),s.addEventListener("paste",o=>{const a=(o.clipboardData?.getData("text")??"").replace(/\D/g,"");a!==(o.clipboardData?.getData("text")??"")&&(o.preventDefault(),s.value=a,h())}),s.addEventListener("keyup",h),h()}function y(){const r=[];for(let u=0;u<40;u++){const l=i[u],e=i[u+40];r.push(`
      <tr>
        <td>${l.num}</td>
        <td>${l.phrases.join(" ")}</td>
        <td class="result-cell result-${l.result}">${l.result}</td>
        <td>${e.num}</td>
        <td>${e.phrases.join(" ")}</td>
        <td class="result-cell result-${e.result}">${e.result}</td>
      </tr>
    `)}const t=i[80];return r.push(`
    <tr>
      <td>81</td>
      <td>${t.phrases.join(" ")}</td>
      <td class="result-cell result-${t.result}">${t.result}</td>
      <td colspan="3" class="empty-cell"></td>
    </tr>
  `),r.join("")}v();
