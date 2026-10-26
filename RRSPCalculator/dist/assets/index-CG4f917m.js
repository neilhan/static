(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function s(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=s(o);fetch(o.href,i)}})();function Ht(e){if(e<71)return 0;const n={71:.0528,72:.054,73:.0553,74:.0567,75:.0582,76:.0598,77:.0617,78:.0636,79:.0658,80:.0682,81:.0708,82:.0738,83:.0771,84:.0808,85:.0851,86:.0899,87:.0955,88:.1021,89:.1099,90:.1192,91:.1306,92:.1449,93:.1634,94:.1879};return e>=95?.2:n[e]??1/(90-e)}function z(e,n=!0){if(e<=0)return 0;const s=[{limit:55867,rate:.15},{limit:111733,rate:.205},{limit:173205,rate:.26},{limit:246752,rate:.29},{limit:1/0,rate:.33}],r=15705;let o=0,i=e,d=0;for(const c of s){if(i<=0)break;const h=Math.min(i,c.limit-d);o+=h*c.rate,i-=h,d=c.limit}o=Math.max(0,o-r*.15),n&&e>2e3&&(o=Math.max(0,o-300));const g=[{limit:51446,rate:.0505},{limit:102894,rate:.0915},{limit:15e4,rate:.1116},{limit:22e4,rate:.1216},{limit:1/0,rate:.1316}],m=12399;let R=0,a=e;d=0;for(const c of g){if(a<=0)break;const h=Math.min(a,c.limit-d);R+=h*c.rate,a-=h,d=c.limit}R=Math.max(0,R-m*.0505);let p=0;return R>5315&&(p+=(R-5315)*.2),R>6802&&(p+=(R-6802)*.36),R+=p,o+R}function tt(e,n,s,r=!0){if(e<=0)return{totalTax:0,spouse1Tax:0,spouse2Tax:0,isSplit:!1};if(r&&(n>=65||s>=65)){const d=e/2,g=z(d,n>=65),m=z(d,s>=65);return{totalTax:Math.round(g+m),spouse1Tax:Math.round(g),spouse2Tax:Math.round(m),isSplit:!0}}const i=z(e,n>=65);return{totalTax:Math.round(i),spouse1Tax:Math.round(i),spouse2Tax:0,isSplit:!1}}function mt(e,n="single",s=65,r=65,o=!0){let i=e,d=e*2.5,g=e;for(let R=0;R<40;R++){const a=(i+d)/2,p=n==="couple"?tt(a,s,r,o):{totalTax:z(a,s>=65)},c=a-p.totalTax;if(Math.abs(c-e)<1){g=a;break}c<e?i=a:d=a,g=a}const m=n==="couple"?tt(g,s,r,o):{totalTax:z(g,s>=65),isSplit:!1};return{gross:Math.round(g),tax:Math.round(m.totalTax),effectiveRate:g>0?m.totalTax/g:0,isSplit:m.isSplit}}function Nt(e,n,s="single",r=65,o=65){const i=Math.max(0,Math.min(.95,n));let d=e,g=e*1.5,m=e;for(let c=0;c<35;c++){const h=(d+g)/2,M=h*i*.5,P=s==="couple"?tt(M,r,o,!0).totalTax:z(M,r>=65),v=h-P;if(Math.abs(v-e)<1){m=h;break}v<e?d=h:g=h,m=h}const a=m*i*.5,p=s==="couple"?tt(a,r,o,!0).totalTax:z(a,r>=65);return{gross:Math.round(m),tax:Math.round(p)}}function Ut(e){const{householdMode:n="single",annualSaving:s,mode:r,reinvestRefund:o,yearsAccumulation:i,retireAge:d,person2RetireAge:g=d,retireNetSpending:m,workTaxRate:R,person2WorkTaxRate:a=R*.75,growthRatePreTax:p,taxDrag:c,retireGrowthRate:h,enableIncomeSplitting:E=!0}=e,M=Math.max(18,d-i),P=Math.max(18,g-i),v=n==="couple"?32490*2:32490,T=s>v,y=n==="couple"?(R+a)/2:R;let B=0,N=0,k=0,q=0,V=0,X=0;r==="preTax"?(B=s,V=s*i,N=s*(1-y),X=N*i,k=s*(1-y)):(N=s,X=s*i,k=s,o?(B=s/(1-y),V=s*i):(B=s,q=s*y,V=s*i));const b=[];let L=0;for(let u=1;u<=i;u++){const f=L,w=(f+B)*p;L=f+B+w,b.push({year:u,age:M+u-1,person2Age:n==="couple"?P+u-1:void 0,startBalance:Math.round(f),contribution:Math.round(B),growth:Math.round(w),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(L)})}const st=[],U=Math.max(0,p-c);let $=0,j=N*i;for(let u=1;u<=i;u++){const f=$,w=(f+N)*U;$=f+N+w,st.push({year:u,age:M+u-1,person2Age:n==="couple"?P+u-1:void 0,startBalance:Math.round(f),contribution:Math.round(N),growth:Math.round(w),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round($)})}const ft=[];let lt=0;for(let u=1;u<=i;u++){const f=lt,w=(f+k)*p;lt=f+k+w,ft.push({year:u,age:M+u-1,person2Age:n==="couple"?P+u-1:void 0,startBalance:Math.round(f),contribution:Math.round(k),growth:Math.round(w),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(lt)})}const dt=mt(m,n,d,g,E),Et=mt(m,"single",d),kt=n==="couple"?Math.max(0,Et.tax-dt.tax):0,Mt=[];let rt=L,Rt=0;const xt=55;let Bt=!1,wt=null,Ct=0;const Gt=n==="couple"?91e3*2:91e3;for(let u=1;u<=xt&&!(rt<=0);u++){const f=d+u-1,w=g+u-1,W=rt,_=W*h,C=Math.min(f,w),G=Ht(n==="couple"?C:f),x=G>0?Math.round(W*G):0,F=x>dt.gross;F&&wt===null&&(wt=f);const Q=Math.max(dt.gross,x),pt=Math.min(W+_,Q),Ft=n==="couple"?tt(pt,f,w,E):{totalTax:z(pt,f>=65)},gt=Math.round(Ft.totalTax),at=Math.max(0,pt-gt),At=Math.max(0,at-m);if(Ct+=At,rt=Math.max(0,W+_-pt),Mt.push({year:u,age:f,person2Age:n==="couple"?w:void 0,startBalance:Math.round(W),contribution:0,growth:Math.round(_),withdrawalGross:Math.round(pt),taxPaid:gt,withdrawalNet:Math.round(at),endBalance:Math.round(rt),isRRIFForced:F,rrifMinGross:x>0?x:void 0,surplusNet:At>0?At:void 0}),pt>=dt.gross)Rt+=1;else{Rt+=pt/dt.gross;break}if(u>=40&&rt>=L&&!F){Bt=!0,Rt=55;break}}const Pt=$>0?Math.max(0,($-j)/$):0,vt=Nt(m,Pt,n,d,g),O=[];let S=$,I=0;const ot=h*.85;let K=!1;for(let u=1;u<=xt&&!(S<=0);u++){const f=d+u-1,w=g+u-1,W=S,_=W*ot,C=Math.min(W+_,vt.gross),G=n==="couple"?tt(C*Pt*.5,f,w,!0).totalTax:z(C*Pt*.5,f>=65),x=C-G;if(S=Math.max(0,W+_-C),O.push({year:u,age:f,person2Age:n==="couple"?w:void 0,startBalance:Math.round(W),contribution:0,growth:Math.round(_),withdrawalGross:Math.round(C),taxPaid:Math.round(G),withdrawalNet:Math.round(x),endBalance:Math.round(S)}),C>=vt.gross)I+=1;else{I+=C/vt.gross;break}if(u>=40&&S>=$){K=!0,I=55;break}}const et=m,ut=[];let it=lt,ct=0,$t=!1;for(let u=1;u<=xt&&!(it<=0);u++){const f=d+u-1,w=g+u-1,W=it,_=W*h,C=Math.min(W+_,et);if(it=Math.max(0,W+_-C),ut.push({year:u,age:f,person2Age:n==="couple"?w:void 0,startBalance:Math.round(W),contribution:0,growth:Math.round(_),withdrawalGross:Math.round(C),taxPaid:0,withdrawalNet:Math.round(C),endBalance:Math.round(it)}),C>=et)ct+=1;else{ct+=C/et;break}if(u>=40&&it>=lt){$t=!0,ct=55;break}}return{params:e,exceedsRrspLimit:T,rrspAnnualLimit:v,rrsp:{accountName:n==="couple"?"Couple's Joint RRSP / RRIF":"RRSP / RRIF",terminalBalance:Math.round(L),totalOutofPocketCost:Math.round(V),totalTaxRefundsReceived:Math.round(q*i),annualGrossWithdrawalNeeded:dt.gross,annualRetirementTaxPaid:dt.tax,longevityYears:Math.round(Rt*10)/10,isPerpetual:Bt,oasClawbackRisk:dt.gross>=Gt,firstRRIFForcedAge:wt,totalRRIFSurplusCash:Math.round(Ct),couplesTaxAdvantageAnnual:Math.round(kt),accumulationHistory:b,decumulationHistory:Mt},nonReg:{accountName:n==="couple"?"Couple's Personal Account (Joint PI)":"Personal Investment (Taxable Non-Registered)",terminalBalance:Math.round($),totalOutofPocketCost:Math.round(X),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:vt.gross,annualRetirementTaxPaid:vt.tax,longevityYears:Math.round(I*10)/10,isPerpetual:K,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:st,decumulationHistory:O},tfsa:{accountName:n==="couple"?"Couple's Combined TFSAs":"TFSA (Tax-Free Savings Account)",terminalBalance:Math.round(lt),totalOutofPocketCost:Math.round(X),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:et,annualRetirementTaxPaid:0,longevityYears:Math.round(ct*10)/10,isPerpetual:$t,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:ft,decumulationHistory:ut}}}function Wt(e){const{householdMode:n="single",annualSaving:s,yearsAccumulation:r,retireAge:o,person2RetireAge:i=o,retireNetSpending:d,workTaxRate:g,person2WorkTaxRate:m=g*.75,growthRatePreTax:R,taxDrag:a,retireGrowthRate:p,enableIncomeSplitting:c=!0,rrspPct:h,piPct:E,tfsaPct:M,reinvestRefundTo:P,decumStrategy:v}=e,T=Math.max(18,o-r),y=Math.max(18,i-r),B=n==="couple"?32490*2:32490,N=n==="couple"?91e3*2:91e3;let k=0,q=0,V=0,X=0,b=0,L=0;if(e.person1RrspSaving!==void 0||e.person2RrspSaving!==void 0||e.piSaving!==void 0)n==="couple"?(b=Math.min(32490,Math.max(0,e.person1RrspSaving??0)),L=Math.min(32490,Math.max(0,e.person2RrspSaving??0)),k=b+L,q=Math.max(0,e.piSaving??0),V=Math.max(0,e.tfsaSaving??0),X=b*g+L*m):(b=Math.min(32490,Math.max(0,e.person1RrspSaving??0)),k=b,q=Math.max(0,e.piSaving??0),V=Math.max(0,e.tfsaSaving??0),X=b*g);else{const O=h+E+M||100,S=h/O,I=E/O,ot=M/O;if(k=s*S,q=s*I,V=s*ot,k>B){const K=k-B;k=B,V+=K*.5,q+=K*.5}n==="couple"?(b=k*.5,L=k*.5,X=b*g+L*m):(b=k,X=k*g)}P==="tfsa"?V+=X:P==="pi"&&(q+=X);let U=0,$=0,j=0,ft=0;const lt=[],dt=Math.max(0,R-a);for(let O=1;O<=r;O++){const S=T+O-1,I=y+O-1,ot=U,K=$,et=j,ut=(ot+k)*R,it=(K+q)*dt,ct=(et+V)*R;U=ot+k+ut,$=K+q+it,j=et+V+ct,ft+=q,lt.push({year:O,age:S,person2Age:n==="couple"?I:void 0,rrspStart:Math.round(ot),piStart:Math.round(K),tfsaStart:Math.round(et),totalStart:Math.round(ot+K+et),rrspContrib:Math.round(k),piContrib:Math.round(q),tfsaContrib:Math.round(V),taxRefund:Math.round(X),rrspGrowth:Math.round(ut),piGrowth:Math.round(it),tfsaGrowth:Math.round(ct),rrspGrossDraw:0,piGrossDraw:0,tfsaGrossDraw:0,totalGrossDraw:0,rrspTax:0,piTax:0,totalTax:0,netSpendReceived:0,rrspEnd:Math.round(U),piEnd:Math.round($),tfsaEnd:Math.round(j),totalEnd:Math.round(U+$+j),notes:"Accumulating"})}const Et={rrsp:Math.round(U),pi:Math.round($),tfsa:Math.round(j),total:Math.round(U+$+j)};let kt=0,Mt=0,rt=0,Rt=!1,xt=0;const Bt=55,wt=p*.85;for(let O=1;O<=Bt;O++){const S=o+O-1,I=i+O-1,ot=U+$+j;if(ot<=0)break;const K=U,et=$,ut=j,it=K*p,ct=et*wt,$t=ut*p;let u=K+it,f=et+ct,w=ut+$t;const W=Math.min(S,I),_=Ht(n==="couple"?W:S),C=_>0?Math.min(u,K*_):0;let G=d,x=0,F=0,Q=0,pt=!1,Ft=!1,gt="";const at=$>0?Math.max(0,($-ft)/$):0;if(v==="oasShield"){const H=n==="couple"?176e3:88e3,Z=Math.max(C,Math.min(u,H));C>H?(pt=!0,gt="RRIF Min Exceeds OAS Cap"):Ft=!0;const D=n==="couple"?tt(Z,S,I,c).totalTax:z(Z,S>=65);if(Math.max(0,Z-D)>=G){const A=mt(G,n,S,I,c);x=Math.max(C,Math.min(u,A.gross))}else{x=Z;const A=x-D;let J=Math.max(0,G-A);if(J>0&&f>0){const bt=Nt(J,at,n,S,I),Lt=Math.min(f,bt.gross);F=Lt;const Vt=n==="couple"?tt(Lt*at*.5,S,I,!0).totalTax:z(Lt*at*.5,S>=65),Xt=Lt-Vt;J=Math.max(0,J-Xt)}if(J>0&&w>0){const bt=Math.min(w,J);Q=bt,J=Math.max(0,J-bt)}}}else if(v==="rrspMeltdown"){const H=n==="couple"?18e4:105e3;if(S<71&&u>0){x=Math.min(u,H);const Z=n==="couple"?tt(x,S,I,c).totalTax:z(x,S>=65),D=x-Z;if(D<G){const nt=G-D;F=Math.min(f,nt);const A=nt-F;A>0&&(Q=Math.min(w,A))}gt="Early RRSP Meltdown"}else{const Z=mt(G,n,S,I,c);x=Math.max(C,Math.min(u,Z.gross));const D=n==="couple"?tt(x,S,I,c).totalTax:z(x,S>=65),nt=x-D;let A=Math.max(0,G-nt);A>0&&f>0&&(F=Math.min(f,A*1.05),A=Math.max(0,A-F)),A>0&&w>0&&(Q=Math.min(w,A)),gt="Post-71 RRIF Mode"}}else if(v==="taxableFirst"){x=C;const H=x>0?n==="couple"?tt(x,S,I,c).totalTax:z(x,S>=65):0,Z=x-H;let D=Math.max(0,G-Z);if(f>0&&D>0){const nt=Nt(D,at,n,S,I),A=Math.min(f,nt.gross);F=A;const J=A-(n==="couple"?tt(A*at*.5,S,I,!0).totalTax:z(A*at*.5,S>=65));D=Math.max(0,D-J)}if(D>0&&u>x){const nt=mt(D,n,S,I,c),A=Math.min(u-x,nt.gross);x+=A}D>0&&w>0&&(Q=Math.min(w,D)),gt=f>0?"Spending Taxable PI First":"PI Exhausted"}else{const H=u+f+w,Z=H>0?u/H:0,D=H>0?f/H:0,nt=H>0?w/H:0,A=mt(G*Z,n,S,I,c).gross;x=Math.max(C,Math.min(u,A)),F=Math.min(f,G*D*1.05),Q=Math.min(w,G*nt),gt="Proportional Draw"}for(let H=0;H<3;H++){const Z=x+F*at*.5,D=n==="couple"?tt(Z,S,I,c).totalTax:z(Z,S>=65),nt=x+F+Q-D,A=G-nt;if(A<=300)break;if(w>Q){const J=Math.min(w-Q,A);Q+=J}else if(f>F){const J=Math.min(f-F,A*1.05);F+=J}else if(u>x){const J=mt(A,n,S,I,c).gross,bt=Math.min(u-x,J);x+=bt}else break}const At=F*at*.5,yt=x+At,Ot=n==="couple"?tt(yt,S,I,c):{totalTax:z(yt,S>=65),isSplit:!1},Tt=Ot.totalTax,Yt=yt>0?Math.round(Tt*(x/yt)):0,zt=Math.round(Tt-Yt);if(kt+=Tt,yt>N){const H=(yt-N)*.15;Mt+=H}const Dt=Math.round(x+F+Q-Tt);U=Math.max(0,u-x),$=Math.max(0,f-F),j=Math.max(0,w-Q),ft=Math.max(0,ft-F*(1-at)),lt.push({year:r+O,age:S,person2Age:n==="couple"?I:void 0,rrspStart:Math.round(K),piStart:Math.round(et),tfsaStart:Math.round(ut),totalStart:Math.round(ot),rrspContrib:0,piContrib:0,tfsaContrib:0,taxRefund:0,rrspGrowth:Math.round(it),piGrowth:Math.round(ct),tfsaGrowth:Math.round($t),rrspGrossDraw:Math.round(x),piGrossDraw:Math.round(F),tfsaGrossDraw:Math.round(Q),totalGrossDraw:Math.round(x+F+Q),rrspTax:Yt,piTax:zt,totalTax:Math.round(Tt),netSpendReceived:Dt,rrspEnd:Math.round(U),piEnd:Math.round($),tfsaEnd:Math.round(j),totalEnd:Math.round(U+$+j),isRRIFForced:pt,isOASCapped:Ft,isIncomeSplit:Ot.isSplit,notes:gt});const qt=U+$+j;if(Dt>=G*.85)rt+=1;else if(qt<=100){rt+=Math.max(0,Dt/G);break}else rt+=1;if(S===85&&(xt=Math.round(U*(1-.45)+$*(1-at*.25)+j)),O>=45&&U+$+j>=Et.total){Rt=!0,rt=55;break}}const Ct=mt(d,n,o,i,c),Gt=mt(d,"single",o),Pt=n==="couple"?Math.max(0,Gt.tax-Ct.tax):0,vt={oasShield:{name:n==="couple"?"Dual OAS Shield & Income Splitting":"OAS Shield & Tax Smoothing",tagline:n==="couple"?"Splits RRIF income 50/50 and shields up to $182k combined from OAS clawback.":"Caps RRSP withdrawals below the ~$91k clawback line; bridges lifestyle with PI/TFSA."},rrspMeltdown:{name:"Early RRSP Meltdown",tagline:"Aggressively burns down RRSP between retirement and age 71 to eliminate the RRIF tax bomb."},taxableFirst:{name:"Taxable (PI) First",tagline:"Spends taxable personal investments first, allowing RRSP and TFSA to compound untouched."},proRata:{name:"Proportional Balanced Draw",tagline:"Draws simultaneously from RRSP, PI, and TFSA in proportion to their current balances."}};return{id:v,name:vt[v].name,tagline:vt[v].tagline,longevityYears:Math.round(rt*10)/10,depletionAge:Math.round(o+rt),isPerpetual:Rt,terminalBalanceAtRetirement:Et,totalLifetimeRetirementTax:Math.round(kt),totalOASClawbackPaid:Math.round(Mt),totalRefundsAccumulated:Math.round(X*r),annualTaxRefund:Math.round(X),person1RrspSaving:Math.round(b),person2RrspSaving:Math.round(L),piSaving:Math.round(q),estateValueAtAge85:xt,couplesAnnualTaxSavings:Pt,history:lt}}function jt(e){return["oasShield","rrspMeltdown","taxableFirst","proRata"].map(s=>Wt({...e,decumStrategy:s}))}const Jt=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>`;let t={householdMode:"single",viewMode:"simulator",annualSaving:4e4,yearsAccumulation:15,retireAge:65,person2RetireAge:63,retireNetSpending:8e4,workTaxRate:.43,person2WorkTaxRate:.3,growthRatePreTax:.07,taxDrag:.015,retireGrowthRate:.05,enableIncomeSplitting:!0,p1RrspSaving:25e3,p2RrspSaving:1e4,piSaving:15e3,tfsaSaving:0,rrspPct:70,piPct:30,tfsaPct:0,reinvestRefundTo:"tfsa",decumStrategy:"oasShield",comparatorMode:"preTax",comparatorReinvest:!1,ledgerOpen:!1,theme:localStorage.getItem("theme")||"dark"};document.documentElement.setAttribute("data-theme",t.theme);const Kt=document.getElementById("app");function l(e){return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(e)}function Qt(e){return e>=1e6?`$${(e/1e6).toFixed(2)}M`:e>=1e3?`$${(e/1e3).toFixed(0)}k`:`$${e}`}function Zt(){const e=t.householdMode==="couple",n=e?t.p1RrspSaving+t.p2RrspSaving+t.piSaving:t.p1RrspSaving+t.piSaving;return t.annualSaving=n,{householdMode:t.householdMode,annualSaving:t.annualSaving,yearsAccumulation:t.yearsAccumulation,retireAge:t.retireAge,person2RetireAge:t.person2RetireAge,retireNetSpending:t.retireNetSpending,workTaxRate:t.workTaxRate,person2WorkTaxRate:t.person2WorkTaxRate,growthRatePreTax:t.growthRatePreTax,taxDrag:t.taxDrag,retireGrowthRate:t.retireGrowthRate,enableIncomeSplitting:t.enableIncomeSplitting,rrspPct:t.rrspPct,piPct:t.piPct,tfsaPct:t.tfsaPct,person1RrspSaving:t.p1RrspSaving,person2RrspSaving:e?t.p2RrspSaving:0,piSaving:t.piSaving,tfsaSaving:t.tfsaSaving,reinvestRefundTo:t.reinvestRefundTo}}function St(){const e=t.householdMode==="couple",s="./calculator.svg";if(!e)t.p1RrspSaving+t.piSaving!==t.annualSaving&&(t.p1RrspSaving=Math.min(32490,Math.round(t.annualSaving*.7)),t.piSaving=Math.max(0,t.annualSaving-t.p1RrspSaving));else if(t.p1RrspSaving+t.p2RrspSaving+t.piSaving!==t.annualSaving){const o=Math.min(32490,Math.round(t.annualSaving*.35));t.p1RrspSaving=o,t.p2RrspSaving=o,t.piSaving=Math.max(0,t.annualSaving-o*2)}Kt.innerHTML=`
    <div class="container">
      <!-- Header -->
      <header class="app-header">
        <nav class="nav-bar">
          <div class="breadcrumb-group">
            <a href="https://neilhan.github.io/static" class="home-link" title="Back to Home" aria-label="Back to Home">
              <span class="home-icon" aria-hidden="true">${Jt}</span>
            </a>
            <span class="breadcrumb-sep">/</span>
            <span class="badge-tag">RETIREMENT STRATEGY ENGINE</span>
          </div>
          <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
            ${t.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode"}
          </button>
        </nav>

        <div class="hero-banner">
          <img src="${s}" alt="Calculator Logo" class="app-logo" />
          <div class="hero-text">
            <h1>${e?"Couples Retirement Strategy Simulator":"Canadian Retirement Strategy Simulator"}</h1>
            <p>
              ${e?"Optimize household savings across Person 1 RRSP, Person 2 RRSP, and Personal Accounts. Model CRA pension income splitting (age 65+), dual basic personal tax credits, and dual OAS clawback shields.":"Optimize accumulation allocation (RRSP vs. Personal Investment vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."}
            </p>
          </div>
        </div>
      </header>

      <!-- Household Mode Selector (Single vs Couple) -->
      <div class="household-toggle-wrapper">
        <div class="household-pills">
          <button id="btn-household-single" class="household-pill ${e?"":"active"}">
            👤 Single Individual
          </button>
          <button id="btn-household-couple" class="household-pill ${e?"active":""}">
            👥 Couple (2 Persons / Spousal)
          </button>
        </div>
      </div>

      <!-- Mode Switcher -->
      <nav class="app-nav-tabs" aria-label="View Mode">
        <button id="tab-mode-sim" class="nav-tab-btn ${t.viewMode==="simulator"?"active":""}">
          🎯 Strategy Simulator & Optimizer
        </button>
        <button id="tab-mode-comp" class="nav-tab-btn ${t.viewMode==="comparator"?"active":""}">
          ⚖️ Direct Account Comparison (RRSP vs PI vs TFSA)
        </button>
      </nav>

      <!-- Main Layout -->
      <main class="main-layout">
        <!-- Controls Sidebar (Persistent DOM Element) -->
        <aside id="controls-panel" class="panel" aria-label="Calculator Settings">
          ${_t(e)}
        </aside>

        <!-- Dynamic Results Panel (Updated on Drag) -->
        <section id="results-container" class="results-container" aria-label="Results">
          <!-- Populated by updateResultsOnly() -->
        </section>
      </main>

      <!-- Rules & Considerations Section -->
      ${oe()}

      <footer class="footer-note">
        <p>Built with CRA RRIF prescribed factors (Age 71+), Pension Income Splitting (Form T1032), Federal & Provincial (Ontario benchmark) graduated brackets, Basic Personal Amounts, and Capital Gains 50% inclusion rules.</p>
        <p>© ${new Date().getFullYear()} static-apps · Educational financial model. Not formal financial advice.</p>
      </footer>
    </div>
  `,ie(),le(),Y()}function _t(e){const n=Math.max(18,t.retireAge-t.yearsAccumulation),s=Math.max(18,t.person2RetireAge-t.yearsAccumulation);return`
    <h2 class="panel-title">${e?"Household Profile & Targets":"Your Profile & Targets"}</h2>

    <!-- Total Annual Saving -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-saving">
          ${e?"Combined Household Saving":"Annual Total Saving"}
        </label>
        <span class="form-val-display" id="disp-saving">${l(t.annualSaving)}</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-saving" min="5000" max="150000" step="1000" value="${t.annualSaving}">
        <input type="number" id="num-saving" class="form-input-number" min="1000" max="300000" step="1000" value="${t.annualSaving}">
      </div>
    </div>

    <!-- Granular Savings Allocation Breakdown -->
    ${t.viewMode==="simulator"?te(e):ee()}

    <div class="divider"></div>

    <!-- Years of Accumulation -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-years">Years to Invest</label>
        <span class="form-val-display" id="disp-years">${t.yearsAccumulation} years</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-years" min="3" max="40" step="1" value="${t.yearsAccumulation}">
        <input type="number" id="num-years" class="form-input-number" min="1" max="50" step="1" value="${t.yearsAccumulation}">
      </div>
    </div>

    <!-- Retirement Ages -->
    ${e?`
      <div class="form-group">
        <label class="form-label">Retirement Ages (Person 1 & Person 2)</label>
        <div class="dual-person-grid">
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 1</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${t.retireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${n})</span>
            </div>
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage2" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${t.person2RetireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${s})</span>
            </div>
          </div>
        </div>
      </div>
      `:`
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-retireage">Retire at Age</label>
          <span class="form-val-display" id="disp-retireage">Age ${t.retireAge} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(Starts @ ${n})</span></span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-retireage" min="50" max="75" step="1" value="${t.retireAge}">
          <input type="number" id="num-retireage" class="form-input-number" min="45" max="80" step="1" value="${t.retireAge}">
        </div>
      </div>
      `}

    <!-- Retirement Net Spending Goal -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-spend">
          ${e?"Household Spend (After-Tax)":"Retirement Spend (After-Tax)"}
        </label>
        <span class="form-val-display" id="disp-spend">${l(t.retireNetSpending)}/yr</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-spend" min="20000" max="250000" step="5000" value="${t.retireNetSpending}">
        <input type="number" id="num-spend" class="form-input-number" min="10000" max="400000" step="5000" value="${t.retireNetSpending}">
      </div>
    </div>

    ${e?`
      <label class="reinvest-checkbox-row" style="margin-bottom:1rem;">
        <input type="checkbox" id="check-splitting" ${t.enableIncomeSplitting?"checked":""}>
        <span>Enable CRA Pension Income Splitting (Age 65+)</span>
      </label>`:""}

    <div class="divider"></div>

    <!-- Working Marginal Tax Rates -->
    ${e?`
      <div class="form-group">
        <label class="form-label">Working Marginal Tax Rates (MTR)</label>
        <div class="dual-person-grid">
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 1 MTR</span>
            <input type="number" id="num-tax" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(t.workTaxRate*100).toFixed(1)}">
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2 MTR</span>
            <input type="number" id="num-tax2" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(t.person2WorkTaxRate*100).toFixed(1)}">
          </div>
        </div>
      </div>`:`
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-tax">Working Marginal Tax Rate</label>
          <span class="form-val-display" id="disp-tax">${(t.workTaxRate*100).toFixed(1)}%</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-tax" min="20" max="54" step="0.5" value="${t.workTaxRate*100}">
          <input type="number" id="num-tax" class="form-input-number" min="15" max="54" step="0.5" value="${t.workTaxRate*100}">
        </div>
      </div>`}

    <!-- Growth & Return Assumptions -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-growth">Annual Pre-Tax Return</label>
        <span class="form-val-display" id="disp-growth">${(t.growthRatePreTax*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-growth" min="3" max="12" step="0.5" value="${t.growthRatePreTax*100}">
        <input type="number" id="num-growth" class="form-input-number" min="1" max="15" step="0.5" value="${t.growthRatePreTax*100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-drag">Tax Drag (Personal Account)</label>
        <span class="form-val-display" id="disp-drag">${(t.taxDrag*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-drag" min="0.5" max="3.0" step="0.1" value="${t.taxDrag*100}">
        <input type="number" id="num-drag" class="form-input-number" min="0" max="5" step="0.1" value="${t.taxDrag*100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-retgrowth">Retirement Return Rate</label>
        <span class="form-val-display" id="disp-retgrowth">${(t.retireGrowthRate*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-retgrowth" min="2" max="8" step="0.5" value="${t.retireGrowthRate*100}">
        <input type="number" id="num-retgrowth" class="form-input-number" min="1" max="10" step="0.5" value="${t.retireGrowthRate*100}">
      </div>
    </div>
  `}function te(e){const n=e?t.p1RrspSaving+t.p2RrspSaving+t.piSaving:t.p1RrspSaving+t.piSaving,s=Math.max(1,n),r=Math.round(t.p1RrspSaving/s*100),o=e?Math.round(t.p2RrspSaving/s*100):0,i=Math.max(0,100-r-o),d=Math.round(t.p1RrspSaving*t.workTaxRate),g=Math.round(t.p2RrspSaving*t.person2WorkTaxRate),m=e?d+g:d;return`
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">
          ${e?"Household Savings Allocation (RRSP vs PI)":"Savings Allocation (RRSP vs PI)"}
        </label>
      </div>

      <!-- Live Multi-Segment Allocation Bar -->
      <div class="allocation-bar-wrapper">
        <div class="allocation-bar">
          <div id="alloc-seg-p1" class="alloc-segment p1" style="width: ${r}%;"></div>
          ${e?`<div id="alloc-seg-p2" class="alloc-segment p2" style="width: ${o}%;"></div>`:""}
          <div id="alloc-seg-pi" class="alloc-segment pi" style="width: ${i}%;"></div>
        </div>
        <div class="alloc-labels-row">
          <span id="alloc-lbl-p1" style="color:var(--rrsp-color);">
            ${e?"P1 RRSP":"RRSP"}: ${r}% (${l(t.p1RrspSaving)})
          </span>
          ${e?`<span id="alloc-lbl-p2" style="color:#8b5cf6;">P2 RRSP: ${o}% (${l(t.p2RrspSaving)})</span>`:""}
          <span id="alloc-lbl-pi" style="color:var(--nonreg-color);">
            PI: ${i}% (${l(t.piSaving)})
          </span>
        </div>
      </div>

      <!-- Quick Preset Strategy Buttons -->
      <div class="alloc-presets-grid">
        ${e?`
          <button type="button" id="preset-couple-equal" class="alloc-preset-btn">⚡ 50/50 Equal RRSPs</button>
          <button type="button" id="preset-couple-max" class="alloc-preset-btn">🚀 Max Both RRSPs ($32.5k x 2)</button>
          <button type="button" id="preset-couple-highearner" class="alloc-preset-btn">💼 High-Earner First (P1)</button>
          <button type="button" id="preset-couple-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
        `:`
          <button type="button" id="preset-single-max" class="alloc-preset-btn">🚀 Max RRSP ($32,490)</button>
          <button type="button" id="preset-single-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
          <button type="button" id="preset-single-half" class="alloc-preset-btn">🎯 50% RRSP / 50% PI</button>
          <button type="button" id="preset-single-all" class="alloc-preset-btn">💰 100% RRSP</button>
        `}
      </div>

      <!-- Account 1: Person 1 RRSP -->
      <div class="alloc-card p1">
        <div class="alloc-card-header">
          <span class="alloc-card-title">
            <span>👤</span> ${e?"Person 1 RRSP":"RRSP Contribution"}
          </span>
          <span id="refund-badge-p1" class="alloc-refund-badge">
            +${l(d)} tax refund
          </span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
          <span id="disp-p1-rrsp" class="form-val-display">${l(t.p1RrspSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-p1-rrsp" min="0" max="32490" step="500" value="${t.p1RrspSaving}">
          <input type="number" id="num-p1-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${t.p1RrspSaving}">
        </div>
      </div>

      <!-- Account 2: Person 2 RRSP / Spousal (Couples Only) -->
      ${e?`
        <div class="alloc-card p2">
          <div class="alloc-card-header">
            <span class="alloc-card-title">
              <span>👤</span> Person 2 RRSP / Spousal
            </span>
            <span id="refund-badge-p2" class="alloc-refund-badge">
              +${l(g)} tax refund
            </span>
          </div>
          <div class="form-label-row" style="margin-bottom:0.25rem;">
            <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
            <span id="disp-p2-rrsp" class="form-val-display">${l(t.p2RrspSaving)}</span>
          </div>
          <div class="slider-container">
            <input type="range" id="slider-p2-rrsp" min="0" max="32490" step="500" value="${t.p2RrspSaving}">
            <input type="number" id="num-p2-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${t.p2RrspSaving}">
          </div>
        </div>
        `:""}

      <!-- Account 3: Personal Investment (PI) / Non-Registered -->
      <div class="alloc-card pi">
        <div class="alloc-card-header">
          <span class="alloc-card-title">
            <span>📈</span> ${e?"Household Personal Account (PI)":"Personal Investment (PI)"}
          </span>
          <span style="font-size:0.72rem;color:var(--text-muted);">50% Capital Gains</span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Taxable Non-Registered</span>
          <span id="disp-pi" class="form-val-display">${l(t.piSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-pi" min="0" max="100000" step="1000" value="${t.piSaving}">
          <input type="number" id="num-pi" class="form-input-number" min="0" max="250000" step="1000" value="${t.piSaving}">
        </div>
      </div>

      <!-- Tax Refund & Reinvestment Destination -->
      <div class="refund-summary-box">
        <div class="refund-summary-header">
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">
            🎁 Annual Household Tax Refund
          </span>
          <span id="total-refund-val" class="refund-summary-val">
            +${l(m)}/yr
          </span>
        </div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.4rem;">
          Reinvest this tax refund annually into:
        </div>
        <div style="display:flex;gap:0.4rem;">
          <button type="button" class="preset-btn ${t.reinvestRefundTo==="tfsa"?"active":""}" id="refund-tfsa">
            ${e?"Dual TFSAs":"TFSA"}
          </button>
          <button type="button" class="preset-btn ${t.reinvestRefundTo==="pi"?"active":""}" id="refund-pi">
            Personal (PI)
          </button>
          <button type="button" class="preset-btn ${t.reinvestRefundTo==="none"?"active":""}" id="refund-none">
            Spend
          </button>
        </div>
      </div>
    </div>
  `}function ee(){return`
    <div class="mode-selector">
      <span class="form-label">Comparison Baseline</span>
      <div class="mode-pills">
        <button id="mode-pretax" class="mode-pill ${t.comparatorMode==="preTax"?"active":""}">
          Pre-Tax Earnings
        </button>
        <button id="mode-cashout" class="mode-pill ${t.comparatorMode==="cashOut"?"active":""}">
          Cash Out-of-Pocket
        </button>
      </div>
      ${t.comparatorMode==="cashOut"?`
        <label class="reinvest-checkbox-row">
          <input type="checkbox" id="check-reinvest" ${t.comparatorReinvest?"checked":""}>
          <span>Gross-up & Reinvest RRSP Tax Refund</span>
        </label>`:""}
    </div>
  `}function Y(){const e=t.householdMode==="couple",n=document.getElementById("results-container");if(n)if(t.viewMode==="simulator"){const s=Zt(),r=Wt({...s,decumStrategy:t.decumStrategy}),o=jt(s);n.innerHTML=ae(r,o,e),de(),ce(r)}else{const s=Ut({householdMode:t.householdMode,annualSaving:t.annualSaving,mode:t.comparatorMode,reinvestRefund:t.comparatorReinvest,yearsAccumulation:t.yearsAccumulation,retireAge:t.retireAge,person2RetireAge:t.person2RetireAge,retireNetSpending:t.retireNetSpending,workTaxRate:t.workTaxRate,person2WorkTaxRate:t.person2WorkTaxRate,growthRatePreTax:t.growthRatePreTax,taxDrag:t.taxDrag,retireGrowthRate:t.retireGrowthRate,enableIncomeSplitting:t.enableIncomeSplitting});n.innerHTML=ne(s,e)}}function It(){const e=t.householdMode==="couple",n=e?t.p1RrspSaving+t.p2RrspSaving+t.piSaving:t.p1RrspSaving+t.piSaving,s=Math.max(1,n),r=Math.round(t.p1RrspSaving/s*100),o=e?Math.round(t.p2RrspSaving/s*100):0,i=Math.max(0,100-r-o),d=document.getElementById("alloc-seg-p1"),g=document.getElementById("alloc-seg-p2"),m=document.getElementById("alloc-seg-pi");d&&(d.style.width=`${r}%`),g&&(g.style.width=`${o}%`),m&&(m.style.width=`${i}%`);const R=document.getElementById("alloc-lbl-p1"),a=document.getElementById("alloc-lbl-p2"),p=document.getElementById("alloc-lbl-pi");R&&(R.textContent=e?`P1 RRSP: ${r}% (${l(t.p1RrspSaving)})`:`RRSP: ${r}% (${l(t.p1RrspSaving)})`),a&&e&&(a.textContent=`P2 RRSP: ${o}% (${l(t.p2RrspSaving)})`),p&&(p.textContent=`PI: ${i}% (${l(t.piSaving)})`);const c=Math.round(t.p1RrspSaving*t.workTaxRate),h=Math.round(t.p2RrspSaving*t.person2WorkTaxRate),E=e?c+h:c,M=document.getElementById("refund-badge-p1");M&&(M.textContent=`+${l(c)} tax refund`);const P=document.getElementById("refund-badge-p2");P&&(P.textContent=`+${l(h)} tax refund`);const v=document.getElementById("total-refund-val");v&&(v.textContent=`+${l(E)}/yr`)}function ht(){const e=t.householdMode==="couple",n=e?t.p1RrspSaving+t.p2RrspSaving+t.piSaving:t.p1RrspSaving+t.piSaving;t.annualSaving=n;const s=document.getElementById("slider-saving"),r=document.getElementById("num-saving"),o=document.getElementById("disp-saving");s&&(s.value=n.toString()),r&&(r.value=n.toString()),o&&(o.textContent=l(n));const i=document.getElementById("slider-p1-rrsp"),d=document.getElementById("num-p1-rrsp"),g=document.getElementById("disp-p1-rrsp");if(i&&(i.value=t.p1RrspSaving.toString()),d&&(d.value=t.p1RrspSaving.toString()),g&&(g.textContent=l(t.p1RrspSaving)),e){const p=document.getElementById("slider-p2-rrsp"),c=document.getElementById("num-p2-rrsp"),h=document.getElementById("disp-p2-rrsp");p&&(p.value=t.p2RrspSaving.toString()),c&&(c.value=t.p2RrspSaving.toString()),h&&(h.textContent=l(t.p2RrspSaving))}const m=document.getElementById("slider-pi"),R=document.getElementById("num-pi"),a=document.getElementById("disp-pi");m&&(m.value=t.piSaving.toString()),R&&(R.value=t.piSaving.toString()),a&&(a.textContent=l(t.piSaving)),It()}function ae(e,n,s){const r=Math.max(18,t.retireAge-t.yearsAccumulation),o=Math.max(18,t.person2RetireAge-t.yearsAccumulation),i=[...n].sort((a,p)=>p.longevityYears-a.longevityYears||a.totalLifetimeRetirementTax-p.totalLifetimeRetirementTax)[0],d=e.person1RrspSaving??t.p1RrspSaving,g=s?e.person2RrspSaving??t.p2RrspSaving:0,m=e.piSaving??t.piSaving,R=e.annualTaxRefund??Math.round(d*t.workTaxRate+g*t.person2WorkTaxRate);return`
    <!-- Couples Tax Advantage Banner -->
    ${s&&(e.couplesAnnualTaxSavings??0)>0?`
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 The Couples Pension Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, you utilize two sets of basic personal tax credits and keep income in the lowest tax brackets.</p>
        </div>
        <div class="couple-tax-val">
          +${l(e.couplesAnnualTaxSavings??0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Estimated Annual Tax Savings</div>
        </div>
      </div>`:""}

    <!-- Tailored Action Plan / Advisor -->
    <article class="advisor-card">
      <div class="advisor-title">
        <span>💡</span> ${s?"Your Custom 2-Person Household Action Plan":"Your Custom Tailored Strategy Action Plan"}
      </div>
      <div class="advisor-steps">
        <div class="advisor-step">
          <div class="step-num">1</div>
          <div class="step-content">
            ${s?`<strong>Working Years (Ages ${r} & ${o}):</strong> Save <strong>${l(t.annualSaving)}/year combined</strong>. Contribute <strong>${l(d)}</strong> to Person 1 RRSP, <strong>${l(g)}</strong> to Person 2 RRSP (or Spousal RRSP), and <strong>${l(m)}</strong> to your Personal Account. Reinvest your <strong>${l(R)} refund into ${t.reinvestRefundTo==="tfsa"?"both TFSAs ($7k each)":t.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`:`<strong>While Working (Next ${t.yearsAccumulation} Years):</strong> Contribute <strong>${l(d)}/year to your RRSP</strong> and <strong>${l(m)}/year to your Personal Account (PI)</strong>. Reinvest your annual <strong>${l(R)} tax refund</strong> into <strong>${t.reinvestRefundTo==="tfsa"?"TFSA":t.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">2</div>
          <div class="step-content">
            ${s?`<strong>At Retirement (Ages ${t.retireAge} & ${t.person2RetireAge}):</strong> Use the <strong>"${e.name}"</strong> sequence. At age 65, file <strong>CRA Form T1032</strong> to split up to 50% of RRIF withdrawals. This gives your household <strong>$182,000 of combined room</strong> before triggering any OAS clawback.`:`<strong>At Retirement (Age ${t.retireAge} to 71):</strong> Follow the <strong>"${e.name}"</strong> decumulation rule. Draw from RRSP up to the bracket cap while bridging with your Personal Account and TFSA.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">3</div>
          <div class="step-content">
            ${s?`<strong>At Age 71+:</strong> Convert RRSPs to RRIFs. <em>CRA Pro-Tip:</em> Base your mandatory RRIF minimum withdrawals on the <strong>younger spouse (Age ${Math.min(t.retireAge,t.person2RetireAge)})</strong> to legally minimize forced taxable withdrawals!`:"<strong>At Age 71+:</strong> Convert RRSP to a RRIF. Withdraw CRA mandated minimums and use your TFSA/PI as a tax-free buffer to avoid crossing into higher tax brackets and losing your OAS pension."}
          </div>
        </div>
      </div>
    </article>

    <!-- Strategy Selector Cards (Withdrawal Sequencing) -->
    <section>
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.6rem;color:var(--text-primary);">
        Choose Your Decumulation Sequencing Strategy:
      </h3>
      <div class="strat-cards-grid">
        <div class="strat-card ${t.decumStrategy==="oasShield"?"active":""}" data-strat="oasShield">
          <div class="strat-card-title">🛡️ ${s?"Dual OAS Shield":"OAS Shield & Smoothing"} ${i.id==="oasShield"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">${s?"Splits income 50/50 and shields up to $182k combined from OAS clawback.":"Caps RRSP draw below the ~$91k clawback line; bridges shortfall from PI/TFSA."}</p>
        </div>
        <div class="strat-card ${t.decumStrategy==="rrspMeltdown"?"active":""}" data-strat="rrspMeltdown">
          <div class="strat-card-title">🔥 Early RRSP Meltdown ${i.id==="rrspMeltdown"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Burns down RRSP aggressively between retirement and 71 to crush the future RRIF tax bomb.</p>
        </div>
        <div class="strat-card ${t.decumStrategy==="taxableFirst"?"active":""}" data-strat="taxableFirst">
          <div class="strat-card-title">⏳ Taxable (PI) First ${i.id==="taxableFirst"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Spends taxable personal investment first, allowing tax-sheltered accounts to compound.</p>
        </div>
        <div class="strat-card ${t.decumStrategy==="proRata"?"active":""}" data-strat="proRata">
          <div class="strat-card-title">⚖️ Proportional Balanced Draw ${i.id==="proRata"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Draws simultaneously from RRSP, PI, and TFSA in proportion to current account weights.</p>
        </div>
      </div>
    </section>

    <!-- Strategy Scorecard Table -->
    <article class="scorecard-card">
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.85rem;color:var(--text-primary);">
        📊 Strategy Comparison Scorecard ${s?"(Household Combined)":""}
      </h3>
      <div class="table-responsive" style="margin-top:0;">
        <table class="ledger-table">
          <thead>
            <tr>
              <th class="td-left">Strategy</th>
              <th>Retirement Longevity</th>
              <th>Depletion Age</th>
              <th>Lifetime Taxes Paid</th>
              <th>OAS Clawback</th>
              <th>Estate @ 85</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(a=>{const p=a.id===t.decumStrategy,c=a.id===i.id;return`
                <tr style="${p?"background:rgba(99,102,241,0.1);":""}">
                  <td class="td-left" style="font-weight:700;">
                    ${a.name} ${c?'<span class="badge-recommended">Top Pick</span>':""}
                  </td>
                  <td style="color:#10b981;font-weight:700;">${a.isPerpetual?"50+ Yrs":`${a.longevityYears} Yrs`}</td>
                  <td>${a.isPerpetual?"Age 100+":`Age ${a.depletionAge}`}</td>
                  <td style="color:${a.totalLifetimeRetirementTax===Math.min(...n.map(h=>h.totalLifetimeRetirementTax))?"#10b981":"var(--text-primary)"};">
                    ${l(a.totalLifetimeRetirementTax)}
                  </td>
                  <td style="color:${a.totalOASClawbackPaid===0?"#10b981":"#f59e0b"};">
                    ${l(a.totalOASClawbackPaid)}
                  </td>
                  <td>${l(a.estateValueAtAge85)}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </article>

    <!-- Visual Lifespan Chart -->
    <div class="chart-card">
      <div class="chart-header">
        <h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text-primary);">
          Multi-Account Balance Lifespan Curve (Ages ${r} to 95+)
        </h3>
        <div class="chart-legend">
          <div class="legend-item"><span class="legend-dot total"></span> <strong>Total Wealth</strong></div>
          <div class="legend-item"><span class="legend-dot rrsp"></span> ${s?"Joint RRSP/RRIF":"RRSP/RRIF"}</div>
          <div class="legend-item"><span class="legend-dot nonreg"></span> Personal (PI)</div>
          <div class="legend-item"><span class="legend-dot tfsa"></span> ${s?"Dual TFSAs":"TFSA"}</div>
        </div>
      </div>
      <div class="svg-chart-wrapper" id="chart-container">
        ${se(e)}
        <div id="chart-tooltip" class="chart-tooltip"></div>
      </div>
    </div>

    <!-- Simulator Year-by-Year Ledger -->
    <div class="ledger-card">
      <div class="ledger-toggle-row" id="ledger-toggle" role="button" tabindex="0">
        <h2 class="panel-title" style="margin-bottom: 0;">
          📊 Year-by-Year Multi-Account Cash Flow ${s?"(2-Person Breakdown)":""}
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
            ${t.ledgerOpen?"▲ Click to collapse":"▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>
      ${t.ledgerOpen?re(e,s):""}
    </div>
  `}function ne(e,n){return`
    ${n&&(e.rrsp.couplesTaxAdvantageAnnual??0)>0?`
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 Couples Income Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, your RRSP gross withdrawal drops from ~$103,000 to ~$92,000 to yield $80,000 net!</p>
        </div>
        <div class="couple-tax-val">
          +${l(e.rrsp.couplesTaxAdvantageAnnual??0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Annual Tax Saved</div>
        </div>
      </div>`:""}

    <div class="comparison-grid">
      <!-- RRSP Card -->
      <article class="card card-rrsp">
        <div class="card-header">
          <span class="card-badge">${n?"Couple's Joint RRSP":"Tax-Deferred · RRIF at 71"}</span>
          <span class="card-title">${e.rrsp.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${e.rrsp.isPerpetual?"50+ Yrs":`${e.rrsp.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${t.retireAge+Math.floor(e.rrsp.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${l(e.rrsp.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${l(e.rrsp.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${l(e.rrsp.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- Personal (Non-Registered) Card -->
      <article class="card card-nonreg">
        <div class="card-header">
          <span class="card-badge">Taxable Account</span>
          <span class="card-title">${e.nonReg.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${e.nonReg.isPerpetual?"50+ Yrs":`${e.nonReg.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Depleted at Age ${t.retireAge+Math.floor(e.nonReg.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${l(e.nonReg.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${l(e.nonReg.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${l(e.nonReg.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- TFSA Card -->
      <article class="card card-tfsa">
        <div class="card-header">
          <span class="card-badge">Tax-Free Benchmark</span>
          <span class="card-title">${e.tfsa.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${e.tfsa.isPerpetual?"50+ Yrs":`${e.tfsa.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${t.retireAge+Math.floor(e.tfsa.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${l(e.tfsa.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${l(e.tfsa.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">$0/yr</span>
          </div>
        </div>
      </article>
    </div>
  `}function se(e){const n=e.history,s=n.length;if(s===0)return'<p style="padding:2rem;text-align:center;">No data available</p>';let r=0;for(const b of n)r=Math.max(r,b.totalEnd,b.rrspEnd,b.piEnd,b.tfsaEnd);r=Math.max(r,1e4)*1.1;const o=800,i=300,d=70,g=20,m=20,R=35,a=o-d-g,p=i-m-R,c=b=>d+b/Math.max(1,s-1)*a,h=b=>m+p-b/r*p,E=b=>n.map((L,st)=>`${st===0?"M":"L"} ${c(st).toFixed(1)} ${h(L[b]).toFixed(1)}`).join(" "),M=E("totalEnd"),P=E("rrspEnd"),v=E("piEnd"),T=E("tfsaEnd"),y=c(0).toFixed(1),B=c(s-1).toFixed(1),N=(m+p).toFixed(1),k=`${M} L ${B} ${N} L ${y} ${N} Z`;let q="";for(let b=0;b<=4;b++){const L=r/4*b,st=h(L);q+=`
      <line x1="${d}" y1="${st}" x2="${o-g}" y2="${st}" class="chart-grid-line" />
      <text x="${d-8}" y="${st+4}" text-anchor="end" class="chart-axis-label">${Qt(L)}</text>
    `}let V="";const X=Math.max(1,Math.floor(s/6));for(let b=0;b<s;b+=X){const L=n[b],st=c(b);V+=`<text x="${st}" y="${i-10}" text-anchor="middle" class="chart-axis-label">Age ${L.age}</text>`}return`
    <svg viewBox="0 0 ${o} ${i}" class="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--total-color)" stop-opacity="0.22" />
          <stop offset="90%" stop-color="var(--total-color)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${q}
      ${V}
      <!-- Total Wealth Translucent Area Gradient -->
      <path d="${k}" fill="url(#total-wealth-grad)" />
      <!-- Account-Specific Paths -->
      <path d="${T}" class="chart-line tfsa" />
      <path d="${v}" class="chart-line nonreg" />
      <path d="${P}" class="chart-line rrsp" />
      <!-- Total Wealth Prominent Curve -->
      <path d="${M}" class="chart-line total" />
      <line id="hover-line" x1="0" y1="${m}" x2="0" y2="${m+p}" class="chart-hover-line" style="display:none;" />
    </svg>
  `}function re(e,n){const s=e.history.map(r=>{const o=r.age>=t.retireAge;return`
        <tr>
          <td class="td-left" style="font-weight:600;">
            <span class="badge-age">${n&&r.person2Age?`P1: Age ${r.age} · P2: Age ${r.person2Age}`:`Age ${r.age}`}</span>
            ${r.isIncomeSplit?'<span class="badge-rrif-min" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4);">Pension Split</span>':""}
            ${r.notes?`<span class="badge-rrif-min">${r.notes}</span>`:""}
          </td>
          <td class="td-highlight-rrsp">${l(r.rrspEnd)}</td>
          <td class="td-highlight-nonreg">${l(r.piEnd)}</td>
          <td style="color:var(--tfsa-color);">${l(r.tfsaEnd)}</td>
          <td style="font-weight:700;">${l(r.totalEnd)}</td>
          <td>${l(o?r.totalGrossDraw:r.rrspContrib+r.piContrib+r.tfsaContrib)}</td>
          <td>${l(r.totalTax)}</td>
          <td style="color:#10b981;font-weight:700;">${o?l(r.netSpendReceived):"—"}</td>
        </tr>
      `}).join("");return`
    <div class="table-responsive">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="td-left">${n?"Couple Ages & Strategy":"Age & Status"}</th>
            <th>RRSP End</th>
            <th>Personal (PI) End</th>
            <th>TFSA End</th>
            <th>Total Portfolio</th>
            <th>Cash In / Out</th>
            <th>Tax Paid</th>
            <th>Net Spend</th>
          </tr>
        </thead>
        <tbody>
          ${s}
        </tbody>
      </table>
    </div>
  `}function oe(){return`
    <section class="rules-section" aria-label="Canadian Retirement Planning Rules & Factors">
      <div class="rules-header">
        <h2>📋 Rules & Factors to Consider in Canadian Retirement Planning</h2>
        <p>Key tax laws, CRA regulations, and structural differences that impact RRSP, Personal Non-Registered, and TFSA accounts.</p>
      </div>

      <div class="rules-grid">
        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🤝</span>
              <span class="rule-title">Pension Income Splitting (CRA Form T1032)</span>
            </div>
            <span class="rule-tag tag-strategy">Couples Rule</span>
          </div>
          <p class="rule-desc">
            At age 65+, Canadian couples can transfer up to <strong>50% of eligible RRIF withdrawals</strong> to their spouse on line 21000 of their tax return. Both spouses get the <strong>$2,000 Pension Credit</strong> and dual Basic Personal Amounts ($31,410 tax-free combined).
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Cuts annual retirement income tax by $6,000 to $12,000+ per year, adding 3 to 6 years of longevity to a couple's portfolio!
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🛡️</span>
              <span class="rule-title">Dual OAS Clawback Shield ($182k Combined)</span>
            </div>
            <span class="rule-tag tag-tax">Clawback Shield</span>
          </div>
          <p class="rule-desc">
            While a single person's OAS clawback starts at ~$91,000, a couple splitting income can draw up to <strong>$182,000 combined</strong> before triggering the 15% OAS recovery tax.
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Fully shields both spouses' Old Age Security pensions from government clawbacks.
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">🏛️</span>
              <span class="rule-title">CRA Mandatory RRIF Conversion (Age 71+)</span>
            </div>
            <span class="rule-tag tag-cra">CRA Rule</span>
          </div>
          <p class="rule-desc">
            By December 31 of the year you turn <strong>71</strong>, you must convert your RRSP to a RRIF. For couples, the CRA allows basing mandatory minimums on the <strong>younger spouse's age</strong>, lowering required withdrawals!
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Using the younger spouse's age legally reduces forced taxable withdrawals and keeps more money compounding.
          </div>
        </article>

        <article class="rule-card">
          <div class="rule-card-header">
            <div class="rule-title-group">
              <span class="rule-icon">📉</span>
              <span class="rule-title">Annual Tax Drag in Personal Accounts</span>
            </div>
            <span class="rule-tag tag-tax">Growth Drag</span>
          </div>
          <p class="rule-desc">
            In non-registered accounts, dividends, interest, and realized capital gains are taxed <strong>every single tax year</strong>, dragging compounding down by <strong>1.0% to 2.0% annually</strong> compared to RRSP/TFSA.
          </p>
          <div class="rule-takeaway">
            <strong>Impact:</strong> Couples have double the TFSA room ($14,000/yr) and double the RRSP room to shelter savings from drag.
          </div>
        </article>
      </div>
    </section>
  `}function ie(){document.getElementById("theme-toggle")?.addEventListener("click",()=>{t.theme=t.theme==="dark"?"light":"dark",localStorage.setItem("theme",t.theme),document.documentElement.setAttribute("data-theme",t.theme);const e=document.getElementById("theme-toggle");e&&(e.textContent=t.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode")}),document.getElementById("btn-household-single")?.addEventListener("click",()=>{t.householdMode!=="single"&&(t.householdMode="single",St())}),document.getElementById("btn-household-couple")?.addEventListener("click",()=>{t.householdMode!=="couple"&&(t.householdMode="couple",St())}),document.getElementById("tab-mode-sim")?.addEventListener("click",()=>{t.viewMode!=="simulator"&&(t.viewMode="simulator",St())}),document.getElementById("tab-mode-comp")?.addEventListener("click",()=>{t.viewMode!=="comparator"&&(t.viewMode="comparator",St())})}function le(){const e=t.householdMode==="couple",n=document.getElementById("slider-saving"),s=document.getElementById("num-saving"),r=document.getElementById("disp-saving"),o=a=>{if(t.annualSaving=a,r&&(r.textContent=l(a)),e){const v=t.p1RrspSaving+t.p2RrspSaving+t.piSaving||1,T=t.p1RrspSaving/v,y=t.p2RrspSaving/v;let B=Math.round(a*T),N=Math.round(a*y),k=a-B-N;B>32490&&(k+=B-32490,B=32490),N>32490&&(k+=N-32490,N=32490),t.p1RrspSaving=B,t.p2RrspSaving=N,t.piSaving=Math.max(0,k)}else{const v=t.p1RrspSaving+t.piSaving||1,T=t.p1RrspSaving/v;let y=Math.round(a*T),B=a-y;y>32490&&(B+=y-32490,y=32490),t.p1RrspSaving=y,t.piSaving=Math.max(0,B)}const p=document.getElementById("slider-p1-rrsp"),c=document.getElementById("num-p1-rrsp"),h=document.getElementById("disp-p1-rrsp");if(p&&(p.value=t.p1RrspSaving.toString()),c&&(c.value=t.p1RrspSaving.toString()),h&&(h.textContent=l(t.p1RrspSaving)),e){const v=document.getElementById("slider-p2-rrsp"),T=document.getElementById("num-p2-rrsp"),y=document.getElementById("disp-p2-rrsp");v&&(v.value=t.p2RrspSaving.toString()),T&&(T.value=t.p2RrspSaving.toString()),y&&(y.textContent=l(t.p2RrspSaving))}const E=document.getElementById("slider-pi"),M=document.getElementById("num-pi"),P=document.getElementById("disp-pi");E&&(E.value=t.piSaving.toString()),M&&(M.value=t.piSaving.toString()),P&&(P.textContent=l(t.piSaving)),It(),Y()};n?.addEventListener("input",()=>{const a=parseFloat(n.value)||0;s&&(s.value=a.toString()),o(a)}),s?.addEventListener("input",()=>{const a=parseFloat(s.value)||0;n&&(n.value=a.toString()),o(a)});const i=(a,p,c,h)=>{const E=document.getElementById(a),M=document.getElementById(p),P=document.getElementById(c),v=T=>{h(T),P&&(P.textContent=l(T));const y=e?t.p1RrspSaving+t.p2RrspSaving+t.piSaving:t.p1RrspSaving+t.piSaving;t.annualSaving=y,n&&(n.value=y.toString()),s&&(s.value=y.toString()),r&&(r.textContent=l(y)),It(),Y()};E?.addEventListener("input",()=>{const T=parseFloat(E.value)||0;M&&(M.value=T.toString()),v(T)}),M?.addEventListener("input",()=>{const T=parseFloat(M.value)||0;E&&(E.value=T.toString()),v(T)})};i("slider-p1-rrsp","num-p1-rrsp","disp-p1-rrsp",a=>{t.p1RrspSaving=a}),e&&i("slider-p2-rrsp","num-p2-rrsp","disp-p2-rrsp",a=>{t.p2RrspSaving=a}),i("slider-pi","num-pi","disp-pi",a=>{t.piSaving=a}),e?(document.getElementById("preset-couple-equal")?.addEventListener("click",()=>{const a=Math.min(t.annualSaving,64980),p=Math.min(32490,Math.floor(a/2));t.p1RrspSaving=p,t.p2RrspSaving=p,t.piSaving=Math.max(0,t.annualSaving-p*2),ht(),Y()}),document.getElementById("preset-couple-max")?.addEventListener("click",()=>{t.p1RrspSaving=32490,t.p2RrspSaving=32490,t.annualSaving=Math.max(t.annualSaving,64980),t.piSaving=Math.max(0,t.annualSaving-64980),ht(),Y()}),document.getElementById("preset-couple-highearner")?.addEventListener("click",()=>{const a=Math.min(32490,t.annualSaving),p=Math.max(0,t.annualSaving-a),c=Math.min(32490,p);t.p1RrspSaving=a,t.p2RrspSaving=c,t.piSaving=Math.max(0,p-c),ht(),Y()}),document.getElementById("preset-couple-balanced")?.addEventListener("click",()=>{const a=Math.round(t.annualSaving*.7),p=Math.min(32490,Math.floor(a/2)),c=Math.min(32490,a-p);t.p1RrspSaving=p,t.p2RrspSaving=c,t.piSaving=Math.max(0,t.annualSaving-p-c),ht(),Y()})):(document.getElementById("preset-single-max")?.addEventListener("click",()=>{t.p1RrspSaving=Math.min(32490,t.annualSaving),t.piSaving=Math.max(0,t.annualSaving-t.p1RrspSaving),ht(),Y()}),document.getElementById("preset-single-balanced")?.addEventListener("click",()=>{t.p1RrspSaving=Math.min(32490,Math.round(t.annualSaving*.7)),t.piSaving=Math.max(0,t.annualSaving-t.p1RrspSaving),ht(),Y()}),document.getElementById("preset-single-half")?.addEventListener("click",()=>{t.p1RrspSaving=Math.min(32490,Math.round(t.annualSaving*.5)),t.piSaving=Math.max(0,t.annualSaving-t.p1RrspSaving),ht(),Y()}),document.getElementById("preset-single-all")?.addEventListener("click",()=>{t.p1RrspSaving=Math.min(32490,t.annualSaving),t.piSaving=0,t.annualSaving=t.p1RrspSaving,ht(),Y()}));const d=a=>{t.reinvestRefundTo=a,document.querySelectorAll(".refund-summary-box .preset-btn").forEach(p=>{p.classList.remove("active")}),document.getElementById(`refund-${a}`)?.classList.add("active"),Y()};document.getElementById("refund-tfsa")?.addEventListener("click",()=>d("tfsa")),document.getElementById("refund-pi")?.addEventListener("click",()=>d("pi")),document.getElementById("refund-none")?.addEventListener("click",()=>d("none"));const g=(a,p,c,h,E)=>{const M=document.getElementById(a),P=document.getElementById(p),v=document.getElementById(c),T=y=>{E(y),v&&(v.textContent=h(y)),Y()};M?.addEventListener("input",()=>{const y=parseFloat(M.value);P&&(P.value=y.toString()),T(y)}),P?.addEventListener("input",()=>{const y=parseFloat(P.value);isNaN(y)||(M&&(M.value=y.toString()),T(y))})};g("slider-years","num-years","disp-years",a=>`${Math.round(a)} years`,a=>{t.yearsAccumulation=Math.round(a)}),g("slider-retireage","num-retireage","disp-retireage",a=>`Age ${Math.round(a)}`,a=>{t.retireAge=Math.round(a)});const m=document.getElementById("num-retireage2");m?.addEventListener("input",()=>{const a=parseFloat(m.value);isNaN(a)||(t.person2RetireAge=Math.round(a),Y())}),g("slider-spend","num-spend","disp-spend",a=>`${l(a)}/yr`,a=>{t.retireNetSpending=a}),document.getElementById("check-splitting")?.addEventListener("change",a=>{t.enableIncomeSplitting=a.target.checked,Y()}),g("slider-tax","num-tax","disp-tax",a=>`${a.toFixed(1)}%`,a=>{t.workTaxRate=a/100,It()});const R=document.getElementById("num-tax2");R?.addEventListener("input",()=>{const a=parseFloat(R.value);isNaN(a)||(t.person2WorkTaxRate=a/100,It(),Y())}),g("slider-growth","num-growth","disp-growth",a=>`${a.toFixed(1)}%`,a=>{t.growthRatePreTax=a/100}),g("slider-drag","num-drag","disp-drag",a=>`${a.toFixed(1)}%`,a=>{t.taxDrag=a/100}),g("slider-retgrowth","num-retgrowth","disp-retgrowth",a=>`${a.toFixed(1)}%`,a=>{t.retireGrowthRate=a/100}),document.getElementById("mode-pretax")?.addEventListener("click",()=>{t.comparatorMode="preTax",St()}),document.getElementById("mode-cashout")?.addEventListener("click",()=>{t.comparatorMode="cashOut",St()}),document.getElementById("check-reinvest")?.addEventListener("change",a=>{t.comparatorReinvest=a.target.checked,Y()})}function de(e){document.querySelectorAll(".strat-card").forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.strat;s&&s!==t.decumStrategy&&(t.decumStrategy=s,Y())})}),document.getElementById("ledger-toggle")?.addEventListener("click",()=>{t.ledgerOpen=!t.ledgerOpen,Y()})}function ce(e){const n=document.getElementById("chart-container"),s=document.getElementById("svg-chart-el"),r=document.getElementById("hover-line"),o=document.getElementById("chart-tooltip");if(!n||!s||!r||!o)return;const i=e.history,d=i.length;d<=0||(n.addEventListener("mousemove",g=>{const m=n.getBoundingClientRect(),R=g.clientX-m.left,a=R/m.width,p=70/800,c=20/800,h=1-p-c;if(a<p||a>1-c){r.style.display="none",o.style.display="none";return}const E=(a-p)/h,M=Math.min(d-1,Math.max(0,Math.round(E*(d-1)))),P=70+M/(d-1)*710;r.setAttribute("x1",P.toString()),r.setAttribute("x2",P.toString()),r.style.display="block";const v=i[M],T=v.age>=t.retireAge,y=v.person2Age?`P1: Age ${v.age} · P2: Age ${v.person2Age}`:`Age ${v.age}`;o.innerHTML=`
      <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
        ${y} (${T?"Retirement":"Accumulating"})
      </div>
      <div style="color: var(--total-color); font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
        Total Wealth: ${l(v.totalEnd)}
      </div>
      <div style="color: var(--rrsp-color);">RRSP: <strong>${l(v.rrspEnd)}</strong></div>
      <div style="color: var(--nonreg-color);">PI: <strong>${l(v.piEnd)}</strong></div>
      <div style="color: var(--tfsa-color);">TFSA: <strong>${l(v.tfsaEnd)}</strong></div>
    `;const B=Math.min(m.width-180,Math.max(10,R-90));o.style.left=`${B}px`,o.style.top="30px",o.style.display="block"}),n.addEventListener("mouseleave",()=>{r.style.display="none",o.style.display="none"}))}St();
