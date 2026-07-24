'use strict';

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

function makeToggle(label){
  const btn=document.createElement('button');btn.className='view-toggle';btn.type='button';btn.textContent=label;btn.addEventListener('click',toggleView);return btn;
}

function coverTitle(){
  const el=document.createElement('div');el.className='cover-title';
  el.innerHTML='<div class="star">✦</div><h1>이야기가 마르던 밤</h1><small>THE NIGHT WHEN STORIES RAN DRY</small>';
  return el;
}

function setExactLines(element,text){
  const lines=String(text??'').split('\n');
  lines.forEach((line,index)=>{
    const span=document.createElement('span');
    span.className='text-line';
    span.textContent=line||'\u00a0';
    element.appendChild(span);
    if(index<lines.length-1)element.appendChild(document.createElement('br'));
  });
}

function makeTextBlock(className,text,fit=true){
  const block=document.createElement('div');block.className=className;
  if(fit)block.dataset.fitText='true';
  const p=document.createElement('p');setExactLines(p,text);block.appendChild(p);
  return block;
}

function sceneParagraphs(n){return SCENES[n].split('\n\n')}
function paragraphLines(text){return String(text||'').split('\n')}
function appendSpacer(page,className='wt-spacer'){const spacer=document.createElement('div');spacer.className=className;page.appendChild(spacer);return spacer}

function appendSpecialWebtoonLayout(n,image,page){
  const p=sceneParagraphs(n);
  let lines;

  switch(n){
    case 10:
      image.appendChild(makeTextBlock('wt-top-caption right one-line',p[0]));
      paragraphLines(p[1]).forEach((text,index)=>{
        const classes=['cut-1','cut-2 dark readability-glow','cut-3'];
        image.appendChild(makeTextBlock(`wt-cut-caption ${classes[index]}`,text));
      });
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',p[2]));
      return true;

    case 11:
      lines=paragraphLines(p[0]);
      image.appendChild(makeTextBlock('wt-top-caption one-line',lines[0]));
      image.appendChild(makeTextBlock('wt-overlay',[lines[1],p[1]].join('\n\n')));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',p[2]));
      return true;

    case 12:
      image.appendChild(makeTextBlock('wt-overlay',[p[0],p[1],p[2]].join('\n\n')));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',p[3]));
      return true;

    case 13:
      image.appendChild(makeTextBlock('wt-overlay',[p[0],p[1]].join('\n\n')));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',[p[2],p[3]].join('\n\n')));
      return true;

    case 14:
      image.appendChild(makeTextBlock('wt-top-caption',p[0]));
      image.appendChild(makeTextBlock('wt-overlay',p[1]));
      page.appendChild(image);
      appendSpacer(page,'wt-spacer wt-section-spacer');
      return true;

    case 15:
      lines=paragraphLines(p[2]);
      image.appendChild(makeTextBlock('wt-top-caption',[p[0],p[1],lines[0]].join('\n\n')));
      image.appendChild(makeTextBlock('wt-overlay',lines[1]));
      page.appendChild(image);
      appendSpacer(page);
      return true;

    case 16:
      image.appendChild(makeTextBlock('wt-panel-caption upper',p[0]));
      image.appendChild(makeTextBlock('wt-panel-caption lower',p[1]));
      page.appendChild(image);
      appendSpacer(page);
      return true;

    case 17:
      page.appendChild(makeTextBlock('wt-gap wt-gap-before',p[0]));
      image.appendChild(makeTextBlock('wt-overlay',p[1]));
      page.appendChild(image);
      appendSpacer(page);
      return true;

    case 20:
      image.appendChild(makeTextBlock('wt-top-caption layout-right one-line',p[0]));
      image.appendChild(makeTextBlock('wt-overlay layout-right',p[1]));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',p[2]));
      return true;

    case 21:
      lines=paragraphLines(p[1]);
      image.appendChild(makeTextBlock('wt-top-caption layout-left',p[0]));
      image.appendChild(makeTextBlock('wt-overlay layout-left one-line',lines[0]));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',lines.slice(1).join('\n')));
      return true;

    case 23:
      image.appendChild(makeTextBlock('wt-top-caption',p[0]));
      image.appendChild(makeTextBlock('wt-overlay',p[1]));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap center scene23-gap',p[2]));
      return true;

    case 24:
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap center scene24-gap',[p[0],p[1]].join('\n\n')));
      return true;

    case 25:
      lines=paragraphLines(p[1]);
      page.appendChild(makeTextBlock('wt-gap wt-gap-before center scene25-before',p[0]));
      image.appendChild(makeTextBlock('wt-overlay',lines[0]));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap center scene25-after',lines[1]));
      return true;

    case 26:
      lines=paragraphLines(p[1]);
      image.appendChild(makeTextBlock('wt-top-caption layout-right',p[0]));
      image.appendChild(makeTextBlock('wt-overlay layout-left',lines.slice(0,2).join('\n')));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap',lines[2]));
      return true;

    case 27:
      page.appendChild(makeTextBlock('wt-gap wt-gap-before scene27-before',p[0]));
      image.appendChild(makeTextBlock('wt-overlay layout-center',p[1]));
      page.appendChild(image);
      page.appendChild(makeTextBlock('wt-gap center scene27-after',p[2]));
      return true;

    case 28:
      image.appendChild(makeTextBlock('wt-overlay layout-center',p[0]));
      page.appendChild(image);
      appendSpacer(page);
      return true;

    default:
      return false;
  }
}

