(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function l(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=l(o);fetch(o.href,i)}})();function st(t){if(t<71)return 0;const a={71:.0528,72:.054,73:.0553,74:.0567,75:.0582,76:.0598,77:.0617,78:.0636,79:.0658,80:.0682,81:.0708,82:.0738,83:.0771,84:.0808,85:.0851,86:.0899,87:.0955,88:.1021,89:.1099,90:.1192,91:.1306,92:.1449,93:.1634,94:.1879};return t>=95?.2:a[t]??1/(90-t)}function V(t,a=!0){if(t<=0)return 0;const l=[{limit:55867,rate:.15},{limit:111733,rate:.205},{limit:173205,rate:.26},{limit:246752,rate:.29},{limit:1/0,rate:.33}],r=15705;let o=0,i=t,d=0;for(const p of l){if(i<=0)break;const n=Math.min(i,p.limit-d);o+=n*p.rate,i-=n,d=p.limit}o=Math.max(0,o-r*.15),a&&t>2e3&&(o=Math.max(0,o-300));const c=[{limit:51446,rate:.0505},{limit:102894,rate:.0915},{limit:15e4,rate:.1116},{limit:22e4,rate:.1216},{limit:1/0,rate:.1316}],h=12399;let S=0,u=t;d=0;for(const p of c){if(u<=0)break;const n=Math.min(u,p.limit-d);S+=n*p.rate,u-=n,d=p.limit}S=Math.max(0,S-h*.0505);let f=0;return S>5315&&(f+=(S-5315)*.2),S>6802&&(f+=(S-6802)*.36),S+=f,o+S}function ne(t,a,l,r=!0){if(t<=0)return{totalTax:0,spouse1Tax:0,spouse2Tax:0,isSplit:!1};if(r&&(a>=65||l>=65)){const d=t/2,c=V(d,a>=65),h=V(d,l>=65);return{totalTax:Math.round(c+h),spouse1Tax:Math.round(c),spouse2Tax:Math.round(h),isSplit:!0}}const i=V(t,a>=65);return{totalTax:Math.round(i),spouse1Tax:Math.round(i),spouse2Tax:0,isSplit:!1}}function ve(t,a="single",l=65,r=65,o=!0){let i=t,d=t*2.5,c=t;for(let S=0;S<40;S++){const u=(i+d)/2,f=a==="couple"?ne(u,l,r,o):{totalTax:V(u,l>=65)},p=u-f.totalTax;if(Math.abs(p-t)<1){c=u;break}p<t?i=u:d=u,c=u}const h=a==="couple"?ne(c,l,r,o):{totalTax:V(c,l>=65),isSplit:!1};return{gross:Math.round(c),tax:Math.round(h.totalTax),effectiveRate:c>0?h.totalTax/c:0,isSplit:h.isSplit}}function Ue(t,a,l="single",r=65,o=65){const i=Math.max(0,Math.min(.95,a));let d=t,c=t*1.5,h=t;for(let p=0;p<35;p++){const n=(d+c)/2,v=n*i*.5,R=l==="couple"?ne(v,r,o,!0).totalTax:V(v,r>=65),w=n-R;if(Math.abs(w-t)<1){h=n;break}w<t?d=n:c=n,h=n}const u=h*i*.5,f=l==="couple"?ne(u,r,o,!0).totalTax:V(u,r>=65);return{gross:Math.round(h),tax:Math.round(f)}}function mt(t){const{householdMode:a="single",annualSaving:l,mode:r,reinvestRefund:o,yearsAccumulation:i,retireAge:d,person2RetireAge:c=d,retireNetSpending:h,workTaxRate:S,person2WorkTaxRate:u=S*.75,growthRatePreTax:f,taxDrag:p,retireGrowthRate:n,enableIncomeSplitting:m=!0}=t,v=Math.max(18,d-i),R=Math.max(18,c-i),w=a==="couple"?32490*2:32490,E=l>w,x=a==="couple"?(S+u)/2:S;let g=0,b=0,y=0,k=0,F=0,L=0;r==="preTax"?(g=l,F=l*i,b=l*(1-x),L=b*i,y=l*(1-x)):(b=l,L=l*i,y=l,o?(g=l/(1-x),F=l*i):(g=l,k=l*x,F=l*i));const P=[];let z=0;for(let $=1;$<=i;$++){const O=z,M=(O+g)*f;z=O+g+M,P.push({year:$,age:v+$-1,person2Age:a==="couple"?R+$-1:void 0,startBalance:Math.round(O),contribution:Math.round(g),growth:Math.round(M),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(z)})}const _=[],q=Math.max(0,f-p);let C=0,j=b*i;for(let $=1;$<=i;$++){const O=C,M=(O+b)*q;C=O+b+M,_.push({year:$,age:v+$-1,person2Age:a==="couple"?R+$-1:void 0,startBalance:Math.round(O),contribution:Math.round(b),growth:Math.round(M),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(C)})}const ae=[];let ie=0;for(let $=1;$<=i;$++){const O=ie,M=(O+y)*f;ie=O+y+M,ae.push({year:$,age:v+$-1,person2Age:a==="couple"?R+$-1:void 0,startBalance:Math.round(O),contribution:Math.round(y),growth:Math.round(M),withdrawalGross:0,taxPaid:0,withdrawalNet:0,endBalance:Math.round(ie)})}const le=ve(h,a,d,c,m),Ne=ve(h,"single",d),Ye=a==="couple"?Math.max(0,Ne.tax-le.tax):0,Be=[];let de=z,Ae=0;const Me=55;let Fe=!1,Ie=null,ze=0;const Je=a==="couple"?91e3*2:91e3;for(let $=1;$<=Me&&!(de<=0);$++){const O=d+$-1,M=c+$-1,B=de,Y=B*n,J=Math.min(O,M),be=st(a==="couple"?J:O),se=be>0?Math.round(B*be):0,Se=se>le.gross;Se&&Ie===null&&(Ie=O);const Te=Math.max(le.gross,se),ce=Math.min(B+Y,Te),ke=a==="couple"?ne(ce,O,M,m):{totalTax:V(ce,O>=65)},xe=Math.round(ke.totalTax),Re=Math.max(0,ce-xe),re=Math.max(0,Re-h);if(ze+=re,de=Math.max(0,B+Y-ce),Be.push({year:$,age:O,person2Age:a==="couple"?M:void 0,startBalance:Math.round(B),contribution:0,growth:Math.round(Y),withdrawalGross:Math.round(ce),taxPaid:xe,withdrawalNet:Math.round(Re),endBalance:Math.round(de),isRRIFForced:Se,rrifMinGross:se>0?se:void 0,surplusNet:re>0?re:void 0}),ce>=le.gross)Ae+=1;else{Ae+=ce/le.gross;break}if($>=40&&de>=z&&!Se){Fe=!0,Ae=55;break}}const De=C>0?Math.max(0,(C-j)/C):0,we=Ue(h,De,a,d,c),He=[];let fe=C,H=0;const A=n*.85;let D=!1;for(let $=1;$<=Me&&!(fe<=0);$++){const O=d+$-1,M=c+$-1,B=fe,Y=B*A,J=Math.min(B+Y,we.gross),be=a==="couple"?ne(J*De*.5,O,M,!0).totalTax:V(J*De*.5,O>=65),se=J-be;if(fe=Math.max(0,B+Y-J),He.push({year:$,age:O,person2Age:a==="couple"?M:void 0,startBalance:Math.round(B),contribution:0,growth:Math.round(Y),withdrawalGross:Math.round(J),taxPaid:Math.round(be),withdrawalNet:Math.round(se),endBalance:Math.round(fe)}),J>=we.gross)H+=1;else{H+=J/we.gross;break}if($>=40&&fe>=C){D=!0,H=55;break}}const ee=h,K=[];let te=ie,pe=0,ye=!1;for(let $=1;$<=Me&&!(te<=0);$++){const O=d+$-1,M=c+$-1,B=te,Y=B*n,J=Math.min(B+Y,ee);if(te=Math.max(0,B+Y-J),K.push({year:$,age:O,person2Age:a==="couple"?M:void 0,startBalance:Math.round(B),contribution:0,growth:Math.round(Y),withdrawalGross:Math.round(J),taxPaid:0,withdrawalNet:Math.round(J),endBalance:Math.round(te)}),J>=ee)pe+=1;else{pe+=J/ee;break}if($>=40&&te>=ie){ye=!0,pe=55;break}}return{params:t,exceedsRrspLimit:E,rrspAnnualLimit:w,rrsp:{accountName:a==="couple"?"Couple's Joint RRSP / RRIF":"RRSP / RRIF",terminalBalance:Math.round(z),totalOutofPocketCost:Math.round(F),totalTaxRefundsReceived:Math.round(k*i),annualGrossWithdrawalNeeded:le.gross,annualRetirementTaxPaid:le.tax,longevityYears:Math.round(Ae*10)/10,isPerpetual:Fe,oasClawbackRisk:le.gross>=Je,firstRRIFForcedAge:Ie,totalRRIFSurplusCash:Math.round(ze),couplesTaxAdvantageAnnual:Math.round(Ye),accumulationHistory:P,decumulationHistory:Be},nonReg:{accountName:a==="couple"?"Couple's Personal Account (Joint PI)":"Personal Investment (Taxable Non-Registered)",terminalBalance:Math.round(C),totalOutofPocketCost:Math.round(L),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:we.gross,annualRetirementTaxPaid:we.tax,longevityYears:Math.round(H*10)/10,isPerpetual:D,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:_,decumulationHistory:He},tfsa:{accountName:a==="couple"?"Couple's Combined TFSAs":"TFSA (Tax-Free Savings Account)",terminalBalance:Math.round(ie),totalOutofPocketCost:Math.round(L),totalTaxRefundsReceived:0,annualGrossWithdrawalNeeded:ee,annualRetirementTaxPaid:0,longevityYears:Math.round(pe*10)/10,isPerpetual:ye,oasClawbackRisk:!1,firstRRIFForcedAge:null,totalRRIFSurplusCash:0,accumulationHistory:ae,decumulationHistory:K}}}function Xe(t){const{householdMode:a="single",annualSaving:l,yearsAccumulation:r,retireAge:o,person2RetireAge:i=o,retireNetSpending:d,workTaxRate:c,person2WorkTaxRate:h=c*.75,growthRatePreTax:S,taxDrag:u,retireGrowthRate:f,enableIncomeSplitting:p=!0,rrspPct:n,piPct:m,tfsaPct:v,reinvestRefundTo:R,decumStrategy:w}=t,E=Math.max(18,o-r),x=Math.max(18,i-r),g=a==="couple"?32490*2:32490,b=a==="couple"?91e3*2:91e3;let y=0,k=0,F=0,L=0,P=0,z=0;if(t.person1RrspSaving!==void 0||t.person2RrspSaving!==void 0||t.piSaving!==void 0)a==="couple"?(P=Math.min(32490,Math.max(0,t.person1RrspSaving??0)),z=Math.min(32490,Math.max(0,t.person2RrspSaving??0)),y=P+z,k=Math.max(0,t.piSaving??0),F=Math.max(0,t.tfsaSaving??0),L=P*c+z*h):(P=Math.min(32490,Math.max(0,t.person1RrspSaving??0)),y=P,k=Math.max(0,t.piSaving??0),F=Math.max(0,t.tfsaSaving??0),L=P*c);else{const H=n+m+v||100,A=n/H,D=m/H,ee=v/H;if(y=l*A,k=l*D,F=l*ee,y>g){const K=y-g;y=g,F+=K*.5,k+=K*.5}a==="couple"?(P=y*.5,z=y*.5,L=P*c+z*h):(P=y,L=y*c)}R==="tfsa"?F+=L:R==="pi"&&(k+=L);let q=0,C=0,j=0,ae=0;const ie=[],le=Math.max(0,S-u);for(let H=1;H<=r;H++){const A=E+H-1,D=x+H-1,ee=q,K=C,te=j,pe=(ee+y)*S,ye=(K+k)*le,$=(te+F)*S;q=ee+y+pe,C=K+k+ye,j=te+F+$,ae+=k,ie.push({year:H,age:A,person2Age:a==="couple"?D:void 0,rrspStart:Math.round(ee),piStart:Math.round(K),tfsaStart:Math.round(te),totalStart:Math.round(ee+K+te),rrspContrib:Math.round(y),piContrib:Math.round(k),tfsaContrib:Math.round(F),taxRefund:Math.round(L),rrspGrowth:Math.round(pe),piGrowth:Math.round(ye),tfsaGrowth:Math.round($),guaranteedGross:0,guaranteedNet:0,portfolioNetDraw:0,cppIncome:0,oasIncome:0,dbPensionIncome:0,otherIncome:0,rrspGrossDraw:0,piGrossDraw:0,tfsaGrossDraw:0,totalGrossDraw:0,rrspTax:0,piTax:0,totalTax:0,netSpendReceived:0,rrspEnd:Math.round(q),piEnd:Math.round(C),tfsaEnd:Math.round(j),totalEnd:Math.round(q+C+j),notes:"Accumulating"})}const Ne={rrsp:Math.round(q),pi:Math.round(C),tfsa:Math.round(j),total:Math.round(q+C+j)};let Ye=0,Be=0,de=0,Ae=!1,Me=0,Fe=0,Ie=0;const ze=55,Je=f*.85;for(let H=1;H<=ze;H++){const A=o+H-1,D=i+H-1,ee=q+C+j;if(ee<=0)break;const K=q,te=C,pe=j,ye=K*f,$=te*Je,O=pe*f;let M=K+ye,B=te+$,Y=pe+O;const J=Math.min(A,D),be=st(a==="couple"?J:A),se=be>0?Math.min(M,K*be):0;let Se=0,Te=0,ce=0,ke=0,xe=0,Re=0;if(t.includeOtherIncome){if(A>=(t.person1CppStartAge??65)&&(Se=t.person1CppAnnual??1e4),a==="couple"&&D>=(t.person2CppStartAge??65)&&(Te=t.person2CppAnnual??8e3),A>=65){const N=t.person1OasAnnual??8560;ce=A>=75?N*1.1:N}if(a==="couple"&&D>=65){const N=t.person2OasAnnual??8560;ke=D>=75?N*1.1:N}A>=(t.employerPensionStartAge??o)&&(xe=t.employerPensionAnnual??0),Re=t.otherTaxableIncome??0}const re=Se+Te+ce+ke+xe+Re;let Oe=0;if(re>0)if(a==="couple"){const N=Se+ce+xe*.5+Re*.5,U=Te+ke+xe*.5+Re*.5,W=V(N,A>=65),Z=V(U,D>=65);Oe=W+Z}else Oe=V(re,A>=65);const We=Math.max(0,re-Oe);let ue=Math.max(0,d-We);H===1&&(Fe=re,Ie=We);let I=0,X=0,oe=0,Ze=!1,_e=!1,Ee="";const ge=C>0?Math.max(0,(C-ae)/C):0;if(w==="oasShield"){const N=a==="couple"?176e3:88e3,U=Math.max(se,Math.min(M,N));se>N?(Ze=!0,Ee="RRIF Min Exceeds OAS Cap"):_e=!0;const W=a==="couple"?ne(U,A,D,p).totalTax:V(U,A>=65);if(Math.max(0,U-W)>=ue){const G=ve(ue,a,A,D,p);I=Math.max(se,Math.min(M,G.gross))}else{I=U;const G=I-W;let Q=Math.max(0,ue-G);if(Q>0&&B>0){const Ce=Ue(Q,ge,a,A,D),je=Math.min(B,Ce.gross);X=je;const ut=a==="couple"?ne(je*ge*.5,A,D,!0).totalTax:V(je*ge*.5,A>=65),gt=je-ut;Q=Math.max(0,Q-gt)}if(Q>0&&Y>0){const Ce=Math.min(Y,Q);oe=Ce,Q=Math.max(0,Q-Ce)}}}else if(w==="rrspMeltdown"){const N=a==="couple"?18e4:105e3;if(A<71&&M>0){I=Math.min(M,N);const U=a==="couple"?ne(I,A,D,p).totalTax:V(I,A>=65),W=I-U;if(W<ue){const Z=ue-W;X=Math.min(B,Z);const G=Z-X;G>0&&(oe=Math.min(Y,G))}Ee="Early RRSP Meltdown"}else{const U=ve(ue,a,A,D,p);I=Math.max(se,Math.min(M,U.gross));const W=a==="couple"?ne(I,A,D,p).totalTax:V(I,A>=65),Z=I-W;let G=Math.max(0,ue-Z);G>0&&B>0&&(X=Math.min(B,G*1.05),G=Math.max(0,G-X)),G>0&&Y>0&&(oe=Math.min(Y,G)),Ee="Post-71 RRIF Mode"}}else if(w==="taxableFirst"){I=se;const N=I>0?a==="couple"?ne(I,A,D,p).totalTax:V(I,A>=65):0,U=I-N;let W=Math.max(0,ue-U);if(B>0&&W>0){const Z=Ue(W,ge,a,A,D),G=Math.min(B,Z.gross);X=G;const Q=G-(a==="couple"?ne(G*ge*.5,A,D,!0).totalTax:V(G*ge*.5,A>=65));W=Math.max(0,W-Q)}if(W>0&&M>I){const Z=ve(W,a,A,D,p),G=Math.min(M-I,Z.gross);I+=G}W>0&&Y>0&&(oe=Math.min(Y,W)),Ee=B>0?"Spending Taxable PI First":"PI Exhausted"}else{const N=M+B+Y,U=N>0?M/N:0,W=N>0?B/N:0,Z=N>0?Y/N:0,G=ve(ue*U,a,A,D,p).gross;I=Math.max(se,Math.min(M,G)),X=Math.min(B,ue*W*1.05),oe=Math.min(Y,ue*Z),Ee="Proportional Draw"}for(let N=0;N<3;N++){const U=re+I+X*ge*.5,W=a==="couple"?ne(U,A,D,p).totalTax:V(U,A>=65),Z=re+I+X+oe-W,G=d-Z;if(G<=300)break;if(Y>oe){const Q=Math.min(Y-oe,G);oe+=Q}else if(B>X){const Q=Math.min(B-X,G*1.05);X+=Q}else if(M>I){const Q=ve(G,a,A,D,p).gross,Ce=Math.min(M-I,Q);I+=Ce}else break}const et=X*ge*.5,Ve=re+I+et,tt=a==="couple"?ne(Ve,A,D,p):{totalTax:V(Ve,A>=65),isSplit:!1},Ge=tt.totalTax,nt=I+et,at=nt>0?Math.round((Ge-Oe)*(I/nt)):0,dt=Math.max(0,Math.round(Ge-Oe-at));if(Ye+=Ge,Ve>b){const N=(Ve-b)*.15;Be+=N}const qe=Math.round(re+I+X+oe-Ge),ct=Math.max(0,qe-We);q=Math.max(0,M-I),C=Math.max(0,B-X),j=Math.max(0,Y-oe),ae=Math.max(0,ae-X*(1-ge)),ie.push({year:r+H,age:A,person2Age:a==="couple"?D:void 0,rrspStart:Math.round(K),piStart:Math.round(te),tfsaStart:Math.round(pe),totalStart:Math.round(ee),rrspContrib:0,piContrib:0,tfsaContrib:0,taxRefund:0,rrspGrowth:Math.round(ye),piGrowth:Math.round($),tfsaGrowth:Math.round(O),guaranteedGross:Math.round(re),guaranteedNet:Math.round(We),portfolioNetDraw:Math.round(ct),cppIncome:Math.round(Se+Te),oasIncome:Math.round(ce+ke),dbPensionIncome:Math.round(xe),otherIncome:Math.round(Re),rrspGrossDraw:Math.round(I),piGrossDraw:Math.round(X),tfsaGrossDraw:Math.round(oe),totalGrossDraw:Math.round(I+X+oe),rrspTax:at,piTax:dt,totalTax:Math.round(Ge),netSpendReceived:qe,rrspEnd:Math.round(q),piEnd:Math.round(C),tfsaEnd:Math.round(j),totalEnd:Math.round(q+C+j),isRRIFForced:Ze,isOASCapped:_e,isIncomeSplit:tt.isSplit,notes:Ee});const pt=q+C+j;if(qe>=d*.85)de+=1;else if(pt<=100){de+=Math.max(0,qe/d);break}else de+=1;if(A===85&&(Me=Math.round(q*(1-.45)+C*(1-ge*.25)+j)),H>=45&&q+C+j>=Ne.total){Ae=!0,de=55;break}}const De=ve(d,a,o,i,p),we=ve(d,"single",o),He=a==="couple"?Math.max(0,we.tax-De.tax):0,fe={oasShield:{name:a==="couple"?"Dual OAS Shield & Income Splitting":"OAS Shield & Tax Smoothing",tagline:a==="couple"?"Splits RRIF income 50/50 and shields up to $182k combined from OAS clawback.":"Caps RRSP withdrawals below the ~$91k clawback line; bridges lifestyle with PI/TFSA."},rrspMeltdown:{name:"Early RRSP Meltdown",tagline:"Aggressively burns down RRSP between retirement and age 71 to eliminate the RRIF tax bomb."},taxableFirst:{name:"Taxable (PI) First",tagline:"Spends taxable personal investments first, allowing RRSP and TFSA to compound untouched."},proRata:{name:"Proportional Balanced Draw",tagline:"Draws simultaneously from RRSP, PI, and TFSA in proportion to their current balances."}};return{id:w,name:fe[w].name,tagline:fe[w].tagline,longevityYears:Math.round(de*10)/10,depletionAge:Math.round(o+de),isPerpetual:Ae,terminalBalanceAtRetirement:Ne,totalLifetimeRetirementTax:Math.round(Ye),totalOASClawbackPaid:Math.round(Be),totalRefundsAccumulated:Math.round(L*r),annualTaxRefund:Math.round(L),person1RrspSaving:Math.round(P),person2RrspSaving:Math.round(z),piSaving:Math.round(k),annualGuaranteedGrossAtRetirement:Math.round(Fe),annualGuaranteedNetAtRetirement:Math.round(Ie),estateValueAtAge85:Me,couplesAnnualTaxSavings:He,history:ie}}function vt(t){return["oasShield","rrspMeltdown","taxableFirst","proRata"].map(l=>Xe({...t,decumStrategy:l}))}function ht(t,a=95){const l=Math.max(1,a-t.retireAge),r=["oasShield","rrspMeltdown","taxableFirst","proRata"];let o=0,i="oasShield",d=null;for(const c of r){let h=15e3,S=4e5,u=15e3,f=null;for(let p=0;p<16;p++){const n=Math.round((h+S)/2/1e3)*1e3,m=Xe({...t,retireNetSpending:n,decumStrategy:c});m.isPerpetual||m.longevityYears>=l?(u=n,f=m,h=n+1e3):S=n-1e3}u>o&&f&&(o=u,i=c,d=f)}return{maxSpending:o,bestStrategy:i,strategyResult:d||Xe({...t,retireNetSpending:o,decumStrategy:i})}}const ft=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>`;let e={householdMode:"single",viewMode:"simulator",annualSaving:4e4,yearsAccumulation:15,retireAge:65,person2RetireAge:63,retireNetSpending:8e4,workTaxRate:.43,person2WorkTaxRate:.3,growthRatePreTax:.07,taxDrag:.015,retireGrowthRate:.05,enableIncomeSplitting:!0,p1RrspSaving:25e3,p2RrspSaving:1e4,piSaving:15e3,tfsaSaving:0,rrspPct:70,piPct:30,tfsaPct:0,reinvestRefundTo:"tfsa",decumStrategy:"oasShield",includeOtherIncome:!1,otherIncomeExpanded:!1,person1CppAnnual:1e4,person1CppStartAge:65,person2CppAnnual:8e3,person2CppStartAge:65,person1OasAnnual:8560,person2OasAnnual:8560,employerPensionAnnual:0,employerPensionStartAge:65,otherTaxableIncome:0,comparatorMode:"preTax",comparatorReinvest:!1,chartViewMode:"balances",blueprintSelectedAge:null,ledgerOpen:!1,theme:localStorage.getItem("theme")||"dark"};document.documentElement.setAttribute("data-theme",e.theme);const yt=document.getElementById("app");function s(t){return new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(t)}function Qe(t){return t>=1e6?`$${(t/1e6).toFixed(2)}M`:t>=1e3?`$${(t/1e3).toFixed(0)}k`:`$${t}`}function rt(){const t=e.householdMode==="couple",a=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving:e.p1RrspSaving+e.piSaving;return e.annualSaving=a,{householdMode:e.householdMode,annualSaving:e.annualSaving,yearsAccumulation:e.yearsAccumulation,retireAge:e.retireAge,person2RetireAge:e.person2RetireAge,retireNetSpending:e.retireNetSpending,workTaxRate:e.workTaxRate,person2WorkTaxRate:e.person2WorkTaxRate,growthRatePreTax:e.growthRatePreTax,taxDrag:e.taxDrag,retireGrowthRate:e.retireGrowthRate,enableIncomeSplitting:e.enableIncomeSplitting,rrspPct:e.rrspPct,piPct:e.piPct,tfsaPct:e.tfsaPct,person1RrspSaving:e.p1RrspSaving,person2RrspSaving:t?e.p2RrspSaving:0,piSaving:e.piSaving,tfsaSaving:e.tfsaSaving,reinvestRefundTo:e.reinvestRefundTo,includeOtherIncome:e.includeOtherIncome,person1CppAnnual:e.person1CppAnnual,person1CppStartAge:e.person1CppStartAge,person2CppAnnual:e.person2CppAnnual,person2CppStartAge:e.person2CppStartAge,person1OasAnnual:e.person1OasAnnual,person2OasAnnual:e.person2OasAnnual,employerPensionAnnual:e.employerPensionAnnual,employerPensionStartAge:e.employerPensionStartAge,otherTaxableIncome:e.otherTaxableIncome}}function he(){const t=e.householdMode==="couple",l="./calculator.svg";if(!t)e.p1RrspSaving+e.piSaving!==e.annualSaving&&(e.p1RrspSaving=Math.min(32490,Math.round(e.annualSaving*.7)),e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving));else if(e.p1RrspSaving+e.p2RrspSaving+e.piSaving!==e.annualSaving){const o=Math.min(32490,Math.round(e.annualSaving*.35));e.p1RrspSaving=o,e.p2RrspSaving=o,e.piSaving=Math.max(0,e.annualSaving-o*2)}yt.innerHTML=`
    <div class="container">
      <!-- Header -->
      <header class="app-header">
        <nav class="nav-bar">
          <div class="breadcrumb-group">
            <a href="https://neilhan.github.io/static" class="home-link" title="Back to Home" aria-label="Back to Home">
              <span class="home-icon" aria-hidden="true">${ft}</span>
            </a>
            <span class="breadcrumb-sep">/</span>
            <span class="badge-tag">RETIREMENT STRATEGY ENGINE</span>
          </div>
          <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
            ${e.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode"}
          </button>
        </nav>

        <div class="hero-banner">
          <img src="${l}" alt="Calculator Logo" class="app-logo" />
          <div class="hero-text">
            <h1>${t?"Couples Retirement Strategy Simulator":"Canadian Retirement Strategy Simulator"}</h1>
            <p>
              ${t?"Optimize household savings across Person 1 RRSP, Person 2 RRSP, and Personal Accounts. Model CRA pension income splitting (age 65+), dual basic personal tax credits, and dual OAS clawback shields.":"Optimize accumulation allocation (RRSP vs. Personal Investment vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."}
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
          ⚖️ Direct Account Comparison (RRSP vs PI vs TFSA)
        </button>
      </nav>

      <!-- Interactive Scenario Playbook Bar -->
      <div class="scenario-playbook-bar" aria-label="Quick Experiment Scenarios">
        <span class="scenario-playbook-label">🧪 Quick Scenarios:</span>
        <button type="button" class="scenario-chip" id="chip-scenario-baseline">
          🎯 Benchmark ($80k @ 65)
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

      <!-- Main Layout -->
      <main class="main-layout">
        <!-- Controls Sidebar (Persistent DOM Element) -->
        <aside id="controls-panel" class="panel" aria-label="Calculator Settings">
          ${ot(t)}
        </aside>

        <!-- Dynamic Results Panel (Updated on Drag) -->
        <section id="results-container" class="results-container" aria-label="Results">
          <!-- Populated by updateResultsOnly() -->
        </section>
      </main>

      <!-- Rules & Considerations Section -->
      ${It()}

      <footer class="footer-note">
        <p>Built with CRA RRIF prescribed factors (Age 71+), Pension Income Splitting (Form T1032), Federal & Provincial (Ontario benchmark) graduated brackets, Basic Personal Amounts, and Capital Gains 50% inclusion rules.</p>
        <p>© ${new Date().getFullYear()} static-apps · Educational financial model. Not formal financial advice.</p>
      </footer>
    </div>
  `,Tt(),lt(),T()}function Pe(){const t=document.getElementById("controls-panel");t&&(t.innerHTML=ot(e.householdMode==="couple"),lt())}function ot(t){const a=Math.max(18,e.retireAge-e.yearsAccumulation),l=Math.max(18,e.person2RetireAge-e.yearsAccumulation);return`
    <h2 class="panel-title">${t?"Household Profile & Targets":"Your Profile & Targets"}</h2>

    <!-- Total Annual Saving -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-saving">
          ${t?"Combined Household Saving":"Annual Total Saving"}
        </label>
        <span class="form-val-display" id="disp-saving">${s(e.annualSaving)}</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-saving" min="5000" max="150000" step="1000" value="${e.annualSaving}">
        <input type="number" id="num-saving" class="form-input-number" min="1000" max="300000" step="1000" value="${e.annualSaving}">
      </div>
    </div>

    <!-- Granular Savings Allocation Breakdown -->
    ${e.viewMode==="simulator"?bt(t):St()}

    <div class="divider"></div>

    <!-- Years of Accumulation -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-years">Years to Invest</label>
        <span class="form-val-display" id="disp-years">${e.yearsAccumulation} years</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-years" min="3" max="40" step="1" value="${e.yearsAccumulation}">
        <input type="number" id="num-years" class="form-input-number" min="1" max="50" step="1" value="${e.yearsAccumulation}">
      </div>
    </div>

    <!-- Retirement Ages -->
    ${t?`
      <div class="form-group">
        <label class="form-label">Retirement Ages (Person 1 & Person 2)</label>
        <div class="dual-person-grid">
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 1</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${e.retireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${a})</span>
            </div>
          </div>
          <div class="dual-person-card">
            <span class="dual-person-title">👤 Person 2</span>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <input type="number" id="num-retireage2" class="form-input-number" style="width:100%;text-align:left;" min="45" max="80" step="1" value="${e.person2RetireAge}">
              <span style="font-size:0.75rem;color:var(--text-muted);">(Starts @ ${l})</span>
            </div>
          </div>
        </div>
      </div>
      `:`
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-retireage">Retire at Age</label>
          <span class="form-val-display" id="disp-retireage">Age ${e.retireAge} <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);">(Starts @ ${a})</span></span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-retireage" min="50" max="75" step="1" value="${e.retireAge}">
          <input type="number" id="num-retireage" class="form-input-number" min="45" max="80" step="1" value="${e.retireAge}">
        </div>
      </div>
      `}

    <!-- Retirement Net Spending Goal -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-spend">
          ${t?"Household Spend (After-Tax)":"Retirement Spend (After-Tax)"}
        </label>
        <span class="form-val-display" id="disp-spend">${s(e.retireNetSpending)}/yr</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-spend" min="20000" max="250000" step="2500" value="${e.retireNetSpending}">
        <input type="number" id="num-spend" class="form-input-number" min="10000" max="400000" step="2500" value="${e.retireNetSpending}">
      </div>
      <button type="button" id="btn-optimize-spending" class="btn-optimize-spend">
        ⚡ Auto-Find Max Safe Spending (to Age 95)
      </button>
      <div id="optimize-spend-result" class="optimize-spend-banner" style="display:none;"></div>
    </div>

    <!-- Guaranteed Pensions & Other Income Section -->
    ${e.viewMode==="simulator"?xt(t):""}

    ${t?`
      <label class="reinvest-checkbox-row" style="margin-bottom:1rem;">
        <input type="checkbox" id="check-splitting" ${e.enableIncomeSplitting?"checked":""}>
        <span>Enable CRA Pension Income Splitting (Age 65+)</span>
      </label>`:""}

    <div class="divider"></div>

    <!-- Working Marginal Tax Rates -->
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
      </div>`:`
      <div class="form-group">
        <div class="form-label-row">
          <label class="form-label" for="slider-tax">Working Marginal Tax Rate</label>
          <span class="form-val-display" id="disp-tax">${(e.workTaxRate*100).toFixed(1)}%</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-tax" min="20" max="54" step="0.5" value="${e.workTaxRate*100}">
          <input type="number" id="num-tax" class="form-input-number" min="15" max="54" step="0.5" value="${e.workTaxRate*100}">
        </div>
      </div>`}

    <!-- Growth & Return Assumptions -->
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-growth">Annual Pre-Tax Return</label>
        <span class="form-val-display" id="disp-growth">${(e.growthRatePreTax*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-growth" min="3" max="12" step="0.5" value="${e.growthRatePreTax*100}">
        <input type="number" id="num-growth" class="form-input-number" min="1" max="15" step="0.5" value="${e.growthRatePreTax*100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-drag">Tax Drag (Personal Account)</label>
        <span class="form-val-display" id="disp-drag">${(e.taxDrag*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-drag" min="0.5" max="3.0" step="0.1" value="${e.taxDrag*100}">
        <input type="number" id="num-drag" class="form-input-number" min="0" max="5" step="0.1" value="${e.taxDrag*100}">
      </div>
    </div>

    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label" for="slider-retgrowth">Retirement Return Rate</label>
        <span class="form-val-display" id="disp-retgrowth">${(e.retireGrowthRate*100).toFixed(1)}%</span>
      </div>
      <div class="slider-container">
        <input type="range" id="slider-retgrowth" min="2" max="8" step="0.5" value="${e.retireGrowthRate*100}">
        <input type="number" id="num-retgrowth" class="form-input-number" min="1" max="10" step="0.5" value="${e.retireGrowthRate*100}">
      </div>
    </div>
  `}function bt(t){const a=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving:e.p1RrspSaving+e.piSaving,l=Math.max(1,a),r=Math.round(e.p1RrspSaving/l*100),o=t?Math.round(e.p2RrspSaving/l*100):0,i=Math.max(0,100-r-o),d=Math.round(e.p1RrspSaving*e.workTaxRate),c=Math.round(e.p2RrspSaving*e.person2WorkTaxRate),h=t?d+c:d;return`
    <div class="form-group">
      <div class="form-label-row">
        <label class="form-label">
          ${t?"Household Savings Allocation (RRSP vs PI)":"Savings Allocation (RRSP vs PI)"}
        </label>
      </div>

      <!-- Live Multi-Segment Allocation Bar -->
      <div class="allocation-bar-wrapper">
        <div class="allocation-bar">
          <div id="alloc-seg-p1" class="alloc-segment p1" style="width: ${r}%;"></div>
          ${t?`<div id="alloc-seg-p2" class="alloc-segment p2" style="width: ${o}%;"></div>`:""}
          <div id="alloc-seg-pi" class="alloc-segment pi" style="width: ${i}%;"></div>
        </div>
        <div class="alloc-labels-row">
          <span id="alloc-lbl-p1" style="color:var(--rrsp-color);">
            ${t?"P1 RRSP":"RRSP"}: ${r}% (${s(e.p1RrspSaving)})
          </span>
          ${t?`<span id="alloc-lbl-p2" style="color:#8b5cf6;">P2 RRSP: ${o}% (${s(e.p2RrspSaving)})</span>`:""}
          <span id="alloc-lbl-pi" style="color:var(--nonreg-color);">
            PI: ${i}% (${s(e.piSaving)})
          </span>
        </div>
      </div>

      <!-- Quick Preset Strategy Buttons -->
      <div class="alloc-presets-grid">
        ${t?`
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
            <span>👤</span> ${t?"Person 1 RRSP":"RRSP Contribution"}
          </span>
          <span id="refund-badge-p1" class="alloc-refund-badge">
            +${s(d)} tax refund
          </span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
          <span id="disp-p1-rrsp" class="form-val-display">${s(e.p1RrspSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-p1-rrsp" min="0" max="32490" step="500" value="${e.p1RrspSaving}">
          <input type="number" id="num-p1-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${e.p1RrspSaving}">
        </div>
      </div>

      <!-- Account 2: Person 2 RRSP / Spousal (Couples Only) -->
      ${t?`
        <div class="alloc-card p2">
          <div class="alloc-card-header">
            <span class="alloc-card-title">
              <span>👤</span> Person 2 RRSP / Spousal
            </span>
            <span id="refund-badge-p2" class="alloc-refund-badge">
              +${s(c)} tax refund
            </span>
          </div>
          <div class="form-label-row" style="margin-bottom:0.25rem;">
            <span style="font-size:0.75rem;color:var(--text-muted);">Max CRA Limit: $32,490/yr</span>
            <span id="disp-p2-rrsp" class="form-val-display">${s(e.p2RrspSaving)}</span>
          </div>
          <div class="slider-container">
            <input type="range" id="slider-p2-rrsp" min="0" max="32490" step="500" value="${e.p2RrspSaving}">
            <input type="number" id="num-p2-rrsp" class="form-input-number" min="0" max="32490" step="500" value="${e.p2RrspSaving}">
          </div>
        </div>
        `:""}

      <!-- Account 3: Personal Investment (PI) / Non-Registered -->
      <div class="alloc-card pi">
        <div class="alloc-card-header">
          <span class="alloc-card-title">
            <span>📈</span> ${t?"Household Personal Account (PI)":"Personal Investment (PI)"}
          </span>
          <span style="font-size:0.72rem;color:var(--text-muted);">50% Capital Gains</span>
        </div>
        <div class="form-label-row" style="margin-bottom:0.25rem;">
          <span style="font-size:0.75rem;color:var(--text-muted);">Taxable Non-Registered</span>
          <span id="disp-pi" class="form-val-display">${s(e.piSaving)}</span>
        </div>
        <div class="slider-container">
          <input type="range" id="slider-pi" min="0" max="100000" step="1000" value="${e.piSaving}">
          <input type="number" id="num-pi" class="form-input-number" min="0" max="250000" step="1000" value="${e.piSaving}">
        </div>
      </div>

      <!-- Tax Refund & Reinvestment Destination -->
      <div class="refund-summary-box">
        <div class="refund-summary-header">
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">
            🎁 Annual Household Tax Refund
          </span>
          <span id="total-refund-val" class="refund-summary-val">
            +${s(h)}/yr
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
  `}function St(){return`
    <div class="mode-selector">
      <span class="form-label">Comparison Baseline</span>
      <div class="mode-pills">
        <button id="mode-pretax" class="mode-pill ${e.comparatorMode==="preTax"?"active":""}">
          Pre-Tax Earnings
        </button>
        <button id="mode-cashout" class="mode-pill ${e.comparatorMode==="cashOut"?"active":""}">
          Cash Out-of-Pocket
        </button>
      </div>
      ${e.comparatorMode==="cashOut"?`
        <label class="reinvest-checkbox-row">
          <input type="checkbox" id="check-reinvest" ${e.comparatorReinvest?"checked":""}>
          <span>Gross-up & Reinvest RRSP Tax Refund</span>
        </label>`:""}
    </div>
  `}function xt(t){let a=0;e.includeOtherIncome&&(e.retireAge>=e.person1CppStartAge&&(a+=e.person1CppAnnual),e.retireAge>=65&&(a+=e.person1OasAnnual),t&&(e.person2RetireAge>=e.person2CppStartAge&&(a+=e.person2CppAnnual),e.person2RetireAge>=65&&(a+=e.person2OasAnnual)),e.retireAge>=e.employerPensionStartAge&&(a+=e.employerPensionAnnual),a+=e.otherTaxableIncome);const l=Math.round(a*.85),r=Math.min(100,Math.round(l/Math.max(1,e.retireNetSpending)*100)),o=Math.max(0,e.retireNetSpending-l);return`
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
        <!-- Live Coverage Summary Banner -->
        <div class="pension-coverage-banner" id="pension-coverage-banner">
          <div class="coverage-metrics-row">
            <span>🛡️ Covers: <strong>${s(l)}/yr net</strong> (${r}%)</span>
            <span>💼 Portfolio Bridges: <strong>${s(o)}/yr</strong></span>
          </div>
          <div class="coverage-progress-bar">
            <div class="coverage-seg-pension" style="width: ${r}%;"></div>
            <div class="coverage-seg-portfolio" style="width: ${100-r}%;"></div>
          </div>
        </div>

        <!-- Benchmark Presets Bar -->
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
          <!-- Person 1 CPP -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">👤 ${t?"Person 1 CPP":"Canada Pension Plan (CPP)"}</span>
              <span class="pension-field-tag" id="disp-p1-cpp">${s(e.person1CppAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-p1-cpp" min="0" max="22000" step="500" value="${e.person1CppAnnual}">
              <input type="number" id="num-p1-cpp" class="form-input-number" min="0" max="30000" step="500" value="${e.person1CppAnnual}">
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
              <span style="color:var(--text-muted);">Start Age:</span>
              <select id="select-p1-cpp-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                ${[60,61,62,63,64,65,66,67,68,69,70].map(i=>`<option value="${i}" ${e.person1CppStartAge===i?"selected":""}>Age ${i} ${i===65?"(Standard)":i<65?"(-"+((65-i)*7.2).toFixed(0)+"%)":"(+"+((i-65)*8.4).toFixed(0)+"%)"}</option>`).join("")}
              </select>
            </div>
          </div>

          <!-- Person 1 OAS -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🍁 ${t?"Person 1 OAS":"Old Age Security (OAS)"}</span>
              <span class="pension-field-tag" id="disp-p1-oas">${s(e.person1OasAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-p1-oas" min="0" max="12000" step="250" value="${e.person1OasAnnual}">
              <input type="number" id="num-p1-oas" class="form-input-number" min="0" max="15000" step="250" value="${e.person1OasAnnual}">
            </div>
            <div style="font-size:0.7rem;color:var(--text-muted);">Starts at Age 65 ($8,560 2024-2026 CRA rate). Subject to clawback above $91k.</div>
          </div>

          ${t?`
            <!-- Person 2 CPP -->
            <div class="pension-field-group">
              <div class="pension-field-header">
                <span class="pension-field-title">👤 Person 2 CPP</span>
                <span class="pension-field-tag" id="disp-p2-cpp">${s(e.person2CppAnnual)}/yr</span>
              </div>
              <div class="slider-container">
                <input type="range" id="slider-p2-cpp" min="0" max="22000" step="500" value="${e.person2CppAnnual}">
                <input type="number" id="num-p2-cpp" class="form-input-number" min="0" max="30000" step="500" value="${e.person2CppAnnual}">
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
                <span style="color:var(--text-muted);">Start Age:</span>
                <select id="select-p2-cpp-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                  ${[60,61,62,63,64,65,66,67,68,69,70].map(i=>`<option value="${i}" ${e.person2CppStartAge===i?"selected":""}>Age ${i} ${i===65?"(Standard)":i<65?"(-"+((65-i)*7.2).toFixed(0)+"%)":"(+"+((i-65)*8.4).toFixed(0)+"%)"}</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- Person 2 OAS -->
            <div class="pension-field-group">
              <div class="pension-field-header">
                <span class="pension-field-title">🍁 Person 2 OAS</span>
                <span class="pension-field-tag" id="disp-p2-oas">${s(e.person2OasAnnual)}/yr</span>
              </div>
              <div class="slider-container">
                <input type="range" id="slider-p2-oas" min="0" max="12000" step="250" value="${e.person2OasAnnual}">
                <input type="number" id="num-p2-oas" class="form-input-number" min="0" max="15000" step="250" value="${e.person2OasAnnual}">
              </div>
            </div>
            `:""}

          <!-- Employer DB Pension / Lifetime Annuity -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🏢 Employer Defined Benefit (DB) Pension</span>
              <span class="pension-field-tag" id="disp-db-pension">${s(e.employerPensionAnnual)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-db-pension" min="0" max="80000" step="2500" value="${e.employerPensionAnnual}">
              <input type="number" id="num-db-pension" class="form-input-number" min="0" max="150000" step="2500" value="${e.employerPensionAnnual}">
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.2rem;font-size:0.73rem;">
              <span style="color:var(--text-muted);">Pension Starts At:</span>
              <select id="select-db-pension-age" class="form-input-number" style="padding:0.15rem 0.4rem;font-size:0.75rem;">
                ${[55,58,60,62,65,67,70].map(i=>`<option value="${i}" ${e.employerPensionStartAge===i?"selected":""}>Age ${i}</option>`).join("")}
              </select>
            </div>
          </div>

          <!-- Other Taxable Income (Rental, Business, etc.) -->
          <div class="pension-field-group">
            <div class="pension-field-header">
              <span class="pension-field-title">🏠 Rental or Other Taxable Income</span>
              <span class="pension-field-tag" id="disp-other-inc">${s(e.otherTaxableIncome)}/yr</span>
            </div>
            <div class="slider-container">
              <input type="range" id="slider-other-inc" min="0" max="60000" step="2000" value="${e.otherTaxableIncome}">
              <input type="number" id="num-other-inc" class="form-input-number" min="0" max="150000" step="2000" value="${e.otherTaxableIncome}">
            </div>
          </div>
        </div>
        `:""}
    </div>
  `}function me(){let t=0;e.includeOtherIncome&&(e.retireAge>=e.person1CppStartAge&&(t+=e.person1CppAnnual),e.retireAge>=65&&(t+=e.person1OasAnnual),e.householdMode==="couple"&&(e.person2RetireAge>=e.person2CppStartAge&&(t+=e.person2CppAnnual),e.person2RetireAge>=65&&(t+=e.person2OasAnnual)),e.retireAge>=e.employerPensionStartAge&&(t+=e.employerPensionAnnual),t+=e.otherTaxableIncome);const a=Math.round(t*.85),l=Math.min(100,Math.round(a/Math.max(1,e.retireNetSpending)*100)),r=Math.max(0,e.retireNetSpending-a),o=document.getElementById("pension-coverage-banner");if(o){const i=o.querySelector(".coverage-metrics-row");i&&(i.innerHTML=`
        <span>🛡️ Covers: <strong>${s(a)}/yr net</strong> (${l}%)</span>
        <span>💼 Portfolio Bridges: <strong>${s(r)}/yr</strong></span>
      `);const d=o.querySelector(".coverage-seg-pension"),c=o.querySelector(".coverage-seg-portfolio");d&&(d.style.width=`${l}%`),c&&(c.style.width=`${100-l}%`)}}function T(){const t=e.householdMode==="couple",a=document.getElementById("results-container");if(a)if(e.viewMode==="simulator"){const l=rt(),r=Xe({...l,decumStrategy:e.decumStrategy}),o=vt(l);a.innerHTML=Rt(r,o,t),kt(r,t),Et(r,t)}else{const l=mt({householdMode:e.householdMode,annualSaving:e.annualSaving,mode:e.comparatorMode,reinvestRefund:e.comparatorReinvest,yearsAccumulation:e.yearsAccumulation,retireAge:e.retireAge,person2RetireAge:e.person2RetireAge,retireNetSpending:e.retireNetSpending,workTaxRate:e.workTaxRate,person2WorkTaxRate:e.person2WorkTaxRate,growthRatePreTax:e.growthRatePreTax,taxDrag:e.taxDrag,retireGrowthRate:e.retireGrowthRate,enableIncomeSplitting:e.enableIncomeSplitting});a.innerHTML=$t(l,t)}}function Le(){const t=e.householdMode==="couple",a=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving:e.p1RrspSaving+e.piSaving,l=Math.max(1,a),r=Math.round(e.p1RrspSaving/l*100),o=t?Math.round(e.p2RrspSaving/l*100):0,i=Math.max(0,100-r-o),d=document.getElementById("alloc-seg-p1"),c=document.getElementById("alloc-seg-p2"),h=document.getElementById("alloc-seg-pi");d&&(d.style.width=`${r}%`),c&&(c.style.width=`${o}%`),h&&(h.style.width=`${i}%`);const S=document.getElementById("alloc-lbl-p1"),u=document.getElementById("alloc-lbl-p2"),f=document.getElementById("alloc-lbl-pi");S&&(S.textContent=t?`P1 RRSP: ${r}% (${s(e.p1RrspSaving)})`:`RRSP: ${r}% (${s(e.p1RrspSaving)})`),u&&t&&(u.textContent=`P2 RRSP: ${o}% (${s(e.p2RrspSaving)})`),f&&(f.textContent=`PI: ${i}% (${s(e.piSaving)})`);const p=Math.round(e.p1RrspSaving*e.workTaxRate),n=Math.round(e.p2RrspSaving*e.person2WorkTaxRate),m=t?p+n:p,v=document.getElementById("refund-badge-p1");v&&(v.textContent=`+${s(p)} tax refund`);const R=document.getElementById("refund-badge-p2");R&&(R.textContent=`+${s(n)} tax refund`);const w=document.getElementById("total-refund-val");w&&(w.textContent=`+${s(m)}/yr`)}function $e(){const t=e.householdMode==="couple",a=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving:e.p1RrspSaving+e.piSaving;e.annualSaving=a;const l=document.getElementById("slider-saving"),r=document.getElementById("num-saving"),o=document.getElementById("disp-saving");l&&(l.value=a.toString()),r&&(r.value=a.toString()),o&&(o.textContent=s(a));const i=document.getElementById("slider-p1-rrsp"),d=document.getElementById("num-p1-rrsp"),c=document.getElementById("disp-p1-rrsp");if(i&&(i.value=e.p1RrspSaving.toString()),d&&(d.value=e.p1RrspSaving.toString()),c&&(c.textContent=s(e.p1RrspSaving)),t){const f=document.getElementById("slider-p2-rrsp"),p=document.getElementById("num-p2-rrsp"),n=document.getElementById("disp-p2-rrsp");f&&(f.value=e.p2RrspSaving.toString()),p&&(p.value=e.p2RrspSaving.toString()),n&&(n.textContent=s(e.p2RrspSaving))}const h=document.getElementById("slider-pi"),S=document.getElementById("num-pi"),u=document.getElementById("disp-pi");h&&(h.value=e.piSaving.toString()),S&&(S.value=e.piSaving.toString()),u&&(u.textContent=s(e.piSaving)),Le()}function it(t,a,l){const r=t.cppIncome||0,o=t.oasIncome||0,i=(t.dbPensionIncome||0)+(t.otherIncome||0),d=t.rrspGrossDraw||0,c=t.piGrossDraw||0,h=t.tfsaGrossDraw||0,S=r+o+i+d+c+h,u=Math.max(1,S),f=Math.round(r/u*100),p=Math.round(o/u*100),n=Math.round(i/u*100),m=Math.round(d/u*100),v=Math.round(c/u*100),R=Math.max(0,100-f-p-n-m-v);return`
    <!-- Multi-Segment Visual Income Breakdown Bar -->
    <div class="income-breakdown-bar-wrapper">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.25rem;">
        <span>Gross Income Composition (Total: ${s(S)})</span>
        <span style="color:#10b981;">Net Received: ${s(t.netSpendReceived)} (Tax: ${s(t.totalTax)})</span>
      </div>
      <div class="income-breakdown-bar">
        ${r>0?`<div class="income-bar-seg cpp" style="width:${f}%;" title="CPP: ${s(r)} (${f}%)"></div>`:""}
        ${o>0?`<div class="income-bar-seg oas" style="width:${p}%;" title="OAS: ${s(o)} (${p}%)"></div>`:""}
        ${i>0?`<div class="income-bar-seg db" style="width:${n}%;" title="DB Pension/Other: ${s(i)} (${n}%)"></div>`:""}
        ${d>0?`<div class="income-bar-seg rrsp" style="width:${m}%;" title="RRSP/RRIF: ${s(d)} (${m}%)"></div>`:""}
        ${c>0?`<div class="income-bar-seg pi" style="width:${v}%;" title="Personal (PI): ${s(c)} (${v}%)"></div>`:""}
        ${h>0?`<div class="income-bar-seg tfsa" style="width:${R}%;" title="TFSA: ${s(h)} (${R}%)"></div>`:""}
      </div>
      <div class="income-legend-row">
        ${r>0?`<div class="income-legend-item"><span class="income-legend-dot cpp"></span> CPP: ${s(r)} (${f}%)</div>`:""}
        ${o>0?`<div class="income-legend-item"><span class="income-legend-dot oas"></span> OAS: ${s(o)} (${p}%)</div>`:""}
        ${i>0?`<div class="income-legend-item"><span class="income-legend-dot db"></span> DB/Other: ${s(i)} (${n}%)</div>`:""}
        ${d>0?`<div class="income-legend-item"><span class="income-legend-dot rrsp"></span> RRSP: ${s(d)} (${m}%)</div>`:""}
        ${c>0?`<div class="income-legend-item"><span class="income-legend-dot pi"></span> PI: ${s(c)} (${v}%)</div>`:""}
        ${h>0?`<div class="income-legend-item"><span class="income-legend-dot tfsa"></span> TFSA: ${s(h)} (${R}%)"></div>`:""}
      </div>
    </div>

    ${t.guaranteedGross>0?`
      <div class="income-stack-container">
        <div class="income-stack-title">
          <span>🏛️</span> Full Retirement Income Stack at Age ${a}
        </div>
        <div class="income-stack-rows">
          <div class="income-stack-row">
            <span>1. Guaranteed Pensions & Other Sources (Gross):</span>
            <span style="font-weight:700;color:#60a5fa;">+${s(t.guaranteedGross)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span style="color:var(--text-muted);padding-left:1rem;">↳ CPP: ${s(r)} · OAS: ${s(o)}${i>0?` · Pension/Other: ${s(i)}`:""}</span>
            <span style="color:#93c5fd;font-weight:600;">Net: +${s(t.guaranteedNet)}/yr</span>
          </div>
          <div class="income-stack-row">
            <span>2. Investment Portfolio Net Draw Needed:</span>
            <span style="font-weight:700;color:#34d399;">+${s(t.portfolioNetDraw)}/yr</span>
          </div>
          <div class="income-stack-row total">
            <span>Total Net Spending Cash Delivered:</span>
            <span>${s(t.netSpendReceived)}/yr net (Goal: ${s(e.retireNetSpending)})</span>
          </div>
        </div>
      </div>
      `:""}

    <div class="blueprint-grid">
      <div class="blueprint-col rrsp">
        <div class="blueprint-col-title" style="color:var(--rrsp-color);">
          <span>🟣</span> ${l?"Joint RRSP / RRIF":"RRSP / RRIF"}
        </div>
        <div class="blueprint-amount">${s(t.rrspGrossDraw)}</div>
        <div class="blueprint-note">${t.isRRIFForced?"Mandatory RRIF Min Active":t.rrspGrossDraw>0?"Taxable graduated bracket draw":"$0 needed (deferred)"}</div>
      </div>
      <div class="blueprint-col pi">
        <div class="blueprint-col-title" style="color:var(--nonreg-color);">
          <span>🟠</span> Personal Account (PI)
        </div>
        <div class="blueprint-amount">${s(t.piGrossDraw)}</div>
        <div class="blueprint-note">${t.piGrossDraw>0?"50% capital gains inclusion":"$0 needed this year"}</div>
      </div>
      <div class="blueprint-col tfsa">
        <div class="blueprint-col-title" style="color:var(--tfsa-color);">
          <span>🟢</span> ${l?"Dual TFSAs":"TFSA"}
        </div>
        <div class="blueprint-amount">${s(t.tfsaGrossDraw)}</div>
        <div class="blueprint-note">${t.tfsaGrossDraw>0?"100% tax-free buffer":"Kept compounding tax-free"}</div>
      </div>
      <div class="blueprint-col net">
        <div class="blueprint-col-title" style="color:#10b981;">
          <span>💰</span> Net Cash Received
        </div>
        <div class="blueprint-amount" style="color:#10b981;">${s(t.netSpendReceived)}</div>
        <div class="blueprint-note">${t.guaranteedGross>0?`${s(t.guaranteedNet)} pensions + ${s(t.portfolioNetDraw)} portfolio`:`After paying ${s(t.totalTax)} in tax`}</div>
      </div>
    </div>
  `}function Rt(t,a,l){const r=Math.max(18,e.retireAge-e.yearsAccumulation),o=Math.max(18,e.person2RetireAge-e.yearsAccumulation),i=[...a].sort((u,f)=>f.longevityYears-u.longevityYears||u.totalLifetimeRetirementTax-f.totalLifetimeRetirementTax)[0],d=t.person1RrspSaving??e.p1RrspSaving,c=l?t.person2RrspSaving??e.p2RrspSaving:0,h=t.piSaving??e.piSaving,S=t.annualTaxRefund??Math.round(d*e.workTaxRate+c*e.person2WorkTaxRate);return`
    <!-- Couples Tax Advantage Banner -->
    ${l&&(t.couplesAnnualTaxSavings??0)>0?`
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 The Couples Pension Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, you utilize two sets of basic personal tax credits and keep income in the lowest tax brackets.</p>
        </div>
        <div class="couple-tax-val">
          +${s(t.couplesAnnualTaxSavings??0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Estimated Annual Tax Savings</div>
        </div>
      </div>`:""}

    <!-- Tailored Action Plan / Advisor -->
    <article class="advisor-card">
      <div class="advisor-title">
        <span>💡</span> ${l?"Your Custom 2-Person Household Action Plan":"Your Custom Tailored Strategy Action Plan"}
      </div>
      <div class="advisor-steps">
        <div class="advisor-step">
          <div class="step-num">1</div>
          <div class="step-content">
            ${l?`<strong>Working Years (Ages ${r} & ${o}):</strong> Save <strong>${s(e.annualSaving)}/year combined</strong>. Contribute <strong>${s(d)}</strong> to Person 1 RRSP, <strong>${s(c)}</strong> to Person 2 RRSP (or Spousal RRSP), and <strong>${s(h)}</strong> to your Personal Account. Reinvest your <strong>${s(S)} refund into ${e.reinvestRefundTo==="tfsa"?"both TFSAs ($7k each)":e.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`:`<strong>While Working (Next ${e.yearsAccumulation} Years):</strong> Contribute <strong>${s(d)}/year to your RRSP</strong> and <strong>${s(h)}/year to your Personal Account (PI)</strong>. Reinvest your annual <strong>${s(S)} tax refund</strong> into <strong>${e.reinvestRefundTo==="tfsa"?"TFSA":e.reinvestRefundTo==="pi"?"Personal Account":"spending"}</strong>.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">2</div>
          <div class="step-content">
            ${l?`<strong>At Retirement (Ages ${e.retireAge} & ${e.person2RetireAge}):</strong> Use the <strong>"${t.name}"</strong> sequence. At age 65, file <strong>CRA Form T1032</strong> to split up to 50% of RRIF withdrawals. This gives your household <strong>$182,000 of combined room</strong> before triggering any OAS clawback.`:`<strong>At Retirement (Age ${e.retireAge} to 71):</strong> Follow the <strong>"${t.name}"</strong> decumulation rule. Draw from RRSP up to the bracket cap while bridging with your Personal Account and TFSA.`}
          </div>
        </div>
        <div class="advisor-step">
          <div class="step-num">3</div>
          <div class="step-content">
            ${l?`<strong>At Age 71+:</strong> Convert RRSPs to RRIFs. <em>CRA Pro-Tip:</em> Base your mandatory RRIF minimum withdrawals on the <strong>younger spouse (Age ${Math.min(e.retireAge,e.person2RetireAge)})</strong> to legally minimize forced taxable withdrawals!`:"<strong>At Age 71+:</strong> Convert RRSP to a RRIF. Withdraw CRA mandated minimums and use your TFSA/PI as a tax-free buffer to avoid crossing into higher tax brackets and losing your OAS pension."}
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
        <div class="strat-card ${e.decumStrategy==="oasShield"?"active":""}" data-strat="oasShield">
          <div class="strat-card-title">🛡️ ${l?"Dual OAS Shield":"OAS Shield & Smoothing"} ${i.id==="oasShield"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">${l?"Splits income 50/50 and shields up to $182k combined from OAS clawback.":"Caps RRSP draw below the ~$91k clawback line; bridges shortfall from PI/TFSA."}</p>
        </div>
        <div class="strat-card ${e.decumStrategy==="rrspMeltdown"?"active":""}" data-strat="rrspMeltdown">
          <div class="strat-card-title">🔥 Early RRSP Meltdown ${i.id==="rrspMeltdown"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Burns down RRSP aggressively between retirement and 71 to crush the future RRIF tax bomb.</p>
        </div>
        <div class="strat-card ${e.decumStrategy==="taxableFirst"?"active":""}" data-strat="taxableFirst">
          <div class="strat-card-title">⏳ Taxable (PI) First ${i.id==="taxableFirst"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Spends taxable personal investment first, allowing tax-sheltered accounts to compound.</p>
        </div>
        <div class="strat-card ${e.decumStrategy==="proRata"?"active":""}" data-strat="proRata">
          <div class="strat-card-title">⚖️ Proportional Balanced Draw ${i.id==="proRata"?'<span class="badge-recommended">Optimal</span>':""}</div>
          <p class="strat-card-desc">Draws simultaneously from RRSP, PI, and TFSA in proportion to current account weights.</p>
        </div>
      </div>
    </section>

    <!-- Annual Withdrawal Blueprint Card -->
    ${(()=>{const u=t.history.filter(R=>R.age>=e.retireAge),f=e.retireAge,p=u.length>0?u[u.length-1].age:e.retireAge;let n=e.blueprintSelectedAge??e.retireAge;n<f&&(n=f),n>p&&(n=p),e.blueprintSelectedAge=n;const m=u.find(R=>R.age===n)||u[0]||t.history[0],v=n-e.retireAge+1;return`
      <article class="withdrawal-blueprint-card">
        <div class="blueprint-header">
          <div class="blueprint-title">
            <span>🎯</span> Retirement Income & Withdrawal Blueprint (${t.name})
          </div>
          <span class="badge-recommended">Target Spend: ${s(e.retireNetSpending)}/yr Net</span>
        </div>

        <!-- Interactive Age Explorer -->
        <div class="blueprint-age-explorer">
          <div class="blueprint-age-label-row">
            <span class="blueprint-age-title">📅 Inspect Cashflow Mix at Age:</span>
            <span class="blueprint-age-display" id="disp-blueprint-age">
              Age ${n} (Year ${v} of Retirement)${l&&m.person2Age?` · Spouse Age ${m.person2Age}`:""}
            </span>
          </div>
          <div class="blueprint-age-controls">
            <input type="range" id="slider-blueprint-age" min="${f}" max="${p}" step="1" value="${n}">
            <div class="blueprint-age-chips">
              <button type="button" class="age-chip ${n===f?"active":""}" data-age="${f}">
                Age ${f} (Retire Start)
              </button>
              ${p>=71?`<button type="button" class="age-chip ${n===71?"active":""}" data-age="71">Age 71 (RRIF Min Rule)</button>`:""}
              ${p>=75?`<button type="button" class="age-chip ${n===75?"active":""}" data-age="75">Age 75 (OAS +10% Boost)</button>`:""}
              ${p>=85?`<button type="button" class="age-chip ${n===85?"active":""}" data-age="85">Age 85 (Late Life)</button>`:""}
            </div>
          </div>
        </div>

        <!-- Dynamic Details Container (updates during slider scrubbing) -->
        <div id="blueprint-dynamic-details">
          ${it(m,n,l)}
        </div>

        <div class="blueprint-explanation">
          ${Pt(e.decumStrategy,l)}
        </div>
      </article>
      `})()}

    <!-- Strategy Scorecard Table -->
    <article class="scorecard-card">
      <h3 style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:0.85rem;color:var(--text-primary);">
        📊 Strategy Comparison Scorecard ${l?"(Household Combined)":""}
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
            ${a.map(u=>{const f=u.id===e.decumStrategy,p=u.id===i.id;return`
                <tr style="${f?"background:rgba(99,102,241,0.1);":""}">
                  <td class="td-left" style="font-weight:700;">
                    ${u.name} ${p?'<span class="badge-recommended">Top Pick</span>':""}
                  </td>
                  <td style="color:#10b981;font-weight:700;">${u.isPerpetual?"50+ Yrs":`${u.longevityYears} Yrs`}</td>
                  <td>${u.isPerpetual?"Age 100+":`Age ${u.depletionAge}`}</td>
                  <td style="color:${u.totalLifetimeRetirementTax===Math.min(...a.map(n=>n.totalLifetimeRetirementTax))?"#10b981":"var(--text-primary)"};">
                    ${s(u.totalLifetimeRetirementTax)}
                  </td>
                  <td style="color:${u.totalOASClawbackPaid===0?"#10b981":"#f59e0b"};">
                    ${s(u.totalOASClawbackPaid)}
                  </td>
                  <td>${s(u.estateValueAtAge85)}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </article>

    <!-- Visual Lifespan Chart -->
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 style="font-family:var(--font-display);font-size:1.15rem;color:var(--text-primary);margin-bottom:0.2rem;">
            ${e.chartViewMode==="incomeStreams"?`Annual Retirement Income & Cashflow Breakdown (Ages ${e.retireAge} to 95+)`:`Multi-Account Balance Lifespan Curve (Ages ${r} to 95+)`}
          </h3>
          <span style="font-size:0.75rem;color:var(--text-muted);">
            ${e.chartViewMode==="incomeStreams"?"Stacked annual cashflow received from pensions, investments, and government programs":"Projected investment balances compounding and decumulating over your lifespan"}
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
          <div class="legend-item"><span class="income-legend-dot tfsa"></span> TFSA Draw</div>
          <div class="legend-item"><span style="width:12px;height:2px;background:#10b981;display:inline-block;border-top:1px dashed #10b981;"></span> Target Net Spend</div>
          `:`
          <div class="legend-item"><span class="legend-dot total"></span> <strong>Total Wealth</strong></div>
          <div class="legend-item"><span class="legend-dot rrsp"></span> ${l?"Joint RRSP/RRIF":"RRSP/RRIF"}</div>
          <div class="legend-item"><span class="legend-dot nonreg"></span> Personal (PI)</div>
          <div class="legend-item"><span class="legend-dot tfsa"></span> ${l?"Dual TFSAs":"TFSA"}</div>
          `}
      </div>
      <div class="svg-chart-wrapper" id="chart-container">
        ${e.chartViewMode==="incomeStreams"?wt(t):At(t)}
        <div id="chart-tooltip" class="chart-tooltip"></div>
      </div>
    </div>

    <!-- Simulator Year-by-Year Ledger -->
    <div class="ledger-card">
      <div class="ledger-toggle-row" id="ledger-toggle" role="button" tabindex="0">
        <h2 class="panel-title" style="margin-bottom: 0;">
          📊 Year-by-Year Multi-Account Cash Flow ${l?"(2-Person Breakdown)":""}
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">
            ${e.ledgerOpen?"▲ Click to collapse":"▼ Click to view detailed ledger"}
          </span>
        </h2>
      </div>
      ${e.ledgerOpen?Mt(t,l):""}
    </div>
  `}function $t(t,a){return`
    ${a&&(t.rrsp.couplesTaxAdvantageAnnual??0)>0?`
      <div class="couple-tax-banner">
        <div class="couple-tax-text">
          <h4>🎉 Couples Income Splitting Advantage</h4>
          <p>By splitting income 50/50 between two spouses at age 65+, your RRSP gross withdrawal drops from ~$103,000 to ~$92,000 to yield $80,000 net!</p>
        </div>
        <div class="couple-tax-val">
          +${s(t.rrsp.couplesTaxAdvantageAnnual??0)}/yr
          <div style="font-size:0.75rem;font-weight:500;color:#6ee7b7;">Annual Tax Saved</div>
        </div>
      </div>`:""}

    <div class="comparison-grid">
      <!-- RRSP Card -->
      <article class="card card-rrsp">
        <div class="card-header">
          <span class="card-badge">${a?"Couple's Joint RRSP":"Tax-Deferred · RRIF at 71"}</span>
          <span class="card-title">${t.rrsp.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${t.rrsp.isPerpetual?"50+ Yrs":`${t.rrsp.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${e.retireAge+Math.floor(t.rrsp.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${s(t.rrsp.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${s(t.rrsp.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${s(t.rrsp.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- Personal (Non-Registered) Card -->
      <article class="card card-nonreg">
        <div class="card-header">
          <span class="card-badge">Taxable Account</span>
          <span class="card-title">${t.nonReg.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${t.nonReg.isPerpetual?"50+ Yrs":`${t.nonReg.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Depleted at Age ${e.retireAge+Math.floor(t.nonReg.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${s(t.nonReg.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${s(t.nonReg.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">${s(t.nonReg.annualRetirementTaxPaid)}/yr</span>
          </div>
        </div>
      </article>

      <!-- TFSA Card -->
      <article class="card card-tfsa">
        <div class="card-header">
          <span class="card-badge">Tax-Free Benchmark</span>
          <span class="card-title">${t.tfsa.accountName}</span>
        </div>
        <div class="hero-metric">
          <div class="hero-metric-label">Retirement Longevity</div>
          <div class="hero-metric-val">
            ${t.tfsa.isPerpetual?"50+ Yrs":`${t.tfsa.longevityYears} Yrs`}
          </div>
          <div class="hero-metric-sub">
            Funds household until Age ${e.retireAge+Math.floor(t.tfsa.longevityYears)}
          </div>
        </div>
        <div class="metric-rows">
          <div class="metric-row">
            <span class="metric-label">Terminal Balance:</span>
            <span class="metric-val">${s(t.tfsa.terminalBalance)}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Gross Draw Needed:</span>
            <span class="metric-val">${s(t.tfsa.annualGrossWithdrawalNeeded)}/yr</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Household Tax Paid:</span>
            <span class="metric-val">$0/yr</span>
          </div>
        </div>
      </article>
    </div>
  `}function At(t){const a=t.history,l=a.length;if(l===0)return'<p style="padding:2rem;text-align:center;">No data available</p>';let r=0;for(const P of a)r=Math.max(r,P.totalEnd,P.rrspEnd,P.piEnd,P.tfsaEnd);r=Math.max(r,1e4)*1.1;const o=800,i=300,d=70,c=20,h=20,S=35,u=o-d-c,f=i-h-S,p=P=>d+P/Math.max(1,l-1)*u,n=P=>h+f-P/r*f,m=P=>a.map((z,_)=>`${_===0?"M":"L"} ${p(_).toFixed(1)} ${n(z[P]).toFixed(1)}`).join(" "),v=m("totalEnd"),R=m("rrspEnd"),w=m("piEnd"),E=m("tfsaEnd"),x=p(0).toFixed(1),g=p(l-1).toFixed(1),b=(h+f).toFixed(1),y=`${v} L ${g} ${b} L ${x} ${b} Z`;let k="";for(let P=0;P<=4;P++){const z=r/4*P,_=n(z);k+=`
      <line x1="${d}" y1="${_}" x2="${o-c}" y2="${_}" class="chart-grid-line" />
      <text x="${d-8}" y="${_+4}" text-anchor="end" class="chart-axis-label">${Qe(z)}</text>
    `}let F="";const L=Math.max(1,Math.floor(l/6));for(let P=0;P<l;P+=L){const z=a[P],_=p(P);F+=`<text x="${_}" y="${i-10}" text-anchor="middle" class="chart-axis-label">Age ${z.age}</text>`}return`
    <svg viewBox="0 0 ${o} ${i}" class="svg-chart" id="svg-chart-el">
      <defs>
        <linearGradient id="total-wealth-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--total-color)" stop-opacity="0.22" />
          <stop offset="90%" stop-color="var(--total-color)" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${k}
      ${F}
      <!-- Total Wealth Translucent Area Gradient -->
      <path d="${y}" fill="url(#total-wealth-grad)" />
      <!-- Account-Specific Paths -->
      <path d="${E}" class="chart-line tfsa" />
      <path d="${w}" class="chart-line nonreg" />
      <path d="${R}" class="chart-line rrsp" />
      <!-- Total Wealth Prominent Curve -->
      <path d="${v}" class="chart-line total" />
      <line id="hover-line" x1="0" y1="${h}" x2="0" y2="${h+f}" class="chart-hover-line" style="display:none;" />
    </svg>
  `}function wt(t){const a=t.history.filter(g=>g.age>=e.retireAge),l=a.length;if(l===0)return'<p style="padding:2rem;text-align:center;color:var(--text-muted);">No retirement data available for current settings.</p>';let r=e.retireNetSpending;for(const g of a){const b=(g.cppIncome||0)+(g.oasIncome||0)+(g.dbPensionIncome||0)+(g.otherIncome||0)+g.rrspGrossDraw+g.piGrossDraw+g.tfsaGrossDraw;b>r&&(r=b)}r=Math.max(r,1e4)*1.15;const o=800,i=300,d=70,c=20,h=25,S=35,u=o-d-c,f=i-h-S,p=g=>h+f-g/r*f,n=Math.max(4,Math.min(22,u/l*.72));let m="";for(let g=0;g<=4;g++){const b=r/4*g,y=p(b);m+=`
      <line x1="${d}" y1="${y.toFixed(1)}" x2="${(o-c).toFixed(1)}" y2="${y.toFixed(1)}" class="chart-grid-line" />
      <text x="${(d-8).toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="end" class="chart-axis-label">${Qe(b)}</text>
    `}const v=p(e.retireNetSpending),R=`
    <line x1="${d}" y1="${v.toFixed(1)}" x2="${(o-c).toFixed(1)}" y2="${v.toFixed(1)}" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4" />
    <text x="${(o-c).toFixed(1)}" y="${(v-6).toFixed(1)}" text-anchor="end" fill="#10b981" font-size="11" font-weight="700">Target Net: ${Qe(e.retireNetSpending)}</text>
  `;let w="",E="";const x=Math.max(1,Math.floor(l/7));for(let g=0;g<l;g++){const b=a[g],y=d+g/Math.max(1,l-1)*u,k=y-n/2;(g%x===0||g===l-1)&&(E+=`<text x="${y.toFixed(1)}" y="${i-10}" text-anchor="middle" class="chart-axis-label">Age ${b.age}</text>`);const F=b.cppIncome||0,L=b.oasIncome||0,P=(b.dbPensionIncome||0)+(b.otherIncome||0),z=b.rrspGrossDraw||0,_=b.piGrossDraw||0,q=b.tfsaGrossDraw||0;let C=0;const j=[{val:F,color:"#3b82f6"},{val:L,color:"#60a5fa"},{val:P,color:"#818cf8"},{val:z,color:"var(--rrsp-color)"},{val:_,color:"var(--nonreg-color)"},{val:q,color:"var(--tfsa-color)"}];for(const ae of j){if(ae.val<=0)continue;const ie=ae.val/r*f,le=p(C+ae.val);w+=`<rect x="${k.toFixed(1)}" y="${le.toFixed(1)}" width="${n.toFixed(1)}" height="${ie.toFixed(1)}" fill="${ae.color}" rx="1" opacity="0.9" />`,C+=ae.val}}return`
    <svg viewBox="0 0 ${o} ${i}" class="svg-chart" id="svg-chart-el">
      ${m}
      ${R}
      ${w}
      ${E}
      <line id="hover-line" x1="0" y1="${h}" x2="0" y2="${h+f}" class="chart-hover-line" style="display:none;" />
    </svg>
  `}function Pt(t,a){return t==="oasShield"?a?"<strong>The OAS Shield Formula:</strong> Withdraw from your Joint RRSP/RRIF up to <strong>$176,000/yr combined</strong> ($88,000 per spouse via CRA Form T1032 pension income splitting). This keeps both spouses below the ~$91,000 OAS clawback line. Shortfall is bridged from your <strong>Personal Account (PI)</strong> (where only 50% of capital gains are taxed) and your <strong>TFSA</strong> (100% tax-free).":"<strong>The OAS Shield Formula:</strong> Withdraw from RRSP up to <strong>$88,000/yr</strong> to stay just below the ~$91,000 OAS clawback line. Shortfalls are bridged from your <strong>Personal Account (PI)</strong> (50% capital gains inclusion) and your <strong>TFSA</strong> (tax-free).":t==="rrspMeltdown"?a?`<strong>Early RRSP Meltdown Formula:</strong> Draw aggressively from RRSPs (up to <strong>$180,000/yr combined</strong>) between retirement and age 71. This shrinks your future RRIF balance to dismantle the "tax bomb" when CRA mandatory minimums take effect at age 71. If after-tax proceeds are below your ${s(e.retireNetSpending)} target, take the remaining from PI, then TFSA.`:"<strong>Early RRSP Meltdown Formula:</strong> Draw up to <strong>$105,000/yr</strong> from your RRSP before age 71 to burn down the tax-deferred balance before forced CRA minimums begin. Supplement with PI and TFSA if needed.":t==="taxableFirst"?"<strong>Taxable (PI) First Formula:</strong> Withdraw <strong>100% of spending from your Personal Investment (PI)</strong> first until it reaches $0. During this time, take <strong>$0 from RRSP</strong> (until mandatory RRIF minimums start at age 71) and <strong>$0 from TFSA</strong>. This allows tax-sheltered accounts to compound untouched for as many years as possible.":`<strong>Proportional Balanced Draw Formula:</strong> Withdraw simultaneously from RRSP, Personal Account, and TFSA based on their current balance weights. Each account pays its proportional share toward your ${s(e.retireNetSpending)} after-tax spending goal.`}function Mt(t,a){const l=t.history.map(r=>{const o=r.age>=e.retireAge;return`
        <tr>
          <td class="td-left" style="font-weight:600;">
            <span class="badge-age">${a&&r.person2Age?`P1: Age ${r.age} · P2: Age ${r.person2Age}`:`Age ${r.age}`}</span>
            ${r.isIncomeSplit?'<span class="badge-rrif-min" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4);">Pension Split</span>':""}
            ${r.notes?`<span class="badge-rrif-min">${r.notes}</span>`:""}
          </td>
          <td class="td-highlight-rrsp">${s(r.rrspEnd)}</td>
          <td class="td-highlight-nonreg">${s(r.piEnd)}</td>
          <td style="color:var(--tfsa-color);">${s(r.tfsaEnd)}</td>
          <td style="font-weight:700;color:var(--total-color);">${s(r.totalEnd)}</td>
          ${e.includeOtherIncome?`<td style="color:#60a5fa;font-weight:600;">${o&&r.guaranteedGross>0?s(r.guaranteedGross):"—"}</td>`:""}
          <td style="color:var(--rrsp-color);font-weight:600;">
            ${o?r.rrspGrossDraw>0?s(r.rrspGrossDraw):"—":r.rrspContrib>0?`+${s(r.rrspContrib)}`:"—"}
          </td>
          <td style="color:var(--nonreg-color);font-weight:600;">
            ${o?r.piGrossDraw>0?s(r.piGrossDraw):"—":r.piContrib>0?`+${s(r.piContrib)}`:"—"}
          </td>
          <td style="color:var(--tfsa-color);font-weight:600;">
            ${o?r.tfsaGrossDraw>0?s(r.tfsaGrossDraw):"—":r.tfsaContrib>0?`+${s(r.tfsaContrib)}`:"—"}
          </td>
          <td style="color:${r.totalTax>0?"#f87171":"var(--text-muted)"};">${s(r.totalTax)}</td>
          <td style="color:#10b981;font-weight:700;">
            ${o?s(r.netSpendReceived):"Accumulating"}
          </td>
        </tr>
      `}).join("");return`
    <div class="table-responsive">
      <table class="ledger-table">
        <thead>
          <tr>
            <th class="td-left">${a?"Couple Ages & Strategy":"Age & Status"}</th>
            <th>RRSP Balance</th>
            <th>Personal (PI) Balance</th>
            <th>TFSA Balance</th>
            <th>Total Wealth</th>
            ${e.includeOtherIncome?'<th style="color:#60a5fa;">Guaranteed Inc</th>':""}
            <th style="color:var(--rrsp-color);">RRSP Draw</th>
            <th style="color:var(--nonreg-color);">PI Draw</th>
            <th style="color:var(--tfsa-color);">TFSA Draw</th>
            <th>Tax Paid</th>
            <th style="color:#10b981;">Net Spend</th>
          </tr>
        </thead>
        <tbody>
          ${l}
        </tbody>
      </table>
    </div>
  `}function It(){return`
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
  `}function Tt(){document.getElementById("theme-toggle")?.addEventListener("click",()=>{e.theme=e.theme==="dark"?"light":"dark",localStorage.setItem("theme",e.theme),document.documentElement.setAttribute("data-theme",e.theme);const t=document.getElementById("theme-toggle");t&&(t.textContent=e.theme==="dark"?"☀️ Light Mode":"🌙 Dark Mode")}),document.getElementById("btn-household-single")?.addEventListener("click",()=>{e.householdMode!=="single"&&(e.householdMode="single",he())}),document.getElementById("btn-household-couple")?.addEventListener("click",()=>{e.householdMode!=="couple"&&(e.householdMode="couple",he())}),document.getElementById("tab-mode-sim")?.addEventListener("click",()=>{e.viewMode!=="simulator"&&(e.viewMode="simulator",he())}),document.getElementById("tab-mode-comp")?.addEventListener("click",()=>{e.viewMode!=="comparator"&&(e.viewMode="comparator",he())}),document.getElementById("chip-scenario-baseline")?.addEventListener("click",()=>{e.retireAge=65,e.person2RetireAge=63,e.yearsAccumulation=15,e.retireNetSpending=8e4,e.decumStrategy="oasShield",he()}),document.getElementById("chip-scenario-early")?.addEventListener("click",()=>{e.retireAge=58,e.person2RetireAge=56,e.yearsAccumulation=18,e.retireNetSpending=65e3,e.decumStrategy="rrspMeltdown",he()}),document.getElementById("chip-scenario-fat")?.addEventListener("click",()=>{e.retireNetSpending=11e4,e.decumStrategy="oasShield";const t=document.getElementById("slider-spend"),a=document.getElementById("num-spend"),l=document.getElementById("disp-spend");t&&(t.value="110000"),a&&(a.value="110000"),l&&(l.textContent=`${s(11e4)}/yr`),T()}),document.getElementById("chip-scenario-cppoas")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,e.householdMode==="couple"&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),Pe(),T()})}function lt(){const t=e.householdMode==="couple",a=document.getElementById("slider-saving"),l=document.getElementById("num-saving"),r=document.getElementById("disp-saving"),o=n=>{if(e.annualSaving=n,r&&(r.textContent=s(n)),t){const g=e.p1RrspSaving+e.p2RrspSaving+e.piSaving||1,b=e.p1RrspSaving/g,y=e.p2RrspSaving/g;let k=Math.round(n*b),F=Math.round(n*y),L=n-k-F;k>32490&&(L+=k-32490,k=32490),F>32490&&(L+=F-32490,F=32490),e.p1RrspSaving=k,e.p2RrspSaving=F,e.piSaving=Math.max(0,L)}else{const g=e.p1RrspSaving+e.piSaving||1,b=e.p1RrspSaving/g;let y=Math.round(n*b),k=n-y;y>32490&&(k+=y-32490,y=32490),e.p1RrspSaving=y,e.piSaving=Math.max(0,k)}const m=document.getElementById("slider-p1-rrsp"),v=document.getElementById("num-p1-rrsp"),R=document.getElementById("disp-p1-rrsp");if(m&&(m.value=e.p1RrspSaving.toString()),v&&(v.value=e.p1RrspSaving.toString()),R&&(R.textContent=s(e.p1RrspSaving)),t){const g=document.getElementById("slider-p2-rrsp"),b=document.getElementById("num-p2-rrsp"),y=document.getElementById("disp-p2-rrsp");g&&(g.value=e.p2RrspSaving.toString()),b&&(b.value=e.p2RrspSaving.toString()),y&&(y.textContent=s(e.p2RrspSaving))}const w=document.getElementById("slider-pi"),E=document.getElementById("num-pi"),x=document.getElementById("disp-pi");w&&(w.value=e.piSaving.toString()),E&&(E.value=e.piSaving.toString()),x&&(x.textContent=s(e.piSaving)),Le(),T()};a?.addEventListener("input",()=>{const n=parseFloat(a.value)||0;l&&(l.value=n.toString()),o(n)}),l?.addEventListener("input",()=>{const n=parseFloat(l.value)||0;a&&(a.value=n.toString()),o(n)});const i=(n,m,v,R)=>{const w=document.getElementById(n),E=document.getElementById(m),x=document.getElementById(v),g=b=>{R(b),x&&(x.textContent=s(b));const y=t?e.p1RrspSaving+e.p2RrspSaving+e.piSaving:e.p1RrspSaving+e.piSaving;e.annualSaving=y,a&&(a.value=y.toString()),l&&(l.value=y.toString()),r&&(r.textContent=s(y)),Le(),T()};w?.addEventListener("input",()=>{const b=parseFloat(w.value)||0;E&&(E.value=b.toString()),g(b)}),E?.addEventListener("input",()=>{const b=parseFloat(E.value)||0;w&&(w.value=b.toString()),g(b)})};i("slider-p1-rrsp","num-p1-rrsp","disp-p1-rrsp",n=>{e.p1RrspSaving=n}),t&&i("slider-p2-rrsp","num-p2-rrsp","disp-p2-rrsp",n=>{e.p2RrspSaving=n}),i("slider-pi","num-pi","disp-pi",n=>{e.piSaving=n}),t?(document.getElementById("preset-couple-equal")?.addEventListener("click",()=>{const n=Math.min(e.annualSaving,64980),m=Math.min(32490,Math.floor(n/2));e.p1RrspSaving=m,e.p2RrspSaving=m,e.piSaving=Math.max(0,e.annualSaving-m*2),$e(),T()}),document.getElementById("preset-couple-max")?.addEventListener("click",()=>{e.p1RrspSaving=32490,e.p2RrspSaving=32490,e.annualSaving=Math.max(e.annualSaving,64980),e.piSaving=Math.max(0,e.annualSaving-64980),$e(),T()}),document.getElementById("preset-couple-highearner")?.addEventListener("click",()=>{const n=Math.min(32490,e.annualSaving),m=Math.max(0,e.annualSaving-n),v=Math.min(32490,m);e.p1RrspSaving=n,e.p2RrspSaving=v,e.piSaving=Math.max(0,m-v),$e(),T()}),document.getElementById("preset-couple-balanced")?.addEventListener("click",()=>{const n=Math.round(e.annualSaving*.7),m=Math.min(32490,Math.floor(n/2)),v=Math.min(32490,n-m);e.p1RrspSaving=m,e.p2RrspSaving=v,e.piSaving=Math.max(0,e.annualSaving-m-v),$e(),T()})):(document.getElementById("preset-single-max")?.addEventListener("click",()=>{e.p1RrspSaving=Math.min(32490,e.annualSaving),e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving),$e(),T()}),document.getElementById("preset-single-balanced")?.addEventListener("click",()=>{e.p1RrspSaving=Math.min(32490,Math.round(e.annualSaving*.7)),e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving),$e(),T()}),document.getElementById("preset-single-half")?.addEventListener("click",()=>{e.p1RrspSaving=Math.min(32490,Math.round(e.annualSaving*.5)),e.piSaving=Math.max(0,e.annualSaving-e.p1RrspSaving),$e(),T()}),document.getElementById("preset-single-all")?.addEventListener("click",()=>{e.p1RrspSaving=Math.min(32490,e.annualSaving),e.piSaving=0,e.annualSaving=e.p1RrspSaving,$e(),T()}));const d=n=>{e.reinvestRefundTo=n,document.querySelectorAll(".refund-summary-box .preset-btn").forEach(m=>{m.classList.remove("active")}),document.getElementById(`refund-${n}`)?.classList.add("active"),T()};document.getElementById("refund-tfsa")?.addEventListener("click",()=>d("tfsa")),document.getElementById("refund-pi")?.addEventListener("click",()=>d("pi")),document.getElementById("refund-none")?.addEventListener("click",()=>d("none"));const c=(n,m,v,R,w)=>{const E=document.getElementById(n),x=document.getElementById(m),g=document.getElementById(v),b=y=>{w(y),g&&(g.textContent=R(y)),T()};E?.addEventListener("input",()=>{const y=parseFloat(E.value);x&&(x.value=y.toString()),b(y)}),x?.addEventListener("input",()=>{const y=parseFloat(x.value);isNaN(y)||(E&&(E.value=y.toString()),b(y))})};c("slider-years","num-years","disp-years",n=>`${Math.round(n)} years`,n=>{e.yearsAccumulation=Math.round(n)}),c("slider-retireage","num-retireage","disp-retireage",n=>`Age ${Math.round(n)}`,n=>{e.retireAge=Math.round(n)});const h=document.getElementById("num-retireage2");h?.addEventListener("input",()=>{const n=parseFloat(h.value);isNaN(n)||(e.person2RetireAge=Math.round(n),T())}),c("slider-spend","num-spend","disp-spend",n=>`${s(n)}/yr`,n=>{e.retireNetSpending=n}),document.getElementById("check-splitting")?.addEventListener("change",n=>{e.enableIncomeSplitting=n.target.checked,T()}),c("slider-tax","num-tax","disp-tax",n=>`${n.toFixed(1)}%`,n=>{e.workTaxRate=n/100,Le()});const S=document.getElementById("num-tax2");S?.addEventListener("input",()=>{const n=parseFloat(S.value);isNaN(n)||(e.person2WorkTaxRate=n/100,Le(),T())}),c("slider-growth","num-growth","disp-growth",n=>`${n.toFixed(1)}%`,n=>{e.growthRatePreTax=n/100}),c("slider-drag","num-drag","disp-drag",n=>`${n.toFixed(1)}%`,n=>{e.taxDrag=n/100}),c("slider-retgrowth","num-retgrowth","disp-retgrowth",n=>`${n.toFixed(1)}%`,n=>{e.retireGrowthRate=n/100});const u=document.getElementById("check-other-income");if(u?.addEventListener("change",()=>{e.includeOtherIncome=u.checked,Pe(),T()}),document.getElementById("btn-toggle-income-details")?.addEventListener("click",()=>{e.otherIncomeExpanded=!e.otherIncomeExpanded,Pe()}),document.getElementById("preset-pension-standard")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,t&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=0,e.otherTaxableIncome=0,Pe(),T()}),document.getElementById("preset-pension-max")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.person1CppAnnual=16375,e.person1CppStartAge=65,e.person1OasAnnual=8560,t&&(e.person2CppAnnual=16375,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=0,e.otherTaxableIncome=0,Pe(),T()}),document.getElementById("preset-pension-db")?.addEventListener("click",()=>{e.includeOtherIncome=!0,e.person1CppAnnual=1e4,e.person1CppStartAge=65,e.person1OasAnnual=8560,t&&(e.person2CppAnnual=8e3,e.person2CppStartAge=65,e.person2OasAnnual=8560),e.employerPensionAnnual=3e4,e.employerPensionStartAge=e.retireAge,e.otherTaxableIncome=0,Pe(),T()}),document.getElementById("preset-pension-reset")?.addEventListener("click",()=>{e.includeOtherIncome=!1,e.employerPensionAnnual=0,e.otherTaxableIncome=0,Pe(),T()}),e.includeOtherIncome&&e.otherIncomeExpanded){c("slider-p1-cpp","num-p1-cpp","disp-p1-cpp",v=>`${s(v)}/yr`,v=>{e.person1CppAnnual=v,me()});const n=document.getElementById("select-p1-cpp-age");if(n?.addEventListener("change",()=>{e.person1CppStartAge=parseInt(n.value,10),me(),T()}),c("slider-p1-oas","num-p1-oas","disp-p1-oas",v=>`${s(v)}/yr`,v=>{e.person1OasAnnual=v,me()}),t){c("slider-p2-cpp","num-p2-cpp","disp-p2-cpp",R=>`${s(R)}/yr`,R=>{e.person2CppAnnual=R,me()});const v=document.getElementById("select-p2-cpp-age");v?.addEventListener("change",()=>{e.person2CppStartAge=parseInt(v.value,10),me(),T()}),c("slider-p2-oas","num-p2-oas","disp-p2-oas",R=>`${s(R)}/yr`,R=>{e.person2OasAnnual=R,me()})}c("slider-db-pension","num-db-pension","disp-db-pension",v=>`${s(v)}/yr`,v=>{e.employerPensionAnnual=v,me()});const m=document.getElementById("select-db-pension-age");m?.addEventListener("change",()=>{e.employerPensionStartAge=parseInt(m.value,10),me(),T()}),c("slider-other-inc","num-other-inc","disp-other-inc",v=>`${s(v)}/yr`,v=>{e.otherTaxableIncome=v,me()})}const p=()=>{const n=rt(),m=ht(n,95);e.retireNetSpending=m.maxSpending,e.decumStrategy=m.bestStrategy;const v=document.getElementById("slider-spend"),R=document.getElementById("num-spend"),w=document.getElementById("disp-spend");v&&(v.value=m.maxSpending.toString()),R&&(R.value=m.maxSpending.toString()),w&&(w.textContent=`${s(m.maxSpending)}/yr`);const E=document.getElementById("optimize-spend-result");E&&(E.style.display="block",E.innerHTML=`
        <strong>🎉 Max Safe Spending Found:</strong> You can sustainably spend <strong>${s(m.maxSpending)}/yr after-tax</strong> until <strong>Age ${m.strategyResult.depletionAge}+</strong> using the <em>"${m.strategyResult.name}"</em> strategy!
      `),T()};document.getElementById("btn-optimize-spending")?.addEventListener("click",p),document.getElementById("chip-scenario-optimize")?.addEventListener("click",p),document.getElementById("mode-pretax")?.addEventListener("click",()=>{e.comparatorMode="preTax",he()}),document.getElementById("mode-cashout")?.addEventListener("click",()=>{e.comparatorMode="cashOut",he()}),document.getElementById("check-reinvest")?.addEventListener("change",n=>{e.comparatorReinvest=n.target.checked,T()})}function Ke(t,a,l){const r=a.history.filter(p=>p.age>=e.retireAge);if(r.length===0)return;const o=e.retireAge,i=r[r.length-1].age,d=Math.min(i,Math.max(o,t));e.blueprintSelectedAge=d;const c=r.find(p=>p.age===d)||r[0],h=d-e.retireAge+1,S=document.getElementById("disp-blueprint-age");S&&(S.textContent=`Age ${d} (Year ${h} of Retirement)${l&&c.person2Age?` · Spouse Age ${c.person2Age}`:""}`);const u=document.getElementById("slider-blueprint-age");u&&parseInt(u.value,10)!==d&&(u.value=d.toString()),document.querySelectorAll(".age-chip").forEach(p=>{const n=parseInt(p.dataset.age||"",10);p.classList.toggle("active",n===d)});const f=document.getElementById("blueprint-dynamic-details");f&&(f.innerHTML=it(c,d,l))}function kt(t,a){document.querySelectorAll(".strat-card").forEach(r=>{r.addEventListener("click",()=>{const o=r.dataset.strat;o&&o!==e.decumStrategy&&(e.decumStrategy=o,T())})}),document.getElementById("btn-chart-balances")?.addEventListener("click",()=>{e.chartViewMode!=="balances"&&(e.chartViewMode="balances",T())}),document.getElementById("btn-chart-income")?.addEventListener("click",()=>{e.chartViewMode!=="incomeStreams"&&(e.chartViewMode="incomeStreams",T())}),document.getElementById("slider-blueprint-age")?.addEventListener("input",r=>{const o=parseInt(r.target.value,10);isNaN(o)||Ke(o,t,a)}),document.querySelectorAll(".age-chip").forEach(r=>{r.addEventListener("click",()=>{const o=parseInt(r.dataset.age||"",10);isNaN(o)||Ke(o,t,a)})}),document.getElementById("ledger-toggle")?.addEventListener("click",()=>{e.ledgerOpen=!e.ledgerOpen,T()})}function Et(t,a){const l=document.getElementById("chart-container"),r=document.getElementById("svg-chart-el"),o=document.getElementById("hover-line"),i=document.getElementById("chart-tooltip");if(!l||!r||!o||!i)return;let d=null;if(e.chartViewMode==="incomeStreams"){const S=t.history.filter(f=>f.age>=e.retireAge),u=S.length;if(u<=0)return;l.addEventListener("mousemove",f=>{const p=l.getBoundingClientRect(),n=f.clientX-p.left,m=n/p.width,v=70/800,R=20/800,w=1-v-R;if(m<v||m>1-R){o.style.display="none",i.style.display="none",d=null;return}const E=(m-v)/w,x=Math.min(u-1,Math.max(0,Math.round(E*(u-1)))),g=S[x];d=g.age;const b=70+x/Math.max(1,u-1)*710;o.setAttribute("x1",b.toString()),o.setAttribute("x2",b.toString()),o.style.display="block";const y=g.person2Age?`P1: Age ${g.age} · P2: Age ${g.person2Age}`:`Age ${g.age}`,k=g.cppIncome||0,F=g.oasIncome||0,L=(g.dbPensionIncome||0)+(g.otherIncome||0),P=k+F+L+g.rrspGrossDraw+g.piGrossDraw+g.tfsaGrossDraw;i.innerHTML=`
        <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
          ${y} (Year ${g.age-e.retireAge+1} of Retirement)
        </div>
        <div style="color: #10b981; font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
          Net Spending: ${s(g.netSpendReceived)}
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem;">
          Total Gross Cash Inflows: ${s(P)}
        </div>
        ${k>0?`<div style="color:#3b82f6;">🏛️ CPP: <strong>+${s(k)}</strong></div>`:""}
        ${F>0?`<div style="color:#60a5fa;">🏛️ OAS: <strong>+${s(F)}</strong></div>`:""}
        ${L>0?`<div style="color:#818cf8;">💼 DB/Other: <strong>+${s(L)}</strong></div>`:""}
        ${g.rrspGrossDraw>0?`<div style="color:var(--rrsp-color);">🟣 RRSP Draw: <strong>+${s(g.rrspGrossDraw)}</strong></div>`:""}
        ${g.piGrossDraw>0?`<div style="color:var(--nonreg-color);">🟠 PI Draw: <strong>+${s(g.piGrossDraw)}</strong></div>`:""}
        ${g.tfsaGrossDraw>0?`<div style="color:var(--tfsa-color);">🟢 TFSA Draw: <strong>+${s(g.tfsaGrossDraw)}</strong></div>`:""}
        <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;font-size:0.75rem;color:var(--text-muted);">
          Total Tax Paid: <strong style="color:#ef4444;">${s(g.totalTax)}</strong>
          ${g.isOASCapped?'<br/><span style="color:#10b981;">🛡️ Clawback Shield Active</span>':""}
          ${g.isRRIFForced?'<br/><span style="color:#f59e0b;">⚠️ Mandatory RRIF Min Active</span>':""}
          <div style="margin-top:0.25rem;color:#93c5fd;font-style:italic;">💡 Click to inspect this age in Blueprint below</div>
        </div>
      `;const z=Math.min(p.width-200,Math.max(10,n-100));i.style.left=`${z}px`,i.style.top="30px",i.style.display="block"}),l.addEventListener("click",()=>{d!==null&&Ke(d,t,a)}),l.addEventListener("mouseleave",()=>{o.style.display="none",i.style.display="none",d=null});return}const c=t.history,h=c.length;h<=0||(l.addEventListener("mousemove",S=>{const u=l.getBoundingClientRect(),f=S.clientX-u.left,p=f/u.width,n=70/800,m=20/800,v=1-n-m;if(p<n||p>1-m){o.style.display="none",i.style.display="none";return}const R=(p-n)/v,w=Math.min(h-1,Math.max(0,Math.round(R*(h-1)))),E=70+w/(h-1)*710;o.setAttribute("x1",E.toString()),o.setAttribute("x2",E.toString()),o.style.display="block";const x=c[w],g=x.age>=e.retireAge,b=x.person2Age?`P1: Age ${x.age} · P2: Age ${x.person2Age}`:`Age ${x.age}`;i.innerHTML=`
      <div style="font-weight: 700; margin-bottom: 0.35rem; color: #fff;">
        ${b} (${g?"Retirement":"Accumulating"})
      </div>
      <div style="color: var(--total-color); font-weight: 700; margin-bottom: 0.35rem; font-size: 0.9rem;">
        Total Wealth: ${s(x.totalEnd)}
      </div>
      <div style="color: var(--rrsp-color);">RRSP: <strong>${s(x.rrspEnd)}</strong></div>
      <div style="color: var(--nonreg-color);">PI: <strong>${s(x.piEnd)}</strong></div>
      <div style="color: var(--tfsa-color);">TFSA: <strong>${s(x.tfsaEnd)}</strong></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:0.35rem;padding-top:0.35rem;">
        ${g?`
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Retirement Cashflow:</div>
          ${x.guaranteedGross>0?`
            <div style="color:#60a5fa;">🏛️ Pensions: <strong>+${s(x.guaranteedGross)} (${s(x.guaranteedNet)} net)</strong></div>
            <div style="color:var(--text-secondary);font-size:0.75rem;">Portfolio Bridge: <strong>${s(x.portfolioNetDraw)}</strong></div>`:""}
          <div style="color:var(--rrsp-color);">RRSP Draw: <strong>${x.rrspGrossDraw>0?s(x.rrspGrossDraw):"$0"}</strong></div>
          <div style="color:var(--nonreg-color);">PI Draw: <strong>${x.piGrossDraw>0?s(x.piGrossDraw):"$0"}</strong></div>
          <div style="color:var(--tfsa-color);">TFSA Draw: <strong>${x.tfsaGrossDraw>0?s(x.tfsaGrossDraw):"$0"}</strong></div>
          <div style="color:#10b981;font-weight:700;margin-top:0.2rem;">Net Spending: ${s(x.netSpendReceived)}</div>
          `:`
          <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.2rem;">Annual Savings Added:</div>
          <div style="color:var(--rrsp-color);">RRSP: <strong>+${s(x.rrspContrib)}</strong></div>
          <div style="color:var(--nonreg-color);">PI: <strong>+${s(x.piContrib)}</strong></div>
          ${x.tfsaContrib>0?`<div style="color:var(--tfsa-color);">TFSA: <strong>+${s(x.tfsaContrib)}</strong></div>`:""}
          `}
      </div>
    `;const y=Math.min(u.width-180,Math.max(10,f-90));i.style.left=`${y}px`,i.style.top="30px",i.style.display="block"}),l.addEventListener("mouseleave",()=>{o.style.display="none",i.style.display="none"}))}he();
