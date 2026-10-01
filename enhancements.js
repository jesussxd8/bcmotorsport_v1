'use strict';
(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const fine=matchMedia('(pointer:fine)').matches;
  const supportsIO='IntersectionObserver' in window;
  const gs=()=>window.gsap;
  const st=()=>window.ScrollTrigger;
  document.documentElement.classList.add('fx-enabled');

  // Ambient pointer position: one rAF for all visual spotlights.
  let pointerX=innerWidth*.65,pointerY=innerHeight*.32,pendingPointer=false;
  addEventListener('pointermove',e=>{
    pointerX=e.clientX;pointerY=e.clientY;
    if(pendingPointer)return;pendingPointer=true;
    requestAnimationFrame(()=>{
      document.documentElement.style.setProperty('--mx',pointerX+'px');
      document.documentElement.style.setProperty('--my',pointerY+'px');
      const hero=$('.hero');if(hero){const r=hero.getBoundingClientRect();hero.style.setProperty('--hero-x',((pointerX-r.left)/Math.max(r.width,1)*100).toFixed(1)+'%');hero.style.setProperty('--hero-y',((pointerY-r.top)/Math.max(r.height,1)*100).toFixed(1)+'%')}
      pendingPointer=false;
    });
  },{passive:true});

  // Custom cursor on precise pointing devices only.
  if(fine){
    const ring=document.createElement('i'),dot=document.createElement('i');ring.id='fx-cursor';dot.id='fx-cursor-dot';document.body.append(ring,dot);
    let rx=pointerX,ry=pointerY,dx=pointerX,dy=pointerY;
    const cursorFrame=()=>{rx+=(pointerX-rx)*.17;ry+=(pointerY-ry)*.17;dx+=(pointerX-dx)*.42;dy+=(pointerY-dy)*.42;ring.style.left=rx+'px';ring.style.top=ry+'px';dot.style.left=dx+'px';dot.style.top=dy+'px';requestAnimationFrame(cursorFrame)};cursorFrame();
    addEventListener('pointermove',()=>document.body.classList.add('fx-cursor-on'),{once:true,passive:true});
    addEventListener('pointerover',e=>{if(e.target.closest('a,button,input,select,textarea,summary,.compare'))document.body.classList.add('fx-cursor-hover')});
    addEventListener('pointerout',e=>{if(e.target.closest('a,button,input,select,textarea,summary,.compare'))document.body.classList.remove('fx-cursor-hover')});
  }

  // Section rail + section title/copy reveals.
  const sectionData=[['servicios','SERVICIOS'],['experiencia','ADN'],['selector','SELECTOR'],['planes','PLANES'],['proceso','PROCESO'],['resultados','RESULTADOS'],['proyecto-llantas','LLANTAS'],['galeria','GALERÍA'],['faq','FAQ'],['contacto','CONTACTO']];
  const rail=document.createElement('nav');rail.id='section-rail';rail.setAttribute('aria-label','Navegación por secciones');
  sectionData.forEach(([id,label],i)=>{if(!document.getElementById(id))return;const b=document.createElement('button');b.type='button';b.dataset.target=id;b.setAttribute('aria-label',label);b.innerHTML=`<span>${label}</span>`;b.onclick=()=>document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'});rail.append(b)});document.body.append(rail);

  const sections=$$('.section');
  sections.forEach(section=>{
    const heading=section.querySelector('h2');
    if(heading&&!heading.closest('.results')){
      // Wrap visual lines without changing translations or semantic content.
      heading.classList.add('fx-heading');
    }
    section.querySelectorAll(':scope > div > p:not(.eyebrow),.section-heading>p').forEach(p=>p.classList.add('fx-copy'));
  });
  const makeVisible=section=>section.classList.add('fx-section-visible');
  if(supportsIO){
    const sectionIO=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)makeVisible(entry.target)}),{threshold:.08,rootMargin:'0px 0px -8%'});sections.forEach(s=>sectionIO.observe(s));
    const activeIO=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;$$('#section-rail button').forEach(b=>b.classList.toggle('active',b.dataset.target===entry.target.id))}),{threshold:.1,rootMargin:'-42% 0px -48%'});sectionData.forEach(([id])=>{const el=document.getElementById(id);if(el)activeIO.observe(el)});
    const processIO=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){[...entry.target.children].forEach((el,i)=>setTimeout(()=>el.classList.add('fx-process-on'),i*150));processIO.unobserve(entry.target)}}),{threshold:.3});const pt=$('.process-track');if(pt)processIO.observe(pt);
  } else sections.forEach(makeVisible);

  // Quick action dock and command palette.
  const dock=document.createElement('div');dock.id='quick-dock';dock.innerHTML='<button type="button" data-command>MENÚ · ⌘K</button><a href="#galeria">TRABAJOS</a><button type="button" class="dock-primary" data-book-fx>CITA</button>';document.body.append(dock);
  const palette=document.createElement('div');palette.id='command-palette';palette.setAttribute('aria-hidden','true');palette.innerHTML=`<div class="command-box" role="dialog" aria-modal="true" aria-label="Navegación rápida"><div class="command-head"><strong>BCM / QUICK NAV</strong><span>ESC PARA CERRAR</span></div><input class="command-search" type="search" autocomplete="off" placeholder="Buscar sección o acción…" aria-label="Buscar sección o acción"><div class="command-list"></div></div>`;document.body.append(palette);
  const commands=[...sectionData.map(([id,label],i)=>({label,code:String(i+1).padStart(2,'0'),action:()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'})})),{label:'SOLICITAR CITA',code:'→',action:()=>document.querySelector('[data-book]')?.click()},{label:'VOLVER ARRIBA',code:'↑',action:()=>scrollTo({top:0,behavior:'smooth'})}];
  const search=palette.querySelector('.command-search'),list=palette.querySelector('.command-list');let active=0;
  function renderCommands(){const q=search.value.trim().toLowerCase();const found=commands.filter(c=>c.label.toLowerCase().includes(q));list.replaceChildren();if(!found.length){const e=document.createElement('div');e.className='command-empty';e.textContent='Sin resultados';list.append(e);return}found.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='command-item'+(i===active?' active':'');b.innerHTML=`<b>${c.code}</b><span>${c.label}</span><small>↵</small>`;b.onclick=()=>{closeCommand();c.action()};list.append(b)})}
  function openCommand(){palette.classList.add('open');palette.setAttribute('aria-hidden','false');active=0;search.value='';renderCommands();setTimeout(()=>search.focus(),20)}
  function closeCommand(){palette.classList.remove('open');palette.setAttribute('aria-hidden','true')}
  dock.querySelector('[data-command]').onclick=openCommand;dock.querySelector('[data-book-fx]').onclick=()=>document.querySelector('[data-book]')?.click();palette.addEventListener('pointerdown',e=>{if(e.target===palette)closeCommand()});search.addEventListener('input',()=>{active=0;renderCommands()});
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.classList.contains('open')?closeCommand():openCommand()}else if(e.key==='Escape'&&palette.classList.contains('open'))closeCommand();else if(palette.classList.contains('open')&&(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter')){const items=$$('.command-item');if(!items.length)return;e.preventDefault();if(e.key==='Enter'){items[active]?.click();return}active=(active+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((el,i)=>el.classList.toggle('active',i===active));items[active]?.scrollIntoView({block:'nearest'})}});

  // Ripple feedback for primary interactions.
  document.addEventListener('pointerdown',e=>{const el=e.target.closest('.button,.filter-bar button,.comparison-tabs button,.choice-row label span');if(!el)return;const r=el.getBoundingClientRect(),wave=document.createElement('i');wave.className='fx-ripple';wave.style.left=(e.clientX-r.left)+'px';wave.style.top=(e.clientY-r.top)+'px';el.style.position='relative';el.style.overflow='hidden';el.append(wave);setTimeout(()=>wave.remove(),700)},{passive:true});

  // Magnetic controls and 3D tilt on desktop. Both are bounded and reset cleanly.
  if(fine){
    $$('.button,.film-button,.hero-photo-button,.whatsapp').forEach(el=>{
      el.classList.add('fx-magnetic');let raf=0;
      el.addEventListener('pointermove',e=>{if(raf)return;raf=requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;el.style.transform=`translate3d(${(x*8).toFixed(2)}px,${(y*7).toFixed(2)}px,0)`;raf=0})});
      el.addEventListener('pointerleave',()=>{el.style.transform=''})
    });
    $$('.gallery-item').forEach(item=>item.addEventListener('pointermove',e=>{const r=item.getBoundingClientRect();item.style.setProperty('--gx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');item.style.setProperty('--gy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')}));
    const finder=$('.finder-panel');finder?.addEventListener('pointermove',e=>{const r=finder.getBoundingClientRect();finder.style.setProperty('--finder-x',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');finder.style.setProperty('--finder-y',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')});
  }

  // Finder result response animation.
  $$('#selector input,#selector select').forEach(el=>el.addEventListener('change',()=>{const r=$('.recommendation');if(!r)return;r.classList.remove('fx-pulse');void r.offsetWidth;r.classList.add('fx-pulse')}, {passive:true}));

  // Gallery filtering/load-more gets an explicit transition on visible results.
  const galleryArea=$('#galeria');if(galleryArea){let galleryRaf=0;const galleryObs=new MutationObserver(()=>{if(galleryRaf)return;galleryRaf=requestAnimationFrame(()=>{$$('.gallery-item:not([hidden])').forEach((el,i)=>{el.classList.remove('fx-gallery-enter');el.style.animationDelay=Math.min(i,8)*35+'ms';void el.offsetWidth;el.classList.add('fx-gallery-enter')});galleryRaf=0})});galleryObs.observe(galleryArea,{attributes:true,subtree:true,attributeFilter:['hidden']})}

  // Keep FAQ focused: opening one closes the others and scrolls it into comfortable view.
  $$('.faq-list details').forEach(detail=>detail.addEventListener('toggle',()=>{if(!detail.open)return;$$('.faq-list details').forEach(other=>{if(other!==detail)other.open=false});requestAnimationFrame(()=>detail.scrollIntoView({behavior:'smooth',block:'nearest'}))}));

  // Additional GSAP timeline layer. No critical functionality depends on it.
  if(gs()){
    if(st())gs().registerPlugin(st());
    const hero=$('.hero');
    if(hero&&st()){
      gs().to('.hero-image',{scale:1.12,yPercent:8,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.8}});
      gs().to('.hero-content',{yPercent:10,opacity:.3,ease:'none',scrollTrigger:{trigger:hero,start:'35% top',end:'bottom top',scrub:.7}});
      gs().to('.hero-project',{yPercent:-14,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1.2}});
      gs().to('.hero-index',{y:60,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
    }
    if(st()){
      $$('.section-heading h2,.results h2,.manifesto-copy h2,.treatment-finder h2,.faq-section h2,.contact h2').forEach((h,i)=>{
        if(h.dataset.fxGsap)return;h.dataset.fxGsap='1';gs().from(h,{opacity:0,y:46,skewY:2,duration:.9,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 88%',once:true}})
      });
      $$('.service-grid,.plans-grid,.gallery-grid').forEach(grid=>gs().from(grid.children,{opacity:0,y:34,scale:.985,duration:.75,stagger:.07,ease:'power3.out',scrollTrigger:{trigger:grid,start:'top 87%',once:true}}));
      $$('.manifesto-image,.wheel-stage,.compare').forEach(frame=>gs().from(frame,{clipPath:'inset(0 0 100% 0)',duration:1.15,ease:'power4.inOut',scrollTrigger:{trigger:frame,start:'top 84%',once:true}}));
      $$('.eyebrow.red').forEach(label=>gs().from(label,{x:-22,opacity:0,duration:.55,ease:'power2.out',scrollTrigger:{trigger:label,start:'top 91%',once:true}}));
    }
  }

  // Scroll velocity gives a tiny kinetic response to the page chrome, capped for comfort.
  let lastY=scrollY,lastT=performance.now(),scrollRaf=0;
  addEventListener('scroll',()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{const now=performance.now(),dy=scrollY-lastY,dt=Math.max(now-lastT,16),v=Math.max(-1,Math.min(1,dy/dt*.35));document.documentElement.style.setProperty('--scroll-velocity',v.toFixed(3));lastY=scrollY;lastT=now;scrollRaf=0})},{passive:true});

  // Refresh scroll measurements after images and fonts settle.
  Promise.allSettled([document.fonts?.ready||Promise.resolve(),new Promise(r=>addEventListener('load',r,{once:true}))]).then(()=>st()?.refresh());
})();
