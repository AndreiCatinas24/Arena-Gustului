(()=>{
  'use strict';

  const board=document.getElementById('board');
  const status=document.getElementById('status');
  const newGame=document.getElementById('newgame');
  if(!board||!status)return;

  let gameIndex=0;
  let active=false;
  let completed=false;
  let visibleStartedAt=0;
  let visibleMs=0;
  let lastPieceCount=0;

  const cleanSource=()=>{
    try{
      const params=new URLSearchParams(location.search);
      return params.get('utm_source')||params.get('ref')||document.referrer||'direct';
    }catch(error){return 'direct';}
  };

  const durationBucket=seconds=>{
    if(seconds<60)return '<1 min';
    if(seconds<180)return '1-3 min';
    if(seconds<300)return '3-5 min';
    if(seconds<600)return '5-10 min';
    return '10+ min';
  };

  function track(name,data={}){
    const payload={...data};
    try{window.va?.('event',{name,data:payload});}catch(error){}
    try{window.gtag?.('event',name.toLowerCase().replace(/\s+/g,'_'),payload);}catch(error){}
  }

  function resumeClock(){
    if(active&&!document.hidden&&!visibleStartedAt)visibleStartedAt=Date.now();
  }

  function pauseClock(){
    if(active&&visibleStartedAt){
      visibleMs+=Math.max(0,Date.now()-visibleStartedAt);
      visibleStartedAt=0;
    }
  }

  function elapsedSeconds(){
    let total=visibleMs;
    if(active&&visibleStartedAt)total+=Math.max(0,Date.now()-visibleStartedAt);
    return Math.max(1,Math.round(total/1000));
  }

  function startSession(){
    if(active)return;
    gameIndex+=1;
    active=true;
    completed=false;
    visibleMs=0;
    visibleStartedAt=document.hidden?0:Date.now();
    track('Game Started',{
      game_number:gameIndex,
      source:cleanSource(),
      device:matchMedia('(max-width: 700px)').matches?'mobile':'desktop'
    });
  }

  function endSession(result,reason){
    if(!active)return;
    pauseClock();
    const seconds=elapsedSeconds();
    track(result==='completed'?'Game Completed':'Game Session End',{
      game_number:gameIndex,
      result,
      reason:reason||result,
      duration_seconds:seconds,
      duration_minutes:Number((seconds/60).toFixed(1)),
      duration_bucket:durationBucket(seconds),
      source:cleanSource()
    });
    active=false;
    completed=result==='completed';
    visibleMs=0;
    visibleStartedAt=0;
  }

  function inspectBoard(){
    const pieces=board.querySelectorAll('.piece').length;
    if(pieces>0&&lastPieceCount===0&&!active&&!completed)startSession();
    lastPieceCount=pieces;
  }

  function inspectStatus(){
    const text=(status.textContent||'').trim();
    if(!active)return;
    if(text==='Ai câștigat')endSession('completed','player_win');
    else if(text==='AI a câștigat')endSession('completed','ai_win');
  }

  const observer=new MutationObserver(()=>{
    inspectBoard();
    inspectStatus();
  });
  observer.observe(board,{childList:true,subtree:true});
  observer.observe(status,{childList:true,subtree:true,characterData:true});

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)pauseClock();
    else resumeClock();
  });

  newGame?.addEventListener('click',()=>{
    if(active)endSession('abandoned','new_game');
    completed=false;
    lastPieceCount=0;
    requestAnimationFrame(inspectBoard);
  });

  window.addEventListener('pagehide',()=>{
    if(active)endSession('abandoned','page_exit');
  });

  inspectBoard();
})();
