var PRISTINE=document.body.cloneNode(true);
var $=function(id){return document.getElementById(id);};
if(!window.THREE){
  $('ovMsg').textContent='Não foi possível carregar o motor 3D. Verifique a conexão e abra a página de novo.';
  $('start').disabled=true;
  return;
}
/* Ranking global (Supabase). Preencha as duas linhas abaixo com a URL e a chave pública (anon) do seu projeto. */
var RANK={url:'https://pdmcwtzsisqpshkmpxrh.supabase.co',key:'sb_publishable_F_uYc5vY-aN7qg9j7Qi3Zg_VLtQ8LJN'};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};
var rand=function(a,b){return a+Math.random()*(b-a);};
var TAU=Math.PI*2;

var ROAD_HALF=21, LANES=7, RAMP_L=16, RAMP_H=1.7, RAMP_W=14, TANK=600, RUN_TIME=90;

