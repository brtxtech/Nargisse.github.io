/* studio.js — éditeur (panneau d’options), aperçu, partage, export, mode invité */
const clone=o=>JSON.parse(JSON.stringify(o)),enc=o=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))),dec=h=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(h),c=>c.charCodeAt(0))));
const merge=(a,b)=>{b=b||{};const r={...a,...b};['sec','mp'].forEach(k=>r[k]={...a[k],...(b[k]||{})});return r};
const K='nargisse:v2';let S;try{S=merge(DEF,JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){S=clone(DEF)}
const save=()=>{try{const{audio,gal,...r}=S;localStorage.setItem(K,JSON.stringify(r))}catch(e){}};
const img2url=(f,max,q=.86)=>new Promise(res=>{const im=new Image();im.onload=()=>{const r=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*r;c.height=im.height*r;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};im.src=URL.createObjectURL(f)});
const TAGP=Object.fromEntries(Object.entries(TAGS).flatMap(([l,a])=>a.map((t,i)=>[l+i,[t.length>24?t.slice(0,24)+'…':t,t]])));
const SECS=[['cd','Compte à rebours'],['cal','Calendrier'],['ven','Lieu'],['pr','Programme'],['mn','Menu'],['dr','Code vestimentaire'],['inf','Informations'],['hot','Hébergement'],['gift','Cadeaux'],['gal','Galerie'],['rsvp','Réponse (RSVP)'],['qr','QR code & partage']];
const UI=[['✉','Ouverture',[['c','env','Style d’ouverture'],['c','ec','Couleur de l’enveloppe / des rideaux'],['c','wc','Couleur du sceau'],['t','mono','Monogramme (vide = initiales)'],['t','et','Texte à toucher (vide = par défaut)'],['c','oe','Effet à l’ouverture']]],
['♫','Musique',[['c','mus','Mélodie'],['r','vol','Volume',0,100,5],['m']]],
['🎨','Style général',[['c','lang','Langue de la carte'],['c','th','Palette de couleurs (50)'],['c','fh','Police des titres'],['c','fn','Police des noms'],['c','fb','Police du texte'],['c','fs','Taille du texte'],['c','sp','Espacement'],['c','cs','Style des cartes'],['r','rad','Arrondi des coins',0,40,2],['c','h2','Style des titres'],['c','rv','Animation d’apparition']]],
['▦','Fond',[['c','bgs','Fond'],['c','bgi','Intensité du motif']]],
['❖','Décors sur les côtés',[['c','fr','Décor principal'],['c','fr2','Second décor'],['c','dc','Couleur du décor'],['c','dsp','Vitesse']]],
['❀','Pétales & particules',[['c','pet','Type'],['c','pcol','Couleur'],['c','pemo','Emoji (si type Emoji)'],['c','pplan','Plan des pétales : devant ou derrière la carte'],['c','pdir','Direction'],['c','pspd','Vitesse'],['c','psz','Taille'],['c','den','Quantité']]],
['◐','Photo principale',[['f','photo','Photo des mariés'],['c','hl','Disposition'],['c','shape','Forme (26)'],['c','fm','Cadre'],['c','anim','Animation'],['c','flt','Filtre'],['c','psz2','Taille'],['r','pz','Zoom',100,220,5],['r','px','Position horizontale',0,100,2],['r','py','Position verticale',0,100,2]]],
['♥','Noms & date',[['t','n1','Prénom 1'],['t','n2','Prénom 2'],['c','sepc','Séparateur'],['c','nfx','Effet des noms'],['c','nl','Disposition'],['t','fam','Familles (optionnel)'],['p','tag','Phrases toutes prêtes',TAGP],['t','tag','Phrase d’invitation'],['d','date','Date'],['h','time','Heure'],['c','dfm','Format de la date'],['t','hash','Hashtag']]],
['⏳','Compte à rebours',[['c','cd','Style']]],
['⌖','Lieu',[['c','ven','Lieu'],['t','vn','Nom (si « Autre lieu »)'],['t','va','Adresse'],['t','vnote','Description'],['c','vst','Photo du lieu'],['f','vimg','Importer une photo du lieu'],['x','mp',[['g','Google Maps'],['w','Waze'],['a','Apple Plans']]]]],
['◷','Programme',[['c','pr','Style'],['k','pic','Afficher les icônes'],['p','prog','Modèles',PR],['a','prog','Une ligne par moment : heure | titre | détail — « # » pour un titre de jour']]],
['✦','Menu',[['c','mn','Style'],['p','menu','Modèles',MN],['a','menu','« # » pour une section, puis un plat par ligne']]],
['◈','Code vestimentaire',[['t','dress','Titre'],['c','ds','Style'],['a','dtxt','Description'],['q','dcols','Couleurs conseillées']]],
['ⓘ','Informations pratiques',[['p','info','Modèles',IF],['a','info','« # » titre, puis le texte'],['a','trans','Parking & accès'],['a','contact','Contact (nom, téléphone)']]],
['▤','Hébergement',[['a','hotels','« # » nom de l’hôtel, puis adresse et tarif']]],
['🎁','Cadeaux',[['a','gift','Message'],['t','giftlink','Lien (cagnotte…)']]],
['❁','Galerie photos',[['g','gal','Ajouter des photos (12 max.)'],['c','gl','Mise en page']]],
['✆','Réponse (RSVP)',[['t','rsvpwa','Numéro WhatsApp (ex. 212600000000)'],['t','rsvpem','E-mail'],['d','rsvpby','Réponse avant le']]],
['☰','Sections visibles',[['x','sec',SECS]]]];
function musicPicker(box,done){
 let buf,st=0,ln=30,pv=null;
 box.innerHTML=`<label>Importer votre musique (MP3, M4A, WAV…)</label><input type="file" accept="audio/*"><div hidden><div class="wv"><canvas width="600" height="80"></canvas><div class="sel"></div></div><label>Durée de l’extrait</label><div class="chips">${[15,30,45].map(n=>`<button data-n="${n}" class="${n==30?'on':''}">${n} s</button>`).join('')}</div><small class="tt"></small><div class="chips"><button class="pv">▶ Écouter</button><button class="use on">✓ Utiliser cet extrait</button><button class="rm">Retirer</button></div></div>`;
 const fi=$('input',box),pan=$('div',box),wv=$('.wv',box),cv=$('canvas',box),sel=$('.sel',box),tt=$('.tt',box),L=()=>Math.min(ln,buf.duration),fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
 const upd=()=>{const d=buf.duration,l=L();st=Math.max(0,Math.min(st,d-l));sel.style.left=st/d*100+'%';sel.style.width=l/d*100+'%';tt.textContent='Extrait : '+fmt(st)+' → '+fmt(st+l)+'  (sur '+fmt(d)+')'};
 fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{const c=M.ctx=M.ctx||new(window.AudioContext||window.webkitAudioContext)();buf=await c.decodeAudioData(await f.arrayBuffer())}catch(e){alert('Fichier audio illisible. Essayez un MP3 ou un WAV.');return}
  pan.hidden=false;const d=buf.getChannelData(0),n=600,k=Math.floor(d.length/n),g=cv.getContext('2d');g.clearRect(0,0,600,80);g.fillStyle='#b8975a';for(let i=0;i<n;i++){let m=0;for(let j=0;j<k;j+=Math.max(1,k>>6))m=Math.max(m,Math.abs(d[i*k+j]));const h=Math.max(2,m*76);g.fillRect(i,40-h/2,1,h)}st=0;upd()};
 const mv=e=>{const r=wv.getBoundingClientRect();st=(e.clientX-r.left)/r.width*buf.duration-L()/2;upd()};
 wv.onpointerdown=e=>{if(!buf)return;wv.setPointerCapture(e.pointerId);mv(e);wv.onpointermove=mv};wv.onpointerup=()=>wv.onpointermove=null;
 box.onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();
  if(b.dataset.n){ln=+b.dataset.n;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));upd()}
  else if(b.classList.contains('pv')){if(pv){pv.stop();return}M.stop();const c=M.ctx,s=c.createBufferSource();s.buffer=buf;s.connect(c.destination);c.resume();s.start(0,st,L());pv=s;b.textContent='■ Stop';s.onended=()=>{pv=null;b.textContent='▶ Écouter'}}
  else if(b.classList.contains('rm')){pv&&pv.stop();S.audio='';M.src='';M.stop();if(S.mus=='custom')S.mus='rom';pan.hidden=true;fi.value='';done()}
  else if(b.classList.contains('use'))use(b)};
 async function use(b){pv&&pv.stop();const sr=22050,n=Math.floor(L()*sr),r=buf.sampleRate/sr,a=buf.getChannelData(0),c2=buf.numberOfChannels>1?buf.getChannelData(1):a,dv=new DataView(new ArrayBuffer(44+n*2)),w=(o,t)=>[...t].forEach((c,i)=>dv.setUint8(o+i,c.charCodeAt(0)));
  w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);
  const o=Math.floor(st*buf.sampleRate),f=sr*.8,m=Math.max(1,Math.floor(r));for(let k=0;k<n;k++){let t=0;const i=o+Math.floor(k*r);for(let j=0;j<m;j++)t+=((a[i+j]||0)+(c2[i+j]||0))/2;dv.setInt16(44+k*2,Math.max(-1,Math.min(1,t/m*Math.min(1,k/f,(n-k)/f)))*32767,true)}
  S.audio=await new Promise(res=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.readAsDataURL(new Blob([dv],{type:'audio/wav'}))});S.mus='custom';M.src=S.audio;M.stop();b.textContent='✓ Ajouté ('+Math.round(L())+' s)';done()}
}
async function srcFiles(){const b=$('#bundle-js');if(b)return[$('#bundle-css').textContent,b.textContent];const tx=u=>/^data\/features\//.test(u)&&window.__featJS?Promise.resolve(window.__featJS(u)):fetch(u).then(r=>r.ok?r.text():'');return Promise.all([tx('css/invite.css'),Promise.all([...FEATS.map(n=>'data/features/'+n+'.js'),...['catalog','music','render','studio'].map(n=>'js/'+n+'.js')].map(tx)).then(a=>a.join('\n'))])}
const FEATS=['petals','music','frames','backgrounds','envelopes','fonts','palettes','venues'];
const durl=u=>fetch(u).then(r=>r.blob()).then(b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)}));
function studio(){
 let view='card',tm;const open=new Set([0]);
 root.innerHTML=`<div class="app"><div class="pv"><div class="bar"><span class="brand"><i>✿</i> Nargisse</span><div class="seg"><button data-v="env">Enveloppe</button><button data-v="card" class="on">Carte</button></div><button class="btn p" id="full">▶ Plein écran</button></div><div class="pvbox"><div class="pvw"><div class="ph" id="ph"></div></div></div></div>
 <div class="ctl"><div class="hd"><div><h2>Créez votre invitation</h2><p>Chaque choix s’affiche en direct dans l’aperçu.</p></div><div class="acts"><button class="btn" id="rnd">🎲 Surprise</button><button class="btn" id="rst">↺ Réinit.</button></div></div>
 <p class="sub">Modèles prêts à l’emploi</p><div class="tpl" id="tpl">${TPL.map((t,i)=>`<button data-i="${i}"><b>${t[0]}</b><small>${t[1]}</small></button>`).join('')}</div><div id="acc"></div><button class="btn p wide" id="share">⤴ Partager · Liens invités · Télécharger</button></div></div>
 <div class="dlg" id="dlg" hidden><div><h3>Partager l’invitation</h3><input id="lnk" readonly><div class="row"><button class="btn p" id="cp">Copier le lien</button><button class="btn" id="dl">⬇ Fichier HTML complet</button></div><label>Liens personnalisés (un invité par ligne)</label><textarea id="gl" placeholder="Famille Alami&#10;Sara & Yassine"></textarea><div class="row"><button class="btn" id="mk">Générer les liens</button><button class="btn" id="cpa">Copier tout</button></div><textarea id="out" readonly hidden></textarea><small>Le lien ne contient ni la musique importée ni les photos importées. Le fichier HTML est complet (photos + musique).</small><button class="btn" id="cl">Fermer</button></div></div>`;
 const ph=$('#ph'),acc=$('#acc'),draw=()=>{const sc=$('.scroll',ph),t=sc?sc.scrollTop:0;inv(ph,S,{env:view=='env'});const n=$('.scroll',ph);if(n)n.scrollTop=t},redraw=(d=0)=>{clearTimeout(tm);tm=setTimeout(draw,d)};
 const fit=()=>{const b=$('.pvbox'),k=Math.min(b.clientWidth/390,b.clientHeight/780),w=$('.pvw');ph.style.transform=`scale(${k})`;w.style.width=390*k+'px';w.style.height=780*k+'px'};addEventListener('resize',fit);
 const setView=v=>{view=v;document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.v==v));M.stop();draw()};
 document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
 function panel(){acc.innerHTML='';UI.forEach(([ic,t,fs],i)=>{const d=document.createElement('details');d.open=open.has(i);d.dataset.i=i;let h=`<summary><span class="ic">${ic}</span>${t}</summary><div class="fld">`;
  fs.forEach(([ty,k,l,x,y,z])=>{
   if(ty=='c'){const o=CAT[k];h+=`<label>${l} <em>${o.length}</em></label><div class="chips${o.length>14?' big':''}" data-k="${k}">${o.map(c=>{const sw=c[2]&&String(c[2]).includes(',')?c[2].split(','):0;return`<button data-v="${c[0]}" class="${S[k]==c[0]?'on':''}">${sw?`<i style="background:linear-gradient(135deg,${sw[0]} 50%,${sw[1]} 50%)"></i>`:''}${c[1]}</button>`}).join('')}</div>`}
   else if(ty=='t'||ty=='d'||ty=='h')h+=`<label>${l}</label><input data-k="${k}" type="${ty=='d'?'date':ty=='h'?'time':'text'}" value="${E(S[k])}">`;
   else if(ty=='a')h+=`<label>${l}</label><textarea data-k="${k}">${E(S[k])}</textarea>`;
   else if(ty=='r')h+=`<label>${l} <em data-o="${k}">${S[k]}</em></label><input type="range" data-k="${k}" data-r min="${x}" max="${y}" step="${z}" value="${S[k]}">`;
   else if(ty=='k')h+=`<label class="chk"><input type="checkbox" data-kk="${k}" ${S[k]?'checked':''}>${l}</label>`;
   else if(ty=='x')h+=`<div class="xs">${l.map(a=>`<label class="chk"><input type="checkbox" data-x="${k}" data-id="${a[0]}" ${S[k][a[0]]?'checked':''}>${a[1]}</label>`).join('')}</div>`;
   else if(ty=='p')h+=`<label>${l}</label><div class="chips" data-p="${k}">${Object.entries(y===undefined?x:x).map(([id,v])=>`<button data-id="${id}">${v[0]}</button>`).join('')}</div>`;
   else if(ty=='q')h+=`<label>${l}</label><div class="cols">${[0,1,2,3,4].map(i=>`<input type="color" data-q="${k}" data-i="${i}" value="${(S[k]||[])[i]||'#ffffff'}">`).join('')}</div>`;
   else if(ty=='f')h+=`<label>${l}</label><input type="file" accept="image/*" data-f="${k}"><div class="chips"><button data-nof="${k}">Retirer</button></div>`;
   else if(ty=='g')h+=`<label>${l} <em>${(S.gal||[]).length}</em></label><input type="file" accept="image/*" multiple data-g><div class="chips"><button data-nog>Vider la galerie</button></div>`;
   else if(ty=='m')h+='<div id="mpk"></div>'});
  d.innerHTML=h+'</div>';d.ontoggle=()=>d.open?open.add(i):open.delete(i);acc.append(d)});musicPicker($('#mpk'),()=>{panel();save();draw()})}
 acc.onclick=e=>{const b=e.target.closest('button');if(!b)return;const c=b.closest('[data-k]'),p=b.closest('[data-p]');
  if(c){const k=c.dataset.k;S[k]=b.dataset.v;if(k=='lang'&&Object.values(TAGS).flat().includes(S.tag))S.tag=TAGS[S.lang][0];c.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));save();if(k=='lang')panel();if(k=='env')setView('env');else if(k=='mus')M.on&&M.play(S.mus);else redraw()}
  else if(p){const k=p.dataset.p,src=k=='tag'?TAGP:k=='prog'?PR:k=='menu'?MN:IF;S[k]=src[b.dataset.id][1];acc.querySelector(`[data-k=${k}]:is(textarea,input)`).value=S[k];save();redraw()}
  else if(b.dataset.nof){S[b.dataset.nof]='';save();redraw()}else if(b.hasAttribute('data-nog')){S.gal=[];panel();redraw()}};
 acc.oninput=e=>{const t=e.target,k=t.dataset.k;if(k){S[k]=t.dataset.r!==undefined?+t.value:t.value;const o=acc.querySelector(`[data-o=${k}]`);o&&(o.textContent=t.value);save();redraw(t.dataset.r!==undefined?60:250)}else if(t.dataset.x){S[t.dataset.x][t.dataset.id]=t.checked?1:0;save();redraw()}else if(t.dataset.kk){S[t.dataset.kk]=t.checked?1:0;save();redraw()}else if(t.dataset.q){S[t.dataset.q][+t.dataset.i]=t.value;save();redraw(100)}};
 acc.onchange=async e=>{const t=e.target;if(t.dataset.f&&t.files[0]){S[t.dataset.f]=await img2url(t.files[0],900);save();draw()}else if(t.hasAttribute('data-g')){S.gal=[...(S.gal||[]),...await Promise.all([...t.files].slice(0,12).map(f=>img2url(f,800,.8)))].slice(0,12);panel();draw()}};
 $('#tpl').onclick=e=>{const b=e.target.closest('button');if(!b)return;Object.assign(S,TPL[b.dataset.i][2]);save();panel();setView('env')};
 $('#rnd').onclick=()=>{['th','fh','fn','fb','cs','h2','rv','bgs','fr','pet','pcol','pdir','pplan','shape','fm','anim','flt','nfx','cd','pr','mn','ec','wc','env','mus','sepc'].forEach(k=>{const o=CAT[k];S[k]=o[Math.random()*o.length|0][0]});save();panel();setView('env')};
 $('#rst').onclick=()=>{if(confirm('Revenir aux réglages de départ ?')){S=clone(DEF);save();panel();draw()}};
 $('#full').onclick=()=>{const f=document.createElement('div');f.style.cssText='position:fixed;inset:0;z-index:150';document.body.append(f);inv(f,S,{env:1,full:1});const x=document.createElement('button');x.textContent='✕';x.className='btn p cls';x.onclick=()=>{stopInv(f);M.stop();f.remove();x.remove()};document.body.append(x)};
 /* partage */
 const dlg=$('#dlg'),base=()=>location.href.split('#')[0],data=()=>{const{audio,gal,...r}=S;if(r.photo&&r.photo.startsWith('data:'))r.photo='';if(r.vimg&&r.vimg.startsWith('data:'))r.vimg='';return enc(r)},link=n=>base()+'#v='+data()+(n?'&to='+encodeURIComponent(n):'');
 $('#cl').onclick=()=>dlg.hidden=true;$('#share').onclick=()=>{$('#lnk').value=link();dlg.hidden=false};
 $('#cp').onclick=async()=>{const i=$('#lnk');i.select();try{await navigator.clipboard.writeText(i.value);$('#cp').textContent='Lien copié ✓'}catch(e){}};
 $('#mk').onclick=()=>{const o=$('#out');o.hidden=false;o.value=$('#gl').value.split('\n').map(x=>x.trim()).filter(Boolean).map(n=>n+' → '+link(n)).join('\n')};
 $('#cpa').onclick=async()=>{try{await navigator.clipboard.writeText($('#out').value)}catch(e){}};
 $('#dl').onclick=async()=>{try{let[css,js]=await srcFiles();for(const u of['assets/envelope.jpg','assets/venue.jpg'])if(js.includes("'"+u+"'"))js=js.split("'"+u+"'").join("'"+await durl(u)+"'");
  for(const u of new Set(js.match(/uploads\/[\w.\/-]+/g)||[]))js=js.split(u).join(await durl(u));
  const P={...S};for(const k of['photo','vimg'])if(P[k]&&!P[k].startsWith('data:'))P[k]=await durl(P[k]);
  const fonts=[...document.querySelectorAll('link[href*=fonts.googleapis]')].map(l=>`<link rel="stylesheet" href="${l.href}">`).join(''),libs=['canvas-confetti/1.9.3/confetti.browser.min.js','qrcode-generator/1.4.4/qrcode.min.js'].map(l=>`<script src="https://cdnjs.cloudflare.com/ajax/libs/${l}"><\/script>`).join('');
  const code='window.__P='+JSON.stringify(P).replace(/</g,'\\u003c')+';'+js.replace(/<\/script/g,'<\\/script'),name='invitation-'+(S.n1+'-'+S.n2).toLowerCase().replace(/\W+/g,'-')+'.html',out='<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>'+E(S.n1+' & '+S.n2)+'</title>'+fonts+'<style>'+css+'</style>'+libs+'</head><body><div id="root"></div><script>'+code+'<\/script></body></html>';
  let d=null;try{d=window.claude&&await claude.use('downloads')}catch(e){}if(d)await d.save({filename:name,data:out});else{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([out],{type:'text/html'}));a.download=name;a.click()}}catch(e){alert('Téléchargement impossible : '+e.message)}};
 panel();fit();draw();
}
/* ---------- démarrage ---------- */
const root=document.getElementById('root'),hp=Object.fromEntries(location.hash.slice(1).split('&').filter(Boolean).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1)]}));
GUEST=decodeURIComponent(hp.to||new URLSearchParams(location.search).get('to')||'');
if(window.__P||hp.v){let P=window.__P;if(!P){try{P=dec(hp.v)}catch(e){P={}}}root.innerHTML='<div id="g" style="position:fixed;inset:0"></div>';inv($('#g'),merge(DEF,{photo:'',...P}),{env:1,full:1})}else studio();
