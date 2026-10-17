/* music.js — moteur audio : mélodies générées + extrait importé */
const M={ctx:null,iv:0,t:'none',step:0,src:'',vol:.8,cu:0,au:null,
 tone(f,t,d,v,ty){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=f;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*this.vol,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.05)},
 tick(){const s=SEQ[this.t],f=s[this.step++%s.length],t=this.ctx.currentTime+.05,k=MU[this.t][3],pl=MU[this.t][1].split(' ').length;
  if(k=='bell'){this.tone(f,t,1.9,.08,'sine');this.tone(f*2.76,t,.5,.02,'sine')}
  else if(k=='pluck')this.tone(f,t,.9,.11,'triangle');
  else if(k=='organ'){this.tone(f,t,3,.05,'triangle');this.tone(f*2,t,3,.025,'sine')}
  else{this.tone(f,t,2.2,.09,'sine');this.tone(f*2,t,1.4,.025,'triangle')}
  if(this.step%pl==1)this.tone(f/2,t,3.4,.06,'sine')},
 play(t){this.stop();if(t=='none')return;
  const fu=(typeof FX!='undefined'&&FX.music[t])||'';if(t=='custom'||fu){const src=fu||this.src;if(!src)return;const a=this.au=new Audio(src);a.loop=true;a.volume=0;this.cu=1;a.play().then(()=>{let v=0;const f=setInterval(()=>{v=Math.min(this.vol,v+.05);a.volume=v;v>=this.vol&&clearInterval(f)},120)}).catch(()=>{this.cu=0});return}
  if(!SEQ[t])return;try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume();this.t=t;this.step=0;this.tick();this.iv=setInterval(()=>this.tick(),MU[t][2])}catch(e){}},
 stop(){clearInterval(this.iv);this.iv=0;this.cu=0;this.au&&this.au.pause()},
 get on(){return !!this.iv||!!this.cu}};
