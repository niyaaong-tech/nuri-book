const IMAGE_MAP={};
Object.entries(FALLBACK_IDS).forEach(([n,id])=>IMAGE_MAP[Number(n)]={id});

function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(ch==='"')quoted=false;
      else cell+=ch;
    }else if(ch==='"')quoted=true;
    else if(ch===','){row.push(cell);cell='';}
    else if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  if(cell.length||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  return rows;
}
function extractDriveId(value){
  const s=String(value||'').trim();
  if(!s)return '';
  const patterns=[/\/d\/([\w-]{20,})/,/id=([\w-]{20,})/,/^([\w-]{20,})$/];
  for(const p of patterns){const m=s.match(p);if(m)return m[1];}
  return '';
}
function normalizeKey(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,'_')}
async function fetchWithTimeout(url,timeoutMs=6000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(url,{credentials:'omit',cache:'no-store',signal:controller.signal});}
  finally{clearTimeout(timer);}
}
async function loadImagesFromSheet(){
  const endpoints=[
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=976851566`
  ];
  let lastError;
  for(const url of endpoints){
    try{
      const res=await fetchWithTimeout(url);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const rows=parseCsv(await res.text());
      if(rows.length<2)throw new Error('시트 데이터 없음');
      const headers=rows[0].map(normalizeKey);
      const nameIndex=headers.findIndex(h=>['파일명','filename','file_name'].includes(h));
      const idIndex=headers.findIndex(h=>['file_id','fileid','id'].includes(h));
      const urlIndex=headers.findIndex(h=>['image_url','img_url','url','이미지_url','이미지url'].includes(h));
      if(nameIndex<0)throw new Error('파일명 열 없음');
      let count=0;
      rows.slice(1).forEach(cols=>{
        const filename=String(cols[nameIndex]||'').trim();
        const m=filename.match(/^(\d{2})\.png$/i);
        if(!m)return;
        const n=Number(m[1]);if(n<0||n>28)return;
        const directUrl=urlIndex>=0?String(cols[urlIndex]||'').trim():'';
        const id=idIndex>=0?extractDriveId(cols[idIndex]):extractDriveId(directUrl);
        if(id||directUrl){IMAGE_MAP[n]={id:id||undefined,url:directUrl||undefined};count++;}
      });
      if(count<1)throw new Error('유효한 이미지 행 없음');
      return count;
    }catch(error){lastError=error;}
  }
  throw lastError||new Error('시트 로드 실패');
}
function imageCandidates(n){
  const record=IMAGE_MAP[n]||IMAGE_MAP[n===0?1:n]||{};
  const urls=[];
  if(record.url)urls.push(record.url);
  if(record.id){
    urls.push(`https://drive.google.com/thumbnail?id=${record.id}&sz=w2400`);
    urls.push(`https://lh3.googleusercontent.com/d/${record.id}=w2400`);
    urls.push(`https://drive.google.com/uc?export=view&id=${record.id}`);
  }
  if(n===0&&IMAGE_MAP[1]?.id){
    const id=IMAGE_MAP[1].id;
    urls.push(`https://drive.google.com/thumbnail?id=${id}&sz=w2400`);
  }
  return [...new Set(urls)];
}
function makeImage(n,className='drive-img'){
  const urls=imageCandidates(n);
  if(!urls.length)return makeError(n,'ID 없음');
  const img=document.createElement('img');
  img.className=className;img.alt=n===0?'표지':`장면 ${n}`;img.referrerPolicy='no-referrer';
  img.decoding='async';img.loading=n<=2?'eager':'lazy';
  let index=0;img.src=urls[0];
  img.onerror=()=>{index++;if(index<urls.length)img.src=urls[index];else img.replaceWith(makeError(n,'불러오기 실패'));};
  return img;
}
function makeError(n,message){
  const el=document.createElement('div');el.className='img-error';
  el.innerHTML=`<strong>${String(n).padStart(2,'0')}</strong><span>${message}</span>`;return el;
}
function makeToggle(label){const btn=document.createElement('button');btn.className='view-toggle';btn.type='button';btn.textContent=label;btn.addEventListener('click',toggleView);return btn}
function coverTitle(){const el=document.createElement('div');el.className='cover-title';el.innerHTML='<div class="star">✦</div><h1>이야기가 마르던 밤</h1><small>THE NIGHT WHEN STORIES RAN DRY</small>';return el}
function makeTextBlock(className,text,fit=true){
  const block=document.createElement('div');block.className=className;
  if(fit)block.dataset.fitText='true';
  const p=document.createElement('p');p.textContent=text;block.appendChild(p);
  return block;
}

