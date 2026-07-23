(function(){
  'use strict';

  function makeBlock(className,text){
    const block=document.createElement('div');
    block.className=className;
    block.dataset.fitText='true';
    const p=document.createElement('p');
    p.textContent=text;
    block.appendChild(p);
    return block;
  }

  function cleanScene(page){
    const image=page.querySelector('.wt-image');
    if(!image)return null;
    image.querySelectorAll('.wt-overlay,.wt-top-caption,.wt-cut-caption,.wt-panel-caption').forEach(el=>el.remove());
    page.querySelectorAll(':scope > .wt-gap,:scope > .wt-spacer,:scope > .layout-gap').forEach(el=>el.remove());
    return image;
  }

  function addBefore(page,image,text,classes=''){
    const block=makeBlock(`layout-gap layout-before ${classes}`.trim(),text);
    page.insertBefore(block,image);
    return block;
  }

  function addTop(image,text,classes=''){
    const block=makeBlock(`wt-top-caption ${classes}`.trim(),text);
    image.appendChild(block);
    return block;
  }

  function addBottom(image,text,classes=''){
    const block=makeBlock(`wt-overlay ${classes}`.trim(),text);
    image.appendChild(block);
    return block;
  }

  function addAfter(page,text,classes=''){
    const block=makeBlock(`layout-gap layout-after ${classes}`.trim(),text);
    page.appendChild(block);
    return block;
  }

  function replaceRenderedTerms(){
    const root=document.querySelector('body');
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      node.nodeValue=node.nodeValue
        .replaceAll('기사는','장군은')
        .replaceAll('기사가','장군이')
        .replaceAll('기사를','장군을')
        .replaceAll('기사와','장군과')
        .replaceAll('기사','장군');
    });
  }

  function fitOneLine(){
    document.querySelectorAll('.layout-one-line p').forEach(p=>{
      p.style.removeProperty('font-size');
      let size=parseFloat(getComputedStyle(p).fontSize)||16;
      for(let i=0;i<14&&p.scrollWidth>p.clientWidth;i++){
        size*=.94;
        p.style.fontSize=`${size}px`;
      }
    });
  }

  function applyLayouts(){
    const required=[20,21,23,24,25,26,27,28].map(n=>document.querySelector(`.scene-${n}`));
    if(required.some(page=>!page))return false;

    let page,image;

    page=document.querySelector('.scene-20');
    image=cleanScene(page);
    addTop(image,'별빛이 마지막으로 깜빡이던 밤이었습니다.','layout-right layout-one-line');
    addBottom(image,'하늘 저편에서, 다가오는 무언가가 보였습니다.\n별똥별이라기엔 너무 천천히. 하지만 똑바로.','layout-right');
    addAfter(page,'신비하게 반짝이며 다가온 그 사람은,\n가슴께가 오래된 화로처럼\n은은하게 빛나고 있었습니다.\n이야기였습니다.');

    page=document.querySelector('.scene-21');
    image=cleanScene(page);
    addTop(image,'작은 별은 마지막 힘으로\n그 사람을 비추었습니다.\n"당신은… 누구인가요?"','layout-left');
    addBottom(image,'"저는, 이야기가 아주 많은 곳에서 왔습니다."','layout-left layout-one-line');
    addAfter(page,'그곳에는 이야기가 넘쳐서, 미처 태어나지 못한 이야기들이\n사람들 가슴속에 가득 쌓여 있어요.\n저도 그중 하나를 품고 왔습니다.');

    page=document.querySelector('.scene-23');
    image=cleanScene(page);
    addTop(image,'사람은 잠시 눈을 감았습니다.\n그리고, 이야기를 시작했습니다.');
    addBottom(image,'작은 별은 그\n이야기를 들었습니다.\n한 마디, 한 마디.');
    addAfter(page,'그리고.','layout-center layout-scene23');

    page=document.querySelector('.scene-24');
    image=cleanScene(page);
    const scene24=document.createElement('div');
    scene24.className='layout-gap layout-after layout-scene24';
    const lead=makeBlock('layout-scene24-line','별이, 타올랐습니다.');
    const line=makeBlock('layout-scene24-line layout-one-line','꺼져가던 작은 별이, 누리의 밤하늘 전체를 밝힐 만큼 크게.');
    scene24.append(lead,line);
    page.appendChild(scene24);

    page=document.querySelector('.scene-25');
    image=cleanScene(page);
    addBefore(page,image,'그 빛 속에서, 아주 오랜만에 —\n무언가 태어나기 시작했습니다.','layout-center layout-scene25-before');
    addBottom(image,'빛이 실이 되고\n실이 날개가 되었습니다.');
    addAfter(page,'날개가, 숨을 쉬기 시작했습니다.','layout-center layout-scene25-after');

    page=document.querySelector('.scene-26');
    image=cleanScene(page);
    addTop(image,'갓 태어난 날개가 날아올랐습니다.\n잠든 별들로 가득한 하늘을 가로질렀습니다.','layout-right');
    addBottom(image,'날갯짓이 스칠 때마다,\n별들이 하나둘 눈을 떴습니다.','layout-left');
    addAfter(page,'밤하늘이 다시\n반짝이기 시작했습니다.');

    page=document.querySelector('.scene-27');
    image=cleanScene(page);
    addBefore(page,image,'별들이 다시 빛나게 되자\n언덕에는 발걸음이 돌아왔습니다.','layout-scene27-before');
    addBottom(image,'그리고 별들은 다시,\n조금씩 낮아졌습니다.','layout-center');
    addAfter(page,'손을 뻗으면 닿을 것처럼.\n지붕 위에 앉으면 숨소리가 들릴 것처럼.','layout-center layout-scene27-after');

    page=document.querySelector('.scene-28');
    image=cleanScene(page);
    addBottom(image,'아주 높은 하늘 어딘가에서,\n빛으로 태어난 것이 고요히 날개를 펼치고\n누리의 밤을 바라보고 있었습니다.','layout-center');
    addAfter(page,'마침','layout-center layout-final');

    replaceRenderedTerms();
    if(typeof queueTextFit==='function')queueTextFit();
    requestAnimationFrame(fitOneLine);
    return true;
  }

  function start(){
    replaceRenderedTerms();
    if(applyLayouts())return;
    const observer=new MutationObserver(()=>{
      if(applyLayouts())observer.disconnect();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }

  window.addEventListener('resize',()=>requestAnimationFrame(fitOneLine),{passive:true});
  start();
})();