let mode='webtoon';
let bookPages=[];let webtoonPages=[];let current=0;let observer;

function makeBookScene(n){
  const page=document.createElement('section');page.className='book-page';
  page.appendChild(makeImage(n));
  page.appendChild(makeTextBlock('book-caption',SCENES[n]));
  return page;
}

function buildBook(){
  const wrap=document.getElementById('book-view');wrap.textContent='';bookPages=[];
  const cover=document.createElement('section');cover.className='spread';
  const blank=document.createElement('div');blank.className='book-page blank';
  const right=document.createElement('div');right.className='book-page book-cover';
  right.appendChild(makeImage(0));right.appendChild(document.createElement('div')).className='cover-grad';right.appendChild(coverTitle());right.appendChild(makeToggle('웹툰으로 보기'));
  cover.append(blank,right);wrap.appendChild(cover);bookPages.push(cover);
  for(let n=1;n<=28;n+=2){const spread=document.createElement('section');spread.className='spread';spread.append(makeBookScene(n),makeBookScene(n+1));wrap.appendChild(spread);bookPages.push(spread);}
  const end=document.createElement('section');end.className='spread';
  const e1=document.createElement('div');e1.className='book-page blank';
  const e2=document.createElement('div');e2.className='book-page end-page';e2.innerHTML='<p>✦<br><br>마침</p>';
  end.append(e1,e2);wrap.appendChild(end);bookPages.push(end);
}

function buildWebtoon(){
  const wrap=document.getElementById('webtoon-view');wrap.textContent='';webtoonPages=[];
  const cover=document.createElement('section');cover.className='wt-page wt-cover';
  cover.appendChild(makeImage(0));cover.appendChild(document.createElement('div')).className='cover-grad';cover.appendChild(coverTitle());cover.appendChild(makeToggle('동화책으로 보기'));
  wrap.appendChild(cover);webtoonPages.push(cover);
  const coverSpacer=document.createElement('div');coverSpacer.className='wt-cover-spacer';wrap.appendChild(coverSpacer);

  for(let n=1;n<=28;n++){
    const page=document.createElement('section');page.className=`wt-page scene-${n}`;page.dataset.scene=String(n);
    const image=document.createElement('div');image.className='wt-image';image.appendChild(makeImage(n));
    if(!appendSpecialWebtoonLayout(n,image,page)){
      const paragraphs=sceneParagraphs(n);
      image.appendChild(makeTextBlock('wt-overlay',paragraphs[0]||''));page.appendChild(image);
      if(paragraphs.length>1)page.appendChild(makeTextBlock(`wt-gap${n===24||n===27||n===28?' center':''}`,paragraphs.slice(1).join('\n\n')));
      else appendSpacer(page);
    }
    wrap.appendChild(page);webtoonPages.push(page);
  }

  const end=document.createElement('section');end.className='wt-page wt-end';end.innerHTML='<p>✦<br><br>마침</p>';wrap.appendChild(end);webtoonPages.push(end);
}