const WEBTOON_LAYOUTS={
  10:{
    top:'처음 사라진 것은 아주 작은 것들이었습니다.',
    topClass:'right one-line',
    cuts:[
      {text:'우물가 세 번째 돌의 이름.',className:'cut-1'},
      {text:'방앗간 골목의 오래된 노래.',className:'cut-2 dark'},
      {text:'어떤 모험 이야기의 마지막 장면.',className:'cut-3'}
    ],
    gap:'너무 작아서, 사라진 줄도 몰랐습니다.'
  },
  11:{
    top:'변화는 멈추지 않고 누리 곳곳으로 퍼져나갔습니다.',
    topClass:'one-line',
    bottom:'그리고 마침내, 사람들의 마음속까지 스며들었습니다.\n사람들은 차츰, 이야기를 잊어버리게 되었습니다.',
    gap:'어떤 이야기를 품고 있었는지.\n누구에게 들려주려 했는지.\n그런 것들이, 떠오르지 않게 되었습니다.'
  },
  12:{
    bottom:'지워짐은 멈추지 않았습니다.\n이름을 잃은 들판은\n자기가 들판이었다는 것을 잊었습니다.\n노래를 잊은 바다는\n파도치는 법을 자꾸 틀렸습니다.',
    gap:'이야기로 태어난 이웃들도,\n하나둘 옅어져 갔습니다.'
  },
  13:{
    bottom:'별빛 기사는 마지막까지 마을 어귀를 지켰습니다.\n"내 이야기를 기억해 주는 이가 한 사람이라도 있는 한,\n나는 사라지지 않아."',
    gap:'그렇게 말했지만···.\n\n기억하는 이들의 창문도,\n하나둘 어두워지고 있었습니다.'
  },
  14:{
    top:'어느 저녁, 아이 하나가 물었습니다.\n"할머니, 별한테 이야기를 들려주면\n친구가 태어난다는 게 정말이에요?"',
    bottom:'할머니는 오래 말이 없다가, 창밖을 보았습니다.\n"···글쎄다. 옛날에는 그랬다는데."'
  },
  15:{
    top:'그리고 마침내.\n굶주림에 지친 별들이, 잠들기 시작했습니다.\n동쪽 하늘의 큰 별이 제일 먼저 눈을 감았습니다.',
    bottom:'별 하나가, 잠들었습니다.'
  },
  16:{
    panels:[
      {text:'서쪽 하늘의 등불별이 눈을 감았습니다.\n별 둘이, 잠들었습니다.',className:'upper'},
      {text:'남쪽 바다의 뱃길별이\n마지막 배 한 척을 배웅하고 눈을 감았습니다.\n별 셋이, 잠들었습니다.',className:'lower'}
    ]
  },
  17:{
    topGap:'하나, 또 하나.\n밤마다 하늘은 조용히 어두워졌습니다.',
    bottom:'이제 남은 별은 하나.\n하늘 끝, 가장 높은 곳의 가장 작은 별이었습니다.'
  }
};

