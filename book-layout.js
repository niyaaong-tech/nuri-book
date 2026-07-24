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

function joinParagraphs(parts){
  return parts.filter(part=>String(part??'').trim()!=='').join('\n\n');
}

/*
 * 동화책뷰 배치 원칙
 * - 기본은 상단 1블록 + 하단 1블록이다.
 * - 같은 흐름의 문단은 한 블록으로 묶는다.
 * - 중앙 배치는 웹뷰에서도 중앙 배치가 필요한 장면에만 쓴다.
 * - 3블록은 실제 3단 장면인 장면 10에만 사용한다.
 */
function appendBookSceneLayout(n,page){
  const p=sceneParagraphs(n);
  let lines;

  switch(n){
    case 1:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left compact',joinParagraphs([p[2],p[3]]));
      break;
    case 2:
      appendBookText(page,'book-top align-left',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 3:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left compact',joinParagraphs([p[1],p[2]]));
      break;
    case 4:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 5:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left compact',p[2]);
      break;
    case 6:
    case 7:
      appendBookText(page,'book-bottom align-left',p[0]);
      break;
    case 8:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 9:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left',p[2]);
      break;
    case 10:
      lines=nonBlankLines(p[1]);
      appendBookText(page,'book-top align-right compact',joinParagraphs([p[0],lines[0]]));
      appendBookText(page,'book-middle align-right book-dark',lines[1]);
      appendBookText(page,'book-bottom align-left compact',joinParagraphs([lines[2],p[2]]));
      break;
    case 11:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left compact',p[2]);
      break;
    case 12:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left compact',joinParagraphs([p[2],p[3]]));
      break;
    case 13:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-left compact',joinParagraphs([p[2],p[3]]));
      break;
    case 14:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left',p[1]);
      break;
    case 15:
      lines=nonBlankLines(p[2]);
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1],lines[0]]));
      appendBookText(page,'book-bottom align-left',lines[1]);
      break;
    case 16:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 17:
      appendBookText(page,'book-top align-left',p[0]);
      appendBookText(page,'book-bottom align-left',p[1]);
      break;
    case 18:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 19:
      appendBookText(page,'book-top align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left dense',joinParagraphs([p[1],p[2]]));
      break;
    case 20:
      appendBookText(page,'book-top align-right compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-right compact',p[2]);
      break;
    case 21:
      appendBookText(page,'book-middle align-left compact',p[0]);
      appendBookText(page,'book-bottom align-left dense',p[1]);
      break;
    case 22:
      appendBookText(page,'book-bottom align-center',joinParagraphs([p[0],p[1]]));
      break;
    case 23:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-center',p[2]);
      break;
    case 24:
      appendBookText(page,'book-bottom align-center compact book-ink-glow',joinParagraphs([p[0],p[1]]));
      break;
    case 25:
      appendBookText(page,'book-top align-center compact',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 26:
      appendBookText(page,'book-top align-right compact',p[0]);
      appendBookText(page,'book-bottom align-left compact',p[1]);
      break;
    case 27:
      appendBookText(page,'book-top align-left compact',joinParagraphs([p[0],p[1]]));
      appendBookText(page,'book-bottom align-center compact',p[2]);
      break;
    case 28:
      appendBookText(page,'book-bottom align-center compact',p[0]);
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
