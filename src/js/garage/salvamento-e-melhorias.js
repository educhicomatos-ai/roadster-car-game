/* ---------- save, garage and console ---------- */
var SAVE_KEY='roadster-rocket-save', MAXL=5;
var UPG=[
  {id:'motor',name:'Motor elétrico',desc:'+9 km/h de velocidade de cruzeiro por nível',base:400},
  {id:'tank',name:'Tanque de ar',desc:'+20% de ar comprimido por nível',base:300},
  {id:'armor',name:'Blindagem',desc:'−8% do tempo perdido em batidas por nível',base:500},
  {id:'magnet',name:'Ímã de power-ups',desc:'Coleta power-ups só um pouco de mais longe (máx. nível 3)',base:600,max:3},
  {id:'clock',name:'Cronômetro estendido',desc:'+5 s no início de cada corrida por nível',base:450}
];
var RAR={c:{n:'Comum',col:'#9aa6c0',w:55},r:{n:'Raro',col:'#3fa0ff',w:29},e:{n:'Épico',col:'#b455ff',w:12},l:{n:'Lendário',col:'#ffb02a',w:4}};
var RAR_ORDER=['l','e','r','c'], SPIN_COST=900, SPIN_SLOT_MS=2*60*60*1000, QUOTA={c:4,r:3,e:2,l:1}, WHEEL_MAX=10, DUP_REFUND={c:250,r:400,e:650,l:900};
var LOOK={
  paint:{title:'Pintura',tag:'Pintura',items:[
    {id:'white',name:'Branco pérola',r:'c',c:0xe9edf4},{id:'red',name:'Vermelho foguete',r:'c',c:0xd92b3a},{id:'blue',name:'Azul elétrico',r:'c',c:0x2a6df0},
    {id:'gray',name:'Cinza grafite',r:'c',c:0x6b7280},{id:'yellow',name:'Amarelo táxi',r:'c',c:0xf2c230},{id:'brown',name:'Café',r:'c',c:0x7a4a2a},
    {id:'orange',name:'Laranja Marte',r:'r',c:0xff7a1f},{id:'green',name:'Verde neon',r:'r',c:0x20c27a},{id:'black',name:'Preto carbono',r:'r',c:0x1b1d26},
    {id:'purple',name:'Roxo galáxia',r:'r',c:0x8a4af0},{id:'pink',name:'Rosa choque',r:'r',c:0xff6fb5},{id:'teal',name:'Turquesa',r:'r',c:0x1fb5b0},
    {id:'navy',name:'Azul-marinho',r:'r',c:0x1a2a6a},{id:'wine',name:'Vinho',r:'r',c:0x7a1f3a},
    {id:'gold',name:'Dourado',r:'e',c:0xe6b43a},{id:'silver',name:'Prata cromada',r:'e',c:0xcfd6e0},{id:'acid',name:'Verde ácido',r:'e',c:0x9dff2a},
    {id:'glacier',name:'Gelo azulado',r:'e',c:0x9ad8ff},{id:'sunset',name:'Pôr do sol',r:'e',c:0xff6a4a},
    {id:'rainbow',name:'Arco-íris',r:'l',c:0xff3a3a,fx:'rainbow'},{id:'void',name:'Vazio cósmico',r:'l',c:0x1a0a40,c2:0x5a2aff,fx:'pulse'},
    {id:'aurora',name:'Aurora boreal',r:'l',c:0x35ff9a,c2:0x8a4af0,fx:'pulse'},{id:'lava',name:'Lava viva',r:'l',c:0xd91a0a,c2:0xffb02a,fx:'pulse'}]},
  air:{title:'Cor do ar dos propulsores',tag:'Ar',items:[
    {id:'ice',name:'Gelo',r:'c',c:0xdff6ff},{id:'cyan',name:'Ciano',r:'c',c:0x28e1ff},{id:'orange',name:'Fogo',r:'c',c:0xff8a2a},
    {id:'white',name:'Branco',r:'c',c:0xffffff},{id:'yellow',name:'Amarelo',r:'c',c:0xffe65a},
    {id:'magenta',name:'Magenta',r:'r',c:0xff2fd0},{id:'lime',name:'Lima',r:'r',c:0x8dff4a},{id:'red',name:'Vermelho',r:'r',c:0xff3a3a},
    {id:'blue',name:'Azul',r:'r',c:0x4a7aff},{id:'violet',name:'Violeta',r:'r',c:0xb46aff},
    {id:'gold',name:'Dourado',r:'e',c:0xffd23a},{id:'mint',name:'Menta',r:'e',c:0x5affc8},{id:'rose',name:'Rosa neon',r:'e',c:0xff7ad0},{id:'toxic',name:'Tóxico',r:'e',c:0xb8ff1a},
    {id:'rainbow',name:'Arco-íris',r:'l',c:0xff3a3a,fx:'rainbow'},{id:'plasma',name:'Plasma',r:'l',c:0x28e1ff,c2:0xff2fd0,fx:'pulse'},{id:'inferno',name:'Inferno',r:'l',c:0xff3a1a,c2:0xffe65a,fx:'pulse'}]},
  trim:{title:'Detalhes (aerofólio e lanterna)',tag:'Detalhe',items:[
    {id:'stock',name:'Original',r:'c',c:0x141826,t:0xff3b4a},{id:'red',name:'Vermelho',r:'c',c:0x8f1a22,t:0xff3b4a},
    {id:'steel',name:'Aço',r:'c',c:0x4a5260,t:0xff3b4a},{id:'white',name:'Branco',r:'c',c:0xd8dde6,t:0xff3b4a},
    {id:'carbon',name:'Carbono e âmbar',r:'r',c:0x050507,t:0xff8a2a},{id:'ice',name:'Gelo',r:'r',c:0x3a8fb8,t:0x7fe6ff},
    {id:'blue',name:'Azul esportivo',r:'r',c:0x1a3a9a,t:0x4aa0ff},{id:'green',name:'Verde corrida',r:'r',c:0x1a6a3a,t:0x6aff9a},
    {id:'gold',name:'Dourado',r:'e',c:0xb88a2a,t:0xffd23a},{id:'violet',name:'Roxo místico',r:'e',c:0x4a1a8a,t:0xd08aff},{id:'chrome',name:'Cromado',r:'e',c:0xc0c8d4,t:0xff5a2a},
    {id:'prism',name:'Prisma',r:'l',c:0x101014,t:0xff3a3a,fx:'rainbow'},{id:'ember',name:'Brasa',r:'l',c:0x1a0a06,t:0xff5a1a,t2:0xffe65a,fx:'pulse'}]},
  decal:{title:'Pintura lateral (adesivos)',tag:'Adesivo',items:[
    {id:'none',name:'Sem adesivo',r:'c',c:0xcfd5e2},
    {id:'stripes',name:'Faixas de corrida',r:'c',c:0xff3b4a},{id:'checker',name:'Xadrez',r:'c',c:0xf4f6fb},{id:'stars',name:'Estrelas',r:'c',c:0xffd23a},{id:'dots',name:'Bolinhas',r:'c',c:0xff3b6b},
    {id:'bolt',name:'Raio',r:'r',c:0xffe23a},{id:'flames',name:'Fogo',r:'r',c:0xff5a1a},{id:'claws',name:'Garras',r:'r',c:0xff2a3a},{id:'tribal',name:'Tribal',r:'r',c:0x0b0c14},
    {id:'brazil',name:'Bandeira do Brasil',r:'e',c:0x009c3b},{id:'skull',name:'Caveira',r:'e',c:0xf4f1e6},{id:'sakura',name:'Sakura',r:'e',c:0xffc2dc},{id:'cyber',name:'Circuito neon',r:'e',c:0x28e1ff},
    {id:'flameskull',name:'Caveira em chamas azuis',r:'l',c:0x2a7bff},{id:'holo',name:'Holográfico',r:'l',c:0xff3a3a,fx:'rainbow'}]},
  acc:{title:'Acessórios',tag:'Acessório',items:[
    {id:'none',name:'Nenhum',r:'c',c:0x252d52},
    {id:'antenna',name:'Antena com bandeirinha',r:'c',c:0x009c3b},
    {id:'ears',name:'Orelhas de gato',r:'r',c:0xff9ac8},{id:'horns',name:'Chifrinhos',r:'r',c:0xd92b3a},{id:'underglow',name:'Neon azul no chão',r:'r',c:0x28e1ff},
    {id:'halo',name:'Auréola',r:'e',c:0xffe27a},{id:'crown',name:'Coroa real',r:'e',c:0xffc83a},
    {id:'neon',name:'Neon arco-íris no chão',r:'l',c:0xff3a3a},{id:'wings',name:'Asas douradas',r:'l',c:0xfff4d0}]}
};
function freshSave(dev){
  var d={money:0,dev:!!dev,name:'',pid:'',acct:'',ts:0,pend:null,up:{motor:0,tank:0,armor:0,magnet:0,clock:0},own:{},sel:{}};
  for(var cat in LOOK){d.own[cat]=[LOOK[cat].items[0].id]; d.sel[cat]=LOOK[cat].items[0].id;}
  return d;
}