let mode='webtoon';
let bookPages=[];let webtoonPages=[];let current=0;let observer;
function makeBookScene(n){
  const page=document.createElement('section');page.className='book-page';
  page.appendChild(makeImage(n));
  const caption=document.createElement('div');caption.className='book-caption';caption.dataset.fitText='true';caption.textContent=SCENES[n];page.appendChild(caption);
  return page;
}
function buildBook(){
  const wrap=document.getElementById('book-view');wrap.textContent='';bookPages=[];
  const cover=document.createElement('section');cover.className='spread';
  const blank=document.createElement('div');blank.className='book-page blank';
  const right=document.createElement('div');right.className='book-page book-cover';right.appendChild(makeImage(0));right.appendChild(document.createElement('div')).className='cover-grad';right.appendChild(coverTitle());right.appendChild(makeToggle('웹툰으로 보기'));
  cover.append(blank,right);wrap.appendChild(cover);bookPages.push(cover);
  for(let n=1;n<=28;n+=2){const spread=document.createElement('section');spread.className='spread';spread.append(makeBookScene(n),makeBookScene(n+1));wrap.appendChild(spread);bookPages.push(spread);}
  const end=document.createElement('section');end.className='spread';const e1=document.createElement('div');e1.className='book-page blank';const e2=document.createElement('div');e2.className='book-page end-page';e2.innerHTML='<p>✦<br><br>끝</p>';end.append(e1,e2);wrap.appendChild(end);bookPages.push(end);
}
function appendSpecialWebtoonLayout(n,image,page){
  const layout=WEBTOON_LAYOUTS[n];
  if(!layout)return false;
  if(layout.topGap)page.appendChild(makeTextBlock('wt-gap wt-gap-before',layout.topGap));
  if(layout.top)image.appendChild(makeTextBlock(`wt-top-caption ${layout.topClass||''}`.trim(),layout.top));
  if(layout.cuts)layout.cuts.forEach(cut=>image.appendChild(makeTextBlock(`wt-cut-caption ${cut.className}`,cut.text,false)));
  if(layout.panels)layout.panels.forEach(panel=>image.appendChild(makeTextBlock(`wt-panel-caption ${panel.className}`,panel.text)));
  if(layout.bottom)image.appendChild(makeTextBlock('wt-overlay',layout.bottom));
  page.appendChild(image);
  if(layout.gap)page.appendChild(makeTextBlock('wt-gap',layout.gap));
  else page.appendChild(Object.assign(document.createElement('div'),{className:'wt-spacer'}));
  return true;
}
function buildWebtoon(){
  const wrap=document.getElementById('webtoon-view');wrap.textContent='';webtoonPages=[];
  const cover=document.createElement('section');cover.className='wt-page wt-cover';cover.appendChild(makeImage(0));cover.appendChild(document.createElement('div')).className='cover-grad';cover.appendChild(coverTitle());cover.appendChild(makeToggle('동화책으로 보기'));wrap.appendChild(cover);webtoonPages.push(cover);
  for(let n=1;n<=28;n++){
    const page=document.createElement('section');page.className=`wt-page scene-${n}`;page.dataset.scene=String(n);
    const image=document.createElement('div');image.className='wt-image';image.appendChild(makeImage(n));
    if(!appendSpecialWebtoonLayout(n,image,page)){
      const paragraphs=SCENES[n].split(/\n\s*\n/).filter(Boolean);
      const overlay=makeTextBlock('wt-overlay',paragraphs[0]||'');image.appendChild(overlay);page.appendChild(image);
      if(paragraphs.length>1){const gap=makeTextBlock('wt-gap'+(n===24||n===27||n===28?' center':''),paragraphs.slice(1).join('\n\n'));page.appendChild(gap);}
      else{const spacer=document.createElement('div');spacer.className='wt-spacer';page.appendChild(spacer);}
    }
    wrap.appendChild(page);webtoonPages.push(page);
  }
  const end=document.createElement('section');end.className='wt-page wt-end';end.innerHTML='<p>✦<br><br>끝</p>';wrap.appendChild(end);webtoonPages.push(end);
}
function activePages(){return mode==='book'?bookPages:webtoonPages}
function setupObserver(){
  if(observer)observer.disconnect();
  const pages=activePages();
  observer=new IntersectionObserver(entries=>{let best=null;entries.forEach(entry=>{if(entry.isIntersecting&&(!best||entry.intersectionRatio>best.intersectionRatio))best=entry});if(best){const i=pages.indexOf(best.target);if(i>=0){current=i;updateNav();}}},{threshold:[.25,.45,.65]});
  pages.forEach(page=>observer.observe(page));
}
function navLabel(){
  if(mode==='book'){if(current===0)return '표지';if(current===bookPages.length-1)return '끝';const left=(current-1)*2+1;return `${String(left).padStart(2,'0')}–${String(left+1).padStart(2,'0')}`;}
  if(current===0)return '표지';if(current===webtoonPages.length-1)return '끝';return String(current).padStart(2,'0');
}
function updateNav(){const pages=activePages();document.getElementById('indicator').textContent=`${navLabel()}\n${current+1} / ${pages.length}`;document.getElementById('prev').disabled=current<=0;document.getElementById('next').disabled=current>=pages.length-1}
function go(delta){const pages=activePages();const next=Math.max(0,Math.min(pages.length-1,current+delta));if(next===current)return;current=next;pages[current].scrollIntoView({behavior:'smooth',block:'center'});updateNav()}
function toggleView(){mode=mode==='webtoon'?'book':'webtoon';document.getElementById('webtoon-view').classList.toggle('active',mode==='webtoon');document.getElementById('book-view').classList.toggle('active',mode==='book');current=0;window.scrollTo({top:0,behavior:'auto'});setupObserver();updateNav();queueTextFit()}
document.getElementById('prev').addEventListener('click',()=>go(-1));document.getElementById('next').addEventListener('click',()=>go(1));
document.addEventListener('keydown',event=>{if(['ArrowUp','ArrowLeft'].includes(event.key))go(-1);if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();go(1)}});

