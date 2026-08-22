(()=>{
  'use strict';

  const SOURCES={
    S:'assets/food/covrig-blue.webp',
    M:'assets/food/corn-blue.webp',
    L:'assets/food/merdenea-blue.webp'
  };
  const generated={};

  function rgbToHsv(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
    let h=0;
    if(d){
      if(max===r)h=((g-b)/d)%6;
      else if(max===g)h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h*=60;
      if(h<0)h+=360;
    }
    return[h,max===0?0:d/max,max];
  }

  function hsvToRgb(h,s,v){
    const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
    let r=0,g=0,b=0;
    if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}
    else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
    return[Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];
  }

  function makeOrange(src){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        canvas.width=img.naturalWidth;
        canvas.height=img.naturalHeight;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(img,0,0);
        const frame=ctx.getImageData(0,0,canvas.width,canvas.height);
        const d=frame.data;
        for(let i=0;i<d.length;i+=4){
          if(d[i+3]===0)continue;
          const [h,s,v]=rgbToHsv(d[i],d[i+1],d[i+2]);
          const blueAura=(h>=175&&h<=250&&s>.23&&v>.20);
          if(!blueAura)continue;
          const [r,g,b]=hsvToRgb(28,Math.max(.72,s*.92),Math.min(1,v*1.02));
          d[i]=r; d[i+1]=g; d[i+2]=b;
        }
        ctx.putImageData(frame,0,0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror=reject;
      img.src=src;
    });
  }

  function sizeOf(img){
    return img.classList.contains('size-L')?'L':img.classList.contains('size-M')?'M':img.classList.contains('size-S')?'S':null;
  }

  function applyToImage(img){
    if(!img.classList.contains('team-o'))return;
    const size=sizeOf(img);
    if(!size||!generated[size])return;
    img.style.setProperty('content',`url("${generated[size]}")`,'important');
    img.dataset.runtimeAura='orange';
  }

  function applyAll(root=document){
    root.querySelectorAll?.('.mask-art.team-o').forEach(applyToImage);
    if(root.matches?.('.mask-art.team-o'))applyToImage(root);
  }

  Promise.all(Object.entries(SOURCES).map(async([size,src])=>{
    generated[size]=await makeOrange(src);
  })).then(()=>{
    applyAll();
    new MutationObserver(records=>{
      records.forEach(record=>record.addedNodes.forEach(node=>{
        if(node.nodeType===1)applyAll(node);
      }));
    }).observe(document.documentElement,{childList:true,subtree:true});
  }).catch(err=>console.error('Arena Gustului aura generation failed',err));
})();
