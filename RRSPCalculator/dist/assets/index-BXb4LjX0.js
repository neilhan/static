(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=a(s);fetch(s.href,n)}})();function Ot(t){if(t<71)return 0;const r={71:.0528,72:.054,73:.0553,74:.0567,75:.0582,76:.0598,77:.0617,78:.0636,79:.0658,80:.0682,81:.0708,82:.0738,83:.0771,84:.0808,85:.0851,86:.0899,87:.0955,88:.1021,89:.1099,90:.1192,91:.1306,92:.1449,93:.1634,94:.1879};return t>=95?.2:r[t]??1/(90-t)}function V(t,r=!0){if(t<=0)return 0;const a=[{limit:55867,rate:.15},{limit:111733,rate:.205},{limit:173205,rate:.26},{limit:246752,rate:.29},{limit:1/0,rate:.33}],o=15705;let s=0,n=t,i=0;for(const p of a){if(n<=0)break;const h=Math.min(n,p.limit-i);s+=h*p.rate,n-=h,i=p.limit}s=Math.max(0,s-o*.15),r&&t>2e3&&(s=Math.max(0,s-300));const d=[{limit:51446,rate:.0505},{limit:102894,rate:.0915},{limit:15e4,rate:.1116},{limit:22e4,rate:.1216},{limit:1/0,rate:.1316}],c=12399;let g=0,u=t;i=0;for(const p of d){if(u<=0)break;const h=Math.min(u,p.limit-i);g+=h*p.rate,u-=h,i=p.limit}g=Math.max(0,g-c*.0505);let m=0;return g>5315&&(m+=(g-5315)*.2),g>6802&&(m+=(g-6802)*.36),g+=m,s+g}function fe(t,r,a,o=!0){if(t<=0)return{totalTax:0,spouse1Tax:0,spouse2Tax:0,isSplit:!1};if(o&&(r>=65||a>=65)){const i=t/2,d=V(i,r>=65),c=V(i,a>=65);return{totalTax:Math.round(d+c),spouse1Tax:Math.round(d),spouse2Tax:Math.round(c),isSplit:!0}}const n=V(t,r>=65);return{totalTax:Math.round(n),spouse1Tax:Math.round(n),spouse2Tax:0,isSplit:!1}}function Be(t,r="single",a=65,o=65,s=!0){let n=t,i=t*2.5,d=t;for(let g=0;g<40;g++){const u=(n+i)/2,m=r==="couple"?fe(u,a,o,s):{totalTax:V(u,a>=65)},p=u-m.totalTax;if(Math.abs(p-t)<1){d=u;break}p<t?n=u:i=u,d=u}const c=r==="couple"?fe(d,a,o,s):{totalTax:V(d,a>=65),isSplit:!1};return{gross:Math.round(d),tax:Math.round(c.totalTax),effectiveRate:d>0?c.totalTax/d:0,isSplit:c.isSplit}}function xt(t,r,a="single",o=65,s=65){const n=Math.max(0,Math.min(.95,r));let i=t,d=t*1.5,c=t;for(let p=0;p<35;p++){const h=(i+d)/2,y=h*n*.5,D=a==="couple"?fe(y,o,s,!0).totalTax:V(y,o>=65),F=h-D;if(Math.abs(F-t)<1){c=h;break}F<t?i=h:d=h,c=h}const u=c*n*.5,m=a==="couple"?fe(u,o,s,!0).totalTax:V(u,o>=65);return{gross:Math.round(c),tax:Math.round(m)}}function tt(t,r){if(t<=0)return{cdaTaxFreeCash:0,taxableDividendCash:0,grossedUpDividend:0,dividendTaxCredit:0};const a=Math.max(0,Math.min(.95,r)),o=t*a*.5,s=Math.max(0,t-o),n=s*1.15,i=n*.1202;return{cdaTaxFreeCash:o,taxableDividendCash:s,grossedUpDividend:n,dividendTaxCredit:i}}function pt(t,r,a="single",o=65,s=65,n=!0){if(t<=0)return{gross:0,tax:0,cdaTaxFree:0,taxableDividend:0};let i=t,d=t*1.85,c=t;const g=p=>{const h=tt(p,r);if(a==="couple"&&n){const S=h.grossedUpDividend*.5,y=h.dividendTaxCredit*.5,D=Math.max(0,V(S,o>=65)-y),F=Math.max(0,V(S,s>=65)-y);return D+F}return Math.max(0,V(h.grossedUpDividend,o>=65)-h.dividendTaxCredit)};for(let p=0;p<35;p++){const h=(i+d)/2,S=g(h),y=h-S;if(Math.abs(y-t)<1){c=h;break}y<t?i=h:d=h,c=h}const u=g(c),m=tt(c,r);return{gross:Math.round(c),tax:Math.round(u),cdaTaxFree:Math.round(m.cdaTaxFreeCash),taxableDividend:Math.round(m.taxableDividendCash)}}function _t(t){const{householdMode:r="single",annualSaving:a,mode:o,reinvestRefund:s,yearsAccumulation:n,retireAge:i,person2RetireAge:d=i,retireNetSpending:c,workTaxRate:g,person2WorkTaxRate:u=g*.75,growthRatePreTax:m,taxDrag:p,retireGrowthRate:h,enableIncomeSplitting:S=!0}=t,y=Math.max(18,i-n),D=Math.max(18,d-n),F=r==="couple"?32490*2:32490,N=a>F,X=r==="couple"?(g+u)/2:g,M=.122;let v=0,f=0,I=0,z=0,J=0,W=0,Z=0,x=0;o==="preTax"?(v=a,W=a*n,f=a*(1-X),Z=f*n,I=a*(1-M),x=I*n,z=a*(1-X)):(f=a,Z=a*n,I=a,x=a*n,z=a,s?(v=a/(1-X),W=a*n):(v=a,J=a*X,W=a*n));const re=[],de=[],Q=[],we=[];let Re=0,G=0,O=0,K=0,ce=0,pe=0;if(t.startAtRetirement&&t.startingRetirementAssets){const R=t.startingRetirementAssets,$=Math.max(0,R.person1Rrsp??(r==="couple"?R.rrsp*.5:R.rrsp)),k=r==="couple"?Math.max(0,R.person2Rrsp??R.rrsp*.5):0,P=r==="couple"?$+k:$,C=Math.max(0,R.pi),T=Math.max(0,R.corp??0),ee=Math.max(0,R.tfsa),H=P+C+T+ee,he=Math.min(95,Math.max(0,R.piUnrealizedGainPct??50))/100,ye=Math.min(95,Math.max(0,R.corpUnrealizedGainPct??50))/100;t.comparatorUseBreakdown?(Re=P,G=C,O=T,K=ee,ce=C*(1-he),pe=T*(1-ye),W=P,Z=ce,x=pe):(Re=H,G=H,O=H,K=H,ce=H*(1-he),pe=H*(1-ye),W=H,Z=ce,x=pe),J=0}else{const R=($,k,P)=>{let C=0;for(let T=1;T<=n;T++){const ee=C,H=(ee+$)*k;C=ee+$+H,P.push({year:T,age:y+T-1,person2Age:r==="couple"?D+T-1:void 0,startBalance:Math.round(ee),contribution:Math.round($),growth:Math.round(H),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(C)})}return C};Re=R(v,m,re),ce=f*n,G=R(f,Math.max(0,m-p),de),pe=I*n,O=R(I,Math.max(0,m-p*.9),Q),K=R(z,m,we)}const be=Be(c,r,i,d,S),vt=Be(c,"single",i),St=r==="couple"?Math.max(0,vt.tax-be.tax):0,je=[];let Ie=Re,He=0;const Ne=55;let Te=!1,qe=null,Qe=0;const _e=r==="couple"?91e3*2:91e3;for(let R=1;R<=Ne&&!(Ie<=0);R++){const $=i+R-1,k=d+R-1,P=Ie,C=P*h,T=Math.min($,k),ee=Ot(r==="couple"?T:$),H=ee>0?Math.round(P*ee):0,he=H>be.gross;he&&qe===null&&(qe=$);const ye=Math.max(be.gross,H),ie=Math.min(P+C,ye),Xe=r==="couple"?fe(ie,$,k,S):{totalTax:V(ie,$>=65)},Ge=Math.round(Xe.totalTax),Oe=Math.max(0,ie-Ge),ve=Math.max(0,Oe-c);if(Qe+=ve,Ie=Math.max(0,P+C-ie),je.push({year:R,age:$,person2Age:r==="couple"?k:void 0,startBalance:Math.round(P),contribution:0,growth:Math.round(C),withdrawalGross:Math.round(ie),taxPaid:Ge,withdrawalNet:Math.round(Oe),endBalance:Math.round(Ie),isRRIFForced:he,rrifMinGross:H>0?H:void 0,surplusNet:ve>0?ve:void 0}),ie>=be.gross)He+=1;else{He+=ie/be.gross;break}if(R>=40&&Ie>=Re&&!he){Te=!0,He=55;break}}const Ze=G>0?Math.max(0,(G-ce)/G):0,ze=xt(c,Ze,r,i,d),rt=[];let We=G,Ye=0;const ft=h*.85;let at=!1;for(let R=1;R<=Ne&&!(We<=0);R++){const $=i+R-1,k=d+R-1,P=We,C=P*ft,T=Math.min(P+C,ze.gross),ee=r==="couple"?fe(T*Ze*.5,$,k,!0).totalTax:V(T*Ze*.5,$>=65),H=T-ee;if(We=Math.max(0,P+C-T),rt.push({year:R,age:$,person2Age:r==="couple"?k:void 0,startBalance:Math.round(P),contribution:0,growth:Math.round(C),withdrawalGross:Math.round(T),taxPaid:Math.round(ee),withdrawalNet:Math.round(H),endBalance:Math.round(We)}),T>=ze.gross)Ye+=1;else{Ye+=T/ze.gross;break}if(R>=40&&We>=G){at=!0,Ye=55;break}}const et=O>0?Math.max(0,(O-pe)/O):0,ke=pt(c,et,r,i,d,S),w=[];let b=O,A=0;const ue=h*.88;let se=!1;for(let R=1;R<=Ne&&!(b<=0);R++){const $=i+R-1,k=d+R-1,P=b,C=P*ue,T=Math.min(P+C,ke.gross),ee=tt(T,et);let H=0;if(r==="couple"&&S){const ye=ee.grossedUpDividend*.5,ie=ee.dividendTaxCredit*.5;H=Math.max(0,V(ye,$>=65)-ie)+Math.max(0,V(ye,k>=65)-ie)}else H=Math.max(0,V(ee.grossedUpDividend,$>=65)-ee.dividendTaxCredit);const he=T-H;if(b=Math.max(0,P+C-T),w.push({year:R,age:$,person2Age:r==="couple"?k:void 0,startBalance:Math.round(P),contribution:0,growth:Math.round(C),withdrawalGross:Math.round(T),taxPaid:Math.round(H),withdrawalNet:Math.round(he),endBalance:Math.round(b)}),T>=ke.gross)A+=1;else{A+=T/ke.gross;break}if(R>=40&&b>=O){se=!0,A=55;break}}const L=c,me=[];let _=K,ge=0,Me=!1;for(let R=1;R<=Ne&&!(_<=0);R++){const $=i+R-1,k=d+R-1,P=_,C=P*h,T=Math.min(P+C,L);if(_=Math.max(0,P+C-T),me.push({year:R,age:$,person2Age:r==="couple"?k:void 0,startBalance:Math.round(P),contribution:0,growth:Math.round(C),withdrawalGross:Math.round(T),taxPaid:0,withdrawalNet:Math.round(T),endBalance:Math.round(_)}),T>=L)ge+=1;else{ge+=T/L;break}if(R>=40&&_>=K){Me=!0,ge=55;break}}const Ee=tt(ke.gross,et).grossedUpDividend;return{params:t,exceedsRrspLimit:N,rrspAnnualLimit:F,rrsp:{accountName:r==="couple"?"Couple's Joint RRSP / RRIF":"RRSP / RRIF",terminalBalance:Math.round(Re),totalOutofPocketCost:Math.round(W),totalTaxRefundsReceived:Math.round(J*n),annualGrossWithdrawalNeeded:be.gross,annualRetirementTaxPaid:be.tax,longevityYears:Math.round(He*10)/10,isPerpetual:Te,oasClawbackRisk:be.gross>=_e,firstRRIFForcedAge:qe,totalRRIFSurplusCash:Math.round(Qe),couplesTaxAdvantageAnnual:Math.round(St),accumulationHistory:re,decumulationHistory:je},nonReg:{accountName:r==="couple"?"Couple's Personal Account (Joint PI)":"Personal Investment (Taxable Non-Registered)",terminalBalance:Math.round(G),totalOutofPocketCost:Math.round(Z),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:ze.gross,annualRetirementTaxPaid:ze.tax,longevityYears:Math.round(Ye*10)/10,isPerpetual:at,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:de,decumulationHistory:rt},corp:{accountName:r==="couple"?"Couple's Co-Owned Corp (CCPC / HoldCo)":"Private Corp (CCPC / HoldCo)",terminalBalance:Math.round(O),totalOutofPocketCost:Math.round(x),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:ke.gross,annualRetirementTaxPaid:ke.tax,longevityYears:Math.round(A*10)/10,isPerpetual:se,oasClawbackRisk:Ee>=_e,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:Q,decumulationHistory:w},tfsa:{accountName:r==="couple"?"Couple's Combined TFSAs":"TFSA (Tax-Free Savings Account)",terminalBalance:Math.round(K),totalOutofPocketCost:Math.round(Z),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:L,annualRetirementTaxPaid:0,longevityYears:Math.round(ge*10)/10,isPerpetual:Me,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:we,decumulationHistory:me}}}function gt(t){const{householdMode:r="single",annualSaving:a,yearsAccumulation:o,retireAge:s,person2RetireAge:n=s,retireNetSpending:i,workTaxRate:d,person2WorkTaxRate:c=d*.75,growthRatePreTax:g,taxDrag:u,retireGrowthRate:m,enableIncomeSplitting:p=!0,rrspPct:h,piPct:S,corpPct:y=0,tfsaPct:D,reinvestRefundTo:F,decumStrategy:N}=t,X=Math.max(18,s-o),M=Math.max(18,n-o),v=r==="couple"?32490*2:32490,f=r==="couple"?91e3*2:91e3;let I=0,z=0,J=0,W=0,Z=0,x=0,re=0;if(t.person1RrspSaving!==void 0||t.person2RrspSaving!==void 0||t.piSaving!==void 0||t.corpSaving!==void 0)r==="couple"?(x=Math.min(32490,Math.max(0,t.person1RrspSaving??0)),re=Math.min(32490,Math.max(0,t.person2RrspSaving??0)),I=x+re,z=Math.max(0,t.piSaving??0),J=Math.max(0,t.corpSaving??0),W=Math.max(0,t.tfsaSaving??0),Z=x*d+re*c):(x=Math.min(32490,Math.max(0,t.person1RrspSaving??0)),I=x,z=Math.max(0,t.piSaving??0),J=Math.max(0,t.corpSaving??0),W=Math.max(0,t.tfsaSaving??0),Z=x*d);else{const w=h+S+y+D||100,b=h/w,A=S/w,ue=y/w,se=D/w;if(I=a*b,z=a*A,J=a*ue,W=a*se,I>v){const L=I-v;I=v,W+=L*.5,z+=L*.5}r==="couple"?(x=I*.5,re=I*.5,Z=x*d+re*c):(x=I,Z=I*d)}F==="tfsa"?W+=Z:F==="pi"&&(z+=Z);let Q=0,we=0,Re=0,G=0,O=0,K=0,ce=0,pe=0;const be=[],vt=Math.max(0,g-u),St=Math.max(0,g-u*.9),je=!!(t.startAtRetirement&&t.startingRetirementAssets);if(je&&t.startingRetirementAssets){const w=t.startingRetirementAssets;r==="couple"?(we=Math.max(0,w.person1Rrsp??w.rrsp*.5),Re=Math.max(0,w.person2Rrsp??w.rrsp*.5),Q=we+Re):(we=Math.max(0,w.person1Rrsp??w.rrsp),Re=0,Q=we),G=Math.max(0,w.pi),O=Math.max(0,w.corp??0),K=Math.max(0,w.tfsa);const b=Math.min(95,Math.max(0,w.piUnrealizedGainPct??50))/100,A=Math.min(95,Math.max(0,w.corpUnrealizedGainPct??50))/100;ce=G*(1-b),pe=O*(1-A),Z=0}else{const w=I>0?x/I:r==="couple"?.5:1,b=r==="couple"?1-w:0;for(let A=1;A<=o;A++){const ue=X+A-1,se=M+A-1,L=Q,me=G,_=O,ge=K,Me=(L+I)*g,Ee=(me+z)*vt,R=(_+J)*St,$=(ge+W)*g;Q=L+I+Me,we=Q*w,Re=Q*b,G=me+z+Ee,O=_+J+R,K=ge+W+$,ce+=z,pe+=J,be.push({year:A,age:ue,person2Age:r==="couple"?se:void 0,rrspStart:Math.round(L),piStart:Math.round(me),corpStart:Math.round(_),tfsaStart:Math.round(ge),totalStart:Math.round(L+me+_+ge),rrspContrib:Math.round(I),piContrib:Math.round(z),corpContrib:Math.round(J),tfsaContrib:Math.round(W),taxRefund:Math.round(Z),rrspGrowth:Math.round(Me),piGrowth:Math.round(Ee),corpGrowth:Math.round(R),tfsaGrowth:Math.round($),guaranteedGross:0,guaranteedNet:0,portfolioNetDraw:0,cppIncome:0,oasIncome:0,dbPensionIncome:0,otherIncome:0,rrspGrossDraw:0,piGrossDraw:0,corpGrossDraw:0,tfsaGrossDraw:0,totalGrossDraw:0,rrspTax:0,piTax:0,corpTax:0,totalTax:0,netSpendReceived:0,rrspEnd:Math.round(Q),piEnd:Math.round(G),corpEnd:Math.round(O),tfsaEnd:Math.round(K),totalEnd:Math.round(Q+G+O+K),notes:"Accumulating"})}}const Ie={rrsp:Math.round(Q),person1Rrsp:Math.round(we),person2Rrsp:Math.round(Re),pi:Math.round(G),piCostBasis:Math.round(ce),piUnrealizedGain:Math.round(Math.max(0,G-ce)),corp:Math.round(O),corpCostBasis:Math.round(pe),corpUnrealizedGain:Math.round(Math.max(0,O-pe)),tfsa:Math.round(K),total:Math.round(Q+G+O+K)};let He=0,Ne=0,Te=0,qe=!1,Qe=0,_e=0,Ze=0;const ze=55,rt=m*.85,We=m*.88,Ye=(w,b,A,ue,se)=>{if(b<=0){const _=r==="couple"?fe(w,ue,se,p):{totalTax:V(w,ue>=65),isSplit:!1};return{totalTax:_.totalTax,isSplit:_.isSplit,grossedUpDiv:0,dtc:0}}const L=tt(b,A);if(r==="couple"){const _=p&&(ue>=65||se>=65),ge=_?w*.5:w,Me=_?w*.5:0,Ee=p?L.grossedUpDividend*.5:L.grossedUpDividend,R=p?L.grossedUpDividend*.5:0,$=p?L.dividendTaxCredit*.5:L.dividendTaxCredit,k=p?L.dividendTaxCredit*.5:0,P=Math.max(0,V(ge+Ee,ue>=65)-$),C=Math.max(0,V(Me+R,se>=65)-k);return{totalTax:Math.round(P+C),isSplit:_||p,grossedUpDiv:L.grossedUpDividend,dtc:L.dividendTaxCredit}}const me=Math.max(0,V(w+L.grossedUpDividend,ue>=65)-L.dividendTaxCredit);return{totalTax:Math.round(me),isSplit:!1,grossedUpDiv:L.grossedUpDividend,dtc:L.dividendTaxCredit}};for(let w=1;w<=ze;w++){const b=s+w-1,A=n+w-1,ue=Q+G+O+K;if(ue<=0)break;const se=Q,L=G,me=O,_=K,ge=se*m,Me=L*rt,Ee=me*We,R=_*m,$=se+ge,k=L+Me,P=me+Ee,C=_+R,T=Math.min(b,A),ee=Ot(r==="couple"?T:b),H=ee>0?Math.min($,se*ee):0;let he=0,ye=0,ie=0,Xe=0,Ge=0,Oe=0;if(t.includeOtherIncome){if(b>=(t.person1CppStartAge??65)&&(he=t.person1CppAnnual??1e4),r==="couple"&&A>=(t.person2CppStartAge??65)&&(ye=t.person2CppAnnual??8e3),b>=65){const Y=t.person1OasAnnual??8560;ie=b>=75?Y*1.1:Y}if(r==="couple"&&A>=65){const Y=t.person2OasAnnual??8560;Xe=A>=75?Y*1.1:Y}b>=(t.employerPensionStartAge??s)&&(Ge=t.employerPensionAnnual??0),Oe=t.otherTaxableIncome??0}const ve=he+ye+ie+Xe+Ge+Oe;let nt=0;if(ve>0)if(r==="couple"){const Y=he+ie+Ge*.5+Oe*.5,oe=ye+Xe+Ge*.5+Oe*.5,j=V(Y,b>=65),U=V(oe,A>=65);nt=j+U}else nt=V(ve,b>=65);const ot=Math.max(0,ve-nt),xe=Math.max(0,i-ot);w===1&&(_e=ve,Ze=ot);let B=0,ae=0,ne=0,Se=0,Ct=!1,wt=!1,Je="";const Ae=G>0?Math.max(0,(G-ce)/G):0,Ve=O>0?Math.max(0,(O-pe)/O):0;if(N==="oasShield"){const Y=r==="couple"?176e3:88e3,oe=Math.max(H,Math.min($,Y));H>Y?(Ct=!0,Je="RRIF Min Exceeds OAS Cap"):wt=!0;const j=r==="couple"?fe(oe,b,A,p).totalTax:V(oe,b>=65);if(Math.max(0,oe-j)>=xe){const E=Be(xe,r,b,A,p);B=Math.max(H,Math.min($,E.gross))}else{B=oe;const E=B-j;let q=Math.max(0,xe-E);if(q>0&&k>0){const Pe=xt(q,Ae,r,b,A),Le=Math.min(k,Pe.gross);ae=Le;const yt=r==="couple"?fe(Le*Ae*.5,b,A,!0).totalTax:V(Le*Ae*.5,b>=65),Qt=Le-yt;q=Math.max(0,q-Qt)}if(q>0&&P>0){const Pe=pt(q,Ve,r,b,A,p),Le=Math.min(P,Pe.gross);ne=Le;const yt=Math.max(0,Le-Pe.tax*(Le/Math.max(1,Pe.gross)));q=Math.max(0,q-yt)}if(q>0&&C>0){const Pe=Math.min(C,q);Se=Pe,q=Math.max(0,q-Pe)}}}else if(N==="rrspMeltdown"){const Y=r==="couple"?18e4:105e3;if(b<71&&$>0){B=Math.min($,Y);const oe=r==="couple"?fe(B,b,A,p).totalTax:V(B,b>=65),j=B-oe;if(j<xe){let U=xe-j;ae=Math.min(k,U),U=Math.max(0,U-ae),U>0&&P>0&&(ne=Math.min(P,U*1.06),U=Math.max(0,U-ne*.94)),U>0&&(Se=Math.min(C,U))}Je="Early RRSP Meltdown"}else{const oe=Be(xe,r,b,A,p);B=Math.max(H,Math.min($,oe.gross));const j=r==="couple"?fe(B,b,A,p).totalTax:V(B,b>=65),U=B-j;let E=Math.max(0,xe-U);E>0&&k>0&&(ae=Math.min(k,E*1.05),E=Math.max(0,E-ae)),E>0&&P>0&&(ne=Math.min(P,E*1.06),E=Math.max(0,E-ne*.94)),E>0&&C>0&&(Se=Math.min(C,E)),Je="Post-71 RRIF Mode"}}else if(N==="taxableFirst"){B=H;const Y=B>0?r==="couple"?fe(B,b,A,p).totalTax:V(B,b>=65):0,oe=B-Y;let j=Math.max(0,xe-oe);if(k>0&&j>0){const U=xt(j,Ae,r,b,A),E=Math.min(k,U.gross);ae=E;const q=E-(r==="couple"?fe(E*Ae*.5,b,A,!0).totalTax:V(E*Ae*.5,b>=65));j=Math.max(0,j-q)}if(P>0&&j>0){const U=pt(j,Ve,r,b,A,p),E=Math.min(P,U.gross);ne=E;const q=Math.max(0,E-U.tax*(E/Math.max(1,U.gross)));j=Math.max(0,j-q)}if(j>0&&$>B){const U=Be(j,r,b,A,p),E=Math.min($-B,U.gross);B+=E}j>0&&C>0&&(Se=Math.min(C,j)),Je=k>0||P>0?P>0&&k<=0?"Spending Co-Owned Corp First":"Spending Taxable / Corp First":"Taxable & Corp Exhausted"}else{const Y=$+k+P+C,oe=Y>0?$/Y:0,j=Y>0?k/Y:0,U=Y>0?P/Y:0,E=Y>0?C/Y:0,q=Be(xe*oe,r,b,A,p).gross;if(B=Math.max(H,Math.min($,q)),ae=Math.min(k,xe*j*1.05),U>0){const Pe=pt(xe*U,Ve,r,b,A,p).gross;ne=Math.min(P,Pe)}Se=Math.min(C,xe*E),Je="Proportional Draw"}for(let Y=0;Y<3;Y++){const oe=ve+B+ae*Ae*.5,j=Ye(oe,ne,Ve,b,A).totalTax,U=ve+B+ae+ne+Se-j,E=i-U;if(E<=300)break;if(C>Se){const q=Math.min(C-Se,E);Se+=q}else if(k>ae){const q=Math.min(k-ae,E*1.05);ae+=q}else if(P>ne){const q=Math.min(P-ne,E*1.08);ne+=q}else if($>B){const q=Be(E,r,b,A,p).gross,Pe=Math.min($-B,q);B+=Pe}else break}const Rt=ae*Ae*.5,It=ve+B+Rt,st=Ye(It,ne,Ve,b,A),it=st.totalTax,Tt=It+st.grossedUpDiv,Zt=Math.max(0,st.grossedUpDiv*.45),lt=B+Rt+Zt,bt=Math.max(0,it-nt),kt=lt>0?Math.round(bt*(B/lt)):0,Et=lt>0?Math.round(bt*(Rt/lt)):0,Xt=Math.max(0,Math.round(bt-kt-Et));if(He+=it,Tt>f){const Y=(Tt-f)*.15;Ne+=Y}const dt=Math.round(ve+B+ae+ne+Se-it),Jt=Math.max(0,dt-ot);Q=Math.max(0,$-B),G=Math.max(0,k-ae),O=Math.max(0,P-ne),K=Math.max(0,C-Se),ce=Math.max(0,ce-ae*(1-Ae)),pe=Math.max(0,pe-ne*(1-Ve)),be.push({year:(je?0:o)+w,age:b,person2Age:r==="couple"?A:void 0,rrspStart:Math.round(se),piStart:Math.round(L),corpStart:Math.round(me),tfsaStart:Math.round(_),totalStart:Math.round(ue),rrspContrib:0,piContrib:0,corpContrib:0,tfsaContrib:0,taxRefund:0,rrspGrowth:Math.round(ge),piGrowth:Math.round(Me),corpGrowth:Math.round(Ee),tfsaGrowth:Math.round(R),guaranteedGross:Math.round(ve),guaranteedNet:Math.round(ot),portfolioNetDraw:Math.round(Jt),cppIncome:Math.round(he+ye),oasIncome:Math.round(ie+Xe),dbPensionIncome:Math.round(Ge),otherIncome:Math.round(Oe),rrspGrossDraw:Math.round(B),piGrossDraw:Math.round(ae),corpGrossDraw:Math.round(ne),tfsaGrossDraw:Math.round(Se),totalGrossDraw:Math.round(B+ae+ne+Se),rrspTax:kt,piTax:Et,corpTax:Xt,totalTax:Math.round(it),netSpendReceived:dt,rrspEnd:Math.round(Q),piEnd:Math.round(G),corpEnd:Math.round(O),tfsaEnd:Math.round(K),totalEnd:Math.round(Q+G+O+K),isRRIFForced:Ct,isOASCapped:wt,isIncomeSplit:st.isSplit,notes:Je});const Kt=Q+G+O+K;if(dt>=i*.85)Te+=1;else if(Kt<=100){Te+=Math.max(0,dt/i);break}else Te+=1;if(b===85&&(Qe=Math.round(Q*(1-.45)+G*(1-Ae*.25)+O*(1-Ve*.28)+K)),w>=45&&Ie.total>0&&Q+G+O+K>=Ie.total){qe=!0,Te=55;break}}const ft=Be(i,r,s,n,p),at=Be(i,"single",s),et=r==="couple"?Math.max(0,at.tax-ft.tax):0,ke={oasShield:{name:r==="couple"?"Dual OAS Shield & Income Splitting":"OAS Shield & Tax Smoothing",tagline:r==="couple"?"Splits RRIF & Corp dividends 50/50 and shields up to $182k combined from OAS clawback.":"Caps RRSP withdrawals below the ~$91k clawback line; bridges lifestyle with PI, Corp & TFSA."},rrspMeltdown:{name:"Early RRSP Meltdown",tagline:"Aggressively burns down RRSP between retirement and age 71 to eliminate the RRIF tax bomb."},taxableFirst:{name:"Taxable (PI & Corp) First",tagline:"Spends Personal (PI) and Corporate (CCPC) investments first, letting RRSP and TFSA compound untouched."},proRata:{name:"Proportional Balanced Draw",tagline:"Draws simultaneously from RRSP, PI, Co-Owned Corp, and TFSA in proportion to their current balances."}};return{id:N,name:ke[N].name,tagline:ke[N].tagline,longevityYears:Math.round(Te*10)/10,depletionAge:Math.round(s+Te),isPerpetual:qe,terminalBalanceAtRetirement:Ie,totalLifetimeRetirementTax:Math.round(He),totalOASClawbackPaid:Math.round(Ne),totalRefundsAccumulated:je?0:Math.round(Z*o),annualTaxRefund:Math.round(Z),person1RrspSaving:Math.round(x),person2RrspSaving:Math.round(re),piSaving:Math.round(z),corpSaving:Math.round(J),annualGuaranteedGrossAtRetirement:Math.round(_e),annualGuaranteedNetAtRetirement:Math.round(Ze),estateValueAtAge85:Qe,couplesAnnualTaxSavings:et,history:be}}function er(t){return["oasShield","rrspMeltdown","taxableFirst","proRata"].map(a=>gt({...t,decumStrategy:a}))}function tr(t,r=95){const a=Math.max(1,r-t.retireAge),o=["oasShield","rrspMeltdown","taxableFirst","proRata"];let s=0,n="oasShield",i=null;for(const d of o){let c=15e3,g=4e5,u=15e3,m=null;for(let p=0;p<16;p++){const h=Math.round((c+g)/2/1e3)*1e3,S=gt({...t,retireNetSpending:h,decumStrategy:d});S.isPerpetual||S.longevityYears>=a?(u=h,m=S,c=h+1e3):g=h-1e3}u>s&&m&&(s=u,n=d,i=m)}return{maxSpending:s,bestStrategy:n,strategyResult:i||gt({...t,retireNetSpending:s,decumStrategy:n})}}function rr(){return`
    <footer class="footer-note">
      <p>Built with CRA RRIF prescribed factors (Age 71+), Pension Income Splitting (Form T1032), CCPC Small Business Deduction (12.2%), Capital Dividend Account (CDA) & Dividend Gross-Up/Tax Credit rules, Federal & Ontario graduated brackets, and Capital Gains 50% inclusion.</p>
      <p>© ${new Date().getFullYear()} static-apps · Educational financial model. Not formal financial advice.</p>
    </footer>
  `}const ar=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>`;function l(t){return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(t)}function te(t){return t>=1e6?`$${(t/1e6).toFixed(2)}M`:t>=1e3?`$${(t/1e3).toFixed(0)}k`:`$${t}`}const e={householdMode:"single",viewMode:"simulator",annualSaving:4e4,yearsAccumulation:15,retireAge:65,person2RetireAge:63,retireNetSpending:8e4,workTaxRate:.43,person2WorkTaxRate:.3,growthRatePreTax:.07,taxDrag:.015,retireGrowthRate:.05,enableIncomeSplitting:!0,p1RrspSaving:25e3,p2RrspSaving:1e4,piSaving:15e3,corpSaving:0,tfsaSaving:0,startAtRetirement:!1,retireStartTotal:12e5,retireStartP1Rrsp:7e5,retireStartP2Rrsp:35e4,retireStartPi:3e5,retireStartPiGainPct:50,retireStartCorp:0,retireStartCorpGainPct:50,retireStartTfsa:2e5,comparatorUseBreakdown:!1,rrspPct:70,piPct:30,corpPct:0,tfsaPct:0,reinvestRefundTo:"tfsa",decumStrategy:"oasShield",includeOtherIncome:!1,otherIncomeExpanded:!1,person1CppAnnual:1e4,person1CppStartAge:65,person2CppAnnual:8e3,person2CppStartAge:65,person1OasAnnual:8560,person2OasAnnual:8560,employerPensionAnnual:0,employerPensionStartAge:65,otherTaxableIncome:0,comparatorMode:"preTax",comparatorReinvest:!1,chartViewMode:"balances",blueprintSelectedAge:null,ledgerOpen:!1,theme:localStorage.getItem("theme")||"dark"};function nr(){if(e.householdMode==="couple"){if(e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving!==e.annualSaving){const o=Math.max(0,e.annualSaving-e.corpSaving),s=Math.min(32490,Math.round(o*.35));e.p1RrspSaving=s,e.p2RrspSaving=s,e.piSaving=Math.max(0,o-s*2)}if(e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa!==e.retireStartTotal){const o=Math.max(0,e.retireStartTotal-e.retireStartPi-e.retireStartCorp-e.retireStartTfsa),s=Math.round(o/2);e.retireStartP1Rrsp=s,e.retireStartP2Rrsp=o-s,e.retireStartTotal=e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa}}else{if(e.p1RrspSaving+e.piSaving+e.corpSaving!==e.annualSaving){const o=Math.max(0,e.annualSaving-e.corpSaving);e.p1RrspSaving=Math.min(32490,Math.round(o*.7)),e.piSaving=Math.max(0,o-e.p1RrspSaving)}e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa!==e.retireStartTotal&&(e.retireStartP1Rrsp=Math.max(0,e.retireStartTotal-e.retireStartPi-e.retireStartCorp-e.retireStartTfsa),e.retireStartTotal=e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa)}}function Lt(){const t=e.householdMode==="couple",r=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving:e.p1RrspSaving+e.piSaving+e.corpSaving;e.annualSaving=r;const a=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa:e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa;return e.retireStartTotal=a,{householdMode:e.householdMode,annualSaving:e.annualSaving,yearsAccumulation:e.yearsAccumulation,retireAge:e.retireAge,person2RetireAge:e.person2RetireAge,retireNetSpending:e.retireNetSpending,workTaxRate:e.workTaxRate,person2WorkTaxRate:e.person2WorkTaxRate,growthRatePreTax:e.growthRatePreTax,taxDrag:e.taxDrag,retireGrowthRate:e.retireGrowthRate,enableIncomeSplitting:e.enableIncomeSplitting,rrspPct:e.rrspPct,piPct:e.piPct,corpPct:e.corpPct,tfsaPct:e.tfsaPct,person1RrspSaving:e.p1RrspSaving,person2RrspSaving:t?e.p2RrspSaving:0,piSaving:e.piSaving,corpSaving:e.corpSaving,tfsaSaving:e.tfsaSaving,reinvestRefundTo:e.reinvestRefundTo,startAtRetirement:e.startAtRetirement,startingRetirementAssets:{rrsp:t?e.retireStartP1Rrsp+e.retireStartP2Rrsp:e.retireStartP1Rrsp,person1Rrsp:e.retireStartP1Rrsp,person2Rrsp:t?e.retireStartP2Rrsp:0,pi:e.retireStartPi,piUnrealizedGainPct:e.retireStartPiGainPct,corp:e.retireStartCorp,corpUnrealizedGainPct:e.retireStartCorpGainPct,tfsa:e.retireStartTfsa},includeOtherIncome:e.includeOtherIncome,person1CppAnnual:e.person1CppAnnual,person1CppStartAge:e.person1CppStartAge,person2CppAnnual:e.person2CppAnnual,person2CppStartAge:e.person2CppStartAge,person1OasAnnual:e.person1OasAnnual,person2OasAnnual:e.person2OasAnnual,employerPensionAnnual:e.employerPensionAnnual,employerPensionStartAge:e.employerPensionStartAge,otherTaxableIncome:e.otherTaxableIncome}}function or(){const t=e.householdMode==="couple";return{householdMode:e.householdMode,annualSaving:e.annualSaving,mode:e.comparatorMode,reinvestRefund:e.comparatorReinvest,yearsAccumulation:e.yearsAccumulation,retireAge:e.retireAge,person2RetireAge:e.person2RetireAge,retireNetSpending:e.retireNetSpending,workTaxRate:e.workTaxRate,person2WorkTaxRate:e.person2WorkTaxRate,growthRatePreTax:e.growthRatePreTax,taxDrag:e.taxDrag,retireGrowthRate:e.retireGrowthRate,enableIncomeSplitting:e.enableIncomeSplitting,startAtRetirement:e.startAtRetirement,startingRetirementAssets:{rrsp:t?e.retireStartP1Rrsp+e.retireStartP2Rrsp:e.retireStartP1Rrsp,person1Rrsp:e.retireStartP1Rrsp,person2Rrsp:t?e.retireStartP2Rrsp:0,pi:e.retireStartPi,piUnrealizedGainPct:e.retireStartPiGainPct,corp:e.retireStartCorp,corpUnrealizedGainPct:e.retireStartCorpGainPct,tfsa:e.retireStartTfsa},comparatorUseBreakdown:e.comparatorUseBreakdown}}function Mt(t){const{sliderId:r,numId:a,value:o,sliderMin:s,sliderMax:n,numMin:i=s,numMax:d=n,step:c}=t,g=Math.min(n,Math.max(s,o));return`
    <div class="slider-container">
      <input type="range" id="${r}" min="${s}" max="${n}" step="${c}" value="${g}">
      <input type="number" id="${a}" class="form-input-number" min="${i}" max="${d}" step="${c}" value="${o}">
    </div>
  `}function De(t){const{id:r,label:a,sliderId:o,dispId:s,displayHtml:n,displayStyle:i,extraHtml:d=""}=t;return`
    <div class="form-group"${r?` id="${r}"`:""}>
      <div class="form-label-row">
        <label class="form-label" for="${o}">${a}</label>
        <span class="form-val-display" id="${s}"${i?` style="${i}"`:""}>${n}</span>
      </div>
      ${Mt(t)}
      ${d}
    </div>
  `}function $e(t){const{sliderId:r,numId:a,dispId:o,maxSliderVal:s,minVal:n,formatter:i,onChange:d}=t,c=document.getElementById(r),g=document.getElementById(a),u=o?document.getElementById(o):null,m=p=>{const h=n!==void 0?Math.max(n,p):p;u&&i&&(u.textContent=i(h)),d(h)};c?.addEventListener("input",()=>{const p=parseFloat(c.value);isNaN(p)||(g&&(g.value=p.toString()),m(p))}),g?.addEventListener("input",()=>{const p=parseFloat(g.value);if(!isNaN(p)){const h=s!==void 0?Math.min(s,p):p;c&&(c.value=h.toString()),m(p)}})}function le(t,r,a,o,s,n){const i=document.getElementById(t),d=document.getElementById(r),c=document.getElementById(a);i&&(i.value=(n!==void 0?Math.min(n,o):o).toString()),d&&(d.value=o.toString()),c&&(c.textContent=s)}function sr(t){return`
    <!-- Header -->
    <header class="app-header">
      <nav class="nav-bar">
        <div class="breadcrumb-group">
          <a href="https://neilhan.github.io/static" class="home-link" title="Back to Home" aria-label="Back to Home">
            <span class="home-icon" aria-hidden="true">${ar}</span>
          </a>
          <span class="breadcrumb-sep">/</span>
          <span class="badge-tag">RETIREMENT STRATEGY ENGINE</span>
        </div>
        <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
          ${e.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode"}
        </button>
      </nav>

      <div class="hero-banner">
        <img src="./calculator.svg" alt="Calculator Logo" class="app-logo" />
        <div class="hero-text">
          <h1>${t?"Couples Retirement Strategy Simulator":"Canadian Retirement Strategy Simulator"}</h1>
          <p>
            ${t?"Optimize household savings across Person 1 RRSP, Person 2 RRSP, Personal Accounts, and a 2-Person Co-Owned Corp (CCPC / HoldCo). Model CRA pension & dividend splitting, CDA tax-free dividends, and dual OAS clawback shields.":"Optimize accumulation allocation (RRSP vs. Personal Investment vs. Private Corp vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."}
          </p>
        </div>
      </div>
    </header>

    <!-- Household Mode Selector (Single vs Couple) -->
    <div class="household-toggle-wrapper">
      <div class="household-pills">
        <button id="btn-household-single" class="household-pill ${t?"":"active"}">
          👤 Single Individual
        </button>
        <button id="btn-household-couple" class="household-pill ${t?"active":""}">
          👥 Couple (2 Persons / Spousal)
        </button>
      </div>
    </div>

    <!-- Mode Switcher -->
    <nav class="app-nav-tabs" aria-label="View Mode">
      <button id="tab-mode-sim" class="nav-tab-btn ${e.viewMode==="simulator"?"active":""}">
        🎯 Strategy Simulator & Optimizer
      </button>
      <button id="tab-mode-comp" class="nav-tab-btn ${e.viewMode==="comparator"?"active":""}">
        ⚖️ Direct Account Comparison (RRSP vs PI vs Corp vs TFSA)
      </button>
    </nav>

    <!-- Interactive Scenario Playbook Bar -->
    <div class="scenario-playbook-bar" aria-label="Quick Experiment Scenarios">
      <span class="scenario-playbook-label">🧪 Quick Scenarios:</span>
      <button type="button" class="scenario-chip" id="chip-scenario-baseline">
        🎯 Benchmark ($80k @ 65)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-couple-corp" style="border-color:rgba(244,114,182,0.5);color:var(--corp-color);">
        🏢 2-Person Co-Owned Corp
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-retire-now" style="border-color:rgba(168,85,247,0.45);color:#c084fc;">
        🏦 Start @ Retirement ($1.5M + Corp)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-early">
        🏖️ Early Freedom (Age 58, $65k)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-fat">
        🏰 High Lifestyle ($110k)
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-cppoas" style="border-color:rgba(59,130,246,0.45);color:#60a5fa;">
        🛡️ +CPP & OAS Guaranteed
      </button>
      <button type="button" class="scenario-chip" id="chip-scenario-optimize" style="border-color:rgba(16,185,129,0.45);color:#10b981;">
        ⚡ Auto-Max Safe Spend (to 95)
      </button>
    </div>
  `}function Ht(t){const r=Lt(),a=tr(r,95);e.retireNetSpending=a.maxSpending,e.decumStrategy=a.bestStrategy,le("slider-spend","num-spend","disp-spend",a.maxSpending,`${l(a.maxSpending)}/yr`,25e4);const o=document.getElementById("optimize-spend-result");o&&(o.style.display="block",o.innerHTML=`
      <strong>🎉 Max Safe Spending Found:</strong> You can sustainably spend <strong>${l(a.maxSpending)}/yr after-tax</strong> until <strong>Age ${a.strategyResult.depletionAge}+</strong> using the <em>"${a.strategyResult.name}"</em> strategy!
    `),t.updateResultsOnly()}function ir(t){document.getElementById("theme-toggle")?.addEventListener("click",()=>{e.theme=e.theme==="dark"?"light":"dark",localStorage.setItem("theme",e.theme),document.documentElement.setAttribute("data-theme",e.theme);const r=document.getElementById("theme-toggle");r&&(r.textContent=e.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode")}),document.getElementById("btn-household-single")?.addEventListener("click",()=>{e.householdMode!=="single"&&(e.householdMode="single",t.renderApp())}),document.getElementById("btn-household-couple")?.addEventListener("click",()=>{e.householdMode!=="couple"&&(e.householdMode="couple",t.renderApp())}),document.getElementById("tab-mode-sim")?.addEventListener("click",()=>{e.viewMode!=="simulator"&&(e.viewMode="simulator",t.renderApp())}),document.getElementById("tab-mode-comp")?.addEventListener("click",()=>{e.viewMode!=="comparator"&&(e.viewMode="comparator",t.renderApp())}),document.getElementById("chip-scenario-baseline")?.addEventListener("click",()=>{e.startAtRetirement=!1,e.retireAge=65,e.person2RetireAge=63,e.yearsAccumulation=15,e.retireNetSpending=8e4,e.corpSaving=0,e.decumStrategy="oasShield",t.renderApp()}),document.getElementById("chip-scenario-couple-corp")?.addEventListener("click",()=>{e.householdMode="couple",e.viewMode="simulator",e.retireAge=65,e.person2RetireAge=63,e.enableIncomeSplitting=!0,e.retireNetSpending=1e5,e.startAtRetirement?(e.retireStartP1Rrsp=35e4,e.retireStartP2Rrsp=35e4,e.retireStartPi=15e4,e.retireStartCorp=6e5,e.retireStartCorpGainPct=50,e.retireStartTfsa=2e5,e.retireStartTotal=165e4):(e.yearsAccumulation=15,e.p1RrspSaving=2e4,e.p2RrspSaving=2e4,e.piSaving=5e3,e.corpSaving=35e3,e.annualSaving=8e4),e.decumStrategy="oasShield",t.renderApp()}),document.getElementById("chip-scenario-retire-now")?.addEventListener("click",()=>{e.startAtRetirement=!0,e.retireAge=65,e.person2RetireAge=63,e.retireNetSpending=9e4,e.householdMode==="couple"?(e.retireStartP1Rrsp=35e4,e.retireStartP2Rrsp=35e4,e.retireStartPi=2e5,e.retireStartCorp=4e5,e.retireStartTfsa=2e5):(e.retireStartP1Rrsp=65e4,e.retireStartPi=25e4,e.retireStartCorp=4e5,e.retireStartTfsa=2e5),e.retireStartTotal=15e5,e.retireStartPiGainPct=50,e.retireStartCorpGainPct=50,e.decumStrategy="oasShield",t.renderApp()}),document.getElementById("chip-scenario-early")?.addEventListener("click",()=>{e.startAtRetirement=!1,e.retireAge=58,e.person2RetireAge=56,e.yearsAccumulation=18,e.retireNetSpending=65e3,e.decumStrategy="rrspMeltdown",t.renderApp()}),document.getElementById("chip-scenario-fat")?.addEventListener("click",()=>{e.retireNetSpending=11e4,e.decumStrategy="oasShield",le("slider-spend","num-spend","disp-spend",11e4,`${l(11e4)}/yr`),t.updateResultsOnly()}),document.getElementById("chip-scenario-cppoas")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,e.householdMode==="couple"&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),t.renderControlsPanel(),t.updateResultsOnly()}),document.getElementById("chip-scenario-optimize")?.addEventListener("click",()=>{Ht(t)})}const lr=[{icon:"🤝",title:"Pension Income Splitting (CRA Form T1032)",tagText:"Couples Rule",tagClass:"tag-strategy",descriptionHtml:"At age 65+, Canadian couples can transfer up to <strong>50% of eligible RRIF withdrawals</strong> to their spouse on line 21000 of their tax return. Both spouses get the <strong>$2,000 Pension Credit</strong> and dual Basic Personal Amounts ($31,410 tax-free combined).",takeawayHtml:"<strong>Impact:</strong> Cuts annual retirement income tax by $6,000 to $12,000+ per year, adding 3 to 6 years of longevity to a couple's portfolio!"},{icon:"🏢",title:"2-Person Co-Owned Corp (CCPC / HoldCo)",tagText:"Co-Owned Corp",tagClass:"tag-strategy",tagStyle:"background:rgba(244,114,182,0.18);color:var(--corp-color);border-color:rgba(244,114,182,0.35);",descriptionHtml:"Active business earnings retained inside a Canadian-Controlled Private Corporation are taxed at just <strong>12.2% (Ontario SBD)</strong>, leaving 87.8¢ on the dollar to invest. In retirement, <strong>50% of realized corporate capital gains</strong> flow out <strong>100% tax-free via the Capital Dividend Account (CDA)</strong>, while co-owning spouses split dividends 50/50 (TOSI-exempt at age 65+ or with co-founder shares).",takeawayHtml:"<strong>Impact:</strong> Note that taxable CCPC dividends have a <strong>1.15× CRA gross-up</strong> on line 23400, so blending CDA tax-free payouts with RRSP/TFSA draws helps protect OAS!"},{icon:"🛡️",title:"Dual OAS Clawback Shield ($182k Combined)",tagText:"Clawback Shield",tagClass:"tag-tax",descriptionHtml:"While a single person's OAS clawback starts at ~$91,000, a couple splitting RRIF pensions and CCPC corporate dividends can draw up to <strong>$182,000 combined</strong> before triggering the 15% OAS recovery tax.",takeawayHtml:"<strong>Impact:</strong> Fully shields both spouses' Old Age Security pensions from government clawbacks."},{icon:"🏛️",title:"CRA Mandatory RRIF Conversion (Age 71+)",tagText:"CRA Rule",tagClass:"tag-cra",descriptionHtml:"By December 31 of the year you turn <strong>71</strong>, you must convert your RRSP to a RRIF. For couples, the CRA allows basing mandatory minimums on the <strong>younger spouse's age</strong>, lowering required withdrawals!",takeawayHtml:"<strong>Impact:</strong> Using the younger spouse's age legally reduces forced taxable withdrawals and keeps more money compounding."},{icon:"📉",title:"Annual Tax Drag in Personal & Passive Accounts",tagText:"Growth Drag",tagClass:"tag-tax",descriptionHtml:"In non-registered and passive corporate investment accounts, dividends, interest, and realized capital gains face annual tax drag, slowing compounding by <strong>~1.0% to 2.0% annually</strong> compared to RRSP/TFSA.",takeawayHtml:"<strong>Impact:</strong> Prioritize ETFs with deferred capital gains inside Personal & HoldCo accounts, and maximize dual TFSAs ($14,000/yr) first."}];function dr(t){return`
    <article class="rule-card">
      <div class="rule-card-header">
        <div class="rule-title-group">
          <span class="rule-icon">${t.icon}</span>
          <span class="rule-title">${t.title}</span>
        </div>
        <span class="rule-tag ${t.tagClass}"${t.tagStyle?` style="${t.tagStyle}"`:""}>${t.tagText}</span>
      </div>
      <p class="rule-desc">${t.descriptionHtml}</p>
      <div class="rule-takeaway">${t.takeawayHtml}</div>
    </article>
  `}function cr(){return`
    <section class="rules-section" aria-label="Canadian Retirement Planning Rules & Factors">
      <div class="rules-header">
        <h2>📋 Rules & Factors to Consider in Canadian Retirement Planning</h2>
        <p>Key tax laws, CRA regulations, and structural differences that impact RRSP, Personal Non-Registered, 2-Person Co-Owned Corporations (CCPC), and TFSA accounts.</p>
      </div>
      <div class="rules-grid">
        ${lr.map(dr).join("")}
      </div>
    </section>
  `}function Ce(t){const{variant:r,icon:a,title:o,titleColor:s,amountText:n,amountColor:i,noteText:d,customStyle:c}=t;return`
    <div class="blueprint-col ${r}"${c?` style="${c}"`:""}>
      <div class="blueprint-col-title" style="color:${s};">
        <span>${a}</span> ${o}
      </div>
      <div class="blueprint-amount"${i?` style="color:${i};"`:""}>${n}</div>
      <div class="blueprint-note">${d}</div>
    </div>
  `}function ct(t){const{cardVariant:r,badgeText:a,accountName:o,longevityText:s,longevitySubText:n,metrics:i}=t,d=i.map(c=>`
      <div class="metric-row">
        <span class="metric-label">${c.label}</span>
        <span class="metric-val">${c.value}</span>
      </div>
    `).join("");return`
    <article class="card ${r}">
      <div class="card-header">
        <span class="card-badge">${a}</span>
        <span class="card-title">${o}</span>
      </div>
      <div class="hero-metric">
        <div class="hero-metric-label">Retirement Longevity</div>
        <div class="hero-metric-val">${s}</div>
        <div class="hero-metric-sub">${n}</div>
      </div>
      <div class="metric-rows">
        ${d}
      </div>
    </article>
  `}function Nt({title:t,description:r,annualSavings:a,subLabel:o}){return a<=0?"":`
    <div class="couple-tax-banner">
      <div class="couple-tax-text">
        <h4>${t}</h4>
        <p>${r}</p>
      </div>
      <div class="couple-tax-val">
        +${l(a)}/yr
        <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">${o}</div>
      </div>
    </div>
  `}function pr(t,r){return`
    ${r?Nt({title:"🎉 Couples Income & Dividend Splitting Advantage",description:"By splitting RRIF income and CCPC corporate dividends 50/50 between two spouses, household gross withdrawals drop substantially for the same after-tax lifestyle!",annualSavings:t.rrsp.couplesTaxAdvantageAnnual??0,subLabel:"Annual Tax Saved"}):""}

    <div class="comparison-grid">
      ${ct({cardVariant:"card-rrsp",badgeText:r?"Couple's Joint RRSP":"Tax-Deferred · RRIF at 71",accountName:t.rrsp.accountName,longevityText:t.rrsp.isPerpetual?"50+ Yrs":`${t.rrsp.longevityYears} Yrs`,longevitySubText:`Funds household until Age ${e.retireAge+Math.floor(t.rrsp.longevityYears)}`,metrics:[{label:"Terminal Balance:",value:l(t.rrsp.terminalBalance)},{label:"Gross Draw Needed:",value:`${l(t.rrsp.annualGrossWithdrawalNeeded)}/yr`},{label:"Household Tax Paid:",value:`${l(t.rrsp.annualRetirementTaxPaid)}/yr`}]})}

      ${ct({cardVariant:"card-nonreg",badgeText:"Taxable Account",accountName:t.nonReg.accountName,longevityText:t.nonReg.isPerpetual?"50+ Yrs":`${t.nonReg.longevityYears} Yrs`,longevitySubText:`Depleted at Age ${e.retireAge+Math.floor(t.nonReg.longevityYears)}`,metrics:[{label:"Terminal Balance:",value:l(t.nonReg.terminalBalance)},{label:"Gross Draw Needed:",value:`${l(t.nonReg.annualGrossWithdrawalNeeded)}/yr`},{label:"Household Tax Paid:",value:`${l(t.nonReg.annualRetirementTaxPaid)}/yr`}]})}

      ${ct({cardVariant:"card-corp",badgeText:r?"12.2% SBD · 50/50 Divs + CDA":"12.2% SBD · CCPC Divs + CDA",accountName:t.corp.accountName,longevityText:t.corp.isPerpetual?"50+ Yrs":`${t.corp.longevityYears} Yrs`,longevitySubText:t.corp.isPerpetual?`Sustains past Age ${e.retireAge+50}+`:`Funds household until Age ${e.retireAge+Math.floor(t.corp.longevityYears)}`,metrics:[{label:"Terminal Balance:",value:l(t.corp.terminalBalance)},{label:"Gross Corp Payout:",value:`${l(t.corp.annualGrossWithdrawalNeeded)}/yr`},{label:"Personal Dividend Tax:",value:`${l(t.corp.annualRetirementTaxPaid)}/yr`}]})}

      ${ct({cardVariant:"card-tfsa",badgeText:"Tax-Free Benchmark",accountName:t.tfsa.accountName,longevityText:t.tfsa.isPerpetual?"50+ Yrs":`${t.tfsa.longevityYears} Yrs`,longevitySubText:`Funds household until Age ${e.retireAge+Math.floor(t.tfsa.longevityYears)}`,metrics:[{label:"Terminal Balance:",value:l(t.tfsa.terminalBalance)},{label:"Gross Draw Needed:",value:`${l(t.tfsa.annualGrossWithdrawalNeeded)}/yr`},{label:"Household Tax Paid:",value:"$0/yr"}]})}
    </div>
  `}function ur(t){const r=t.history,a=r.length;if(a===0)return'<p style="padding:2rem;text-align:center;">No data available</p>';let o=0,s=t.terminalBalanceAtRetirement.corp>0;for(const x of r)o=Math.max(o,x.totalEnd,x.rrspEnd,x.piEnd,x.corpEnd,x.tfsaEnd),x.corpEnd>0&&(s=!0);o=Math.max(o,1e4)*1.1;const n=800,i=300,d=70,c=20,g=20,u=35,m=n-d-c,p=i-g-u,h=x=>d+x/Math.max(1,a-1)*m,S=x=>g+p-x/o*p,y=x=>r.map((re,de)=>`${de===0?"M":"L"} ${h(de).toFixed(1)} ${S(re[x]).toFixed(1)}`).join(" "),D=y("totalEnd"),F=y("rrspEnd"),N=y("piEnd"),X=s?y("corpEnd"):"",M=y("tfsaEnd"),v=h(0).toFixed(1),f=h(a-1).toFixed(1),I=(g+p).toFixed(1),z=`${D} L ${f} ${I} L ${v} ${I} Z`;let J="";for(let x=0;x<=4;x++){const re=o/4*x,de=S(re);J+=`
      <line x1="${d}" y1="${de}" x2="${n-c}" y2="${de}" class="chart-grid-line" />
      <text x="${d-8}" y="${de+4}" text-anchor="end" class="chart-axis-label">${te(re)}</text>
    `}let W="";const Z=Math.max(1,Math.floor(a/6));for(let x=0;x<a;x+=Z){const re=r[x],de=h(x);W+=`<text x="${de}" y="${i-10}" text-anchor="middle" class="chart-axis-label">Age ${re.age}</text>`}return`
    <svg viewBox="0 0 ${n} ${i}" class="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--total-color)" stop-opacity="0.22" />
          <stop offset="90%" stop-color="var(--total-color)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${J}
      ${W}
      <path d="${z}" fill="url(#total-wealth-grad)" />
      <path d="${M}" class="chart-line tfsa" />
      <path d="${N}" class="chart-line nonreg" />
      ${s?`<path d="${X}" class="chart-line corp" />`:""}
      <path d="${F}" class="chart-line rrsp" />
      <path d="${D}" class="chart-line total" />
      <line id="hover-line" x1="0" y1="${g}" x2="0" y2="${g+p}" class="chart-hover-line" style="display:none;" />
    </svg>
  `}function gr(t,r,a){const o=document.getElementById("chart-container"),s=document.getElementById("svg-chart-el"),n=document.getElementById("hover-line"),i=document.getElementById("chart-tooltip");if(!o||!s||!n||!i)return;let d=null;const c=t.terminalBalanceAtRetirement.corp>0||t.history.some(m=>m.corpEnd>0);if(e.chartViewMode==="incomeStreams"){const m=t.history.filter(h=>h.age>=e.retireAge),p=m.length;if(p<=0)return;o.addEventListener("mousemove",h=>{const S=o.getBoundingClientRect(),y=h.clientX-S.left,D=y/S.width,F=70/800,N=20/800,X=1-F-N;if(D<F||D>1-N){n.style.display="none",i.style.display="none",d=null;return}const M=(D-F)/X,v=Math.min(p-1,Math.max(0,Math.round(M*(p-1)))),f=m[v];d=f.age;const I=70+v/Math.max(1,p-1)*710;n.setAttribute("x1",I.toString()),n.setAttribute("x2",I.toString()),n.style.display="block";const z=f.person2Age?`P1: Age ${f.age} · P2: Age ${f.person2Age}`:`Age ${f.age}`,J=f.cppIncome||0,W=f.oasIncome||0,Z=(f.dbPensionIncome||0)+(f.otherIncome||0),x=f.corpGrossDraw||0,re=J+W+Z+f.rrspGrossDraw+f.piGrossDraw+x+f.tfsaGrossDraw;i.innerHTML=`
        <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
          ${z} (Year ${f.age-e.retireAge+1} of Retirement)
        </div>
        <div style="color: #10b981; font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
          Net Spending: ${l(f.netSpendReceived)}
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem;">
          Total Gross Cash Inflows: ${l(re)}
        </div>
        ${J>0?`<div style="color:#3b82f6;">🏛️ CPP: <strong>+${l(J)}</strong></div>`:""}
        ${W>0?`<div style="color:#60a5fa;">🏛️ OAS: <strong>+${l(W)}</strong></div>`:""}
        ${Z>0?`<div style="color:#818cf8;">💼 DB/Other: <strong>+${l(Z)}</strong></div>`:""}
        ${f.rrspGrossDraw>0?`<div style="color:var(--rrsp-color);">🟣 RRSP Draw: <strong>+${l(f.rrspGrossDraw)}</strong></div>`:""}
        ${f.piGrossDraw>0?`<div style="color:var(--nonreg-color);">🟠 PI Draw: <strong>+${l(f.piGrossDraw)}</strong></div>`:""}
        ${x>0?`<div style="color:var(--corp-color);">🏢 Corp Div/CDA: <strong>+${l(x)}</strong></div>`:""}
        ${f.tfsaGrossDraw>0?`<div style="color:var(--tfsa-color);">🟢 TFSA Draw: <strong>+${l(f.tfsaGrossDraw)}</strong></div>`:""}
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;font-size:0.75rem;color:var(--text-muted);">
          Total Tax Paid: <strong style="color:#ef4444;">${l(f.totalTax)}</strong>
          ${f.isOASCapped?'<br/><span style="color:#10b981;">🛡️ Clawback Shield Active</span>':""}
          ${f.isRRIFForced?'<br/><span style="color:#f59e0b;">⚠️ Mandatory RRIF Min Active</span>':""}
          <div style="margin-top:0.25rem;color:#93c5fd;font-style:italic;">💡 Click to inspect this age in Blueprint below</div>
        </div>
      `;const de=Math.min(S.width-200,Math.max(10,y-100));i.style.left=`${de}px`,i.style.top="30px",i.style.display="block"}),o.addEventListener("click",()=>{d!==null&&a&&a(d)}),o.addEventListener("mouseleave",()=>{n.style.display="none",i.style.display="none",d=null});return}const g=t.history,u=g.length;u<=0||(o.addEventListener("mousemove",m=>{const p=o.getBoundingClientRect(),h=m.clientX-p.left,S=h/p.width,y=70/800,D=20/800,F=1-y-D;if(S<y||S>1-D){n.style.display="none",i.style.display="none";return}const N=(S-y)/F,X=Math.min(u-1,Math.max(0,Math.round(N*(u-1)))),M=70+X/Math.max(1,u-1)*710;n.setAttribute("x1",M.toString()),n.setAttribute("x2",M.toString()),n.style.display="block";const v=g[X],f=v.age>=e.retireAge,I=v.person2Age?`P1: Age ${v.age} · P2: Age ${v.person2Age}`:`Age ${v.age}`;i.innerHTML=`
      <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
        ${I} (${f?"Retirement":"Accumulating"})
      </div>
      <div style="color: var(--total-color); font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
        Total Wealth: ${l(v.totalEnd)}
      </div>
      <div style="color: var(--rrsp-color);">RRSP: <strong>${l(v.rrspEnd)}</strong></div>
      <div style="color: var(--nonreg-color);">PI: <strong>${l(v.piEnd)}</strong></div>
      ${c||v.corpEnd>0?`<div style="color: var(--corp-color);">Corp: <strong>${l(v.corpEnd)}</strong></div>`:""}
      <div style="color: var(--tfsa-color);">TFSA: <strong>${l(v.tfsaEnd)}</strong></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;">
        ${f?`
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Retirement Cashflow:</div>
          ${v.guaranteedGross>0?`
            <div style="color:#60a5fa;">🏛️ Pensions: <strong>+${l(v.guaranteedGross)} (${l(v.guaranteedNet)} net)</strong></div>
            <div style="color:var(--text-secondary);font-size:0.75rem;">Portfolio Bridge: <strong>${l(v.portfolioNetDraw)}</strong></div>`:""}
          <div style="color:var(--rrsp-color);">RRSP Draw: <strong>${v.rrspGrossDraw>0?l(v.rrspGrossDraw):"$0"}</strong></div>
          <div style="color:var(--nonreg-color);">PI Draw: <strong>${v.piGrossDraw>0?l(v.piGrossDraw):"$0"}</strong></div>
          ${c||v.corpGrossDraw>0?`<div style="color:var(--corp-color);">Corp Draw: <strong>${v.corpGrossDraw>0?l(v.corpGrossDraw):"$0"}</strong></div>`:""}
          <div style="color:var(--tfsa-color);">TFSA Draw: <strong>${v.tfsaGrossDraw>0?l(v.tfsaGrossDraw):"$0"}</strong></div>
          <div style="color:#10b981;font-weight:700;margin-top:0.2rem;">Net Spending: ${l(v.netSpendReceived)}</div>
          `:`
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Annual Savings Added:</div>
          <div style="color:var(--rrsp-color);">RRSP: <strong>+${l(v.rrspContrib)}</strong></div>
          <div style="color:var(--nonreg-color);">PI: <strong>+${l(v.piContrib)}</strong></div>
          ${v.corpContrib>0?`<div style="color:var(--corp-color);">Corp: <strong>+${l(v.corpContrib)}</strong></div>`:""}
          ${v.tfsaContrib>0?`<div style="color:var(--tfsa-color);">TFSA: <strong>+${l(v.tfsaContrib)}</strong></div>`:""}
          `}
      </div>
    `;const z=Math.min(p.width-180,Math.max(10,h-90));i.style.left=`${z}px`,i.style.top="30px",i.style.display="block"}),o.addEventListener("mouseleave",()=>{n.style.display="none",i.style.display="none"}))}function mr(t){const r=t.history.filter(M=>M.age>=e.retireAge),a=r.length;if(a===0)return'<p style="padding:2rem;text-align:center;color:var(--text-muted);">No retirement data available for current settings.</p>';let o=e.retireNetSpending;for(const M of r){const v=(M.cppIncome||0)+(M.oasIncome||0)+(M.dbPensionIncome||0)+(M.otherIncome||0)+M.rrspGrossDraw+M.piGrossDraw+(M.corpGrossDraw||0)+M.tfsaGrossDraw;v>o&&(o=v)}o=Math.max(o,1e4)*1.15;const s=800,n=300,i=70,d=20,c=25,g=35,u=s-i-d,m=n-c-g,p=M=>c+m-M/o*m,h=Math.max(4,Math.min(22,u/a*.72));let S="";for(let M=0;M<=4;M++){const v=o/4*M,f=p(v);S+=`
      <line x1="${i}" y1="${f.toFixed(1)}" x2="${(s-d).toFixed(1)}" y2="${f.toFixed(1)}" class="chart-grid-line" />
      <text x="${(i-8).toFixed(1)}" y="${(f+4).toFixed(1)}" text-anchor="end" class="chart-axis-label">${te(v)}</text>
    `}const y=p(e.retireNetSpending),D=`
    <line x1="${i}" y1="${y.toFixed(1)}" x2="${(s-d).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4" />
    <text x="${(s-d).toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="end" fill="#10b981" font-size="11" font-weight="700">Target Net: ${te(e.retireNetSpending)}</text>
  `;let F="",N="";const X=Math.max(1,Math.floor(a/7));for(let M=0;M<a;M++){const v=r[M],f=i+M/Math.max(1,a-1)*u,I=f-h/2;(M%X===0||M===a-1)&&(N+=`<text x="${f.toFixed(1)}" y="${n-10}" text-anchor="middle" class="chart-axis-label">Age ${v.age}</text>`);const z=[{val:v.cppIncome||0,color:"#3b82f6"},{val:v.oasIncome||0,color:"#60a5fa"},{val:(v.dbPensionIncome||0)+(v.otherIncome||0),color:"#818cf8"},{val:v.rrspGrossDraw||0,color:"var(--rrsp-color)"},{val:v.piGrossDraw||0,color:"var(--nonreg-color)"},{val:v.corpGrossDraw||0,color:"var(--corp-color)"},{val:v.tfsaGrossDraw||0,color:"var(--tfsa-color)"}];let J=0;for(const W of z){if(W.val<=0)continue;const Z=W.val/o*m,x=p(J+W.val);F+=`<rect x="${I.toFixed(1)}" y="${x.toFixed(1)}" width="${h.toFixed(1)}" height="${Z.toFixed(1)}" fill="${W.color}" rx="1" opacity="0.9" />`,J+=W.val}}return`
    <svg viewBox="0 0 ${s} ${n}" class="svg-chart" id="svg-chart-el">
      ${S}
      ${D}
      ${F}
      ${N}
      <line id="hover-line" x1="0" y1="${c}" x2="0" y2="${c+m}" class="chart-hover-line" style="display:none;" />
    </svg>
  `}function hr(t,r,a){const o=Math.max(18,e.retireAge-e.yearsAccumulation),s=Math.max(18,e.person2RetireAge-e.yearsAccumulation),n=t.person1RrspSaving??e.p1RrspSaving,i=r?t.person2RrspSaving??e.p2RrspSaving:0,d=t.piSaving??e.piSaving,c=t.corpSaving??e.corpSaving,g=t.annualTaxRefund??Math.round(n*e.workTaxRate+i*e.person2WorkTaxRate),u=t.terminalBalanceAtRetirement;return`
    <article class="advisor-card">
      <div class="advisor-title">
        <span>💡</span> ${r?"Your Custom 2-Person Household Action Plan":"Your Custom Tailored Strategy Action Plan"}
      </div>
      <div class="advisor-steps">
        <div class="advisor-step">
          <div class="step-num">1</div>
          <div class="step-content">
            ${e.startAtRetirement?r?`<strong>Starting Point at Retirement (Ages ${e.retireAge} & ${e.person2RetireAge}):</strong> Your household enters retirement with <strong>${l(u.total)}</strong> combined wealth: <strong>${l(u.person1Rrsp??Math.round(u.rrsp*.5))}</strong> in Person 1 RRSP, <strong>${l(u.person2Rrsp??Math.round(u.rrsp*.5))}</strong> in Person 2 RRSP, <strong>${l(u.pi)}</strong> in Personal Account (PI)${u.corp>0?`, <strong>${l(u.corp)}</strong> in your 2-Person Co-Owned Corp (CCPC)`:""}, and <strong>${l(u.tfsa)}</strong> in Dual TFSAs.`:`<strong>Starting Point at Retirement (Age ${e.retireAge}):</strong> You enter retirement with <strong>${l(u.total)}</strong> total wealth, broken down into <strong>${l(u.rrsp)}</strong> in RRSP/RRIF, <strong>${l(u.pi)}</strong> in your Personal Account (PI)${u.corp>0?`, <strong>${l(u.corp)}</strong> in your Private Corp`:""}, and <strong>${l(u.tfsa)}</strong> in your TFSA.`:r?`<strong>Working Years (Ages ${o} & ${s}):</strong> Save <strong>${l(e.annualSaving)}/year combined</strong>. Contribute <strong>${l(n)}</strong> to Person 1 RRSP, <strong>${l(i)}</strong> to Person 2 RRSP, <strong>${l(d)}</strong> to Personal (PI)${c>0?`, and retain <strong>${l(c)}</strong> inside your <strong>2-Person Co-Owned Corp (CCPC)</strong>`:""}. Reinvest your <strong>${l(g)} refund into ${e.reinvestRefundTo==="tfsa"?"both TFSAs ($7k each)":e.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`:`<strong>While Working (Next ${e.yearsAccumulation} Years):</strong> Contribute <strong>${l(n)}/year to your RRSP</strong>, <strong>${l(d)}/year to Personal (PI)</strong>${c>0?`, and retain <strong>${l(c)}/year inside your Private Corp</strong>`:""}. Reinvest your annual <strong>${l(g)} tax refund</strong> into <strong>${e.reinvestRefundTo==="tfsa"?"TFSA":e.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">2</div>
          <div class="step-content">
            ${r?`<strong>At Retirement (Ages ${e.retireAge} & ${e.person2RetireAge}):</strong> Use the <strong>"${t.name}"</strong> sequence. File <strong>CRA Form T1032</strong> to split RRIF income 50/50${a?", pay out <strong>100% tax-free Capital Dividend Account (CDA)</strong> balances from corporate capital gains, and split CCPC dividends 50/50":""}. This gives your household <strong>$182,000 of combined room</strong> before triggering OAS clawback.`:`<strong>At Retirement (Age ${e.retireAge} to 71):</strong> Follow the <strong>"${t.name}"</strong> decumulation rule. Draw from RRSP up to the bracket cap while bridging with your Personal Account${a?", Private Corp (CDA + dividends),":""} and TFSA.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">3</div>
          <div class="step-content">
            ${r?`<strong>At Age 71+:</strong> Convert RRSPs to RRIFs. <em>CRA Pro-Tip:</em> Base your mandatory RRIF minimum withdrawals on the <strong>younger spouse (Age ${Math.min(e.retireAge,e.person2RetireAge)})</strong> to legally minimize forced taxable withdrawals!`:`<strong>At Age 71+:</strong> Convert RRSP to a RRIF. Withdraw CRA mandated minimums and use your TFSA/PI${a?"/Corp CDA":""} as a tax-efficient buffer to avoid crossing into higher tax brackets and losing your OAS pension.`}
          </div>
        </div>
      </div>
    </article>
  `}function vr(t,r){const a=t.terminalBalanceAtRetirement.corp>0||t.history.some(s=>s.corpEnd>0||s.corpContrib>0||s.corpGrossDraw>0),o=t.history.map(s=>{const n=s.age>=e.retireAge;return`
        <tr>
          <td class="td-left" style="font-weight:600;">
            <span class="badge-age">${r&&s.person2Age?`P1: Age ${s.age} · P2: Age ${s.person2Age}`:`Age ${s.age}`}</span>
            ${s.isIncomeSplit?'<span class="badge-rrif-min" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4);">Split</span>':""}
            ${s.notes?`<span class="badge-rrif-min">${s.notes}</span>`:""}
          </td>
          <td class="td-highlight-rrsp">${l(s.rrspEnd)}</td>
          <td class="td-highlight-nonreg">${l(s.piEnd)}</td>
          ${a?`<td class="td-highlight-corp">${l(s.corpEnd)}</td>`:""}
          <td style="color:var(--tfsa-color);">${l(s.tfsaEnd)}</td>
          <td style="font-weight:700;color:var(--total-color);">${l(s.totalEnd)}</td>
          ${e.includeOtherIncome?`<td style="color:#60a5fa;font-weight:600;">${n&&s.guaranteedGross>0?l(s.guaranteedGross):"—"}</td>`:""}
          <td style="color:var(--rrsp-color);font-weight:600;">
            ${n?s.rrspGrossDraw>0?l(s.rrspGrossDraw):"—":s.rrspContrib>0?`+${l(s.rrspContrib)}`:"—"}
          </td>
          <td style="color:var(--nonreg-color);font-weight:600;">
            ${n?s.piGrossDraw>0?l(s.piGrossDraw):"—":s.piContrib>0?`+${l(s.piContrib)}`:"—"}
          </td>
          ${a?`<td style="color:var(--corp-color);font-weight:600;">
                  ${n?s.corpGrossDraw>0?l(s.corpGrossDraw):"—":s.corpContrib>0?`+${l(s.corpContrib)}`:"—"}
                </td>`:""}
          <td style="color:var(--tfsa-color);font-weight:600;">
            ${n?s.tfsaGrossDraw>0?l(s.tfsaGrossDraw):"—":s.tfsaContrib>0?`+${l(s.tfsaContrib)}`:"—"}
          </td>
          <td style="color:${s.totalTax>0?"#f87171":"var(--text-muted)"};">${l(s.totalTax)}</td>
          <td style="color:#10b981;font-weight:700;">
            ${n?l(s.netSpendReceived):"Accumulating"}
          </td>
        </tr>
      `}).join("");return`
    <div class="table-responsive">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="td-left">${r?"Couple Ages & Strategy":"Age & Status"}</th>
            <th>RRSP Balance</th>
            <th>Personal (PI)</th>
            ${a?`<th style="color:var(--corp-color);">${r?"Co-Owned Corp":"Corp Balance"}</th>`:""}
            <th>TFSA Balance</th>
            <th>Total Wealth</th>
            ${e.includeOtherIncome?'<th style="color:#60a5fa;">Guaranteed Inc</th>':""}
            <th style="color:var(--rrsp-color);">RRSP Draw</th>
            <th style="color:var(--nonreg-color);">PI Draw</th>
            ${a?'<th style="color:var(--corp-color);">Corp Draw</th>':""}
            <th style="color:var(--tfsa-color);">TFSA Draw</th>
            <th>Tax Paid</th>
            <th style="color:#10b981;">Net Spend</th>
          </tr>
        </thead>
        <tbody>
          ${o}
        </tbody>
      </table>
    </div>
  `}function Sr(t,r){return`
    <div class="ledger-card">
      <div class="ledger-toggle-row" id="ledger-toggle" role="button" tabindex="0">
        <h2 class="panel-title" style="margin-bottom: 0;">
          📊 Year-by-Year Multi-Account Cash Flow ${r?"(2-Person Breakdown)":""}
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
            ${e.ledgerOpen?"▲ Click to collapse":"▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>
      ${e.ledgerOpen?vr(t,r):""}
    </div>
  `}function fr(t){document.getElementById("ledger-toggle")?.addEventListener("click",()=>{e.ledgerOpen=!e.ledgerOpen,t.updateResultsOnly()})}function At({segments:t,barHeightPx:r,wrapperStyle:a}){const o=t.map(n=>n.hiddenWhenZero&&n.isZero&&!n.segId?"":`<div${n.segId?` id="${n.segId}"`:""} class="alloc-segment ${n.variant}" style="width: ${n.pct}%;"${n.title?` title="${n.title}"`:""}></div>`).join(""),s=t.map(n=>{if(n.hiddenWhenZero&&n.isZero&&!n.lblId)return"";const i=n.hiddenWhenZero&&n.isZero?"display:none;":"",d=n.labelWeight?`font-weight:${n.labelWeight};`:"";return`<span${n.lblId?` id="${n.lblId}"`:""} style="color:${n.labelColor};${d}${i}">${n.labelHtml}</span>`}).join("");return`
    <div class="allocation-bar-wrapper"${a?` style="${a}"`:""}>
      <div class="allocation-bar"${r?` style="height:${r}px;"`:""}>
        ${o}
      </div>
      <div class="alloc-labels-row">
        ${s}
      </div>
    </div>
  `}function Rr(t,r){const a=t.terminalBalanceAtRetirement,o=Math.max(1,a.total),s=a.person1Rrsp??(r?Math.round(a.rrsp*.5):a.rrsp),n=r?a.person2Rrsp??Math.max(0,a.rrsp-s):0,i=Math.round(s/o*100),d=r?Math.round(n/o*100):0,c=Math.round(a.rrsp/o*100),g=Math.round(a.pi/o*100),u=Math.round(a.corp/o*100),m=Math.max(0,100-(r?i+d:c)-g-u),p=a.piCostBasis??Math.round(a.pi*.5),h=a.piUnrealizedGain??Math.max(0,a.pi-p),S=a.corpCostBasis??Math.round(a.corp*.5),y=a.corpUnrealizedGain??Math.max(0,a.corp-S),D=Math.round(y*.5),F=a.tfsa+p+D,N=[{variant:"p1",pct:r?i:c,title:`${r?"Person 1 RRSP":"RRSP"}: ${l(s)}`,labelHtml:`🟣 ${r?`P1 RRSP: ${l(s)} (${i}%)`:`RRSP/RRIF: ${l(a.rrsp)} (${c}%)`}`,labelColor:"var(--rrsp-color)",labelWeight:"600"},...r?[{variant:"p2",pct:d,title:`Person 2 RRSP: ${l(n)}`,labelHtml:`🟣 P2 RRSP: ${l(n)} (${d}%)`,labelColor:"#8b5cf6",labelWeight:"600"}]:[],{variant:"pi",pct:g,title:`Personal Account (PI): ${l(a.pi)}`,labelHtml:`🟠 Personal (PI): ${l(a.pi)} (${g}%)`,labelColor:"var(--nonreg-color)",labelWeight:"600"},{variant:"corp",pct:u,title:`Co-Owned Corp (CCPC): ${l(a.corp)}`,labelHtml:`🏢 ${r?"Co-Owned Corp":"Corp"}: ${l(a.corp)} (${u}%)`,labelColor:"var(--corp-color)",labelWeight:"600",hiddenWhenZero:!0,isZero:a.corp<=0},{variant:"tfsa",pct:m,title:`TFSA: ${l(a.tfsa)}`,labelHtml:`🟢 ${r?"Dual TFSAs":"TFSA"}: ${l(a.tfsa)} (${m}%)`,labelColor:"var(--tfsa-color)",labelWeight:"600"}];return`
    <article class="withdrawal-blueprint-card" style="margin-top:0;margin-bottom:0.25rem;">
      <div class="blueprint-header" style="margin-bottom:0.75rem;">
        <div>
          <div class="blueprint-title">
            <span>🏦</span> Starting Point at Retirement (Age ${e.retireAge}${r?` & ${e.person2RetireAge}`:""}) — Asset Breakdown
          </div>
          <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:0.15rem;">
            ${e.startAtRetirement?"Directly configured retirement nest egg & account allocation":`Projected portfolio accumulated after ${e.yearsAccumulation} years of saving ${l(e.annualSaving)}/yr`}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <span class="badge-recommended" style="background:rgba(56,189,248,0.18);color:var(--total-color);border:1px solid rgba(56,189,248,0.4);">
            Total Nest Egg: ${l(a.total)}
          </span>
          ${e.startAtRetirement?`<button type="button" id="btn-switch-to-accum" class="btn-toggle-expand" style="padding:0.25rem 0.65rem;">
                  📈 Switch to Working Years
                </button>`:`<button type="button" id="btn-customize-retire-breakdown" class="btn-toggle-expand" style="border-color:rgba(99,102,241,0.45);color:var(--rrsp-color);font-weight:600;padding:0.25rem 0.65rem;">
                  ✏️ Customize Starting Assets
                </button>`}
        </div>
      </div>

      ${At({segments:N,barHeightPx:14,wrapperStyle:"margin:0.35rem 0 0.85rem 0;"})}

      <div class="blueprint-grid" style="margin-bottom:0;">
        ${Ce({variant:"rrsp",icon:"🟣",title:`${r?"Person 1 RRSP / RRIF":"RRSP / RRIF"} (${r?i:c}%)`,titleColor:"var(--rrsp-color)",amountText:l(r?s:a.rrsp),noteText:"100% taxable on withdrawal · Converts to RRIF at 71"})}
        ${r?Ce({variant:"rrsp",icon:"🟣",title:`Person 2 RRSP / Spousal (${d}%)`,titleColor:"#8b5cf6",amountText:l(n),noteText:"Eligible for 50/50 CRA Form T1032 pension splitting",customStyle:"border-left-color:#8b5cf6;"}):""}
        ${Ce({variant:"pi",icon:"🟠",title:`Personal Account (PI) (${g}%)`,titleColor:"var(--nonreg-color)",amountText:l(a.pi),noteText:`ACB Principal: ${l(p)} · Cap Gain: ${l(h)}`})}
        ${a.corp>0?Ce({variant:"corp",icon:"🏢",title:`${r?"2-Person Co-Owned Corp":"Private Corp (CCPC)"} (${u}%)`,titleColor:"var(--corp-color)",amountText:l(a.corp),noteText:`Retained Basis: ${l(S)} · Tax-Free CDA: ${l(D)}`}):""}
        ${Ce({variant:"tfsa",icon:"🟢",title:`${r?"Dual TFSAs":"TFSA"} (${m}%)`,titleColor:"var(--tfsa-color)",amountText:l(a.tfsa),noteText:`100% tax-free · Total Tax-Free Cushion: ${l(F)}`})}
      </div>
    </article>
  `}function br(t,r,a){document.getElementById("btn-customize-retire-breakdown")?.addEventListener("click",()=>{const o=t.terminalBalanceAtRetirement;r?(e.retireStartP1Rrsp=o.person1Rrsp??Math.round(o.rrsp*.5),e.retireStartP2Rrsp=o.person2Rrsp??Math.max(0,o.rrsp-e.retireStartP1Rrsp)):(e.retireStartP1Rrsp=o.rrsp,e.retireStartP2Rrsp=0),e.retireStartPi=o.pi,o.pi>0&&o.piUnrealizedGain!==void 0&&(e.retireStartPiGainPct=Math.min(95,Math.max(0,Math.round(o.piUnrealizedGain/o.pi*100/5)*5))),e.retireStartCorp=o.corp,o.corp>0&&o.corpUnrealizedGain!==void 0&&(e.retireStartCorpGainPct=Math.min(95,Math.max(0,Math.round(o.corpUnrealizedGain/o.corp*100/5)*5))),e.retireStartTfsa=o.tfsa,e.retireStartTotal=o.total,e.startAtRetirement=!0,a.renderControlsPanel(),a.updateResultsOnly();const s=document.getElementById("retire-start-assets-card");s&&s.scrollIntoView({behavior:"smooth",block:"center"})}),document.getElementById("btn-switch-to-accum")?.addEventListener("click",()=>{e.startAtRetirement=!1,a.renderControlsPanel(),a.updateResultsOnly()})}function yr(t,r,a){return`
    <section>
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.6rem;color:var(--text-primary);">
        Choose Your Decumulation Sequencing Strategy:
      </h3>
      <div class="strat-cards-grid">
        ${[{id:"oasShield",title:`🛡️ ${r?"Dual OAS Shield":"OAS Shield & Smoothing"}`,desc:r?"Splits RRIF & Corp income 50/50 and shields up to $182k combined from OAS clawback.":"Caps taxable draw below the ~$91k clawback line; bridges shortfall from PI/Corp/TFSA."},{id:"rrspMeltdown",title:"🔥 Early RRSP Meltdown",desc:"Burns down RRSP aggressively between retirement and 71 to crush the future RRIF tax bomb."},{id:"taxableFirst",title:`⏳ Taxable (PI${a?" + Corp":""}) First`,desc:`Spends Personal (PI)${a?" & Co-Owned Corp":""} first, allowing RRSP & TFSA shelters to compound.`},{id:"proRata",title:"⚖️ Proportional Balanced Draw",desc:`Draws simultaneously across RRSP, PI${a?", Corp,":""} and TFSA in proportion to account weights.`}].map(n=>`
      <div class="strat-card ${e.decumStrategy===n.id?"active":""}" data-strat="${n.id}">
        <div class="strat-card-title">${n.title} ${t===n.id?'<span class="badge-recommended">Optimal</span>':""}</div>
        <p class="strat-card-desc">${n.desc}</p>
      </div>
    `).join("")}
      </div>
    </section>
  `}function xr(t,r,a){const o=Math.min(...t.map(n=>n.totalLifetimeRetirementTax)),s=t.map(n=>{const i=n.id===e.decumStrategy,d=n.id===r;return`
        <tr style="${i?"background:rgba(99,102,241,0.1);":""}">
          <td class="td-left" style="font-weight:700;">
            ${n.name} ${d?'<span class="badge-recommended">Top Pick</span>':""}
          </td>
          <td style="color:#10b981;font-weight:700;">${n.isPerpetual?"50+ Yrs":`${n.longevityYears} Yrs`}</td>
          <td>${n.isPerpetual?"Age 100+":`Age ${n.depletionAge}`}</td>
          <td style="color:${n.totalLifetimeRetirementTax===o?"#10b981":"var(--text-primary)"};">
            ${l(n.totalLifetimeRetirementTax)}
          </td>
          <td style="color:${n.totalOASClawbackPaid===0?"#10b981":"#f59e0b"};">
            ${l(n.totalOASClawbackPaid)}
          </td>
          <td>${l(n.estateValueAtAge85)}</td>
        </tr>
      `}).join("");return`
    <article class="scorecard-card">
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.85rem;color:var(--text-primary);">
        📊 Strategy Comparison Scorecard ${a?"(Household Combined)":""}
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
            ${s}
          </tbody>
        </table>
      </div>
    </article>
  `}function Pr(t){document.querySelectorAll(".strat-card").forEach(r=>{r.addEventListener("click",()=>{const a=r.dataset.strat;a&&a!==e.decumStrategy&&(e.decumStrategy=a,t.updateResultsOnly())})})}function zt(t,r,a,o=!1){const s=t.cppIncome||0,n=t.oasIncome||0,i=(t.dbPensionIncome||0)+(t.otherIncome||0),d=t.rrspGrossDraw||0,c=t.piGrossDraw||0,g=t.corpGrossDraw||0,u=t.tfsaGrossDraw||0,m=s+n+i+d+c+g+u,p=Math.max(1,m),h=Math.round(s/p*100),S=Math.round(n/p*100),y=Math.round(i/p*100),D=Math.round(d/p*100),F=Math.round(c/p*100),N=Math.round(g/p*100),X=Math.max(0,100-h-S-y-D-F-N),M=o||g>0||t.corpStart>0,v=[{variant:"cpp",label:"CPP",fullTitle:"CPP",amount:s,pct:h},{variant:"oas",label:"OAS",fullTitle:"OAS",amount:n,pct:S},{variant:"db",label:"DB/Other",fullTitle:"DB Pension/Other",amount:i,pct:y},{variant:"rrsp",label:"RRSP",fullTitle:"RRSP/RRIF",amount:d,pct:D},{variant:"pi",label:"PI",fullTitle:"Personal (PI)",amount:c,pct:F},{variant:"corp",label:"Corp",fullTitle:"Co-Owned Corp (CDA + Div)",amount:g,pct:N},{variant:"tfsa",label:"TFSA",fullTitle:"TFSA",amount:u,pct:X}].filter(f=>f.amount>0);return`
    <!-- Multi-Segment Visual Income Breakdown Bar -->
    <div class="income-breakdown-bar-wrapper">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.25rem;">
        <span>Gross Income Composition (Total: ${l(m)})</span>
        <span style="color:#10b981;">Net Received: ${l(t.netSpendReceived)} (Tax: ${l(t.totalTax)})</span>
      </div>
      <div class="income-breakdown-bar">
        ${v.map(f=>`<div class="income-bar-seg ${f.variant}" style="width:${f.pct}%;" title="${f.fullTitle}: ${l(f.amount)} (${f.pct}%)"></div>`).join("")}
      </div>
      <div class="income-legend-row">
        ${v.map(f=>`<div class="income-legend-item"><span class="income-legend-dot ${f.variant}"></span> ${f.label}: ${l(f.amount)} (${f.pct}%)</div>`).join("")}
      </div>
    </div>

    ${t.guaranteedGross>0?`
      <div class="income-stack-container">
        <div class="income-stack-title">
          <span>🏛️</span> Full Retirement Income Stack at Age ${r}
        </div>
        <div class="income-stack-rows">
          <div class="income-stack-row">
            <span>1. Guaranteed Pensions & Other Sources (Gross):</span>
            <span style="font-weight:700;color:#60a5fa;">+${l(t.guaranteedGross)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span style="color:var(--text-muted);padding-left:1rem;">↳ CPP: ${l(s)} · OAS: ${l(n)}${i>0?` · Pension/Other: ${l(i)}`:""}</span>
            <span style="color:#93c5fd;font-weight:600;">Net: +${l(t.guaranteedNet)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span>2. Investment Portfolio Net Draw Needed:</span>
            <span style="font-weight:700;color:#34d399;">+${l(t.portfolioNetDraw)}/yr</span>
          </div>
          <div class="income-stack-row total">
            <span>Total Net Spending Cash Delivered:</span>
            <span>${l(t.netSpendReceived)}/yr net (Goal: ${l(e.retireNetSpending)})</span>
          </div>
        </div>
      </div>
      `:`
      <div class="pension-cta-callout">
        <div class="pension-cta-info">
          <span style="font-size:1.15rem;">🛡️</span>
          <span><strong>Have a Pension, CPP, or OAS?</strong> Add them to factor in guaranteed lifetime income and reduce required investment portfolio draw.</span>
        </div>
        <button type="button" class="btn-enable-pensions-inline" id="btn-enable-pensions-inline">
          + Add Pensions & Income
        </button>
      </div>
      `}

    <div class="blueprint-grid">
      ${Ce({variant:"rrsp",icon:"🟣",title:a?"Joint RRSP / RRIF":"RRSP / RRIF",titleColor:"var(--rrsp-color)",amountText:l(t.rrspGrossDraw),noteText:t.isRRIFForced?"Mandatory RRIF Min Active":t.rrspGrossDraw>0?"Taxable graduated bracket draw":"$0 needed (deferred)"})}
      ${Ce({variant:"pi",icon:"🟠",title:"Personal Account (PI)",titleColor:"var(--nonreg-color)",amountText:l(t.piGrossDraw),noteText:t.piGrossDraw>0?"50% capital gains inclusion":"$0 needed this year"})}
      ${M?Ce({variant:"corp",icon:"🏢",title:a?"Co-Owned Corp":"Private Corp",titleColor:"var(--corp-color)",amountText:l(g),noteText:g>0?a?"Tax-free CDA + 50/50 split divs":"Tax-free CDA + CCPC dividends":"$0 distributed this year"}):""}
      ${Ce({variant:"tfsa",icon:"🟢",title:a?"Dual TFSAs":"TFSA",titleColor:"var(--tfsa-color)",amountText:l(t.tfsaGrossDraw),noteText:t.tfsaGrossDraw>0?"100% tax-free buffer":"Kept compounding tax-free"})}
      ${Ce({variant:"net",icon:"💰",title:"Net Cash Received",titleColor:"#10b981",amountText:l(t.netSpendReceived),amountColor:"#10b981",noteText:t.guaranteedGross>0?`${l(t.guaranteedNet)} pensions + ${l(t.portfolioNetDraw)} portfolio`:`After paying ${l(t.totalTax)} in tax`})}
    </div>
  `}function $r(t,r,a=!1){const o=a?r?", <strong>2-Person Co-Owned Corp</strong> (50% tax-free CDA + 50/50 split dividends with 1.15× gross-up check),":", <strong>Private Corp</strong> (50% tax-free CDA + CCPC dividends),":"";return t==="oasShield"?r?`<strong>The OAS Shield Formula:</strong> Withdraw from your Joint RRSP/RRIF up to <strong>$176,000/yr combined</strong> ($88,000 per spouse via CRA Form T1032 pension income splitting). This keeps both spouses below the ~$91,000 OAS clawback line. Shortfall is bridged from your <strong>Personal Account (PI)</strong>${o} and your <strong>TFSA</strong> (100% tax-free).`:`<strong>The OAS Shield Formula:</strong> Withdraw from RRSP up to <strong>$88,000/yr</strong> to stay just below the ~$91,000 OAS clawback line. Shortfalls are bridged from your <strong>Personal Account (PI)</strong>${o} and your <strong>TFSA</strong> (tax-free).`:t==="rrspMeltdown"?r?`<strong>Early RRSP Meltdown Formula:</strong> Draw aggressively from RRSPs (up to <strong>$180,000/yr combined</strong>) between retirement and age 71. This shrinks your future RRIF balance to dismantle the "tax bomb" when CRA mandatory minimums take effect at age 71. If after-tax proceeds are below your ${l(e.retireNetSpending)} target, take the remaining from PI${a?", Co-Owned Corp,":""} then TFSA.`:`<strong>Early RRSP Meltdown Formula:</strong> Draw up to <strong>$105,000/yr</strong> from your RRSP before age 71 to burn down the tax-deferred balance before forced CRA minimums begin. Supplement with PI${a?", Corp,":""} and TFSA if needed.`:t==="taxableFirst"?`<strong>Taxable (PI${a?" & Corp":""}) First Formula:</strong> Withdraw spending from your <strong>Personal Investment (PI)</strong>${a?" and <strong>Co-Owned Private Corp (CDA + dividends)</strong>":""} first until exhausted. During this time, take <strong>$0 from RRSP</strong> (until mandatory RRIF minimums start at age 71) and <strong>$0 from TFSA</strong>, allowing tax-sheltered accounts to compound untouched.`:`<strong>Proportional Balanced Draw Formula:</strong> Withdraw simultaneously across RRSP, Personal Account${a?", Co-Owned Corp,":""} and TFSA based on their current balance weights. Each account pays its proportional share toward your ${l(e.retireNetSpending)} after-tax spending goal.`}function Mr(t,r,a){const o=t.history.filter(g=>g.age>=e.retireAge),s=e.retireAge,n=o.length>0?o[o.length-1].age:e.retireAge;let i=e.blueprintSelectedAge??e.retireAge;i<s&&(i=s),i>n&&(i=n),e.blueprintSelectedAge=i;const d=o.find(g=>g.age===i)||o[0]||t.history[0],c=i-e.retireAge+1;return`
    <article class="withdrawal-blueprint-card">
      <div class="blueprint-header">
        <div class="blueprint-title">
          <span>🎯</span> Retirement Income & Withdrawal Blueprint (${t.name})
        </div>
        <span class="badge-recommended">Target Spend: ${l(e.retireNetSpending)}/yr Net</span>
      </div>

      <!-- Interactive Age Explorer -->
      <div class="blueprint-age-explorer">
        <div class="blueprint-age-label-row">
          <span class="blueprint-age-title">📅 Inspect Cashflow Mix at Age:</span>
          <span class="blueprint-age-display" id="disp-blueprint-age">
            Age ${i} (Year ${c} of Retirement)${r&&d.person2Age?` · Spouse Age ${d.person2Age}`:""}
          </span>
        </div>
        <div class="blueprint-age-controls">
          <input type="range" id="slider-blueprint-age" min="${s}" max="${n}" step="1" value="${i}">
          <div class="blueprint-age-chips">
            <button type="button" class="age-chip ${i===s?"active":""}" data-age="${s}">
              Age ${s} (Retire Start)
            </button>
            ${n>=71?`<button type="button" class="age-chip ${i===71?"active":""}" data-age="71">Age 71 (RRIF Min Rule)</button>`:""}
            ${n>=75?`<button type="button" class="age-chip ${i===75?"active":""}" data-age="75">Age 75 (OAS +10% Boost)</button>`:""}
            ${n>=85?`<button type="button" class="age-chip ${i===85?"active":""}" data-age="85">Age 85 (Late Life)</button>`:""}
          </div>
        </div>
      </div>

      <!-- Dynamic Details Container (updates during slider scrubbing) -->
      <div id="blueprint-dynamic-details">
        ${zt(d,i,r,a)}
      </div>

      <div class="blueprint-explanation">
        ${$r(e.decumStrategy,r,a)}
      </div>
    </article>
  `}function Wt(t){document.getElementById("btn-enable-pensions-inline")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.otherIncomeExpanded=!0,t.renderControlsPanel(),t.updateResultsOnly();const r=document.getElementById("pension-income-card");r&&(r.scrollIntoView({behavior:"smooth",block:"center"}),r.classList.add("highlight-pulse"),setTimeout(()=>r.classList.remove("highlight-pulse"),2e3))})}function Pt(t,r,a,o){const s=r.history.filter(S=>S.age>=e.retireAge);if(s.length===0)return;const n=e.retireAge,i=s[s.length-1].age,d=Math.min(i,Math.max(n,t));e.blueprintSelectedAge=d;const c=s.find(S=>S.age===d)||s[0],g=d-e.retireAge+1,u=document.getElementById("disp-blueprint-age");u&&(u.textContent=`Age ${d} (Year ${g} of Retirement)${a&&c.person2Age?` · Spouse Age ${c.person2Age}`:""}`);const m=document.getElementById("slider-blueprint-age");m&&parseInt(m.value,10)!==d&&(m.value=d.toString()),document.querySelectorAll(".age-chip").forEach(S=>{const y=parseInt(S.dataset.age||"",10);S.classList.toggle("active",y===d)});const p=r.terminalBalanceAtRetirement.corp>0||r.history.some(S=>S.corpEnd>0),h=document.getElementById("blueprint-dynamic-details");h&&(h.innerHTML=zt(c,d,a,p),o&&Wt(o))}function Ar(t,r,a){document.getElementById("slider-blueprint-age")?.addEventListener("input",s=>{const n=parseInt(s.target.value,10);isNaN(n)||Pt(n,t,r,a)}),document.querySelectorAll(".age-chip").forEach(s=>{s.addEventListener("click",()=>{const n=parseInt(s.dataset.age||"",10);isNaN(n)||Pt(n,t,r,a)})}),Wt(a)}function Cr(t,r,a){const o=Math.max(18,e.retireAge-e.yearsAccumulation);return`
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text-primary);margin-bottom:0.2rem;">
            ${e.chartViewMode==="incomeStreams"?`Annual Retirement Income & Cashflow Breakdown (Ages ${e.retireAge} to 95+)`:`Multi-Account Balance Lifespan Curve (Ages ${e.startAtRetirement?e.retireAge:o} to 95+)`}
          </h3>
          <span style="font-size:0.75rem;color:var(--text-muted);">
            ${e.chartViewMode==="incomeStreams"?"Stacked annual cashflow received from pensions, investments, corporate dividends, and government programs":"Projected investment balances compounding and decumulating over your lifespan"}
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
          <div class="chart-view-toggle">
            <button type="button" class="chart-view-btn ${e.chartViewMode==="balances"?"active":""}" id="btn-chart-balances">
              💰 Asset Balances
            </button>
            <button type="button" class="chart-view-btn ${e.chartViewMode==="incomeStreams"?"active":""}" id="btn-chart-income">
              📊 Annual Income Streams
            </button>
          </div>
        </div>
      </div>
      <div class="chart-legend" style="margin-top:0.5rem;padding:0 0.5rem;">
        ${e.chartViewMode==="incomeStreams"?`
          <div class="legend-item"><span class="income-legend-dot cpp"></span> CPP</div>
          <div class="legend-item"><span class="income-legend-dot oas"></span> OAS</div>
          <div class="legend-item"><span class="income-legend-dot db"></span> DB/Other</div>
          <div class="legend-item"><span class="income-legend-dot rrsp"></span> RRSP/RRIF Draw</div>
          <div class="legend-item"><span class="income-legend-dot pi"></span> Personal (PI) Draw</div>
          ${a?`<div class="legend-item"><span class="income-legend-dot corp"></span> ${r?"Co-Owned Corp Draw":"Corp Draw"}</div>`:""}
          <div class="legend-item"><span class="income-legend-dot tfsa"></span> TFSA Draw</div>
          <div class="legend-item"><span style="width:12px;height:2px;background:#10b981;display:inline-block;border-top:1px dashed #10b981;"></span> Target Net Spend</div>
          `:`
          <div class="legend-item"><span class="legend-dot total"></span> <strong>Total Wealth</strong></div>
          <div class="legend-item"><span class="legend-dot rrsp"></span> ${r?"Joint RRSP/RRIF":"RRSP/RRIF"}</div>
          <div class="legend-item"><span class="legend-dot nonreg"></span> Personal (PI)</div>
          ${a?`<div class="legend-item"><span class="legend-dot corp"></span> ${r?"2-Person Co-Owned Corp":"Private Corp"}</div>`:""}
          <div class="legend-item"><span class="legend-dot tfsa"></span> ${r?"Dual TFSAs":"TFSA"}</div>
          `}
      </div>
      <div class="svg-chart-wrapper" id="chart-container">
        ${e.chartViewMode==="incomeStreams"?mr(t):ur(t)}
        <div id="chart-tooltip" class="chart-tooltip"></div>
      </div>
    </div>
  `}function wr(t,r,a){const o=[...r].sort((d,c)=>c.longevityYears-d.longevityYears||d.totalLifetimeRetirementTax-c.totalLifetimeRetirementTax)[0],s=t.corpSaving??e.corpSaving,i=t.terminalBalanceAtRetirement.corp>0||s>0||t.history.some(d=>d.corpEnd>0);return`
    ${a?Nt({title:"🎉 The Couples Pension & Dividend Splitting Advantage",description:"By splitting RRIF income (Form T1032) and CCPC corporate dividends 50/50 between two spouses, you utilize two sets of basic personal credits and keep income in lower brackets.",annualSavings:t.couplesAnnualTaxSavings??0,subLabel:"Estimated Annual Tax Savings"}):""}

    ${Rr(t,a)}
    ${hr(t,a,i)}
    ${yr(o.id,a,i)}
    ${Mr(t,a,i)}
    ${xr(r,o.id,a)}
    ${Cr(t,a,i)}
    ${Sr(t,a)}
  `}function Ir(t,r,a){br(t,r,a),Pr(a),Ar(t,r,a),fr(a),document.getElementById("btn-chart-balances")?.addEventListener("click",()=>{e.chartViewMode!=="balances"&&(e.chartViewMode="balances",a.updateResultsOnly())}),document.getElementById("btn-chart-income")?.addEventListener("click",()=>{e.chartViewMode!=="incomeStreams"&&(e.chartViewMode="incomeStreams",a.updateResultsOnly())}),gr(t,r,o=>Pt(o,t,r,a))}function $t({label:t,options:r,wrapperStyle:a,hintHtml:o,extraHtml:s=""}){const n=r.map(i=>`<button type="button" id="${i.id}" class="mode-pill ${i.active?"active":""}">${i.label}</button>`).join("");return`
    <div class="mode-selector"${a?` style="${a}"`:""}>
      <div class="form-label-row" style="margin-bottom:0.25rem;">
        <span class="form-label">${t}</span>
      </div>
      <div class="mode-pills">
        ${n}
      </div>
      ${o?`<div class="mode-hint">${o}</div>`:""}
      ${s}
    </div>
  `}function Dt(){return e.startAtRetirement?$t({label:"Account Comparison Mode",options:[{id:"comp-retire-equal",label:"Equal Total Nest Egg",active:!e.comparatorUseBreakdown},{id:"comp-retire-breakdown",label:"Exact Asset Breakdown",active:e.comparatorUseBreakdown}],hintHtml:e.comparatorUseBreakdown?"Compares your exact RRSP, PI, Co-Owned Corp, and TFSA starting bucket balances side-by-side.":`Tests how long your total ${te(e.retireStartTotal)} retirement portfolio lasts if held 100% in RRSP vs. PI vs. Co-Owned Corp vs. TFSA.`}):$t({label:"Comparison Baseline",options:[{id:"mode-pretax",label:"Pre-Tax Earnings",active:e.comparatorMode==="preTax"},{id:"mode-cashout",label:"Cash Out-of-Pocket",active:e.comparatorMode==="cashOut"}],extraHtml:e.comparatorMode==="cashOut"?`
        <label class="reinvest-checkbox-row">
          <input type="checkbox" id="check-reinvest" ${e.comparatorReinvest?"checked":""}>
          <span>Gross-up & Reinvest RRSP Tax Refund</span>
        </label>`:""})}function Tr(t){document.getElementById("mode-pretax")?.addEventListener("click",()=>{e.comparatorMode="preTax",t.renderApp()}),document.getElementById("mode-cashout")?.addEventListener("click",()=>{e.comparatorMode="cashOut",t.renderApp()}),document.getElementById("check-reinvest")?.addEventListener("change",r=>{e.comparatorReinvest=r.target.checked,t.updateResultsOnly()}),document.getElementById("comp-retire-equal")?.addEventListener("click",()=>{e.comparatorUseBreakdown=!1,t.renderControlsPanel(),t.updateResultsOnly()}),document.getElementById("comp-retire-breakdown")?.addEventListener("click",()=>{e.comparatorUseBreakdown=!0,t.renderControlsPanel(),t.updateResultsOnly()})}function Ke(t){return`
    <div class="pension-field-group">
      <div class="pension-field-header">
        <span class="pension-field-title">${t.title}</span>
        <span class="pension-field-tag" id="${t.dispId}">${t.displayValue}</span>
      </div>
      ${Mt(t.slider)}
      ${t.extraFooterHtml??""}
    </div>
  `}function Bt(t,r){const a=[60,61,62,63,64,65,66,67,68,69,70].map(o=>{const s=o===65?"(Standard)":o<65?`(-${((65-o)*7.2).toFixed(0)}%)`:`(+${((o-65)*8.4).toFixed(0)}%)`;return`<option value="${o}" ${r===o?"selected":""}>Age ${o} ${s}</option>`}).join("");return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
      <span style="color:var(--text-muted);">Start Age:</span>
      <select id="${t}" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
        ${a}
      </select>
    </div>
  `}function Yt(t){let r=0;e.includeOtherIncome&&(e.retireAge>=e.person1CppStartAge&&(r+=e.person1CppAnnual),e.retireAge>=65&&(r+=e.person1OasAnnual),t&&(e.person2RetireAge>=e.person2CppStartAge&&(r+=e.person2CppAnnual),e.person2RetireAge>=65&&(r+=e.person2OasAnnual)),e.retireAge>=e.employerPensionStartAge&&(r+=e.employerPensionAnnual),r+=e.otherTaxableIncome);const a=Math.round(r*.85),o=Math.min(100,Math.round(a/Math.max(1,e.retireNetSpending)*100)),s=Math.max(0,e.retireNetSpending-a);return{estNet:a,coveragePct:o,portfolioShortfall:s}}function kr(t){const{estNet:r,coveragePct:a,portfolioShortfall:o}=Yt(t);return`
    <div class="pension-income-card ${e.includeOtherIncome?"enabled":""}" id="pension-income-card">
      <div class="pension-card-header">
        <div class="pension-card-title-group">
          <span class="icon">🛡️</span>
          <span>Guaranteed Pensions & Income</span>
        </div>
        <div class="pension-header-actions">
          <label class="pension-switch" title="Toggle Guaranteed Other Income (CPP/OAS/Pensions)">
            <input type="checkbox" id="check-other-income" ${e.includeOtherIncome?"checked":""}>
            <span class="pension-slider-toggle"></span>
          </label>
          ${e.includeOtherIncome?`<button type="button" id="btn-toggle-income-details" class="btn-toggle-expand">
                  ${e.otherIncomeExpanded?"Collapse ▲":"Tune Details ▼"}
                </button>`:""}
        </div>
      </div>

      ${e.includeOtherIncome?`
        <div class="pension-coverage-banner" id="pension-coverage-banner">
          <div class="coverage-metrics-row">
            <span>🛡️ Covers: <strong>${l(r)}/yr net</strong> (${a}%)</span>
            <span>💼 Portfolio Bridges: <strong>${l(o)}/yr</strong></span>
          </div>
          <div class="coverage-progress-bar">
            <div class="coverage-seg-pension" style="width: ${a}%;"></div>
            <div class="coverage-seg-portfolio" style="width: ${100-a}%;"></div>
          </div>
        </div>

        <div class="pension-presets-container">
          <div class="pension-presets-label">⚡ Quick Canadian Benchmarks</div>
          <div class="pension-presets-grid">
            <button type="button" class="pension-preset-btn" id="preset-pension-standard" title="Average Canadian CPP ($10k) + full OAS ($8,560)">
              🇨🇦 Standard CPP + OAS
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-max" title="Maximum CRA CPP ($16,375) + full OAS ($8,560)">
              👑 Max CPP + OAS
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-db" title="Adds a $30,000/yr Employer Defined Benefit pension">
              🏢 DB Pension + CPP
            </button>
            <button type="button" class="pension-preset-btn" id="preset-pension-reset" title="Model purely on personal investment savings">
              🚫 Private Only
            </button>
          </div>
        </div>
        `:`
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.45rem;line-height:1.4;">
          Turn on to factor in <strong>Canada Pension Plan (CPP)</strong>, <strong>Old Age Security (OAS)</strong>, and <strong>Company Pensions</strong>.
        </div>
        `}

      ${e.includeOtherIncome&&e.otherIncomeExpanded?`
        <div class="pension-details-body" id="pension-details-body">
          ${Ke({title:`👤 ${t?"Person 1 CPP":"Canada Pension Plan (CPP)"}`,dispId:"disp-p1-cpp",displayValue:`${l(e.person1CppAnnual)}/yr`,slider:{sliderId:"slider-p1-cpp",numId:"num-p1-cpp",value:e.person1CppAnnual,sliderMin:0,sliderMax:22e3,numMax:3e4,step:500},extraFooterHtml:Bt("select-p1-cpp-age",e.person1CppStartAge)})}

          ${Ke({title:`🍁 ${t?"Person 1 OAS":"Old Age Security (OAS)"}`,dispId:"disp-p1-oas",displayValue:`${l(e.person1OasAnnual)}/yr`,slider:{sliderId:"slider-p1-oas",numId:"num-p1-oas",value:e.person1OasAnnual,sliderMin:0,sliderMax:12e3,numMax:15e3,step:250},extraFooterHtml:'<div style="font-size:0.7rem;color:var(--text-muted);">Starts at Age 65 ($8,560 2024-2026 CRA rate). Subject to clawback above $91k.</div>'})}

          ${t?`
              ${Ke({title:"👤 Person 2 CPP",dispId:"disp-p2-cpp",displayValue:`${l(e.person2CppAnnual)}/yr`,slider:{sliderId:"slider-p2-cpp",numId:"num-p2-cpp",value:e.person2CppAnnual,sliderMin:0,sliderMax:22e3,numMax:3e4,step:500},extraFooterHtml:Bt("select-p2-cpp-age",e.person2CppStartAge)})}

              ${Ke({title:"🍁 Person 2 OAS",dispId:"disp-p2-oas",displayValue:`${l(e.person2OasAnnual)}/yr`,slider:{sliderId:"slider-p2-oas",numId:"num-p2-oas",value:e.person2OasAnnual,sliderMin:0,sliderMax:12e3,numMax:15e3,step:250}})}
            `:""}

          ${Ke({title:"🏢 Employer Defined Benefit (DB) Pension",dispId:"disp-db-pension",displayValue:`${l(e.employerPensionAnnual)}/yr`,slider:{sliderId:"slider-db-pension",numId:"num-db-pension",value:e.employerPensionAnnual,sliderMin:0,sliderMax:8e4,numMax:15e4,step:2500},extraFooterHtml:`
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
                <span style="color:var(--text-muted);">Pension Starts At:</span>
                <select id="select-db-pension-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                  ${[55,58,60,62,65,67,70].map(s=>`<option value="${s}" ${e.employerPensionStartAge===s?"selected":""}>Age ${s}</option>`).join("")}
                </select>
              </div>
            `})}

          ${Ke({title:"🏠 Rental or Other Taxable Income",dispId:"disp-other-inc",displayValue:`${l(e.otherTaxableIncome)}/yr`,slider:{sliderId:"slider-other-inc",numId:"num-other-inc",value:e.otherTaxableIncome,sliderMin:0,sliderMax:6e4,numMax:15e4,step:2e3}})}
        </div>
        `:""}
    </div>
  `}function Ue(){const{estNet:t,coveragePct:r,portfolioShortfall:a}=Yt(e.householdMode==="couple"),o=document.getElementById("pension-coverage-banner");if(!o)return;const s=o.querySelector(".coverage-metrics-row");s&&(s.innerHTML=`
      <span>🛡️ Covers: <strong>${l(t)}/yr net</strong> (${r}%)</span>
      <span>💼 Portfolio Bridges: <strong>${l(a)}/yr</strong></span>
    `);const n=o.querySelector(".coverage-seg-pension"),i=o.querySelector(".coverage-seg-portfolio");n&&(n.style.width=`${r}%`),i&&(i.style.width=`${100-r}%`)}function Er(t){const r=e.householdMode==="couple",a=document.getElementById("check-other-income");a?.addEventListener("change",()=>{e.includeOtherIncome=a.checked,t.renderControlsPanel(),t.updateResultsOnly()}),document.getElementById("btn-toggle-income-details")?.addEventListener("click",()=>{e.otherIncomeExpanded=!e.otherIncomeExpanded,t.renderControlsPanel()});const o=d=>{d(),t.renderControlsPanel(),t.updateResultsOnly()};if(document.getElementById("preset-pension-standard")?.addEventListener("click",()=>o(()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,r&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=0,e.otherTaxableIncome=0})),document.getElementById("preset-pension-max")?.addEventListener("click",()=>o(()=>{e.includeOtherIncome=!0,e.person1CppAnnual=16375,e.person1CppStartAge=65,e.person1OasAnnual=8560,r&&(e.person2CppAnnual=16375,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=0,e.otherTaxableIncome=0})),document.getElementById("preset-pension-db")?.addEventListener("click",()=>o(()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,r&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=3e4,e.employerPensionStartAge=e.retireAge,e.otherTaxableIncome=0})),document.getElementById("preset-pension-reset")?.addEventListener("click",()=>o(()=>{e.includeOtherIncome=!1,e.employerPensionAnnual=0,e.otherTaxableIncome=0})),!e.includeOtherIncome||!e.otherIncomeExpanded)return;const s=(d,c,g,u,m)=>{$e({sliderId:d,numId:c,dispId:g,maxSliderVal:u,minVal:0,formatter:p=>`${l(p)}/yr`,onChange:p=>{m(p),Ue(),t.updateResultsOnly()}})};s("slider-p1-cpp","num-p1-cpp","disp-p1-cpp",22e3,d=>{e.person1CppAnnual=d}),s("slider-p1-oas","num-p1-oas","disp-p1-oas",12e3,d=>{e.person1OasAnnual=d});const n=document.getElementById("select-p1-cpp-age");if(n?.addEventListener("change",()=>{e.person1CppStartAge=parseInt(n.value,10),Ue(),t.updateResultsOnly()}),r){s("slider-p2-cpp","num-p2-cpp","disp-p2-cpp",22e3,c=>{e.person2CppAnnual=c}),s("slider-p2-oas","num-p2-oas","disp-p2-oas",12e3,c=>{e.person2OasAnnual=c});const d=document.getElementById("select-p2-cpp-age");d?.addEventListener("change",()=>{e.person2CppStartAge=parseInt(d.value,10),Ue(),t.updateResultsOnly()})}s("slider-db-pension","num-db-pension","disp-db-pension",8e4,d=>{e.employerPensionAnnual=d});const i=document.getElementById("select-db-pension-age");i?.addEventListener("change",()=>{e.employerPensionStartAge=parseInt(i.value,10),Ue(),t.updateResultsOnly()}),s("slider-other-inc","num-other-inc","disp-other-inc",6e4,d=>{e.otherTaxableIncome=d})}function Fe(t){const{variant:r,icon:a,title:o,badgeId:s,badgeClass:n,badgeText:i,badgeStyle:d,subtitle:c,dispId:g,displayValue:u,slider:m,subSlider:p}=t,h=n?`<span${s?` id="${s}"`:""} class="${n}"${d?` style="${d}"`:""}>${i}</span>`:`<span${s?` id="${s}"`:""} style="${d??"font-size:0.72rem;color:var(--text-muted);"}">${i}</span>`,S=p?`
      <div class="pi-gain-subbox">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;margin-bottom:0.2rem;">
          <span style="color:var(--text-secondary);">${p.label}</span>
          <span id="${p.dispId}" style="font-family:var(--font-mono);font-weight:600;color:${p.color};">
            ${p.displayText}
          </span>
        </div>
        <input type="range" id="${p.sliderId}" min="${p.min??0}" max="${p.max??95}" step="${p.step??5}" value="${p.value}" style="width:100%;">
      </div>
    `:"";return`
    <div class="alloc-card ${r}">
      <div class="alloc-card-header">
        <span class="alloc-card-title">
          <span>${a}</span> ${o}
        </span>
        ${h}
      </div>
      <div class="form-label-row" style="margin-bottom:0.25rem;">
        <span style="font-size:0.74rem;color:var(--text-muted);">${c}</span>
        <span id="${g}" class="form-val-display">${u}</span>
      </div>
      ${Mt(m)}
      ${S}
    </div>
  `}function Dr(t){const r=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa:e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa;e.retireStartTotal=r;const a=Math.max(1,r),o=Math.round(e.retireStartP1Rrsp/a*100),s=t?Math.round(e.retireStartP2Rrsp/a*100):0,n=Math.round(e.retireStartPi/a*100),i=Math.round(e.retireStartCorp/a*100),d=Math.max(0,100-o-s-n-i),c=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp:e.retireStartP1Rrsp,g=Math.round(e.retireStartPi*(e.retireStartPiGainPct/100)),u=Math.max(0,e.retireStartPi-g),m=Math.round(e.retireStartCorp*(e.retireStartCorpGainPct/100)),p=Math.round(m*.5),h=e.retireStartTfsa+u+p,S=[{segId:"retire-seg-p1",lblId:"retire-lbl-p1",variant:"p1",pct:o,labelHtml:`${t?"P1 RRSP":"RRSP"}: ${o}% (${te(e.retireStartP1Rrsp)})`,labelColor:"var(--rrsp-color)"},...t?[{segId:"retire-seg-p2",lblId:"retire-lbl-p2",variant:"p2",pct:s,labelHtml:`P2 RRSP: ${s}% (${te(e.retireStartP2Rrsp)})`,labelColor:"#8b5cf6"}]:[],{segId:"retire-seg-pi",lblId:"retire-lbl-pi",variant:"pi",pct:n,labelHtml:`PI: ${n}% (${te(e.retireStartPi)})`,labelColor:"var(--nonreg-color)"},{segId:"retire-seg-corp",lblId:"retire-lbl-corp",variant:"corp",pct:i,labelHtml:`Corp: ${i}% (${te(e.retireStartCorp)})`,labelColor:"var(--corp-color)",hiddenWhenZero:!0,isZero:e.retireStartCorp===0},{segId:"retire-seg-tfsa",lblId:"retire-lbl-tfsa",variant:"tfsa",pct:d,labelHtml:`TFSA: ${d}% (${te(e.retireStartTfsa)})`,labelColor:"var(--tfsa-color)"}],y=t?`
      <button type="button" id="retire-preset-couple-equal" class="alloc-preset-btn">⚡ Equal RRSPs (30/30/25/15)</button>
      <button type="button" id="retire-preset-couple-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Co-Owned Corp Mix</button>
      <button type="button" id="retire-preset-couple-taxfree" class="alloc-preset-btn">🛡️ Tax-Efficient (20/20/30/30)</button>
      <button type="button" id="retire-preset-couple-allrrsp" class="alloc-preset-btn">🟣 100% RRSP (50/50)</button>
    `:`
      <button type="button" id="retire-preset-single-balanced" class="alloc-preset-btn">⚖️ 60% RRSP / 25% PI / 15% TFSA</button>
      <button type="button" id="retire-preset-single-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Corp HoldCo Mix</button>
      <button type="button" id="retire-preset-single-taxfree" class="alloc-preset-btn">🛡️ 40% RRSP / 30% PI / 30% TFSA</button>
      <button type="button" id="retire-preset-single-allrrsp" class="alloc-preset-btn">💰 100% RRSP</button>
    `;return`
    ${De({id:"retire-start-assets-card",label:t?"Combined Portfolio at Retirement":"Starting Portfolio at Retirement",sliderId:"slider-retire-total",numId:"num-retire-total",dispId:"disp-retire-total",displayHtml:l(r),displayStyle:"color:var(--total-color);",value:r,sliderMin:5e4,sliderMax:6e6,numMin:0,numMax:25e6,step:25e3})}

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">🏦 Retirement Starting Asset Breakdown</label>
      </div>

      ${At({segments:S})}

      <div class="alloc-presets-grid">
        ${y}
      </div>

      ${Fe({variant:"p1",icon:"🟣",title:t?"Person 1 RRSP / RRIF":"RRSP / RRIF Balance",badgeId:"retire-badge-p1",badgeClass:"alloc-share-badge rrsp",badgeText:`${o}% of portfolio`,subtitle:"100% Taxable · RRIF at 71",dispId:"disp-retire-p1-rrsp",displayValue:l(e.retireStartP1Rrsp),slider:{sliderId:"slider-retire-p1-rrsp",numId:"num-retire-p1-rrsp",value:e.retireStartP1Rrsp,sliderMin:0,sliderMax:3e6,numMax:15e6,step:1e4}})}

      ${t?Fe({variant:"p2",icon:"🟣",title:"Person 2 RRSP / Spousal",badgeId:"retire-badge-p2",badgeClass:"alloc-share-badge p2",badgeText:`${s}% of portfolio`,subtitle:"Eligible for 50/50 Split",dispId:"disp-retire-p2-rrsp",displayValue:l(e.retireStartP2Rrsp),slider:{sliderId:"slider-retire-p2-rrsp",numId:"num-retire-p2-rrsp",value:e.retireStartP2Rrsp,sliderMin:0,sliderMax:3e6,numMax:15e6,step:1e4}}):""}

      ${Fe({variant:"pi",icon:"🟠",title:t?"Joint Personal Account (PI)":"Personal Investment (PI)",badgeId:"retire-badge-pi",badgeClass:"alloc-share-badge pi",badgeText:`${n}% of portfolio`,subtitle:"Taxable Non-Registered",dispId:"disp-retire-pi",displayValue:l(e.retireStartPi),slider:{sliderId:"slider-retire-pi",numId:"num-retire-pi",value:e.retireStartPi,sliderMin:0,sliderMax:3e6,numMax:15e6,step:1e4},subSlider:{label:"Unrealized Capital Gains %:",dispId:"disp-retire-pi-gain",displayText:`${e.retireStartPiGainPct}% Gain (${te(g)}) · ACB: ${te(u)}`,color:"var(--nonreg-color)",sliderId:"slider-retire-pi-gain",value:e.retireStartPiGainPct}})}

      ${Fe({variant:"corp",icon:"🏢",title:t?"2-Person Co-Owned Corp (CCPC)":"Private Corp (CCPC / HoldCo)",badgeId:"retire-badge-corp",badgeClass:"alloc-share-badge corp",badgeText:`${i}% of portfolio`,subtitle:t?"50/50 Spousal Dividends + Tax-Free CDA":"CCPC Dividends + Tax-Free CDA",dispId:"disp-retire-corp",displayValue:l(e.retireStartCorp),slider:{sliderId:"slider-retire-corp",numId:"num-retire-corp",value:e.retireStartCorp,sliderMin:0,sliderMax:4e6,numMax:2e7,step:1e4},subSlider:{label:"Corp Unrealized Cap Gains %:",dispId:"disp-retire-corp-gain",displayText:`${e.retireStartCorpGainPct}% Gain · Tax-Free CDA: ${te(p)}`,color:"var(--corp-color)",sliderId:"slider-retire-corp-gain",value:e.retireStartCorpGainPct}})}

      ${Fe({variant:"tfsa",icon:"🟢",title:t?"Combined Dual TFSAs":"TFSA Balance",badgeId:"retire-badge-tfsa",badgeClass:"alloc-share-badge tfsa",badgeText:`${d}% of portfolio`,subtitle:"100% Tax-Free Growth & Draw",dispId:"disp-retire-tfsa",displayValue:l(e.retireStartTfsa),slider:{sliderId:"slider-retire-tfsa",numId:"num-retire-tfsa",value:e.retireStartTfsa,sliderMin:0,sliderMax:15e5,numMax:1e7,step:5e3}})}

      <!-- Tax Character Summary Box -->
      <div class="refund-summary-box" style="background:rgba(56,189,248,0.07);border-color:rgba(56,189,248,0.25);">
        <div class="refund-summary-header" style="margin-bottom:0.3rem;">
          <span style="font-size:0.78rem;font-weight:700;color:var(--text-primary);">
            🛡️ Tax-Free TFSA + ACB + Corp CDA Cushion
          </span>
          <span id="retire-taxfree-val" class="refund-summary-val" style="color:var(--tfsa-color);font-size:0.88rem;">
            ${l(h)}
          </span>
        </div>
        <div id="retire-tax-character-note" style="font-size:0.72rem;color:var(--text-secondary);line-height:1.35;">
          <strong>Taxable RRSP:</strong> ${l(c)}${e.retireStartCorp>0?` · <strong>Corp:</strong> ${l(e.retireStartCorp)}`:""} · <strong>Tax-Free Cushion:</strong> ${l(h)}
        </div>
      </div>
    </div>
  `}function ut(){const t=e.householdMode==="couple",r=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa:e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa;e.retireStartTotal=r;const a=Math.max(1,r),o=Math.round(e.retireStartP1Rrsp/a*100),s=t?Math.round(e.retireStartP2Rrsp/a*100):0,n=Math.round(e.retireStartPi/a*100),i=Math.round(e.retireStartCorp/a*100),d=Math.max(0,100-o-s-n-i),c=(f,I)=>{const z=document.getElementById(f);z&&(z.style.width=`${I}%`)};c("retire-seg-p1",o),c("retire-seg-p2",s),c("retire-seg-pi",n),c("retire-seg-corp",i),c("retire-seg-tfsa",d);const g=document.getElementById("retire-lbl-p1"),u=document.getElementById("retire-lbl-p2"),m=document.getElementById("retire-lbl-pi"),p=document.getElementById("retire-lbl-corp"),h=document.getElementById("retire-lbl-tfsa");g&&(g.textContent=`${t?"P1 RRSP":"RRSP"}: ${o}% (${te(e.retireStartP1Rrsp)})`),u&&t&&(u.textContent=`P2 RRSP: ${s}% (${te(e.retireStartP2Rrsp)})`),m&&(m.textContent=`PI: ${n}% (${te(e.retireStartPi)})`),p&&(p.style.display=e.retireStartCorp>0?"inline":"none",p.textContent=`Corp: ${i}% (${te(e.retireStartCorp)})`),h&&(h.textContent=`TFSA: ${d}% (${te(e.retireStartTfsa)})`);const S=(f,I)=>{const z=document.getElementById(f);z&&(z.textContent=I)};S("retire-badge-p1",`${o}% of portfolio`),S("retire-badge-p2",`${s}% of portfolio`),S("retire-badge-pi",`${n}% of portfolio`),S("retire-badge-corp",`${i}% of portfolio`),S("retire-badge-tfsa",`${d}% of portfolio`);const y=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp:e.retireStartP1Rrsp,D=Math.round(e.retireStartPi*(e.retireStartPiGainPct/100)),F=Math.max(0,e.retireStartPi-D),N=Math.round(e.retireStartCorp*(e.retireStartCorpGainPct/100)),X=Math.round(N*.5),M=e.retireStartTfsa+F+X;S("disp-retire-pi-gain",`${e.retireStartPiGainPct}% Gain (${te(D)}) · ACB: ${te(F)}`),S("disp-retire-corp-gain",`${e.retireStartCorpGainPct}% Gain · Tax-Free CDA: ${te(X)}`),S("retire-taxfree-val",l(M));const v=document.getElementById("retire-tax-character-note");v&&(v.innerHTML=`<strong>Taxable RRSP:</strong> ${l(y)}${e.retireStartCorp>0?` · <strong>Corp:</strong> ${l(e.retireStartCorp)}`:""} · <strong>Tax-Free Cushion:</strong> ${l(M)}`)}function Ft(){const t=e.householdMode==="couple",r=t?e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa:e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa;e.retireStartTotal=r,le("slider-retire-total","num-retire-total","disp-retire-total",r,l(r),6e6),le("slider-retire-p1-rrsp","num-retire-p1-rrsp","disp-retire-p1-rrsp",e.retireStartP1Rrsp,l(e.retireStartP1Rrsp),3e6),t&&le("slider-retire-p2-rrsp","num-retire-p2-rrsp","disp-retire-p2-rrsp",e.retireStartP2Rrsp,l(e.retireStartP2Rrsp),3e6),le("slider-retire-pi","num-retire-pi","disp-retire-pi",e.retireStartPi,l(e.retireStartPi),3e6),le("slider-retire-corp","num-retire-corp","disp-retire-corp",e.retireStartCorp,l(e.retireStartCorp),4e6),le("slider-retire-tfsa","num-retire-tfsa","disp-retire-tfsa",e.retireStartTfsa,l(e.retireStartTfsa),15e5),ut()}function Br(t){const r=e.householdMode==="couple";$e({sliderId:"slider-retire-total",numId:"num-retire-total",dispId:"disp-retire-total",maxSliderVal:6e6,minVal:0,formatter:l,onChange:i=>{if(e.retireStartTotal=i,r){const d=e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa||1,c=e.retireStartP1Rrsp/d,g=e.retireStartP2Rrsp/d,u=e.retireStartPi/d,m=e.retireStartCorp/d;e.retireStartP1Rrsp=Math.round(i*c/1e3)*1e3,e.retireStartP2Rrsp=Math.round(i*g/1e3)*1e3,e.retireStartPi=Math.round(i*u/1e3)*1e3,e.retireStartCorp=Math.round(i*m/1e3)*1e3,e.retireStartTfsa=Math.max(0,i-e.retireStartP1Rrsp-e.retireStartP2Rrsp-e.retireStartPi-e.retireStartCorp)}else{const d=e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa||1,c=e.retireStartP1Rrsp/d,g=e.retireStartPi/d,u=e.retireStartCorp/d;e.retireStartP1Rrsp=Math.round(i*c/1e3)*1e3,e.retireStartPi=Math.round(i*g/1e3)*1e3,e.retireStartCorp=Math.round(i*u/1e3)*1e3,e.retireStartTfsa=Math.max(0,i-e.retireStartP1Rrsp-e.retireStartPi-e.retireStartCorp)}Ft(),t.updateResultsOnly()}});const a=(i,d,c,g,u)=>{$e({sliderId:i,numId:d,dispId:c,maxSliderVal:g,minVal:0,formatter:l,onChange:m=>{u(m);const p=r?e.retireStartP1Rrsp+e.retireStartP2Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa:e.retireStartP1Rrsp+e.retireStartPi+e.retireStartCorp+e.retireStartTfsa;e.retireStartTotal=p,le("slider-retire-total","num-retire-total","disp-retire-total",p,l(p),6e6),ut(),t.updateResultsOnly()}})};a("slider-retire-p1-rrsp","num-retire-p1-rrsp","disp-retire-p1-rrsp",3e6,i=>{e.retireStartP1Rrsp=i}),r&&a("slider-retire-p2-rrsp","num-retire-p2-rrsp","disp-retire-p2-rrsp",3e6,i=>{e.retireStartP2Rrsp=i}),a("slider-retire-pi","num-retire-pi","disp-retire-pi",3e6,i=>{e.retireStartPi=i}),a("slider-retire-corp","num-retire-corp","disp-retire-corp",4e6,i=>{e.retireStartCorp=i}),a("slider-retire-tfsa","num-retire-tfsa","disp-retire-tfsa",15e5,i=>{e.retireStartTfsa=i});const o=document.getElementById("slider-retire-pi-gain");o?.addEventListener("input",()=>{e.retireStartPiGainPct=parseFloat(o.value)||0,ut(),t.updateResultsOnly()});const s=document.getElementById("slider-retire-corp-gain");s?.addEventListener("input",()=>{e.retireStartCorpGainPct=parseFloat(s.value)||0,ut(),t.updateResultsOnly()});const n=(i,d,c,g=0)=>{const u=e.retireStartTotal>0?e.retireStartTotal:12e5;r?(e.retireStartP1Rrsp=Math.round(u*i/1e3)*1e3,e.retireStartP2Rrsp=Math.round(u*d/1e3)*1e3,e.retireStartPi=Math.round(u*c/1e3)*1e3,e.retireStartCorp=Math.round(u*g/1e3)*1e3,e.retireStartTfsa=Math.max(0,u-e.retireStartP1Rrsp-e.retireStartP2Rrsp-e.retireStartPi-e.retireStartCorp)):(e.retireStartP1Rrsp=Math.round(u*i/1e3)*1e3,e.retireStartPi=Math.round(u*c/1e3)*1e3,e.retireStartCorp=Math.round(u*g/1e3)*1e3,e.retireStartTfsa=Math.max(0,u-e.retireStartP1Rrsp-e.retireStartPi-e.retireStartCorp)),Ft(),t.updateResultsOnly()};r?(document.getElementById("retire-preset-couple-equal")?.addEventListener("click",()=>n(.3,.3,.25,0)),document.getElementById("retire-preset-couple-corp")?.addEventListener("click",()=>n(.2,.2,.1,.35)),document.getElementById("retire-preset-couple-taxfree")?.addEventListener("click",()=>n(.2,.2,.3,0)),document.getElementById("retire-preset-couple-allrrsp")?.addEventListener("click",()=>n(.5,.5,0,0))):(document.getElementById("retire-preset-single-balanced")?.addEventListener("click",()=>n(.6,0,.25,0)),document.getElementById("retire-preset-single-corp")?.addEventListener("click",()=>n(.35,0,.1,.4)),document.getElementById("retire-preset-single-taxfree")?.addEventListener("click",()=>n(.4,0,.3,0)),document.getElementById("retire-preset-single-allrrsp")?.addEventListener("click",()=>n(1,0,0,0)))}function Fr(t){const r=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving:e.p1RrspSaving+e.piSaving+e.corpSaving,a=Math.max(1,r),o=Math.round(e.p1RrspSaving/a*100),s=t?Math.round(e.p2RrspSaving/a*100):0,n=Math.round(e.corpSaving/a*100),i=Math.max(0,100-o-s-n),d=Math.round(e.p1RrspSaving*e.workTaxRate),c=Math.round(e.p2RrspSaving*e.person2WorkTaxRate),g=t?d+c:d,u=[{segId:"alloc-seg-p1",lblId:"alloc-lbl-p1",variant:"p1",pct:o,labelHtml:`${t?"P1 RRSP":"RRSP"}: ${o}% (${l(e.p1RrspSaving)})`,labelColor:"var(--rrsp-color)"},...t?[{segId:"alloc-seg-p2",lblId:"alloc-lbl-p2",variant:"p2",pct:s,labelHtml:`P2 RRSP: ${s}% (${l(e.p2RrspSaving)})`,labelColor:"#8b5cf6"}]:[],{segId:"alloc-seg-pi",lblId:"alloc-lbl-pi",variant:"pi",pct:i,labelHtml:`PI: ${i}% (${l(e.piSaving)})`,labelColor:"var(--nonreg-color)"},{segId:"alloc-seg-corp",lblId:"alloc-lbl-corp",variant:"corp",pct:n,labelHtml:`Corp: ${n}% (${l(e.corpSaving)})`,labelColor:"var(--corp-color)",hiddenWhenZero:!0,isZero:e.corpSaving===0}],m=t?`
      <button type="button" id="preset-couple-equal" class="alloc-preset-btn">⚡ 50/50 Equal RRSPs</button>
      <button type="button" id="preset-couple-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Co-Owned Corp</button>
      <button type="button" id="preset-couple-highearner" class="alloc-preset-btn">💼 High-Earner First (P1)</button>
      <button type="button" id="preset-couple-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
    `:`
      <button type="button" id="preset-single-max" class="alloc-preset-btn">🚀 Max RRSP ($32,490)</button>
      <button type="button" id="preset-single-corp" class="alloc-preset-btn" style="border-color:rgba(244,114,182,0.45);color:var(--corp-color);">🏢 +Private Corp</button>
      <button type="button" id="preset-single-balanced" class="alloc-preset-btn">⚖️ 70% RRSP / 30% PI</button>
      <button type="button" id="preset-single-all" class="alloc-preset-btn">💰 100% RRSP</button>
    `;return`
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">
          ${t?"Household Savings Allocation (RRSP / PI / Co-Owned Corp)":"Savings Allocation (RRSP / PI / Corp)"}
        </label>
      </div>

      ${At({segments:u})}

      <div class="alloc-presets-grid">
        ${m}
      </div>

      ${Fe({variant:"p1",icon:"👤",title:t?"Person 1 RRSP":"RRSP Contribution",badgeId:"refund-badge-p1",badgeClass:"alloc-refund-badge",badgeText:`+${l(d)} tax refund`,subtitle:"Max CRA Limit: $32,490/yr",dispId:"disp-p1-rrsp",displayValue:l(e.p1RrspSaving),slider:{sliderId:"slider-p1-rrsp",numId:"num-p1-rrsp",value:e.p1RrspSaving,sliderMin:0,sliderMax:32490,step:500}})}

      ${t?Fe({variant:"p2",icon:"👤",title:"Person 2 RRSP / Spousal",badgeId:"refund-badge-p2",badgeClass:"alloc-refund-badge",badgeText:`+${l(c)} tax refund`,subtitle:"Max CRA Limit: $32,490/yr",dispId:"disp-p2-rrsp",displayValue:l(e.p2RrspSaving),slider:{sliderId:"slider-p2-rrsp",numId:"num-p2-rrsp",value:e.p2RrspSaving,sliderMin:0,sliderMax:32490,step:500}}):""}

      ${Fe({variant:"pi",icon:"📈",title:t?"Household Personal Account (PI)":"Personal Investment (PI)",badgeText:"50% Capital Gains",subtitle:"Taxable Non-Registered",dispId:"disp-pi",displayValue:l(e.piSaving),slider:{sliderId:"slider-pi",numId:"num-pi",value:e.piSaving,sliderMin:0,sliderMax:1e5,numMax:25e4,step:1e3}})}

      ${Fe({variant:"corp",icon:"🏢",title:t?"2-Person Co-Owned Corp (CCPC)":"Private Corp (CCPC / HoldCo)",badgeClass:"alloc-share-badge corp",badgeText:"12.2% SBD · CDA + Divs",subtitle:t?"Retained Earnings Invested Inside Co-Owned HoldCo":"Retained Earnings Invested Inside Corp",dispId:"disp-corp",displayValue:l(e.corpSaving),slider:{sliderId:"slider-corp",numId:"num-corp",value:e.corpSaving,sliderMin:0,sliderMax:15e4,numMax:4e5,step:1e3}})}

      <!-- Tax Refund & Reinvestment Destination -->
      <div class="refund-summary-box">
        <div class="refund-summary-header">
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">
            🎁 Annual Household Tax Refund
          </span>
          <span id="total-refund-val" class="refund-summary-val">
            +${l(g)}/yr
          </span>
        </div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:0.4rem;">
          Reinvest this tax refund annually into:
        </div>
        <div style="display:flex;gap:0.4rem;">
          <button type="button" class="preset-btn ${e.reinvestRefundTo==="tfsa"?"active":""}" id="refund-tfsa">
            ${t?"Dual TFSAs":"TFSA"}
          </button>
          <button type="button" class="preset-btn ${e.reinvestRefundTo==="pi"?"active":""}" id="refund-pi">
            Personal (PI)
          </button>
          <button type="button" class="preset-btn ${e.reinvestRefundTo==="none"?"active":""}" id="refund-none">
            Spend
          </button>
        </div>
      </div>
    </div>
  `}function mt(){const t=e.householdMode==="couple",r=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving:e.p1RrspSaving+e.piSaving+e.corpSaving,a=Math.max(1,r),o=Math.round(e.p1RrspSaving/a*100),s=t?Math.round(e.p2RrspSaving/a*100):0,n=Math.round(e.corpSaving/a*100),i=Math.max(0,100-o-s-n),d=document.getElementById("alloc-seg-p1"),c=document.getElementById("alloc-seg-p2"),g=document.getElementById("alloc-seg-pi"),u=document.getElementById("alloc-seg-corp");d&&(d.style.width=`${o}%`),c&&(c.style.width=`${s}%`),g&&(g.style.width=`${i}%`),u&&(u.style.width=`${n}%`);const m=document.getElementById("alloc-lbl-p1"),p=document.getElementById("alloc-lbl-p2"),h=document.getElementById("alloc-lbl-pi"),S=document.getElementById("alloc-lbl-corp");m&&(m.textContent=`${t?"P1 RRSP":"RRSP"}: ${o}% (${l(e.p1RrspSaving)})`),p&&t&&(p.textContent=`P2 RRSP: ${s}% (${l(e.p2RrspSaving)})`),h&&(h.textContent=`PI: ${i}% (${l(e.piSaving)})`),S&&(S.style.display=e.corpSaving>0?"inline":"none",S.textContent=`Corp: ${n}% (${l(e.corpSaving)})`);const y=Math.round(e.p1RrspSaving*e.workTaxRate),D=Math.round(e.p2RrspSaving*e.person2WorkTaxRate),F=t?y+D:y,N=document.getElementById("refund-badge-p1");N&&(N.textContent=`+${l(y)} tax refund`);const X=document.getElementById("refund-badge-p2");X&&(X.textContent=`+${l(D)} tax refund`);const M=document.getElementById("total-refund-val");M&&(M.textContent=`+${l(F)}/yr`)}function Gt(){const t=e.householdMode==="couple",r=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving:e.p1RrspSaving+e.piSaving+e.corpSaving;e.annualSaving=r,le("slider-saving","num-saving","disp-saving",r,l(r),2e5),le("slider-p1-rrsp","num-p1-rrsp","disp-p1-rrsp",e.p1RrspSaving,l(e.p1RrspSaving),32490),t&&le("slider-p2-rrsp","num-p2-rrsp","disp-p2-rrsp",e.p2RrspSaving,l(e.p2RrspSaving),32490),le("slider-pi","num-pi","disp-pi",e.piSaving,l(e.piSaving),1e5),le("slider-corp","num-corp","disp-corp",e.corpSaving,l(e.corpSaving),15e4),mt()}function Gr(t){const r=e.householdMode==="couple";$e({sliderId:"slider-saving",numId:"num-saving",dispId:"disp-saving",maxSliderVal:2e5,minVal:0,formatter:l,onChange:n=>{if(e.annualSaving=n,r){const i=e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving||1,d=e.p1RrspSaving/i,c=e.p2RrspSaving/i,g=e.corpSaving/i;let u=Math.round(n*d),m=Math.round(n*c);const p=Math.round(n*g);let h=n-u-m-p;u>32490&&(h+=u-32490,u=32490),m>32490&&(h+=m-32490,m=32490),e.p1RrspSaving=u,e.p2RrspSaving=m,e.corpSaving=Math.max(0,p),e.piSaving=Math.max(0,h)}else{const i=e.p1RrspSaving+e.piSaving+e.corpSaving||1,d=e.p1RrspSaving/i,c=e.corpSaving/i;let g=Math.round(n*d);const u=Math.round(n*c);let m=n-g-u;g>32490&&(m+=g-32490,g=32490),e.p1RrspSaving=g,e.corpSaving=Math.max(0,u),e.piSaving=Math.max(0,m)}Gt(),t.updateResultsOnly()}});const a=(n,i,d,c,g)=>{$e({sliderId:n,numId:i,dispId:d,maxSliderVal:c,minVal:0,formatter:l,onChange:u=>{g(u);const m=r?e.p1RrspSaving+e.p2RrspSaving+e.piSaving+e.corpSaving:e.p1RrspSaving+e.piSaving+e.corpSaving;e.annualSaving=m,le("slider-saving","num-saving","disp-saving",m,l(m),2e5),mt(),t.updateResultsOnly()}})};a("slider-p1-rrsp","num-p1-rrsp","disp-p1-rrsp",32490,n=>{e.p1RrspSaving=n}),r&&a("slider-p2-rrsp","num-p2-rrsp","disp-p2-rrsp",32490,n=>{e.p2RrspSaving=n}),a("slider-pi","num-pi","disp-pi",1e5,n=>{e.piSaving=n}),a("slider-corp","num-corp","disp-corp",15e4,n=>{e.corpSaving=n});const o=n=>{n(),Gt(),t.updateResultsOnly()};r?(document.getElementById("preset-couple-equal")?.addEventListener("click",()=>o(()=>{const n=Math.min(e.annualSaving,64980),i=Math.min(32490,Math.floor(n/2));e.p1RrspSaving=i,e.p2RrspSaving=i,e.corpSaving=0,e.piSaving=Math.max(0,e.annualSaving-i*2)})),document.getElementById("preset-couple-corp")?.addEventListener("click",()=>o(()=>{const n=Math.max(e.annualSaving,7e4);e.p1RrspSaving=Math.min(32490,Math.round(n*.25/500)*500),e.p2RrspSaving=Math.min(32490,Math.round(n*.25/500)*500),e.corpSaving=Math.round(n*.4/1e3)*1e3,e.piSaving=Math.max(0,n-e.p1RrspSaving-e.p2RrspSaving-e.corpSaving)})),document.getElementById("preset-couple-highearner")?.addEventListener("click",()=>o(()=>{const n=Math.min(32490,e.annualSaving),i=Math.max(0,e.annualSaving-n),d=Math.min(32490,i);e.p1RrspSaving=n,e.p2RrspSaving=d,e.corpSaving=0,e.piSaving=Math.max(0,i-d)})),document.getElementById("preset-couple-balanced")?.addEventListener("click",()=>o(()=>{const n=Math.round(e.annualSaving*.7),i=Math.min(32490,Math.floor(n/2)),d=Math.min(32490,n-i);e.p1RrspSaving=i,e.p2RrspSaving=d,e.corpSaving=0,e.piSaving=Math.max(0,e.annualSaving-i-d)}))):(document.getElementById("preset-single-max")?.addEventListener("click",()=>o(()=>{e.p1RrspSaving=Math.min(32490,e.annualSaving),e.corpSaving=0,e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving)})),document.getElementById("preset-single-corp")?.addEventListener("click",()=>o(()=>{const n=Math.max(e.annualSaving,6e4);e.p1RrspSaving=Math.min(32490,Math.round(n*.4/500)*500),e.corpSaving=Math.round(n*.5/1e3)*1e3,e.piSaving=Math.max(0,n-e.p1RrspSaving-e.corpSaving)})),document.getElementById("preset-single-balanced")?.addEventListener("click",()=>o(()=>{e.p1RrspSaving=Math.min(32490,Math.round(e.annualSaving*.7)),e.corpSaving=0,e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving)})),document.getElementById("preset-single-all")?.addEventListener("click",()=>o(()=>{e.p1RrspSaving=Math.min(32490,e.annualSaving),e.piSaving=0,e.corpSaving=0})));const s=n=>{e.reinvestRefundTo=n,document.querySelectorAll(".refund-summary-box .preset-btn").forEach(i=>{i.classList.remove("active")}),document.getElementById(`refund-${n}`)?.classList.add("active"),t.updateResultsOnly()};document.getElementById("refund-tfsa")?.addEventListener("click",()=>s("tfsa")),document.getElementById("refund-pi")?.addEventListener("click",()=>s("pi")),document.getElementById("refund-none")?.addEventListener("click",()=>s("none"))}function Vt(t){const r=Math.max(18,e.retireAge-e.yearsAccumulation),a=Math.max(18,e.person2RetireAge-e.yearsAccumulation);return`
    <h2 class="panel-title">${t?"Household Profile & Targets":"Your Profile & Targets"}</h2>

    ${$t({label:"Planning Starting Point",wrapperStyle:"margin-bottom: 1.15rem;",options:[{id:"btn-start-accum",label:"📈 Save to Retirement",active:!e.startAtRetirement},{id:"btn-start-retire",label:"🏖️ Start at Retirement",active:e.startAtRetirement}]})}

    ${e.startAtRetirement?`
      ${Dr(t)}
      ${e.viewMode==="comparator"?Dt():""}
      `:`
      ${De({label:t?"Combined Household Saving":"Annual Total Saving",sliderId:"slider-saving",numId:"num-saving",dispId:"disp-saving",displayHtml:l(e.annualSaving),value:e.annualSaving,sliderMin:5e3,sliderMax:2e5,numMin:1e3,numMax:5e5,step:1e3})}

      ${e.viewMode==="simulator"?Fr(t):Dt()}

      <div class="divider"></div>

      ${De({label:"Years to Invest",sliderId:"slider-years",numId:"num-years",dispId:"disp-years",displayHtml:`${e.yearsAccumulation} years`,value:e.yearsAccumulation,sliderMin:3,sliderMax:40,numMin:1,numMax:50,step:1})}
      `}

    <div class="divider"></div>

    <!-- Retirement Ages -->
    ${t?`
      <div class="form-group">
        <label class="form-label">Retirement Ages (Person 1 & Person 2)</label>
        <div class="dual-person-grid">
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 1</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${e.retireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">${e.startAtRetirement?"(Retire Age)":`(Starts @ ${r})`}</span>
            </div>
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage2" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${e.person2RetireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">${e.startAtRetirement?"(Retire Age)":`(Starts @ ${a})`}</span>
            </div>
          </div>
        </div>
      </div>
      `:De({label:"Retire at Age",sliderId:"slider-retireage",numId:"num-retireage",dispId:"disp-retireage",displayHtml:`Age ${e.retireAge} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">${e.startAtRetirement?"(Retiring Now)":`(Starts @ ${r})`}</span>`,value:e.retireAge,sliderMin:50,sliderMax:75,numMin:45,numMax:80,step:1})}

    <!-- Retirement Net Spending Goal -->
    ${De({label:t?"Household Spend (After-Tax)":"Retirement Spend (After-Tax)",sliderId:"slider-spend",numId:"num-spend",dispId:"disp-spend",displayHtml:`${l(e.retireNetSpending)}/yr`,value:e.retireNetSpending,sliderMin:2e4,sliderMax:25e4,numMin:1e4,numMax:4e5,step:2500,extraHtml:`
        <button type="button" id="btn-optimize-spending" class="btn-optimize-spend">
          ⚡ Auto-Find Max Safe Spending (to Age 95)
        </button>
        <div id="optimize-spend-result" class="optimize-spend-banner" style="display:none;"></div>
      `})}

    <!-- Guaranteed Pensions & Other Income Section -->
    ${e.viewMode==="simulator"?kr(t):""}

    ${t?`
      <label class="reinvest-checkbox-row" style="margin-bottom:1rem;">
        <input type="checkbox" id="check-splitting" ${e.enableIncomeSplitting?"checked":""}>
        <span>Enable CRA Pension & Corp Dividend Splitting</span>
      </label>`:""}

    <div class="divider"></div>

    ${e.startAtRetirement?"":`
      ${t?`
        <div class="form-group">
          <label class="form-label">Working Marginal Tax Rates (MTR)</label>
          <div class="dual-person-grid">
            <div class="dual-person-card">
              <span class="dual-person-title">👤 Person 1 MTR</span>
              <input type="number" id="num-tax" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(e.workTaxRate*100).toFixed(1)}">
            </div>
            <div class="dual-person-card">
              <span class="dual-person-title">👤 Person 2 MTR</span>
              <input type="number" id="num-tax2" class="form-input-number" style="width:100%;text-align:left;" min="15" max="54" step="0.5" value="${(e.person2WorkTaxRate*100).toFixed(1)}">
            </div>
          </div>
        </div>`:De({label:"Working Marginal Tax Rate",sliderId:"slider-tax",numId:"num-tax",dispId:"disp-tax",displayHtml:`${(e.workTaxRate*100).toFixed(1)}%`,value:e.workTaxRate*100,sliderMin:20,sliderMax:54,numMin:15,numMax:54,step:.5})}

      ${De({label:"Annual Pre-Tax Return",sliderId:"slider-growth",numId:"num-growth",dispId:"disp-growth",displayHtml:`${(e.growthRatePreTax*100).toFixed(1)}%`,value:e.growthRatePreTax*100,sliderMin:3,sliderMax:12,numMin:1,numMax:15,step:.5})}

      ${De({label:"Tax Drag (Personal / Corp Passive)",sliderId:"slider-drag",numId:"num-drag",dispId:"disp-drag",displayHtml:`${(e.taxDrag*100).toFixed(1)}%`,value:e.taxDrag*100,sliderMin:.5,sliderMax:3,numMin:0,numMax:5,step:.1})}
      `}

    ${De({label:"Retirement Return Rate",sliderId:"slider-retgrowth",numId:"num-retgrowth",dispId:"disp-retgrowth",displayHtml:`${(e.retireGrowthRate*100).toFixed(1)}%`,value:e.retireGrowthRate*100,sliderMin:2,sliderMax:8,numMin:1,numMax:10,step:.5})}
  `}function Ut(t){document.getElementById("btn-start-accum")?.addEventListener("click",()=>{e.startAtRetirement&&(e.startAtRetirement=!1,t.renderControlsPanel(),t.updateResultsOnly())}),document.getElementById("btn-start-retire")?.addEventListener("click",()=>{e.startAtRetirement||(e.startAtRetirement=!0,t.renderControlsPanel(),t.updateResultsOnly())}),e.startAtRetirement?Br(t):Gr(t),Er(t),Tr(t),$e({sliderId:"slider-years",numId:"num-years",dispId:"disp-years",formatter:o=>`${Math.round(o)} years`,onChange:o=>{e.yearsAccumulation=Math.round(o),t.updateResultsOnly()}}),$e({sliderId:"slider-retireage",numId:"num-retireage",dispId:"disp-retireage",formatter:o=>`Age ${Math.round(o)}`,onChange:o=>{e.retireAge=Math.round(o),Ue(),t.updateResultsOnly()}});const r=document.getElementById("num-retireage2");r?.addEventListener("input",()=>{const o=parseFloat(r.value);isNaN(o)||(e.person2RetireAge=Math.round(o),Ue(),t.updateResultsOnly())}),$e({sliderId:"slider-spend",numId:"num-spend",dispId:"disp-spend",maxSliderVal:25e4,formatter:o=>`${l(o)}/yr`,onChange:o=>{e.retireNetSpending=o,Ue(),t.updateResultsOnly()}}),document.getElementById("btn-optimize-spending")?.addEventListener("click",()=>{Ht(t)}),document.getElementById("check-splitting")?.addEventListener("change",o=>{e.enableIncomeSplitting=o.target.checked,t.updateResultsOnly()}),$e({sliderId:"slider-tax",numId:"num-tax",dispId:"disp-tax",formatter:o=>`${o.toFixed(1)}%`,onChange:o=>{e.workTaxRate=o/100,mt(),t.updateResultsOnly()}});const a=document.getElementById("num-tax2");a?.addEventListener("input",()=>{const o=parseFloat(a.value);isNaN(o)||(e.person2WorkTaxRate=o/100,mt(),t.updateResultsOnly())}),$e({sliderId:"slider-growth",numId:"num-growth",dispId:"disp-growth",formatter:o=>`${o.toFixed(1)}%`,onChange:o=>{e.growthRatePreTax=o/100,t.updateResultsOnly()}}),$e({sliderId:"slider-drag",numId:"num-drag",dispId:"disp-drag",formatter:o=>`${o.toFixed(1)}%`,onChange:o=>{e.taxDrag=o/100,t.updateResultsOnly()}}),$e({sliderId:"slider-retgrowth",numId:"num-retgrowth",dispId:"disp-retgrowth",formatter:o=>`${o.toFixed(1)}%`,onChange:o=>{e.retireGrowthRate=o/100,t.updateResultsOnly()}})}document.documentElement.setAttribute("data-theme",e.theme);const Or=document.getElementById("app"),ht={renderApp:jt,renderControlsPanel:Lr,updateResultsOnly:qt};function jt(){const t=e.householdMode==="couple";nr(),Or.innerHTML=`
    <div class="container">
      ${sr(t)}

      <main class="main-layout">
        <!-- Controls Sidebar (Persistent DOM Element) -->
        <aside id="controls-panel" class="panel" aria-label="Calculator Settings">
          ${Vt(t)}
        </aside>

        <!-- Dynamic Results Panel (Updated on Drag) -->
        <section id="results-container" class="results-container" aria-label="Results">
          <!-- Populated by updateResultsOnly() -->
        </section>
      </main>

      ${cr()}
      ${rr()}
    </div>
  `,ir(ht),Ut(ht),qt()}function Lr(){const t=document.getElementById("controls-panel");t&&(t.innerHTML=Vt(e.householdMode==="couple"),Ut(ht))}function qt(){const t=e.householdMode==="couple",r=document.getElementById("results-container");if(r)if(e.viewMode==="simulator"){const a=Lt(),o=gt({...a,decumStrategy:e.decumStrategy}),s=er(a);r.innerHTML=wr(o,s,t),Ir(o,t,ht)}else{const a=_t(or());r.innerHTML=pr(a,t)}}jt();
