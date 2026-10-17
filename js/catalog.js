/* ===================================================================
   catalog.js — toutes les listes d’options (données pures)
   =================================================================== */
const O=(...a)=>a.map(x=>x.split('|')),L=s=>s.trim().split('\n').map(x=>x.split('|'));
const $=(s,r=document)=>r.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---- 50 palettes : id | nom | fond | carte | accent | texte | secondaire ---- */
const PAL=L(`ivoire|Ivoire & or|#faf7f2|#f2ece1|#b8975a|#2a2a3c|#7a736a
blush|Blush & or rose|#fbf0ee|#f5e1dd|#b9806f|#3a2a30|#85706f
nuit|Nuit & or|#14182b|#1d2340|#d6b878|#f2ead9|#a9acc0
sauge|Sauge & champagne|#f1f3ec|#e3e8da|#a8935a|#2d3a2f|#6f7a6c
bordeaux|Bordeaux & or|#2a0f18|#3a1823|#d9b46f|#f6e9e0|#c7a9a6
blanc|Blanc pur|#ffffff|#f6f6f6|#9a9a9a|#1f1f1f|#777777
noir|Noir & or|#0e0e0e|#1a1a1a|#cfae6b|#f4efe6|#aaa49a
poudre|Rose poudré|#fdf2f4|#f8e0e6|#c98a9b|#4a2c36|#8c6b75
lavande|Lavande|#f5f2fb|#e7e0f4|#8e79b8|#2f2a45|#75708a
ciel|Bleu ciel|#f1f7fc|#dcebf7|#6f9bc2|#20344a|#667b8f
marine|Marine & or|#0f1d33|#172a48|#d1ae6a|#eef0f4|#a5b0c2
emeraude|Émeraude|#0f2a22|#17392f|#d3b46c|#eaf3ee|#9fb9ad
olive|Olive|#f3f2e6|#e5e4cf|#8b8a45|#2e2f1a|#75755a
terracotta|Terracotta|#fbf1ea|#f3dccf|#c0623f|#3d2218|#8a6a5a
peche|Pêche|#fff3ec|#fde0d0|#e08a66|#47291f|#94705f
champagne|Champagne|#fbf6ea|#f1e7cf|#c2a35b|#3a3020|#857a62
menthe|Menthe|#effaf5|#d9f0e6|#4f9f84|#1b3a31|#628477
corail|Corail|#fff1ef|#ffdcd5|#e0685a|#4a221d|#96655e
moutarde|Moutarde|#fdf7e4|#f4e8bd|#c79a1e|#3a2e0c|#85763f
vieuxrose|Vieux rose|#f9eeee|#efd6d6|#b57a7f|#3f2528|#8a6a6c
argent|Argent|#f4f5f7|#e4e6ea|#8f97a3|#22262d|#6e7480
cuivre|Cuivre|#fbf2ec|#f0dccd|#b4694a|#36221a|#86695c
prune|Prune|#2b1230|#3b1b42|#d9a8c9|#f6e8f4|#c0a0bb
petrole|Pétrole|#0f2c33|#163b44|#e0b86e|#e9f4f4|#9dbbc0
creme|Crème|#fffaf0|#f6ecd8|#b89b66|#33281a|#84785f
nude|Nude|#f8f0ea|#eddcd0|#a8826b|#3b2b22|#85705f
nuitargent|Nuit & argent|#101826|#1a2538|#b9c4d6|#edf1f7|#96a2b6
foret|Forêt|#14261c|#1d3828|#c8b273|#ecf2e8|#9db39f
rosegold|Rose gold|#fcf1ee|#f4ddd7|#c4837a|#40262a|#8d6d70
bleuroi|Bleu roi|#f2f5fd|#dde5fa|#2f55b5|#14234a|#5f6d92
turquoise|Turquoise|#effafa|#d5f0f0|#28909a|#123a3f|#5a8084
abricot|Abricot|#fff4e8|#ffe0c2|#de8a2e|#45280d|#946f48
pistache|Pistache|#f6f9ec|#e5efcf|#8aa13e|#2c3a12|#6d7b4d
cerise|Cerise|#fff0f2|#ffd9df|#c2284a|#4a1020|#94606b
lilas|Lilas|#f8f1fb|#ecddf3|#a46bbd|#35203f|#7c6a86
sable|Sable|#f7f1e6|#eadfc9|#a38b5a|#36301f|#7f745b
ardoise|Ardoise|#20262e|#2c343e|#d4b483|#eef0f2|#a2abb5
chocolat|Chocolat|#2a1a14|#3a251c|#d8b07a|#f7ece2|#bfa28f
azur|Azur & blanc|#f4fbff|#def2fb|#1f8fc9|#0f2f45|#577a90
rosenuit|Rose & nuit|#1f1522|#2d1e31|#f0b5c4|#fbeef2|#c9a3b0
jade|Jade|#eefaf4|#d4f0e1|#2e9c6d|#11382a|#5a8672
safran|Safran|#fff7e1|#ffe9a8|#d68f00|#3d2c00|#8f7a36
magenta|Magenta|#fff0f8|#ffd8ee|#c2178c|#4a0f38|#965a84
brume|Brume|#f2f4f6|#e1e6ea|#7d93a6|#233039|#6a7b88
vanille|Vanille|#fffcf0|#f9f0cf|#bfa04a|#3c3412|#867c52
boisrose|Bois de rose|#faeeed|#efd5d3|#a8625f|#3a1f1e|#86605e
minuit|Minuit|#0a0f24|#121a3a|#8fa8ff|#eaeefc|#a0abd0
orblanc|Or & blanc|#ffffff|#faf5e8|#c9a44c|#2b2616|#82796a
aurore|Aurore|#fff2f0|#ffe0e6|#d96b8a|#4a1f2e|#98666f
ebene|Ébène|#121212|#1e1e1e|#e8c987|#f3ece0|#a79f92`);
const THEMES={};PAL.forEach(p=>THEMES[p[0]]={bg:p[2],card:p[3],gold:p[4],ink:p[5],muted:p[6]});
const isDark=h=>{const n=parseInt(h.slice(1),16);return((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)<110};
/* ---- polices (Google Fonts, chargées à la demande) ---- */
const FH=['Playfair Display','Cormorant Garamond','Cinzel','Bodoni Moda','Italiana','Marcellus','Lora','Libre Baskerville','DM Serif Display','Cormorant','Forum','Gilda Display','Prata','Abril Fatface','Tenor Sans','Cormorant Infant','Spectral','Crimson Text','EB Garamond','Old Standard TT'];
const FS=['Great Vibes','Allura','Parisienne','Pinyon Script','Alex Brush','Dancing Script','Tangerine','Mrs Saint Delafield','Sacramento','Petit Formal Script','Italianno','Rouge Script','Playball','Satisfy','Monsieur La Doulaise','Herr Von Muellerhoff','Mea Culpa','Ballet','Birthstone','WindSong'];
const FB=['Inter','Montserrat','Lato','Josefin Sans','Raleway','Nunito','Poppins','Work Sans','Jost','Open Sans','Mulish','Quicksand'];
const fl=a=>a.map(x=>[x,x]);
const _fonts={};
function loadFont(n,body){if(_fonts[n])return;_fonts[n]=1;const fx=FX.fonts[n];if(fx){const s=document.createElement('style');s.textContent=`@font-face{font-family:'${n}';src:url('${fx.url}') format('${{woff2:'woff2',woff:'woff',ttf:'truetype',otf:'opentype'}[fx.ext]||'truetype'}');font-display:swap}`;document.head.append(s);return}const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+n.replace(/ /g,'+')+(body?':wght@300;400;500':'')+'&display=swap';document.head.append(l)}
/* ---- motifs SVG (zellige, pois, losanges…) ---- */
const PATS={star:[26,'<path d="M13 1l3 6 6-3-3 6 6 3-6 3 3 6-6-3-3 6-3-6-6 3 3-6-6-3 6-3-3-6 6 3z" fill="none" stroke="C" stroke-width=".8"/>'],dots:[16,'<circle cx="8" cy="8" r="1.6" fill="C"/>'],diam:[20,'<path d="M10 1l9 9-9 9-9-9z" fill="none" stroke="C"/>'],hex:[24,'<path d="M12 2l9 5v10l-9 5-9-5V7z" fill="none" stroke="C"/>'],lat:[20,'<path d="M0 0l20 20M20 0L0 20" stroke="C" stroke-width=".6"/>'],chev:[20,'<path d="M0 6l10 8 10-8" fill="none" stroke="C"/>'],wave:[20,'<path d="M0 10q5-8 10 0t10 0" fill="none" stroke="C"/>'],heart:[20,'<path d="M10 17C2 11 3 5 7 5c2 0 3 1 3 3 0-2 1-3 3-3 4 0 5 6-3 12z" fill="none" stroke="C" stroke-width=".7"/>'],leaf:[20,'<path d="M3 17C3 7 9 3 17 3 17 11 13 17 3 17z" fill="none" stroke="C" stroke-width=".7"/>'],cross:[20,'<path d="M10 3v14M3 10h14" stroke="C"/>'],circ:[20,'<circle cx="10" cy="10" r="7" fill="none" stroke="C"/>'],greek:[20,'<path d="M0 18V4h16v10H6V9h6" fill="none" stroke="C"/>']};
const PN={star:'Étoile zellige',dots:'Pois',diam:'Losanges',hex:'Hexagones',lat:'Treillis',chev:'Chevrons',wave:'Vagues',heart:'Cœurs',leaf:'Feuilles',cross:'Croix',circ:'Cercles',greek:'Frise grecque'};
const pat=(id,c)=>{const p=PATS[id];return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${p[0]}' height='${p[0]}'>${p[1].replace(/C/g,c)}</svg>`)}")`};
/* ---- catalogues de choix (chips) : id|libellé ---- */
const CAT={
 env:O('seal|Sceau doré (photo)','env|Enveloppe & monogramme','cur|Rideaux velours','door|Portes zellige','shr|Voile transparent','iri|Iris monogramme'),
 ec:O('ivoire|Ivoire','champ|Champagne','blanc|Blanc','rose|Rose','ciel|Bleu ciel','sauge|Sauge','noir|Noir','bord|Bordeaux','marine|Marine','or|Or','lav|Lavande','vert|Vert forêt'),
 wc:O('or|Or','rouge|Rouge','bord|Bordeaux','arg|Argent','rg|Rose gold','bleu|Bleu','vert|Vert','noir|Noir','blanc|Blanc','cuivre|Cuivre'),
 oe:O('none|Aucun','burst|Confettis','stars|Étoiles','hearts|Cœurs','fire|Feux d’artifice'),
 mus:O('none|Sans musique','rom|Romantique','nos|Nostalgique','cry|Cristalline','aube|Aube','jardin|Jardin','valse|Valse','berc|Berceuse','lune|Clair de lune','ori|Orient','cath|Cathédrale','fee|Féerie','pia|Piano','custom|Ma musique'),
 lang:O('fr|Français','en|English','ar|العربية'),
 th:PAL.map(p=>[p[0],p[1],p[2]+','+p[4]]),
 fh:fl(FH),fn:fl([...FS,...FH]),fb:fl(FB),
 fs:O('90|Petit','100|Normal','110|Grand','120|Très grand'),
 sp:O('26|Compact','38|Normal','56|Aéré'),
 cs:O('soft|Doux','out|Contour or','glass|Verre','solid|Plein','flat|Plat','shadow|Ombré'),
 h2:O('line|Filet doré','orn|Ornement ✦','sides|Traits latéraux','box|Encadré','big|Grand','plain|Sobre'),
 rv:O('up|Monter','fade|Fondu','zoom|Zoom','left|Glisser gauche','right|Glisser droite','blur|Flou','flip|Bascule','none|Aucun'),
 bgs:[['plain','Uni'],['g1','Dégradé vertical'],['g2','Dégradé radial'],['g3','Dégradé diagonal'],['g4','Halo central'],['g5','Bandes douces'],['g6','Aurore'],...Object.keys(PATS).map(k=>['p_'+k,PN[k]]),['t_paper','Papier grain'],['t_linen','Lin'],['t_vig','Vignette']],
 bgi:O('6|Très léger','12|Léger','22|Marqué'),
 fr:[['none','Aucun'],['line','Filet doré'],['dbl','Double filet'],['dot','Pointillé'],['cor','Coins arabesques'],['flo','Feuillages animés'],['lig','Guirlande lumineuse'],['bok','Bokeh doré'],['sta','Étoiles scintillantes'],['vel','Rideaux velours'],['rib','Rubans dorés'],['ray','Rayons de lumière'],['gli','Paillettes'],['gar','Guirlande de cœurs'],['wav','Vagues animées'],...Object.keys(PATS).map(k=>['s_'+k,'Frise · '+PN[k]]),['e_🦋','Papillons'],['e_🕊️','Colombes'],['e_🏮','Lanternes'],['e_💖','Cœurs flottants'],['e_🌼','Fleurs flottantes'],['e_✨','Étincelles'],['e_🍃','Feuilles'],['e_🫧','Bulles'],['e_🪷','Lotus'],['e_🎈','Ballons']],
 dc:O('gold|Accent du thème','white|Blanc','rose|Rose','blue|Bleu','green|Vert','black|Noir'),
 dsp:O('2|Calme','1|Normal','.5|Vif'),
 pet:[['none','Aucune'],['petal','Pétales'],['heart','Cœurs'],['spark','Étincelles'],['star','Étoiles'],['circle','Bokeh'],['leaf','Feuilles'],['diamond','Diamants'],['confetti','Confettis'],['ribbon','Rubans'],['snow','Neige'],['bubble','Bulles'],['ring','Anneaux'],['emoji','Emoji']],
 pcol:O('rose|Rose','red|Rouge','white|Blanc','gold|Or','lav|Lavande','peach|Pêche','blue|Bleu','sage|Sauge','pink|Fuchsia','champ|Champagne','silver|Argent','multi|Multicolore'),
 pemo:'🌸 🌹 🌷 🌼 🪻 🍃 🦋 ✨ 🕊️ 💖 🎈 🌿 🪷 🌺 💐 🍂 ❄️ 🥂'.split(' ').map(x=>[x,x]),
 pdir:O('down|Tomber','up|Monter','diag|Diagonale','swirl|Tourbillon'),pplan:O('front|Premier plan · devant la carte','back|Arrière-plan · derrière la carte'),
 pspd:O('.6|Lent','1|Moyen','1.7|Rapide'),psz:O('.7|Petit','1|Moyen','1.5|Grand'),den:O('10|Léger','22|Moyen','40|Dense','75|Pluie'),
 hl:O('stack|Photo puis noms','names|Noms puis photo','cover|Photo plein écran'),
 shape:[['arch','Arche',.75],['circle','Cercle',1],['oval','Ovale',.75],['round','Carré arrondi',1],['squ','Squircle',1],['rect','Rectangle',.8],['heart','Cœur',1],['hex','Hexagone',1.1],['dia','Losange',1],['oct','Octogone',1],['star','Étoile',1],['shield','Écusson',.85],['leaf','Feuille',1],['blob1','Blob 1',1],['blob2','Blob 2',1],['blob3','Blob 3',1],['drop','Goutte',1],['pill','Pilule verticale',.62],['pillh','Pilule horizontale',1.6],['top','Dôme',.85],['trap','Trapèze',1],['para','Parallélogramme',1],['pent','Pentagone',1],['plus','Croix',1],['tick','Ticket',1.3],['tilt','Polaroïd incliné',.9]],
 fm:O('ring|Anneau or','dbl|Double anneau','pol|Cadre blanc','soft|Ombre douce','glow|Halo lumineux','dash|Pointillé','off|Contour décalé','none|Sans cadre'),
 anim:O('none|Aucune','zoom|Zoom lent','float|Flottement','beat|Battement','shine|Brillance','sway|Balancement','swing|Pendule','glow|Halo pulsé','pan|Panoramique','breathe|Respiration','drift|Dérive','ripple|Ondes','tilt|Inclinaison','pulse|Pulsation','pop|Rebond'),
 flt:O('none|Original','sepia|Sépia','bw|Noir & blanc','warm|Chaud','cool|Froid','vint|Vintage','fade|Délavé','viv|Éclatant','dream|Rêve','film|Film'),
 psz2:O('60|Petite','70|Moyenne','82|Grande'),
 sepc:O('&|&','♥|♥','+|+','✦|✦','et|et','and|and','❀|❀','∞|∞','✿|✿','♡|♡','❦|❦','🤍|🤍'),
 nfx:O('shine|Or animé','gold|Or uni','solid|Couleur du texte','rg|Dégradé rosé','silver|Argent','outline|Contour','shadow|Ombre portée','neon|Néon','emb|Relief','dual|Bicolore'),
 nl:O('stack|Sur deux lignes','inline|Sur une ligne'),
 dfm:O('long|Complète','short|Courte','num|30 · 05 · 2027','slash|30/05/2027','big|Grand jour','roman|Chiffres romains'),
 cd:O('classic|Classique','cards|Cartes','rings|Anneaux','line|Ligne','flip|Flip','outl|Cercles contour','plate|Plaques or','mini|Minimal','glass|Verre','bars|Barres'),
 ven:[],vst:O('arch|Arche','rect|Rectangle','circ|Cercle','none|Sans photo'),
 pr:O('tl|Chronologie','pc|Cartes','pce|Centré','ptb|Tableau','ico|Icônes','zig|Alterné','stp|Étapes','mini|Compact'),
 mn:O('cards|Cartes dorées','mcl|Carte classique','mco|Deux colonnes','tkt|Ticket','min|Minimal','fr2|Cadre unique','big|Grand format','ico|Icônes'),
 gl:O('grid|Grille','car|Carrousel','col|Collage','pol|Polaroïds','str|Pellicule','msn|Mosaïque'),
 ds:O('pill|Pastille','tag|Étiquette','plain|Sobre')};
/* ---- lieux ---- */
const VEN=[['himmi','Himmi Palace','Salle de réception','Un lieu d’exception pour une soirée inoubliable.',1],['chateau','Château','','Un château entouré de jardins.'],['riad','Riad','','Un riad intime aux patios fleuris et aux zelliges.'],['jardin','Jardin & domaine','','Un domaine romantique en plein air.'],['hotel','Hôtel de luxe','','Un cadre raffiné pour la cérémonie et le dîner.'],['salle','Salle des fêtes','','Une grande salle lumineuse pour tous vos invités.'],['plage','Plage & bord de mer','','Les pieds dans le sable, face à l’horizon.'],['mas','Mas provençal','','Oliviers, lavande et pierres dorées.'],['manoir','Manoir','','Un manoir de charme au cœur de la campagne.'],['roof','Rooftop','','Une terrasse avec vue panoramique.'],['ferme','Ferme & grange','','Un décor champêtre et chaleureux.'],['vigne','Domaine viticole','','Entre vignes et caves, un cadre authentique.'],['custom','Autre lieu…','','']].map(v=>({id:v[0],n:v[1],a:v[2],d:v[3],img:v[4]}));
CAT.fr2=CAT.fr;CAT.ven=VEN.map(v=>[v.id,v.n]);
/* ---- modèles de programme / menu / infos ---- */
const PR={one:['Une journée','# Samedi\n15h00 | Accueil des invités\n16h00 | Cérémonie\n17h30 | Cocktail | Vin d’honneur & animations\n20h00 | Dîner\n23h00 | Soirée dansante'],two:['Deux jours','# Jour 1\n14h00 | Cérémonie civile | Mairie\n# Jour 2\n16h00 | Accueil des invités\n16h30 | Cérémonie\n17h30 | Cocktail | Vin d’honneur & animations\n19h30 | Dîner\n23h00 | Ouverture du bal | Soirée dansante'],soir:['Soirée','19h00 | Accueil & cocktail\n20h30 | Dîner\n22h00 | Gâteau des mariés\n22h30 | Ouverture du bal\n02h00 | Fin de soirée'],bru:['Avec brunch','# Samedi\n15h00 | Cérémonie\n17h00 | Cocktail\n20h00 | Dîner & bal\n# Dimanche\n11h00 | Brunch d’au revoir'],rel:['Civil + religieux','# Mairie\n11h00 | Cérémonie civile\n# Cérémonie religieuse\n15h00 | Bénédiction\n16h30 | Photos de groupe\n18h00 | Réception\n20h30 | Dîner']};
const MN={fr:['Français','# Cocktail\nChampagne Brut\nSaumon gravlax & crème citronnée\nFoie gras sur brioche toastée\n# Entrée\nCarpaccio de Saint-Jacques, agrumes & huile d’olive\n# Plat\nFilet de bœuf rôti, jus au thym, purée truffée\n# Dessert\nEntremets vanille & fruits rouges'],ma:['Marocain','# Accueil\nThé à la menthe & dattes\nPâtisseries marocaines\n# Entrée\nPastilla au poulet\n# Plat\nTajine d’agneau aux pruneaux\nCouscous royal\n# Dessert\nCorne de gazelle & fruits de saison'],bu:['Buffet','# Entrées\nSalades composées, verrines & canapés\n# Plats\nViandes grillées, poissons & légumes rôtis\n# Desserts\nFontaine de chocolat & pièces montées'],it:['Italien','# Antipasti\nBurrata, tomates anciennes & basilic\n# Primo\nRisotto aux cèpes\n# Secondo\nOsso buco & polenta crémeuse\n# Dolce\nTiramisu & panna cotta'],me:['Mer','# Entrée\nHuîtres & tartare de daurade\n# Plat\nHomard grillé, beurre blanc\n# Dessert\nPavlova aux fruits exotiques'],ve:['Végétarien','# Entrée\nVelouté de petits pois & menthe\n# Plat\nRisotto aux asperges & parmesan\n# Dessert\nTarte fine aux poires'],br:['Brunch','# Brunch\nViennoiseries & pains\nŒufs brouillés, saumon fumé\nSalade de fruits frais\nJus pressés, café & thé']};
const IF={a:['Classique','# Photographies et souvenirs\nPartagez vos photos avec nous après l’événement.\n# Téléphones pendant la cérémonie\nProfitons pleinement de ce moment en gardant nos téléphones discrets.\n# Moments partagés\nVotre présence est le plus beau des cadeaux. Une urne sera à votre disposition le jour de la réception.'],b:['Pratique','# Enfants\nNous avons prévu un espace dédié aux enfants avec animatrice.\n# Parking\nUn parking gratuit est disponible sur place.\n# Navettes\nDes navettes seront organisées depuis les hôtels partenaires.'],c:['Esprit de la journée','# Esprit de la journée\nLaissez les montres de côté, profitez du moment et célébrons ensemble cette journée remplie de joie et de souvenirs.']};
const TAGS={fr:['Vous invitent à célébrer leur mariage','Ont la joie de vous convier à leur mariage','Se disent « oui » et vous invitent à partager leur bonheur','Vous attendent pour le plus beau jour de leur vie','Unissent leurs vies et vous invitent à la célébrer'],en:['Invite you to celebrate their wedding','Joyfully invite you to their wedding','Are getting married and would love you there','Request the pleasure of your company'],ar:['يدعونكم لحضور حفل زفافهم','يتشرفان بدعوتكم لمشاركتهم فرحتهم','يسعدهما حضوركم في يومهم المميز']};
/* ---- traductions des textes de la carte ---- */
const TR={fr:{cd:'Compte à rebours',bef:'avant le grand jour',d:'Jours',h:'Heures',m:'Minutes',s:'Secondes',ven:'Lieu',pr:'Programme',mn:'Menu',dr:'Code vestimentaire',inf:'Informations',hot:'Hébergement',gift:'Cadeaux',gal:'Galerie',rsvp:'Confirmer ma présence',cal:'Calendrier',share:'Partager',open:'Touchez pour ouvrir',scroll:'Faites défiler',maps:'Maps',route:'Itinéraire',addcal:'Ajouter à mon agenda',yes:'Je serai présent(e)',no:'Je ne pourrai pas venir',name:'Nom et prénom',guests:'Nombre de personnes',msg:'Message ou allergies',send:'Envoyer',dear:'Cher(e)',today:'C’est le grand jour !',until:'Merci de répondre avant le',scan:'Scannez pour partager',par:'Parking & accès',cer:'Cérémonie',rec:'Réception'},
 en:{cd:'Countdown',bef:'until the big day',d:'Days',h:'Hours',m:'Minutes',s:'Seconds',ven:'Venue',pr:'Schedule',mn:'Menu',dr:'Dress code',inf:'Information',hot:'Accommodation',gift:'Gifts',gal:'Gallery',rsvp:'RSVP',cal:'Calendar',share:'Share',open:'Tap to open',scroll:'Scroll down',maps:'Maps',route:'Directions',addcal:'Add to my calendar',yes:'Joyfully accept',no:'Regretfully decline',name:'Full name',guests:'Number of guests',msg:'Message or allergies',send:'Send',dear:'Dear',today:'It’s the big day!',until:'Kindly reply by',scan:'Scan to share',par:'Parking & access',cer:'Ceremony',rec:'Reception'},
 ar:{cd:'العد التنازلي',bef:'قبل اليوم الكبير',d:'أيام',h:'ساعات',m:'دقائق',s:'ثوانٍ',ven:'المكان',pr:'البرنامج',mn:'قائمة الطعام',dr:'اللباس',inf:'معلومات',hot:'الإقامة',gift:'الهدايا',gal:'معرض الصور',rsvp:'تأكيد الحضور',cal:'التقويم',share:'مشاركة',open:'المس للفتح',scroll:'مرّر للأسفل',maps:'الخرائط',route:'الاتجاهات',addcal:'أضف إلى التقويم',yes:'سأحضر بإذن الله',no:'لن أتمكن من الحضور',name:'الاسم الكامل',guests:'عدد الأشخاص',msg:'رسالة أو حساسية',send:'إرسال',dear:'عزيزي',today:'إنه اليوم الكبير!',until:'يرجى الرد قبل',scan:'امسح للمشاركة',par:'مواقف السيارات',cer:'الحفل',rec:'الاستقبال'}};
/* ---- couleurs ---- */
const EC={ivoire:['#f6ecd6','#e6d6b4'],champ:['#f3e5c4','#dfc78f'],blanc:['#ffffff','#ececec'],rose:['#f8e1e0','#e9b9b8'],ciel:['#e3effa','#b9d3ea'],sauge:['#e4ebd9','#b9c8a4'],noir:['#2a2a2e','#0f0f12'],bord:['#7a1a2e','#4a0c1b'],marine:['#1f3558','#0f1d33'],or:['#e9d08e','#b8975a'],lav:['#e8e0f5','#c3b4e0'],vert:['#2f5a44','#17382a']};
const WC={or:['#f0d68a','#c39a43','#8a6a26','#6d5118'],rouge:['#e0525a','#a81f2d','#6e0f1a','#fbd9db'],bord:['#a03045','#6b1325','#3d0813','#f5d0d6'],arg:['#f1f3f6','#aab2be','#6c7480','#3c424c'],rg:['#f6d2c8','#cf8f82','#94584f','#5e332d'],bleu:['#7fa6e6','#3f67b5','#1f3a78','#d6e3fa'],vert:['#7cc09b','#3a8d65','#1c5538','#d4f0e1'],noir:['#5a5a60','#2b2b30','#111114','#d8d8de'],blanc:['#ffffff','#e6e1d6','#b9b2a2','#6f695b'],cuivre:['#f0b48c','#c07242','#85441f','#4f260f']};
const PC={rose:[['#fff4f0','#f6cfc8'],['#f4c6c0','#d98f8a']],red:[['#e86a6a','#9e1b2d'],['#c0293d','#7a0f22']],white:[['#ffffff','#eee6dc'],['#fffdf8','#e3d9c8']],gold:[['#fff0b8','#d4a73c'],['#f6dd8e','#b8892a']],lav:[['#efe6ff','#b79be0'],['#d8c6f5','#9477c9']],peach:[['#ffe6d6','#f2a982'],['#ffd0b5','#e58a5f']],blue:[['#e3f1ff','#8fbbe8'],['#c3defa','#5f95cf']],sage:[['#eef5e6','#a7c08a'],['#d3e5be','#7fa05f']],pink:[['#ffd1ea','#e83e9e'],['#ffb3dc','#c21d84']],champ:[['#fff8e1','#e6cf94'],['#f7e9bd','#cdb06a']],silver:[['#ffffff','#b8c0cc'],['#eef1f5','#8f98a6']],multi:[['#ffd1dc','#ef7b9c'],['#fff2a8','#f0c93a'],['#c8f0d8','#5bc08b'],['#cfe4ff','#6aa0e8'],['#e6d2ff','#a77ee0']]};
const DCC={white:'#ffffff',rose:'#e59aa8',blue:'#6f9bd0',green:'#7d9a6a',black:'#222'};
/* ---- musique générée (accords, motif, tempo, timbre) ---- */
const MU={rom:['C4 E4 G4,A3 C4 E4,F3 A3 C4,G3 B3 D4','0 1 2 1 2 1',700,'pad'],nos:['A3 C4 E4,F3 A3 C4,C4 E4 G4,G3 B3 D4','0 1 2 1 2 1',950,'pad'],cry:['C5 E5 G5,A4 C5 E5,F4 A4 C5,G4 B4 D5','0 2 1 2 0 1 2 1',420,'bell'],aube:['C4 E4 G4 B4,F3 A3 C4 E4,A3 C4 E4 G4,G3 B3 D4 F4','0 1 2 3 2 1',800,'pad'],jardin:['G3 B3 D4,D4 F#4 A4,E3 G3 B3,C4 E4 G4','0 1 2 1',650,'pluck'],valse:['D3 F#3 A3,A3 C#4 E4,B3 D4 F#4,G3 B3 D4','0 1 2',520,'pluck'],berc:['F3 A3 C4,C4 E4 G4,D3 F3 A3,Bb3 D4 F4','0 1 2 1',1000,'pad'],lune:['Db3 F3 Ab3,Gb3 Bb3 Db4,Bb3 Db4 F4,Ab3 C4 Eb4','0 1 2 1 2 1',1100,'bell'],ori:['D4 Eb4 F#4 A4,Eb4 F#4 A4 Bb4,D4 F#4 A4 C5,Eb4 G4 Bb4','0 1 2 3 2 1',600,'pluck'],cath:['D3 A3 D4,B2 F#3 B3,G2 D3 G3,A2 E3 A3','0 1 2 1',1400,'organ'],fee:['C5 E5 G5 C6,A4 C5 E5 A5,F4 A4 C5 F5,G4 B4 D5 G5','0 1 2 3 2 1 3 2',300,'bell'],pia:['C4 E4 G4,A3 C4 E4,D4 F4 A4,G3 B3 D4','0 1 2 1 2 1',600,'pluck']};
const NT={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const hz=s=>{const m=s.match(/^([A-G])(#|b)?(\d)$/);return 440*Math.pow(2,((NT[m[1]]+(m[2]=='#'?1:m[2]=='b'?-1:0))+12*(+m[3]+1)-69)/12)};
const SEQ={};Object.entries(MU).forEach(([k,v])=>{const ch=v[0].split(',').map(c=>c.split(' ').map(hz)),pt=v[1].split(' ').map(Number);SEQ[k]=ch.flatMap(c=>pt.map(i=>c[i%c.length]))});
/* ---- modèles complets ---- */
const TPL=[['Classique doré','Ivoire & or',{th:'ivoire',fh:'Playfair Display',fn:'Playfair Display',nfx:'shine',fr:'line',pet:'petal',pcol:'rose',env:'seal',mus:'rom',bgs:'plain',shape:'arch',anim:'zoom',cd:'classic'}],
['Romantique rose','Blush',{th:'blush',fh:'Cormorant Garamond',fn:'Great Vibes',nfx:'rg',fr:'e_🦋',pet:'petal',pcol:'pink',env:'env',ec:'rose',wc:'rg',mus:'cry',bgs:'g2',shape:'heart',anim:'beat',cd:'rings'}],
['Oriental nuit','Zellige',{th:'nuit',fh:'Cinzel',fn:'Cinzel',nfx:'gold',fr:'s_star',pet:'spark',pcol:'gold',env:'door',mus:'ori',bgs:'p_star',bgi:'6',shape:'arch',anim:'glow',cd:'plate',pr:'ico'}],
['Jardin sauge','Nature',{th:'sauge',fh:'Cormorant Garamond',fn:'Allura',nfx:'solid',fr:'flo',pet:'leaf',pcol:'sage',env:'shr',mus:'jardin',bgs:'g1',shape:'oval',anim:'float',cd:'cards'}],
['Royal bordeaux','Luxe',{th:'bordeaux',fh:'Bodoni Moda',fn:'Pinyon Script',nfx:'shine',fr:'vel',pet:'petal',pcol:'red',env:'cur',mus:'cath',bgs:'t_vig',shape:'shield',anim:'shine',cd:'flip',mn:'tkt'}],
['Minimal blanc','Épuré',{th:'blanc',fh:'Italiana',fn:'Italiana',nfx:'solid',fr:'none',pet:'none',env:'iri',mus:'aube',bgs:'plain',shape:'circle',anim:'none',cd:'mini',cs:'flat',h2:'plain'}],
['Féerique','Lumières',{th:'rosenuit',fh:'Cormorant Garamond',fn:'Parisienne',nfx:'neon',fr:'lig',pet:'spark',pcol:'champ',env:'iri',mus:'fee',bgs:'g4',shape:'round',anim:'ripple',cd:'glass'}],
['Marine & or','Élégant',{th:'marine',fh:'Playfair Display',fn:'Alex Brush',nfx:'gold',fr:'dbl',pet:'confetti',pcol:'gold',env:'env',ec:'marine',wc:'or',mus:'pia',bgs:'g3',shape:'arch',anim:'zoom',cd:'outl'}]];

/* ===================================================================
   Fonctionnalités ajoutées depuis l’admin (admin/) — chaque catégorie
   vit dans son propre fichier : data/features/<categorie>.js
   =================================================================== */
const FX={petals:{},frames:{},bgs:{},envs:{},music:{},fonts:{}};
(()=>{const F=window.FEATURES||{},each=(a,f)=>(a||[]).forEach(f),beforeLast=(a,e)=>a.splice(Math.max(0,a.length-1),0,e);
 each(F.palettes,p=>{const id='x_'+p.id;THEMES[id]={bg:p.bg,card:p.card,gold:p.accent,ink:p.ink,muted:p.muted};PAL.push([id,p.name,p.bg,p.card,p.accent,p.ink,p.muted]);CAT.th.push([id,E(p.name),p.bg+','+p.accent])});
 each(F.petals,p=>{const id='x_'+p.id;FX.petals[id]={kind:p.kind,emoji:p.emoji,url:p.url};CAT.pet.push([id,E(p.name)])});
 each(F.music,m=>{const id='x_'+m.id;FX.music[id]=m.url;beforeLast(CAT.mus,[id,'♫ '+E(m.name)])});
 each(F.frames,f=>{FX.frames[f.id]={url:f.url,mode:f.mode};CAT.fr.push(['f_'+f.id,'Décor · '+E(f.name)])});
 each(F.backgrounds,b=>{FX.bgs[b.id]=b;CAT.bgs.push(['i_'+b.id,'Image · '+E(b.name)])});
 each(F.envelopes,e=>{FX.envs['x_'+e.id]=e;CAT.env.push(['x_'+e.id,'Enveloppe · '+E(e.name)])});
 each(F.fonts,f=>{if(f.source=='file'&&f.url)FX.fonts[f.name]={url:f.url,ext:f.ext};const add=a=>a.push([f.name,f.name]);
  if(f.role=='titles'||f.role=='all')add(CAT.fh);if(f.role=='names'||f.role=='all')add(CAT.fn);if(f.role=='body'||f.role=='all')add(CAT.fb)});
 each(F.venues,v=>{VEN.splice(VEN.length-1,0,{id:'x_'+v.id,n:v.name,a:v.a||'',d:v.d||'',img:v.url||0});CAT.ven=VEN.map(x=>[x.id,E(x.n)])});
})();