function lastLineWidth(element){
  const target=element.querySelector('p')||element;
  const range=document.createRange();range.selectNodeContents(target);
  const rects=[...range.getClientRects()].filter(rect=>rect.width>.5&&rect.height>.5);
  range.detach?.();
  return rects.length>1?rects[rects.length-1].width:Infinity;
}
function preventShortLastLines(){
  document.querySelectorAll('[data-fit-text]').forEach(box=>{
    box.style.removeProperty('--pad-x');
    const target=box.querySelector('p')||box;
    const fontSize=parseFloat(getComputedStyle(target).fontSize)||16;
    let pad=parseFloat(getComputedStyle(box).getPropertyValue('--pad-x'))||9;
    for(let i=0;i<7;i++){
      if(lastLineWidth(box)>=fontSize*3.1)break;
      pad=Math.max(2.5,pad-1);
      box.style.setProperty('--pad-x',`${pad}%`);
    }
  });
}
function fitOneLineCaptions(){
  document.querySelectorAll('.one-line').forEach(box=>{
    box.style.removeProperty('--pad-x');
    let pad=parseFloat(getComputedStyle(box).getPropertyValue('--pad-x'))||7;
    const target=box.querySelector('p')||box;
    for(let i=0;i<7&&target.scrollWidth>target.clientWidth;i++){
      pad=Math.max(2,pad-1);box.style.setProperty('--pad-x',`${pad}%`);
    }
  });
}
let fitTimer;
function queueTextFit(){
  clearTimeout(fitTimer);
  fitTimer=setTimeout(()=>requestAnimationFrame(()=>{preventShortLastLines();fitOneLineCaptions();}),80);
}
window.addEventListener('resize',queueTextFit,{passive:true});

(async()=>{
  let status='내장 이미지 목록 사용';
  try{const count=await loadImagesFromSheet();status=`시트 이미지 ${count}개 반영`;}catch(error){status='시트 연결 실패 · 내장 이미지 목록 사용';console.warn(error);}
  buildBook();buildWebtoon();
  document.getElementById('webtoon-view').classList.add('active');
  setupObserver();updateNav();queueTextFit();document.getElementById('status').textContent=status;
  document.getElementById('loading').classList.add('done');setTimeout(()=>document.getElementById('loading').remove(),300);
})();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
