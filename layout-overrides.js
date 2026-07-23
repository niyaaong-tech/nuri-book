(function(){
  'use strict';

  function makeBlock(className,text,fit=true){
    const block=document.createElement('div');
    block.className=className;
    if(fit)block.dataset.fitText='true';
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

  function addCut(image,text,classes=''){
    const block=makeBlock(`wt-cut-caption ${classes}`.trim(),text,false);
    image.appendChild(block);
    return block;
  }

  function addPanel(image,text,classes=''){
    const block=makeBlock(`wt-panel-caption ${classes}`.trim(),text);
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
    const required=[10,11,12,13,14,15,16,17,20,21,23,24,25,26,27,28].map(n=>document.querySelector(`.scene-${n}`));
    if(required.some(page=>!page))return false;

    let page,image;

    page=document.querySelector('.scene-10');
    image=cleanScene(page);
    addTop(image,'처음에는 사소한 것들이 사라졌습니다.','right one-line');
    addCut(image,'우물가 세 번째 돌의 이름.','cut-1');
    addCut(image,'방앗간 골목의 오래된 노랫자락.','cut-2 dark');
    addCut(image,'어떤 모험 이야기의 마지막 장면.','cut-3');
    addAfter(page,'너무 작아서 사라진 줄도 몰랐습니다.');

    page=document.querySelector('.scene-11');
    image=cleanScene(page);
    addTop(image,'변화는 멈추지 않고 누리 곳곳으로 퍼져나갔습니다.','one-line');
    addBottom(image,'그리고 마침내, 사람들의 마음속까지 스며들었습니다.\n\n사람들은 차츰, 이야기를 잊어버리게 되었습니다.');
    addAfter(page,'어떤 이야기를 품고 있었는지.\n누구에게 들려주려 했는지.\n더 이상 떠오르지 않게 되었습니다.');

    page=document.querySelector('.scene-12');
    image=cleanScene(page);
    addBottom(image,'점점 더 많은 것들이 잊혀졌습니다.\n잊혀진 만큼 지워졌습니다.\n\n이름을 잃은 들판은\n봄을 불러오는 법을 잊었습니다.\n\n노래를 잊은 바다는\n성난 파도를 잠재우는 법을 잃었습니다.');
    addAfter(page,'이야기로 태어난 이웃들도\n어느새 하나둘 희미해져 갔습니다.');

    page=document.querySelector('.scene-13');
    image=cleanScene(page);
    addBottom(image,'별빛 장군은 마지막까지 마을 어귀를 지켰습니다.\n\n"내 이야기를 기억해 주는 이가 하나라도 있는 한,\n나는 사라지지 않아."');
    addAfter(page,'그렇게 말했지만···.\n\n기억하는 이들의 살창도\n하나둘 어두워지고 있었습니다.');

    page=document.querySelector('.scene-14');
    image=cleanScene(page);
    addTop(image,'어느 저녁, 아이 하나가 물었습니다.\n"할머니, 별한테 이야기를 들려주면 친구가 태어난다는 게 정말이에요?"');
    addBottom(image,'할머니는 오래 말이 없다가, 창밖을 보았습니다.\n"···글쎄다. 옛날에는 그랬다는데."');

    page=document.querySelector('.scene-15');
    image=cleanScene(page);
    addTop(image,'그리고 마침내.\n\n굶주림에 지친 별들이 잠들기 시작했습니다.\n\n동쪽 하늘의 큰 별이 제일 먼저 눈을 감았습니다.');
    addBottom(image,'별 하나가, 잠들었습니다.');

    page=document.querySelector('.scene-16');
    image=cleanScene(page);
    addPanel(image,'서쪽 하늘의 등불별이 눈을 감았습니다.\n별 둘이, 잠들었습니다.','upper');
    addPanel(image,'남쪽 바다의 뱃길별이 마지막 배 한 척을 배웅하고 눈을 감았습니다.\n별 셋이, 잠들었습니다.','lower');

    page=document.querySelector('.scene-17');
    image=cleanScene(page);
    addBefore(page,image,'하나, 또 하나.\n밤마다 하늘은 조용히 어두워졌습니다.');
    addBottom(image,'이제 남은 별은 하나.\n하늘 끝 가장 높은 곳의 작은 별이었습니다.');

    page=document.querySelector('.scene-20');
    image=cleanScene(page);
    addTop(image,'별빛이 안간힘으로 깜빡이던 밤이었습니다.','layout-right layout-one-line');
    addBottom(image,'하늘 저편에서, 다가오는 무언가가 보였습니다.\n별똥별이라기엔 너무 천천히. 하지만 똑바로.','layout-right');
    addAfter(page,'신비하게 반짝이며 다가온 그 사람은,\n가슴께가 오래된 화로처럼 은은하게 빛나고 있었습니다.\n이야기였습니다.');

    page=document.querySelector('.scene-21');
    image=cleanScene(page);
    addTop(image,'작은 별은 마지막 힘으로 그 사람을 비추었습니다.\n"당신은··· 누구인가요?"','layout-left');
    addBottom(image,'"저는, 이야기가 아주 많은 곳에서 왔습니다.','layout-left layout-one-line');
    addAfter(page,'그곳에는 이야기가 넘쳐서,\n미처 태어나지 못한 이야기들이 사람들 가슴속에 가득 쌓여 있어요.\n저도 그중 하나를 품고 왔습니다."');

    page=document.querySelector('.scene-23');
    image=cleanScene(page);
    addTop(image,'사람은 잠시 눈을 감았습니다.\n그리고, 이야기를 시작했습니다.');
    addBottom(image,'작은 별은 그 이야기를 들었습니다.\n한 마디, 한 마디.');
    addAfter(page,'그리고.','layout-center layout-scene23');

    page=document.querySelector('.scene-24');
    image=cleanScene(page);
    const scene24=document.createElement('div');
    scene24.className='layout-gap layout-after layout-scene24';
    const lead=makeBlock('layout-scene24-line','별이, 타올랐습니다.');
    const line=makeBlock('layout-scene24-line','꺼져가던 작은 별이,\n누리의 밤하늘 전체를 밝힐 만큼 크게.');
    scene24.append(lead,line);
    page.appendChild(scene24);

    page=document.querySelector('.scene-25');
    image=cleanScene(page);
    addBefore(page,image,'그 빛 속에서 아주 오랜만에\n무언가 태어나기 시작했습니다.','layout-center layout-scene25-before');
    addBottom(image,'빛이 실이 되고, 실이 날개가 되었습니다.');
    addAfter(page,'날개가 숨을 쉬기 시작했습니다.','layout-center layout-scene25-after');

    page=document.querySelector('.scene-26');
    image=cleanScene(page);
    addTop(image,'갓 태어난 날개가 날아올랐습니다.\n잠든 별들로 가득한 하늘을 가로질렀습니다.','layout-right');
    addBottom(image,'날갯짓이 스칠 때마다,\n별들이 하나둘 눈을 떴습니다.','layout-left');
    addAfter(page,'밤하늘이 다시 반짝이기 시작했습니다.');

    page=document.querySelector('.scene-27');
    image=cleanScene(page);
    addBefore(page,image,'별들이 다시 빛나게 되자\n언덕에는 발걸음이 돌아왔습니다.','layout-scene27-before');
    addBottom(image,'그리고 별들은 다시, 조금씩 낮아졌습니다.','layout-center');
    addAfter(page,'손을 뻗으면 닿을 것처럼.\n지붕 위에 앉으면 숨소리가 들릴 것처럼.','layout-center layout-scene27-after');

    page=document.querySelector('.scene-28');
    image=cleanScene(page);
    addBottom(image,'아주 높은 하늘 어딘가에서,\n빛으로 태어난 것이 고요히 날개를 펼치고\n누리의 밤을 바라보고 있었습니다.','layout-center');
    addAfter(page,'','layout-center layout-final');

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
