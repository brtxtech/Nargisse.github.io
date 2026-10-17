/* render.js — fabrique la carte d’invitation (enveloppe, sections, décors, particules) */
const ENVIMG='assets/envelope.jpg',VIMG='assets/venue.jpg',DEMO='assets/couple.jpg';
const DEF={lang:'fr',env:'seal',ec:'ivoire',wc:'or',mono:'',et:'',oe:'burst',mus:'rom',vol:'80',audio:'',th:'ivoire',fh:'Playfair Display',fn:'Playfair Display',fb:'Inter',fs:'100',sp:'38',cs:'soft',rad:20,h2:'line',rv:'up',bgs:'plain',bgi:'12',fr:'line',fr2:'none',dc:'gold',dsp:'1',pet:'petal',pcol:'rose',pemo:'🌸',pdir:'down',pplan:'front',pspd:'1',psz:'1',den:'22',hl:'stack',photo:DEMO,shape:'arch',fm:'ring',anim:'zoom',flt:'none',psz2:'70',pz:100,px:42,py:40,n1:'Amara',n2:'Ethan',sepc:'&',nfx:'shine',nl:'stack',fam:'',tag:TAGS.fr[0],date:'2027-05-30',time:'14:00',dfm:'long',hash:'',cd:'classic',ven:'himmi',vn:'',va:'',vst:'arch',vimg:'',vnote:'',mp:{g:1,w:0,a:0},pr:'tl',prog:PR.two[1],pic:1,mn:'cards',menu:MN.fr[1],dress:'Chic et élégant',dtxt:'Messieurs : costume sombre ou bleu marine, chemise claire.\nMesdames : robe longue ou midi, matières fluides.',dcols:['#a8baa6','#d8b988','#d9a18c'],ds:'pill',info:IF.a[1],hotels:'',gift:'',giftlink:'',trans:'',contact:'',rsvpwa:'',rsvpem:'',rsvpby:'',gal:[],gl:'grid',sec:{cd:1,cal:1,ven:1,pr:1,mn:1,dr:1,inf:1,hot:1,gift:1,gal:1,rsvp:1,qr:1}};
let GUEST='';
const rnd=(a,b)=>a+Math.random()*(b-a),groups=t=>{const g=[];String(t||'').split('\n').map(l=>l.trim()).filter(Boolean).forEach(l=>{if(l[0]=='#')g.push({h:l.slice(1).trim(),r:[]});else{if(!g.length)g.push({h:'',r:[]});g.at(-1).r.push(l.split('|').map(x=>x.trim()))}});return g};
const LOC={fr:'fr-FR',en:'en-GB',ar:'ar-u-nu-latn'},ICON=[[/c[ée]r[ée]mon|mairie|b[ée]n[ée]diction|ceremony/i,'💍'],[/cocktail|vin d|champagne|accueil/i,'🥂'],[/d[iî]ner|dinner|repas/i,'🍽️'],[/bal|danse|soir[ée]e/i,'💃'],[/photo/i,'📸'],[/g[âa]teau|dessert|cake/i,'🎂'],[/brunch|petit/i,'🥐'],[/sortie/i,'🎊'],[/fin|retour/i,'🌙']];
const MIC=[[/cocktail|accueil|ap[ée]ro/i,'🥂'],[/entr[ée]e|starter|antipasti/i,'🥗'],[/plat|main|primo|secondo/i,'🍽️'],[/dessert|dolce/i,'🍰'],[/brunch/i,'🥐']];
const ic=(t,a)=>(a.find(x=>x[0].test(t))||[0,'✦'])[1];
const roman=n=>{let r='';[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']].forEach(([v,s])=>{while(n>=v){r+=s;n-=v}});return r};
function fdate(S){const d=new Date(S.date+'T12:00'),l=LOC[S.lang],C=s=>s[0].toUpperCase()+s.slice(1),f=o=>d.toLocaleDateString(l,o);
 return {long:()=>C(f({weekday:'long',day:'numeric',month:'long',year:'numeric'})),short:()=>f({day:'numeric',month:'long',year:'numeric'}),num:()=>f({day:'2-digit'})+' · '+f({month:'2-digit'})+' · '+d.getFullYear(),slash:()=>f({day:'2-digit',month:'2-digit',year:'numeric'}),big:()=>`<span class="dbig"><small>${f({weekday:'long'})}</small><b>${d.getDate()}</b><small>${f({month:'long'})} ${d.getFullYear()}</small></span>`,roman:()=>roman(d.getDate())+' · '+roman(d.getMonth()+1)+' · '+roman(d.getFullYear())}[S.dfm]()}
function calHTML(S){const d=new Date(S.date+'T12:00'),y=d.getFullYear(),m=d.getMonth(),l=LOC[S.lang],f=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
 let h='<p class="lbl">'+d.toLocaleDateString(l,{month:'long',year:'numeric'})+'</p><div class="cg">'+[...Array(7)].map((_,i)=>'<b>'+new Date(2024,0,1+i).toLocaleDateString(l,{weekday:'narrow'})+'</b>').join('')+'<i></i>'.repeat(f);
 for(let i=1;i<=n;i++)h+=`<span class="${i==d.getDate()?'on':''}">${i}</span>`;return h+'</div>'}
const r_=(n,f)=>Array.from({length:n},(_,i)=>f(i)).join('');
function deco(id,S,col){if(!id||id=='none')return'';
 if(id.startsWith('f_')){const f=FX.frames[id.slice(2)];if(!f)return'';const u=`style="background-image:url('${f.url}')"`;
  if(f.mode=='corners')return'<div class="dc">'+['tl','tr','bl','br'].map(k=>`<i class="fi c ${k}" ${u}></i>`).join('')+'</div>';
  if(f.mode=='sides')return`<div class="dc"><i class="fi s l" ${u}></i><i class="fi s r" ${u}></i></div>`;
  return`<div class="dc"><i class="fi o" ${u}></i></div>`}
 const T=id[0]=='s'&&id[1]=='_'?id.slice(2):id,c=col;
 if(id=='line')return'<div class="dc fr-line"></div>';if(id=='dbl')return'<div class="dc fr-dbl"></div>';if(id=='dot')return'<div class="dc fr-dot"></div>';
 if(id=='cor')return'<div class="dc">'+`<svg class="cn" viewBox="0 0 100 100"><path d="M4 96V30C4 14 14 4 30 4h66M14 96V40c0-14 12-26 26-26h56" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="30" cy="30" r="4" fill="${c}"/></svg>`.repeat(4)+'</div>';
 if(id=='flo')return'<div class="dc">'+['l','r'].map(s=>`<svg class="vn ${s}" viewBox="0 0 60 400" preserveAspectRatio="none"><path d="M30 0C5 50 55 100 30 150S5 250 30 300 55 360 30 400" fill="none" stroke="${c}" stroke-width="1.4"/><g fill="${c}" opacity=".7">${[40,110,190,270,350].map((y,i)=>`<ellipse cx="${i%2?42:18}" cy="${y}" rx="11" ry="5" transform="rotate(${i%2?-35:35} ${i%2?42:18} ${y})"/>`).join('')}</g><g fill="#e8a9a0">${[75,230,320].map((y,i)=>`<circle cx="${i%2?16:44}" cy="${y}" r="5"/>`).join('')}</g></svg>`).join('')+'</div>';
 if(id=='lig')return'<div class="dc"><i class="lg t"></i><i class="lg b"></i></div>';
 if(id=='bok')return'<div class="dc">'+r_(14,()=>`<s class="bk" style="left:${rnd(0,95)}%;--s:${rnd(14,50)}px;animation-delay:${-rnd(0,12)}s;animation-duration:${rnd(9,18)}s"></s>`)+'</div>';
 if(id=='sta')return'<div class="dc">'+r_(22,()=>`<s class="tw" style="left:${rnd(0,96)}%;top:${rnd(0,96)}%;font-size:${rnd(8,18)}px;animation-delay:${-rnd(0,4)}s">✦</s>`)+'</div>';
 if(id=='gli')return'<div class="dc">'+r_(50,()=>`<s class="tw gl" style="left:${rnd(0,99)}%;top:${rnd(0,99)}%;animation-delay:${-rnd(0,3)}s"></s>`)+'</div>';
 if(id=='vel')return'<div class="dc"><i class="vl l"></i><i class="vl r"></i></div>';
 if(id=='rib')return'<div class="dc"><i class="rb l"></i><i class="rb r"></i></div>';
 if(id=='ray')return'<div class="dc"><i class="ry"></i></div>';
 if(id=='gar')return'<div class="dc"><div class="gr">'+r_(10,i=>`<s style="animation-delay:${-i*.4}s">${i%2?'♥':'✿'}</s>`)+'</div></div>';
 if(id=='wav')return`<div class="dc"><svg class="wv" viewBox="0 0 800 60" preserveAspectRatio="none"><path d="M0 30q50-30 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0V60H0z" fill="${c}" opacity=".35"/></svg></div>`;
 if(id.startsWith('s_'))return`<div class="dc"><i class="zs l" style="background-image:${pat(T,c)}"></i><i class="zs r" style="background-image:${pat(T,c)}"></i></div>`;
 if(id.startsWith('e_'))return'<div class="dc">'+r_(10,i=>`<s class="fe" style="left:${i%2?rnd(0,12):rnd(84,96)}%;animation-delay:${-i*1.9}s;animation-duration:${rnd(9,17)}s;font-size:${rnd(16,28)}px">${id.slice(2)}</s>`)+'</div>';return''}
function bgl(S,T){const b=S.bgs,i=(+S.bgi||12)/100;if(b=='plain')return'';
 if(b.startsWith('i_')){const x=FX.bgs[b.slice(2)];if(!x)return'';return`<div class="bgl" style="background:url('${x.url}') ${x.mode=='tile'?'0 0/'+(x.tile||160)+'px repeat':'center/cover no-repeat'};opacity:${(x.opacity||100)/100}"></div>`}
 const g={g1:`linear-gradient(180deg,${T.bg},${T.card} 55%,${T.bg})`,g2:`radial-gradient(circle at 50% 35%,${T.card},${T.bg} 72%)`,g3:`linear-gradient(135deg,${T.bg},${T.card} 50%,${T.bg})`,g4:`radial-gradient(ellipse at 50% 0,${T.gold}40,#0000 62%)`,g5:`repeating-linear-gradient(90deg,${T.card} 0 40px,${T.bg} 40px 80px)`,g6:`linear-gradient(160deg,${T.gold}30,#0000 40%,${T.card})`,t_linen:'repeating-linear-gradient(0deg,#0000 0 2px,#0000000c 2px 3px),repeating-linear-gradient(90deg,#0000 0 2px,#0000000a 2px 3px)',t_vig:'radial-gradient(transparent 55%,#0000004d)',t_paper:`url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='.8' numOctaves='2'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .4 0 0 0 .5 0'/></filter><rect width='160' height='160' filter='url(#n)' opacity='.5'/></svg>")}")`}[b];
 return`<div class="bgl" style="background-image:${g||pat(b.slice(2),T.gold)};opacity:${b[0]=='p'?i:1}"></div>`}
/* ---------- particules ---------- */
function pshape(c,t,s){c.beginPath();
 if(t=='heart'){c.moveTo(0,s*.8);c.bezierCurveTo(-s*1.4,-s*.2,-s*.5,-s*1.1,0,-s*.4);c.bezierCurveTo(s*.5,-s*1.1,s*1.4,-s*.2,0,s*.8)}
 else if(t=='spark'){c.moveTo(0,-s);c.quadraticCurveTo(0,0,s,0);c.quadraticCurveTo(0,0,0,s);c.quadraticCurveTo(0,0,-s,0);c.quadraticCurveTo(0,0,0,-s)}
 else if(t=='star'){for(let i=0;i<10;i++){const r=i%2?s*.45:s,a=i*Math.PI/5-Math.PI/2;c[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}c.closePath()}
 else if(t=='circle'||t=='snow'||t=='bubble'||t=='ring')c.arc(0,0,t=='circle'?s*1.3:t=='snow'?s*.35:s*.8,0,6.3);
 else if(t=='leaf'){c.moveTo(0,-s);c.quadraticCurveTo(s*.9,-s*.2,0,s);c.quadraticCurveTo(-s*.9,-s*.2,0,-s)}
 else if(t=='diamond'){c.moveTo(0,-s);c.lineTo(s*.6,0);c.lineTo(0,s);c.lineTo(-s*.6,0);c.closePath()}
 else if(t=='confetti')c.rect(-s*.5,-s*.25,s,s*.5);else if(t=='ribbon')c.rect(-s*.15,-s*1.2,s*.3,s*2.4);
 else{c.moveTo(0,-s);c.bezierCurveTo(s*.9,-s*.7,s*.8,s*.6,0,s);c.bezierCurveTo(-s*.8,s*.6,-s*.9,-s*.7,0,-s)}}
function celebrate(k,col){if(typeof confetti!='function'||k=='none')return;const o={zIndex:400,colors:[col,'#ffffff','#f4d9a0','#f2b8c6']};
 if(k=='burst')confetti({...o,particleCount:140,spread:90,origin:{y:.6}});
 else if(k=='stars')confetti({...o,particleCount:70,spread:100,shapes:['star'],scalar:1.4,origin:{y:.6}});
 else if(k=='hearts'){const h=confetti.shapeFromText?{shapes:[confetti.shapeFromText({text:'❤️',scalar:2})],scalar:2}:{};confetti({...o,...h,particleCount:50,spread:90,origin:{y:.6}})}
 else{let n=0;const t=setInterval(()=>{confetti({...o,particleCount:60,startVelocity:38,spread:360,ticks:70,origin:{x:rnd(.15,.85),y:rnd(.1,.5)}});if(++n>7)clearInterval(t)},320)}}
/* ---------- rendu principal ---------- */
function stopInv(r){cancelAnimationFrame(r._raf);clearInterval(r._iv);r._io&&r._io.disconnect();removeEventListener('resize',r._rs)}
function inv(root,S,o){
 stopInv(root);M.src=S.audio||'';M.vol=(+S.vol||0)/100;const lg=S.lang,Tt=TR[lg],T=THEMES[S.th]||THEMES.ivoire,dk=isDark(T.bg),col=S.dc=='gold'?T.gold:DCC[S.dc];
 [S.fh,S.fn].forEach(f=>loadFont(f));loadFont(lg=='ar'?'Cairo':S.fb,1);
 const st=root.style;for(const k in T)st.setProperty('--'+k,T[k]);st.setProperty('--dc',col);st.setProperty('--serif',`'${S.fh}',Georgia,serif`);st.setProperty('--nm',`'${S.fn}',cursive,serif`);st.setProperty('--body',`'${lg=='ar'?'Cairo':S.fb}',system-ui,sans-serif`);st.setProperty('--rad',S.rad+'px');st.setProperty('--fs',S.fs/100);st.setProperty('--sp',S.sp+'px');st.setProperty('--dsp',S.dsp);st.setProperty('--pz',S.pz/100);
 const E1=EC[S.ec]||EC.ivoire,W=WC[S.wc]||WC.or;st.setProperty('--e1',E1[0]);st.setProperty('--e2',E1[1]);W.forEach((x,i)=>st.setProperty('--w'+(i+1),x));
 root.classList.remove('rev','full');root.classList.add('inv');o.full&&root.classList.add('full');Object.assign(root.dataset,{cs:S.cs,h2:S.h2,rv:S.rv,dk:dk?1:0,hl:S.hl});root.dir=lg=='ar'?'rtl':'ltr';
 const ex=FX.envs[S.env],ek=ex?'seal':CAT.env.some(c=>c[0]==S.env)?S.env:'seal',v=VEN.find(x=>x.id==S.ven)||VEN[0],vn=v.id=='custom'?S.vn||'—':v.n,va=v.id=='custom'?S.va:(S.va||v.a),vim=S.vimg||(v.img?(v.img===1?VIMG:v.img):''),ini=S.mono||(S.n1[0]||'')+'&amp;'+(S.n2[0]||''),sc=S.sec,hasH=S.hl;
 const Mq=encodeURIComponent(vn+' '+va),maps=(S.mp.g?`<a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${Mq}">↗ Google ${Tt.maps}</a><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${Mq}">➤ ${Tt.route}</a>`:'')+(S.mp.w?`<a target="_blank" rel="noopener" href="https://waze.com/ul?q=${Mq}&navigate=yes">Waze</a>`:'')+(S.mp.a?`<a target="_blank" rel="noopener" href="https://maps.apple.com/?q=${Mq}">Apple ${Tt.maps}</a>`:'');
 const sep=S.sepc=='&'?'&amp;':E(S.sepc),pg=groups(S.prog),mg=groups(S.menu),ig=groups(S.info),hg=groups(S.hotels);
 const evs=g=>g.r.map(r=>`<div class="ev">${(S.pic||S.pr=='ico')?`<span class="pi">${ic(r[0]+' '+r[1],ICON)}</span>`:''}<span class="pt">${E(r[0])}</span><div>${r[1]?`<b>${E(r[1])}</b>`:''}${r[2]?`<p>${E(r[2])}</p>`:''}</div></div>`).join('');
 const prog=pg.map(g=>`${g.h?`<p class="day">${E(g.h)}</p>`:''}<div class="pw_ ${S.pr}">${evs(g)}</div>`).join('');
 const menu=mg.map(g=>`<div class="mi"><h3>${S.mn=='ico'?ic(g.h,MIC)+' ':''}${E(g.h)}</h3><p>${g.r.map(r=>E(r[0])).join('<br>')}</p></div>`).join('');
 const cu=['d','h','m','s'].map(k=>`<div class="u" data-k="${k}"><b>0</b><small>${Tt[k]}</small></div>`).join('');
 const dtx=E(S.dtxt).replace(/\n/g,'<br>'),blocks=g=>g.map(b=>`<h4>${E(b.h)}</h4>${b.r.map(r=>E(r[0])).join('<br>')}`).join('');
 const gal=(S.gal||[]).map(s=>`<img alt="" src="${s}">`).join(''),ttl=(k,i)=>`<h2><i>${i}</i>${Tt[k]}</h2>`;
 const evn=[`${S.n1} & ${S.n2}`,S.date.replace(/-/g,''),S.time.replace(':','')];
 const gcal=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evn[0])}&dates=${evn[1]}T${evn[2]}00/${evn[1]}T${evn[2]}00&details=${encodeURIComponent(S.tag)}&location=${Mq}`;
 root.innerHTML=`<svg width="0" height="0" style="position:absolute"><clipPath id="cpH" clipPathUnits="objectBoundingBox"><path d="M.5 .95C.1 .65 0 .45 0 .3 0 .12 .13 0 .27 0 .37 0 .46 .06 .5 .15 .54 .06 .63 0 .73 0 .87 0 1 .12 1 .3 1 .45 .9 .65 .5 .95z"/></clipPath></svg>
 ${bgl(S,T)}<canvas class="pet${S.pplan=='back'?' back':''}"></canvas>${deco(S.fr,S,col)}${deco(S.fr2,S,col)}<button class="mus" aria-label="Musique">♪</button><div class="prog"></div>
 <div class="scroll"><header class="hero">
  ${GUEST?`<p class="gst">${Tt.dear} ${E(GUEST)},</p>`:''}<div class="orn">✿</div>
  ${S.fam?`<p class="fam">${E(S.fam)}</p>`:''}
  <div class="pw an-${S.anim}" style="--pw:${S.psz2}%;--ar:${(CAT.shape.find(x=>x[0]==S.shape)||[0,0,.75])[2]}"><div class="photo sh-${S.shape} fm-${S.fm}">${S.photo?`<img class="f-${S.flt}" alt="" src="${S.photo}" style="object-position:${S.px}% ${S.py}%">`:ini}</div></div>
  <h1 class="nm nfx-${S.nfx} nl-${S.nl}"><span>${E(S.n1)}</span><em>${sep}</em><span>${E(S.n2)}</span></h1><p class="tag">${E(S.tag)}</p><p class="date">${fdate(S)}</p>${S.hash?`<p class="hsh">${E(S.hash)}</p>`:''}<div class="orn">♥</div><p class="sc">${Tt.scroll} ↓</p></header>
 ${sc.cd?`<section class="rv"><div class="card"><p class="lbl">${Tt.cd}</p><p class="it">${Tt.bef}</p><div class="cd ${S.cd}">${cu}</div></div></section>`:''}
 ${sc.cal?`<section class="rv"><div class="card cal">${calHTML(S)}<div class="btns"><a target="_blank" rel="noopener" href="${gcal}">📅 ${Tt.addcal}</a></div></div></section>`:''}
 ${sc.ven?`<section class="rv">${ttl('ven','⌖')}<div style="text-align:center"><h3 class="vt">${E(vn)}</h3><p class="vsub">${E(va)}</p><div class="btns">${maps}</div></div>${vim&&S.vst!='none'?`<div class="venue vs-${S.vst}"><img alt="" src="${vim}"></div>`:''}<p class="vsub">${E(S.vnote||v.d)}</p></section>`:''}
 ${sc.pr?`<section class="rv">${ttl('pr','◷')}${prog}</section>`:''}
 ${sc.mn?`<section class="rv">${ttl('mn','✦')}<div class="mn mn-${S.mn}">${menu}</div></section>`:''}
 ${sc.dr?`<section class="rv">${ttl('dr','◈')}<div class="card"><span class="pill ds-${S.ds}">${E(S.dress)}</span><p>${dtx}</p><div class="dots">${(S.dcols||[]).map(c=>`<i style="background:${c}"></i>`).join('')}</div></div></section>`:''}
 ${sc.inf&&(ig.length||S.trans||S.contact)?`<section class="rv">${ttl('inf','ⓘ')}<div class="card">${blocks(ig)}${S.trans?`<h4>${Tt.par}</h4>${E(S.trans).replace(/\n/g,'<br>')}`:''}${S.contact?`<h4>Contact</h4>${E(S.contact).replace(/\n/g,'<br>')}`:''}</div></section>`:''}
 ${sc.hot&&hg.length?`<section class="rv">${ttl('hot','▦')}<div class="card" style="text-align:start">${blocks(hg)}</div></section>`:''}
 ${sc.gift&&S.gift?`<section class="rv">${ttl('gift','🎁')}<div class="card"><p>${E(S.gift).replace(/\n/g,'<br>')}</p>${S.giftlink?`<div class="btns"><a target="_blank" rel="noopener" href="${E(S.giftlink)}">🎁 ${Tt.gift}</a></div>`:''}</div></section>`:''}
 ${sc.gal&&gal?`<section class="rv">${ttl('gal','❀')}<div class="gal gl-${S.gl}">${gal}</div></section>`:''}
 ${sc.rsvp&&(S.rsvpwa||S.rsvpem)?`<section class="rv">${ttl('rsvp','✉')}<div class="card"><div class="rsvp"><input name="n" placeholder="${Tt.name}"><div class="rr"><label><input type="radio" name="a" value="1" checked> ${Tt.yes}</label><label><input type="radio" name="a" value="0"> ${Tt.no}</label></div><input name="g" type="number" min="1" max="20" value="1" placeholder="${Tt.guests}"><textarea name="m" placeholder="${Tt.msg}"></textarea>${S.rsvpby?`<small>${Tt.until} ${new Date(S.rsvpby+'T12:00').toLocaleDateString(LOC[lg],{day:'numeric',month:'long',year:'numeric'})}</small>`:''}<div class="btns">${S.rsvpwa?'<a class="ra" data-w="1">WhatsApp</a>':''}${S.rsvpem?'<a class="ra" data-w="0">E-mail</a>':''}</div></div></div></section>`:''}
 ${sc.qr?`<section class="rv"><div class="card"><p class="lbl">${Tt.scan}</p><div class="qr"></div><div class="btns"><a class="shr">↗ ${Tt.share}</a></div></div></section>`:''}
 <p class="foot rv">${E(S.n1)} ${sep} ${E(S.n2)}</p></div>
 ${o.env?`<div class="env ${ek}" role="button" tabindex="0" aria-label="${Tt.open}">${{seal:`<img class="envimg" alt="" src="${ex?ex.url:ENVIMG}"><span class="glow"></span><span class="sheen"></span>`,env:`<div class="flap"></div><div class="wax">${ini}</div><div class="hint">${E(S.et||Tt.open)}</div>`,cur:`<i class="pn l"></i><i class="pn r"></i><div class="bdg">${ini}</div><div class="hint">${E(S.et||Tt.open)}</div>`,door:`<i class="pn l"></i><i class="pn r"></i><div class="bdg">${ini}</div><div class="hint">${E(S.et||Tt.open)}</div>`,shr:`<i class="pn l"></i><i class="pn r"></i><div class="bdg">${ini}</div><div class="hint">${E(S.et||Tt.open)}</div>`,iri:`<div class="bdg">${ini}</div><div class="hint">${E(S.et||Tt.open)}</div>`}[ek]}</div>`:''}`;
 const $s=$('.scroll',root),mb=$('.mus',root),cv=$('.pet',root),c2=cv.getContext('2d'),pr=$('.prog',root);
 $s.onscroll=()=>pr.style.width=($s.scrollTop/Math.max(1,$s.scrollHeight-$s.clientHeight)*100)+'%';
 root._io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');root._io.unobserve(e.target)}}),{root:$s,threshold:.1});root.querySelectorAll('.rv').forEach(e=>root._io.observe(e));
 const tg=new Date(S.date+'T'+(S.time||'14:00')),tick=()=>{const d=Math.max(0,tg-Date.now())/1000,V={d:[Math.floor(d/86400),365],h:[Math.floor(d%86400/3600),24],m:[Math.floor(d%3600/60),60],s:[Math.floor(d%60),60]};root.querySelectorAll('.u').forEach(u=>{const x=V[u.dataset.k];u.firstChild.textContent=x[0];u.style.setProperty('--p',Math.min(100,x[0]/x[1]*100))})};tick();root._iv=setInterval(tick,1000);
 /* QR + partage + RSVP + calendrier */
 const url=location.href;const q=$('.qr',root);if(q&&typeof qrcode=='function'){try{const z=qrcode(0,'M');z.addData(url);z.make();q.innerHTML=z.createSvgTag({cellSize:4,margin:0})}catch(e){}}
 const sh=$('.shr',root);if(sh)sh.onclick=()=>navigator.share?navigator.share({title:S.n1+' & '+S.n2,url}).catch(()=>{}):window.open('https://wa.me/?text='+encodeURIComponent(S.n1+' & '+S.n2+' '+url));
 root.querySelectorAll('.ra').forEach(a=>a.onclick=()=>{const f=a.closest('.rsvp'),g=n=>f.querySelector(`[name=${n}]`),yes=f.querySelector('[name=a]:checked').value=='1',tx=`${S.n1} & ${S.n2}\n${g('n').value} — ${yes?Tt.yes:Tt.no}\n${Tt.guests}: ${g('g').value}\n${g('m').value}`;celebrate('burst',T.gold);window.open(a.dataset.w=='1'?'https://wa.me/'+S.rsvpwa.replace(/\D/g,'')+'?text='+encodeURIComponent(tx):'mailto:'+S.rsvpem+'?subject='+encodeURIComponent('RSVP '+S.n1+' & '+S.n2)+'&body='+encodeURIComponent(tx))});
 /* particules */
 let Wd,H,P=[];const fit=()=>{Wd=root.clientWidth;H=root.clientHeight;cv.width=Wd;cv.height=H};fit();root._rs=fit;addEventListener('resize',fit);
 const pc=PC[S.pcol]||PC.rose,sp=+S.pspd,sz=+S.psz,dir=S.pdir,cp=FX.petals[S.pet],pim=cp&&cp.kind=='image'?Object.assign(new Image(),{src:cp.url}):null,pem=S.pet=='emoji'?S.pemo:cp&&cp.kind=='emoji'?cp.emoji:'';
 const mk=top=>{const c=pc[Math.random()*pc.length|0],up=dir=='up';return{x:rnd(0,Wd),y:top?(up?H+20+rnd(0,H):-20-rnd(0,H)):rnd(0,H),s:(6+rnd(0,9))*sz,vy:(.5+rnd(0,1.1))*sp*(up?-1:1),vx:dir=='diag'?(.6+rnd(0,.8))*sp:0,sw:rnd(0,6),t:rnd(0,6),sp:.02+rnd(0,.03),r:rnd(0,6.28),vr:rnd(-.02,.02),c,a:dir=='swirl'?rnd(1.5,4):.9}};
 const draw=p=>{c2.save();c2.translate(p.x,p.y);c2.rotate(p.r);c2.scale(1,.55+.45*Math.abs(Math.sin(p.t)));c2.globalAlpha=S.pet=='bubble'||S.pet=='circle'?.5:.9;
  if(pim){if(pim.naturalWidth){const w=p.s*2.4,hh=w*pim.naturalHeight/pim.naturalWidth;c2.drawImage(pim,-w/2,-hh/2,w,hh)}}else if(pem){c2.font=p.s*2+'px serif';c2.textAlign='center';c2.fillText(pem,0,0)}else{pshape(c2,S.pet,p.s);const g=c2.createRadialGradient(0,-p.s*.3,1,0,0,p.s*1.3);g.addColorStop(0,p.c[0]);g.addColorStop(1,p.c[1]);if(S.pet=='ring'||S.pet=='bubble'){c2.strokeStyle=p.c[1];c2.lineWidth=1.4;c2.stroke()}else{c2.fillStyle=S.pet=='snow'?'#fff':g;c2.fill()}}c2.restore()};
 const loop=()=>{c2.clearRect(0,0,Wd,H);P.forEach(p=>{p.y+=p.vy;p.t+=p.sp;p.x+=Math.sin(p.t+p.sw)*p.a+p.vx;p.r+=p.vr;draw(p);if(p.y>H+40||p.y<-H-60||p.x>Wd+40){Object.assign(p,mk(1));if(dir=='diag')p.x=rnd(-H*.4,Wd)}});root._raf=requestAnimationFrame(loop)};
 const go=()=>{if(S.pet=='none'||P.length||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const n=Math.round(+S.den*(Wd>500?1.5:1));for(let i=0;i<n;i++)P.push(mk(1));loop()};
 const sync=()=>{mb.style.opacity=M.on?1:.5};mb.onclick=()=>{M.on?M.stop():M.play(S.mus);sync()};
 const reveal=()=>{root.classList.add('rev');mb.classList.add('on');go();sync()};
 const e=$('.env',root);if(!e)reveal();else{const op=()=>{if(e.classList.contains('open'))return;e.classList.add('open');if(S.mus!='none')M.play(S.mus);celebrate(S.oe,T.gold);setTimeout(()=>e.classList.add('gone'),S.env=='iri'?1300:900);setTimeout(reveal,1300);setTimeout(()=>e.remove(),3200)};e.onclick=op;e.onkeydown=k=>(k.key=='Enter'||k.key==' ')&&op()}
}
