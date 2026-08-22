(()=>{
  'use strict';

  const PIECES={
    S:{name:'Covrig',blue:'assets/food/covrig-blue.webp',orange:'assets/food/covrig-orange.webp'},
    M:{name:'Corn',blue:'assets/food/corn-blue.webp',orange:'assets/food/corn-orange.webp'},
    L:{name:'Merdenea',blue:'assets/food/merdenea-blue.webp',orange:'assets/food/merdenea-orange.webp'}
  };

  const replacements=[
    [/Arena Strigoilor/g,'Arena Gustului'],
    [/Strigoi/g,'Merdenea'],
    [/Pricolici/g,'Corn'],
    [/Moroi/g,'Covrig'],
    [/Măștile/g,'Piesele'],
    [/măștile/g,'piesele'],
    [/măștii/g,'piesei'],
    [/măști/g,'piese'],
    [/mască/g,'piesă']
  ];

  function translate(value){
    if(!value)return value;
    return replacements.reduce((text,[pattern,next])=>text.replace(pattern,next),value);
  }

  function pieceMeta(img){
    const size=img.classList.contains('size-L')?'L':img.classList.contains('size-M')?'M':img.classList.contains('size-S')?'S':null;
    if(!size)return null;
    const color=img.classList.contains('team-o')?'orange':'blue';
    return{size,color,...PIECES[size]};
  }

  function applyPiece(piece){
    const img=piece.querySelector('.mask-art');
    if(!img)return;
    const meta=pieceMeta(img);
    if(!meta)return;

    const src=meta[meta.color];
    if(img.getAttribute('src')!==src)img.setAttribute('src',src);
    if(img.getAttribute('alt')!==meta.name)img.setAttribute('alt',meta.name);
    img.classList.add('food-art');

    piece.querySelector('.moroi-size-badge')?.remove();
    let badge=piece.querySelector('.food-size-badge');
    if(!badge){
      badge=document.createElement('span');
      badge.className='food-size-badge';
      badge.setAttribute('aria-hidden','true');
      piece.appendChild(badge);
    }
    badge.textContent=meta.size;
    badge.className=`food-size-badge team-${meta.color==='orange'?'o':'b'}`;

    const aria=piece.getAttribute('aria-label');
    if(aria){
      const next=translate(aria);
      if(next!==aria)piece.setAttribute('aria-label',next);
    }
  }

  function translateElement(root){
    if(root.nodeType!==1)return;

    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const textNodes=[];
    while(walker.nextNode())textNodes.push(walker.currentNode);
    for(const node of textNodes){
      const next=translate(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    }

    root.querySelectorAll?.('[aria-label]').forEach(node=>{
      const value=node.getAttribute('aria-label');
      const next=translate(value);
      if(next!==value)node.setAttribute('aria-label',next);
    });
  }

  function apply(root=document){
    root.querySelectorAll?.('.piece').forEach(applyPiece);
    translateElement(root===document?document.body:root);
    document.title='Arena Gustului';
  }

  apply();

  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList'){
        record.addedNodes.forEach(node=>{
          if(node.nodeType===1){
            if(node.matches?.('.piece'))applyPiece(node);
            node.querySelectorAll?.('.piece').forEach(applyPiece);
            translateElement(node);
          }else if(node.nodeType===3){
            const next=translate(node.nodeValue);
            if(next!==node.nodeValue)node.nodeValue=next;
          }
        });
      }
      if(record.type==='attributes'&&record.target.matches?.('.mask-art')){
        const piece=record.target.closest('.piece');
        if(piece)applyPiece(piece);
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','aria-label']});
})();
