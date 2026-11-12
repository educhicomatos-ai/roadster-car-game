/* ---------- biomes: place, time of day and weather change along the route ---------- */
var ZONE_LEN=1100, ZONE_BLEND=700, ENV_FAR=520;
var NUMF=['fogN','fogF','hemiI','sunI','sunX','sunY','sunZ','fillI','haloO','haloS','haloX','haloY','discS','discX','discY','stars','cloudO','rain','leaves','storm','beam','glow','search','rays','leafS','cave','space'];
var COLF=['leafC','hemiS','hemiG','sunC','fillC','ground','road','rail','stripe','haloC','discC','cloudC'];
var BIO=[
 {id:'desert',name:'Deserto ao pôr do sol',
  sky:[0xe2814f,0xe2814f,0xd9607b,0x6b3a85,0x21215c,0x0a0f2e],fogN:70,fogF:520,
  hemiS:0xffc08a,hemiG:0x3a2a50,hemiI:0.95,sunC:0xffa45c,sunI:0.9,sunX:-30,sunY:40,sunZ:-120,fillC:0x9db4ff,fillI:0.45,
  ground:0x9c5a3a,road:0xffffff,rail:0xb9c2d6,stripe:0xff6a3a,
  haloC:0xff9a5a,haloO:0.35,haloS:1,haloX:0,haloY:50,discC:0xffe2b0,discS:1,discX:0,discY:55,
  stars:0,cloudC:0xffb8a0,cloudO:0.5,rain:0,leaves:0,storm:0,beam:0,glow:0,search:0},
 {id:'forest',name:'Floresta de manhã',
  sky:[0xcfe3ee,0xcfe3ee,0xa7d0ea,0x78b0e0,0x5496d6,0x3d7fc6],fogN:60,fogF:500,
  hemiS:0xe4f0ff,hemiG:0x7c8c3c,hemiI:1.05,sunC:0xfff0c0,sunI:1.05,sunX:50,sunY:70,sunZ:-90,fillC:0xbfd0ff,fillI:0.35,
  ground:0x93ad3a,road:0xffffff,rail:0xcfd6c0,stripe:0xffe566,
  haloC:0xfff2c8,haloO:0.28,haloS:0.8,haloX:-260,haloY:330,discC:0xfffbe6,discS:0.8,discX:-260,discY:330,
  stars:0,cloudC:0xffffff,cloudO:0.92,rain:0,leaves:1,storm:0,beam:0,glow:0,search:0},
 {id:'city',name:'Cidade à tarde',
  sky:[0xe8cadc,0xe8cadc,0xc9bfe4,0x93abe4,0x7096e0,0x5a84d4],fogN:70,fogF:500,
  hemiS:0xf2e4ff,hemiG:0x6a6272,hemiI:1.0,sunC:0xfff0d8,sunI:0.95,sunX:60,sunY:55,sunZ:-80,fillC:0xc8d0ff,fillI:0.4,
  ground:0x77727e,road:0xffffff,rail:0xd2d2dc,stripe:0xffd24a,
  haloC:0xffe6c8,haloO:0.26,haloS:1.2,haloX:300,haloY:190,discC:0xfff6e0,discS:0.7,discX:300,discY:190,
  stars:0,cloudC:0xfff4fa,cloudO:0.85,rain:0,leaves:0,storm:0,beam:0,glow:0,search:0},
 {id:'ocean',name:'Mar partido em tempestade',
  sky:[0xe8a066,0xd48a5a,0x7a5a7c,0x3b3a5e,0x24263f,0x15172c],fogN:50,fogF:420,
  hemiS:0x8a9ad4,hemiG:0x2a2a48,hemiI:0.85,sunC:0xffb070,sunI:0.9,sunX:0,sunY:25,sunZ:-140,fillC:0x6f90ff,fillI:0.5,
  ground:0x5a6480,road:0xa8b0c4,rail:0x7a86a8,stripe:0x58e0ff,
  haloC:0xffb070,haloO:0.45,haloS:0.8,haloX:0,haloY:28,discC:0xfff0d0,discS:0.35,discX:0,discY:30,
  stars:0,cloudC:0x4c4764,cloudO:0.96,rain:1,leaves:0,storm:1,beam:1,glow:0.25,search:0},
 {id:'neon',name:'Metrópole cyberpunk',
  sky:[0x7a2aa8,0x4a1f8c,0x2a1a78,0x161268,0x0c0c4c,0x060638],fogN:50,fogF:440,
  hemiS:0x7a6cff,hemiG:0x1a1248,hemiI:0.85,sunC:0x9ab4ff,sunI:0.35,sunX:-40,sunY:60,sunZ:-100,fillC:0xff4ad8,fillI:0.6,
  ground:0x1c2034,road:0xdcd4ff,rail:0x8a6aff,stripe:0xff3fd0,
  haloC:0xff5ad0,haloO:0.34,haloS:1.2,haloX:260,haloY:230,discC:0xdfe6ff,discS:0.7,discX:260,discY:230,
  stars:1,cloudC:0x3a2a6a,cloudO:0.45,rain:0,leaves:0,storm:0,beam:0,glow:1,search:1},
 {id:'ruins',name:'Cidade em ruínas',
  sky:[0xffb070,0xf29a62,0xd8708a,0x8a4a80,0x4a3a78,0x2a2a5a],fogN:40,fogF:400,
  hemiS:0xffc890,hemiG:0x3a2c3c,hemiI:0.9,sunC:0xffb070,sunI:1.0,sunX:0,sunY:30,sunZ:-140,fillC:0xff9a8a,fillI:0.35,
  ground:0x6b5a48,road:0xb7aa9c,rail:0x8a7a6a,stripe:0xff8a3a,
  haloC:0xffa860,haloO:0.55,haloS:1.6,haloX:0,haloY:60,discC:0xffe0a0,discS:1.2,discX:0,discY:62,
  stars:0,cloudC:0xff9a8a,cloudO:0.85,rain:0,leaves:1,leafC:0x4a4038,leafS:0.3,storm:0,beam:0,glow:0,search:0,rays:1},
 {id:'sakura',name:'Alameda de cerejeiras',
  sky:[0xf6e4ec,0xf2dce8,0xe4d4ee,0xc4cdf0,0xa4bce8,0x88aae0],fogN:60,fogF:480,
  hemiS:0xfff0f6,hemiG:0x8a7a70,hemiI:1.05,sunC:0xfff0e0,sunI:0.95,sunX:40,sunY:60,sunZ:-90,fillC:0xffc8e0,fillI:0.4,
  ground:0x9aa860,road:0xffffff,rail:0xd8c8d0,stripe:0xfff2c0,
  haloC:0xfff0e6,haloO:0.3,haloS:1,haloX:200,haloY:260,discC:0xfffaf0,discS:0.6,discX:200,discY:260,
  stars:0,cloudC:0xffffff,cloudO:0.7,rain:0,leaves:1,leafC:0xffc4da,leafS:0.36,storm:0,beam:0,glow:0,search:0},
 {id:'cave',name:'Gruta subterrânea',
  sky:[0x2a1810,0x24140c,0x180e08,0x100a07,0x0a0706,0x060505],fogN:30,fogF:330,
  hemiS:0xffb070,hemiG:0x2a1a10,hemiI:0.8,sunC:0x9ac8ff,sunI:0.6,sunX:0,sunY:80,sunZ:-20,fillC:0xff8a40,fillI:0.75,
  ground:0x3a2c22,road:0xd8cabc,rail:0xb89a70,stripe:0xffb050,
  haloC:0x9ac8ff,haloO:0.0,haloS:1,haloX:0,haloY:260,discC:0xdff0ff,discS:0.01,discX:0,discY:260,
  stars:0,cloudC:0x3a2418,cloudO:0,rain:0,leaves:0,storm:0,beam:0,glow:0,search:0,cave:1},
 {id:'copa',name:'Praia de Copacabana',
  sky:[0xdcf0fa,0xcfe8f6,0xa6d4f4,0x76b8f0,0x4a98ea,0x2c7ce0],fogN:70,fogF:520,
  hemiS:0xffffff,hemiG:0xd8c090,hemiI:1.0,sunC:0xfff2d8,sunI:1.0,sunX:-50,sunY:80,sunZ:-60,fillC:0xbfd8ff,fillI:0.4,
  ground:0xffe8b0,road:0xffffff,rail:0xe4e4e4,stripe:0xffe566,
  haloC:0xfff6d0,haloO:0.16,haloS:0.8,haloX:-240,haloY:300,discC:0xfffff0,discS:0.7,discX:-240,discY:300,
  stars:0,cloudC:0xffffff,cloudO:0.9,rain:0,leaves:0,storm:0,beam:0,glow:0,search:0},
 {id:'space',name:'Espaço sideral',
  sky:[0x020006,0x07031a,0x05020f,0x030110,0x020009,0x010005],fogN:60,fogF:680,
  hemiS:0xb49cff,hemiG:0x2a1050,hemiI:1.0,sunC:0xff9ae8,sunI:0.95,sunX:-60,sunY:50,sunZ:-100,fillC:0x58b8ff,fillI:0.55,
  ground:0x000000,road:0xb868d0,rail:0x7a4aff,stripe:0xff4fd8,
  haloC:0x000000,haloO:0,haloS:1,haloX:0,haloY:260,discC:0x000000,discS:0.01,discX:0,discY:260,
  stars:0,cloudC:0x000000,cloudO:0,rain:0,leaves:0,storm:0,beam:0,glow:1,search:0,space:1}
];
BIO.forEach(function(b){
  if(b.space===undefined) b.space=0; if(b.rays===undefined) b.rays=0; if(b.cave===undefined) b.cave=0; if(b.leafS===undefined) b.leafS=0.24; if(b.leafC===undefined) b.leafC=0xf2b830;
  b.skyC=b.sky.map(function(h){return new THREE.Color(h);});
  COLF.forEach(function(f){b[f]=new THREE.Color(b[f]);});
});
var cur={skyC:[0,1,2,3,4,5].map(function(){return new THREE.Color();})};
NUMF.forEach(function(f){cur[f]=BIO[0][f];});
COLF.forEach(function(f){cur[f]=new THREE.Color().copy(BIO[0][f]);});
function blendBio(a,b,t){
  var i;
  for(i=0;i<NUMF.length;i++){var f=NUMF[i]; cur[f]=a[f]+(b[f]-a[f])*t;}
  for(i=0;i<COLF.length;i++){var g=COLF[i]; cur[g].copy(a[g]).lerp(b[g],t);}
  for(i=0;i<6;i++) cur.skyC[i].copy(a.skyC[i]).lerp(b.skyC[i],t);
}

/* the sequence of zones: random start, then random without repeating either of the last two */
var envSeq=[(Math.random()*BIO.length)|0];
function zoneBio(k){
  while(envSeq.length<=k){
    var prev=envSeq[envSeq.length-1], prev2=envSeq.length>1?envSeq[envSeq.length-2]:-1, n;
    do{n=(Math.random()*BIO.length)|0;}while(n===prev||n===prev2);
    envSeq.push(n);
  }
  return envSeq[k];
}
function bioAt(z){return zoneBio(Math.floor(Math.max(0,-z)/ZONE_LEN));}
function edgeGrow(z){
  var d=Math.max(0,-z), into=d-Math.floor(d/ZONE_LEN)*ZONE_LEN;
  var k=Math.floor(d/ZONE_LEN);
  return clamp((k===0?ZONE_LEN-into:Math.min(into,ZONE_LEN-into))/420,0,1);
}
function hash2(k,s){var x=Math.sin(k*127.1+s*311.7)*43758.5453; return x-Math.floor(x);}