function activePages(){return mode==='book'?bookPages:webtoonPages}

function setupObserver(){
  if(observer)observer.disconnect();
  const pages=activePages();
  observer=new IntersectionObserver(entries=>{
    let best=null;
    entries.forEach(entry=>{if(entry.isIntersecting&&(!best||entry.intersectionRatio>best.intersectionRatio))best=entry});
    if(best){const i=pages.indexOf(best.target);if(i>=0){current=i;updateNav();}}
  },{threshold:[.25,.45,.65]});
  pages.forEach(page=>observer.observe(page));
}

function navLabel(){
  if(mode==='book'){
    if(current===0)return '표지';
    if(current===bookPages.length-1)return '마침';
    const left=(current-1)*2+1;return `${String(left).padStart(2,'0')}–${String(left+1).padStart(2,'0')}`;
  }
  if(current===0)return '표지';
  if(current===webtoonPages.length-1)return '마침';
  return String(current).padStart(2,'0');
}

function updateNav(){
  const pages=activePages();
  document.getElementById('indicator').textContent=`${navLabel()}\n${current+1} / ${pages.length}`;
  document.getElementById('prev').disabled=current<=0;
  document.getElementById('next').disabled=current>=pages.length-1;
}

function go(delta){
  const pages=activePages();
  const next=Math.max(0,Math.min(pages.length-1,current+delta));
  if(next===current)return;
  current=next;pages[current].scrollIntoView({behavior:'smooth',block:'center'});updateNav();
}

function toggleView(){
  mode=mode==='webtoon'?'book':'webtoon';
  document.getElementById('webtoon-view').classList.toggle('active',mode==='webtoon');
  document.getElementById('book-view').classList.toggle('active',mode==='book');
  current=0;window.scrollTo({top:0,behavior:'auto'});setupObserver();updateNav();queueTextFit();
}

document.getElementById('prev').addEventListener('click',()=>go(-1));
document.getElementById('next').addEventListener('click',()=>go(1));
document.addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowLeft'].includes(event.key))go(-1);
  if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();go(1);}
});

function fitTextBlock(box){
  if(!box.offsetParent)return;
  const p=box.querySelector('p');if(!p)return;
  const lines=[...p.querySelectorAll('.text-line')];if(!lines.length)return;
  p.style.removeProperty('font-size');
  const minSize=box.classList.contains('book-caption')?5:9;
  let size=parseFloat(getComputedStyle(p).fontSize)||16;
  for(let i=0;i<12;i++){
    const available=p.clientWidth;
    const widest=Math.max(...lines.map(line=>line.scrollWidth));
    const heightOverflow=box.classList.contains('book-caption')&&p.scrollHeight>box.clientHeight;
    if((!available||widest<=available+.5)&&!heightOverflow)break;
    const widthRatio=available&&widest?Math.min(.98,available/widest*.985):.95;
    const next=Math.max(minSize,size*(heightOverflow?Math.min(widthRatio,.94):widthRatio));
    if(Math.abs(next-size)<.05)break;
    size=next;p.style.fontSize=`${size}px`;
  }
}

let fitTimer;
function queueTextFit(){
  clearTimeout(fitTimer);
  fitTimer=setTimeout(()=>requestAnimationFrame(()=>document.querySelectorAll('[data-fit-text]').forEach(fitTextBlock)),80);
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
