'use strict';

function makeBookText(className,text){
  return makeTextBlock(`book-caption book-text ${className}`,text);
}

function appendBookText(page,className,text){
  if(String(text??'').trim()==='')return null;
  const block=makeBookText(className,text);
  page.appendChild(block);
  return block;
}

function nonBlankLines(text){
  return paragraphLines(text).filter(line=>line.trim()!=='');
}

function appendBookSceneLayout(n,page){
  const p=sceneParagraphs(n);
  let lines;

  switch(n){
    case 1:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-at-28 align-left',p[1]);
      appendBookText(page,'book-at-56 align-left',p[2]);
      appendBookText(page,'book-bottom align-left',p[3]);
      break;
    case 2:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-middle align-left',p[1]);
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 3:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-at-43 align-left compact',p[1]);
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 4:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-middle align-left',p[1]);
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 5:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-middle align-left compact',p[1]);
      appendBookText(page,'book-bottom align-left compact',p[2]);
      break;
    case 6:
    case 7:
      appendBookText(page,'book-bottom align-left',p[0]);
      break;
    case 8:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left',p[1]);
      break;
    case 9:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-middle align-left',p[1]);
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 10:
      appendBookText(page,'book-top align-right',p[0]);
      lines=nonBlankLines(p[1]);
      appendBookText(page,'book-at-29 align-right book-cut',lines[0]);
      appendBookText(page,'book-at-51 align-right book-cut book-dark',lines[1]);
      appendBookText(page,'book-at-72 align-right book-cut',lines[2]);
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 11:
      lines=nonBlankLines(p[0]);
      appendBookText(page,'book-top align-left',lines[0]);
      appendBookText(page,'book-at-31 align-left',lines[1]);
      appendBookText(page,'book-at-59 align-left',p[1]);
      appendBookText(page,'book-bottom align-left compact',p[2]);
      break;
    case 12:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-at-30 align-left',p[1]);
      appendBookText(page,'book-at-56 align-left',p[2]);
      appendBookText(page,'book-bottom align-left',p[3]);
      break;
    case 13:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-at-31 align-left',p[1]);
      appendBookText(page,'book-at-58 align-left',p[2]);
      appendBookText(page,'book-bottom align-left',p[3]);
      break;
    case 14:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left',p[1]);
      break;
    case 15:
      lines=nonBlankLines(p[2]);
      appendBookText(page,'book-top align-left dense',[p[0],p[1],lines[0]].join('\n\n'));
      appendBookText(page,'book-bottom align-left',lines[1]);
      break;
    case 16:
      appendBookText(page,'book-at-37 align-left',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 17:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left',p[1]);
      break;
    case 18:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 19:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-middle align-left compact',p[1]);
      appendBookText(page,'book-bottom align-left compact',p[2]);
      break;
    case 20:
      appendBookText(page,'book-top align-right',p[0]);
      appendBookText(page,'book-at-40 align-right compact',p[1]);
      lines=nonBlankLines(p[2]);
      appendBookText(page,'book-at-67 align-right compact',lines.slice(0,2).join('\n'));
      appendBookText(page,'book-bottom align-right',lines[2]);
      break;
    case 21:
      appendBookText(page,'book-middle align-left',p[0]);
      lines=nonBlankLines(p[1]);
      appendBookText(page,'book-at-72 align-left one-line',lines[0]);
      appendBookText(page,'book-bottom align-left dense',lines.slice(1).join('\n'));
      break;
    case 22:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-center',p[1]);
      break;
    case 23:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-middle align-left',p[1]);
      appendBookText(page,'book-bottom align-center',p[2]);
      break;
    case 24:
      appendBookText(page,'book-middle align-center',p[0]);
      appendBookText(page,'book-at-72 align-center',p[1]);
      break;
    case 25:
      appendBookText(page,'book-top align-center',p[0]);
      lines=nonBlankLines(p[1]);
      appendBookText(page,'book-at-68 align-left',lines[0]);
      appendBookText(page,'book-bottom align-left',lines[1]);
      break;
    case 26:
      appendBookText(page,'book-top align-right compact',p[0]);
      lines=nonBlankLines(p[1]);
      appendBookText(page,'book-at-66 align-left compact',lines.slice(0,2).join('\n'));
      appendBookText(page,'book-bottom align-left',lines[2]);
      break;
    case 27:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-middle align-center',p[1]);
      appendBookText(page,'book-bottom align-center',p[2]);
      break;
    case 28:
      appendBookText(page,'book-at-66 align-center compact',p[0]);
      break;
    default:
      appendBookText(page,'book-bottom align-left dense',SCENES[n]);
  }
}

function makeBookSceneV2(n){
  const page=document.createElement('section');
  page.className=`book-page book-layout-page scene-${n}`;
  page.dataset.scene=String(n);
  page.appendChild(makeImage(n));
  appendBookSceneLayout(n,page);
  return page;
}

buildBook=function(){
  const wrap=document.getElementById('book-view');
  wrap.textContent='';
  bookPages=[];

  const cover=document.createElement('section');
  cover.className='spread';
  const blank=document.createElement('div');
  blank.className='book-page blank';
  const right=document.createElement('div');
  right.className='book-page book-cover';
  right.appendChild(makeImage(0));
  right.appendChild(document.createElement('div')).className='cover-grad';
  right.appendChild(coverTitle());
  right.appendChild(makeToggle('웹뷰로 보기'));
  cover.append(blank,right);
  wrap.appendChild(cover);
  bookPages.push(cover);

  for(let n=1;n<=28;n+=2){
    const spread=document.createElement('section');
    spread.className='spread';
    spread.append(makeBookSceneV2(n),makeBookSceneV2(n+1));
    wrap.appendChild(spread);
    bookPages.push(spread);
  }

  const end=document.createElement('section');
  end.className='spread';
  const e1=document.createElement('div');
  e1.className='book-page blank';
  const e2=document.createElement('div');
  e2.className='book-page end-page';
  e2.innerHTML='<p>✦<br><br>마침</p>';
  end.append(e1,e2);
  wrap.appendChild(end);
  bookPages.push(end);
};

if(document.getElementById('book-view').children.length){
  buildBook();
  if(typeof queueTextFit==='function')queueTextFit();
}
