(()=>{
  'use strict';
  const overlay=document.getElementById('rulesSheetOverlay');
  const sheet=document.getElementById('rulesSheet');
  const closeBtn=document.getElementById('rulesClose');
  const playBtn=document.getElementById('rulesPlay');
  const fullBtn=document.getElementById('rulesFull');
  const launchers=[...document.querySelectorAll('[data-open-rules]')];
  const fullSection=document.getElementById('rulesFullSection');
  if(!overlay||!sheet||!closeBtn||!playBtn||!fullBtn)return;

  const storageKey='arenaGustuluiRulesIntroSeenV1';
  let lastFocus=null;

  function markSeen(){try{localStorage.setItem(storageKey,'1');}catch(error){}}
  function openRules({remember=true}={}){
    lastFocus=document.activeElement;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    if(remember)markSeen();
    setTimeout(()=>closeBtn.focus({preventScroll:true}),40);
  }
  function closeRules(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus({preventScroll:true});
  }
  function goToFullRules(){
    closeRules();
    if(!fullSection)return;
    setTimeout(()=>{
      fullSection.scrollIntoView({behavior:'smooth',block:'start'});
      fullSection.classList.remove('flash-rules');
      void fullSection.offsetWidth;
      fullSection.classList.add('flash-rules');
    },80);
  }

  launchers.forEach(button=>button.addEventListener('click',()=>openRules()));
  closeBtn.addEventListener('click',closeRules);
  playBtn.addEventListener('click',closeRules);
  fullBtn.addEventListener('click',goToFullRules);
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeRules();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&overlay.classList.contains('show'))closeRules();
  });

  let seen=false;
  try{seen=localStorage.getItem(storageKey)==='1';}catch(error){}
  if(!seen)setTimeout(()=>openRules({remember:true}),650);
})();

/* Analytics bootstrap. Loads Vercel Web Analytics plus Arena Gustului game-session events. */
(()=>{
  'use strict';
  window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};

  if(!document.querySelector('script[data-arena-vercel-analytics]')){
    const insights=document.createElement('script');
    insights.defer=true;
    insights.src='/_vercel/insights/script.js';
    insights.dataset.arenaVercelAnalytics='1';
    document.head.appendChild(insights);
  }

  if(!document.querySelector('script[data-arena-game-analytics]')){
    const tracker=document.createElement('script');
    tracker.defer=true;
    tracker.src='assets/game-analytics.js?v=20260822a';
    tracker.dataset.arenaGameAnalytics='1';
    document.body.appendChild(tracker);
  }
})();
