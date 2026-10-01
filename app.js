'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let lang='es';try{lang=localStorage.getItem('bc-language')==='en'?'en':'es'}catch{}
const t=(es,en)=>lang==='es'?es:en;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let settings={...(window.BC_CONFIG||{})},step=0,requestId=crypto.randomUUID(),sending=false,galleryIndex=0,motionPaused=reduce;
const statusNames={received:['Recibida','Received'],confirmed:['Confirmada','Confirmed'],in_progress:['En proceso','In progress'],ready:['Lista para recoger','Ready for collection'],completed:['Completada','Completed'],cancelled:['Cancelada','Cancelled']};
const serviceNames={'Detailing Premium':['Detailing Premium','Premium Detailing'],'Mecánica Avanzada':['Mecánica avanzada','Advanced mechanics'],'Restauración de Faros':['Restauración de faros','Headlight restoration'],'Suspensión y Llantas':['Suspensión y llantas','Suspension & wheels']};
const serviceLabel=s=>serviceNames[s]?.[lang==='es'?0:1]||s;
const statusLabel=s=>statusNames[s]?.[lang==='es'?0:1]||s;
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function button(text,fn,cls='text-link'){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function closeAll(){document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
function openDialog(id){closeAll();$(id).showModal()}
function translate(){document.documentElement.lang=lang;$$('[data-es]').forEach(el=>el.textContent=el.dataset[lang].replaceAll('\\n','\n'));$('#language').textContent=lang==='es'?'🇬🇧 EN':'🇪🇸 ES';$('#language').setAttribute('aria-label',t('Switch to English','Cambiar a español'));$('#comparison').setAttribute('aria-label',t('Comparar antes y después','Compare before and after'));$('#menu').setAttribute('aria-label',t('Abrir menú','Open menu'));$$('[data-close],#close-dialog').forEach(b=>b.setAttribute('aria-label',t('Cerrar','Close')));$('#motion-toggle').setAttribute('aria-label',motionPaused?t('Reanudar movimiento','Resume motion'):t('Pausar movimiento','Pause motion'));$('#back-top').setAttribute('aria-label',t('Volver arriba','Back to top'));$('#gallery-prev').setAttribute('aria-label',t('Anterior','Previous'));$('#gallery-next').setAttribute('aria-label',t('Siguiente','Next'));updateFinder();applySettings();if(step===3)renderSummary();}
$('#language').onclick=()=>{lang=lang==='es'?'en':'es';translate();try{localStorage.setItem('bc-language',lang)}catch{}};
$('#year').textContent=new Date().getFullYear();
const loaderTemplate=$('#preloader').cloneNode(true);let loaderRun=0;
document.body.classList.toggle('is-loading',!reduce);
function runHeroIntro(){
  if(reduce||motionPaused||!window.gsap)return;
  const hero=$('.hero');if(!hero)return;
  const title=$$('.hero h1>span,.hero h1>em'),support=$$('.hero .eyebrow,.hero-copy,.hero-buttons,.film-button,.motion-toggle'),chrome=$$('.hero-project,.hero-index,.hero-bottom');
  gsap.killTweensOf([...title,...support,...chrome,$('.hero-image')]);
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.fromTo('.hero-image',{scale:1.065},{scale:1,duration:1.6,ease:'power2.out'},0)
    .fromTo(title,{y:70,opacity:0,rotationX:-28},{y:0,opacity:1,rotationX:0,duration:.92,stagger:.11},.08)
    .fromTo(support,{y:22,opacity:0},{y:0,opacity:1,duration:.65,stagger:.07},.48)
    .fromTo(chrome,{opacity:0,y:18},{opacity:1,y:0,duration:.72,stagger:.08},.62);
}
function finishLoader(run){
  if(run!==loaderRun)return;
  const loader=$('#preloader');if(!loader||loader.dataset.finished==='1')return;
  loader.dataset.finished='1';loader.dataset.stage='3';loader.style.setProperty('--loaded','1');
  const value=loader.querySelector('#rpm');if(value)value.textContent='100';
  const state=loader.querySelector('#loader-state');if(state)state.textContent=t('LISTO','READY');
  document.body.classList.remove('is-loading');
  loader.classList.add('is-ready');
  setTimeout(()=>{if(run!==loaderRun)return;loader.remove();runHeroIntro()},reduce?0:680);
}
function ignition(replay=false){
  const run=++loaderRun;
  if(replay){$('#preloader')?.remove();document.body.prepend(loaderTemplate.cloneNode(true))}
  const loader=$('#preloader');if(!loader){runHeroIntro();return}
  loader.dataset.finished='0';loader.dataset.stage='0';loader.style.setProperty('--loaded','0');
  document.body.classList.toggle('is-loading',!reduce);
  loader.querySelectorAll('[data-es]').forEach(e=>e.textContent=e.dataset[lang]);
  const skip=loader.querySelector('#skip-loader');if(skip)skip.onclick=()=>finishLoader(run);
  if(reduce){finishLoader(run);return}
  const resources=['work/logo.webp','work/ibiza_limpio.webp','work/motor_limpio3.webp'];
  let complete=0,resourcesDone=false,shown=0,lastStage=-1;const started=performance.now();
  Promise.all(resources.map(src=>new Promise(resolve=>{const img=new Image();const done=()=>{complete++;resolve()};img.onload=done;img.onerror=done;img.src=src}))).then(()=>{resourcesDone=true});
  const hardStop=setTimeout(()=>finishLoader(run),3200);
  function frame(now){
    if(run!==loaderRun||!$('#preloader')){clearTimeout(hardStop);return}
    const elapsed=now-started;
    const resourcePart=(complete/resources.length)*.24;
    const timePart=Math.min(elapsed/1150,1)*.68;
    const target=resourcesDone&&elapsed>850?1:Math.min(.94,.04+resourcePart+timePart);
    shown+=(target-shown)*.105;if(target===1&&shown>.985)shown=1;
    loader.style.setProperty('--loaded',shown.toFixed(4));
    const value=loader.querySelector('#rpm');if(value)value.textContent=String(Math.min(100,Math.round(shown*100))).padStart(2,'0');
    const stage=shown<.34?0:shown<.7?1:shown<.96?2:3;
    if(stage!==lastStage){lastStage=stage;loader.dataset.stage=String(stage);const state=loader.querySelector('#loader-state');if(state)state.textContent=[t('INICIALIZANDO','INITIALIZING'),t('CARGANDO DETALLES','LOADING DETAILS'),t('CALIBRANDO','CALIBRATING'),t('LISTO','READY')][stage]}
    if(shown>=1){clearTimeout(hardStop);setTimeout(()=>finishLoader(run),120);return}
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
ignition();$('#replay-loader').onclick=()=>ignition(true);
$('#menu').onclick=()=>{const on=$('nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(on))};$$('nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}));
$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$('#close-dialog').onclick=()=>$('#dialog').close();
const video=$('#hero-video');let filmPlaying=false;
$('#film-toggle').onclick=()=>{filmPlaying=!filmPlaying;if(filmPlaying){if(!video.src)video.src='detailing.mp4';video.play().catch(()=>{filmPlaying=false;video.classList.remove('film-active');$('#film-toggle').setAttribute('aria-pressed','false');toast(t('La película no está disponible.','The film is unavailable.'))})}else video.pause();video.classList.toggle('film-active',filmPlaying);$('#film-toggle').setAttribute('aria-pressed',String(filmPlaying));$('#film-toggle').textContent=filmPlaying?t('VOLVER AL TALLER','BACK TO THE GARAGE'):t('REPRODUCIR FILM','PLAY FILM')};
if('IntersectionObserver'in window)new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&filmPlaying&&!motionPaused)video.play().catch(()=>{});else video.pause()})).observe(video);
$('#motion-toggle').onclick=()=>{motionPaused=!motionPaused;document.body.classList.toggle('motion-paused',motionPaused);if(motionPaused)video.pause();else if(video.src&&filmPlaying)video.play().catch(()=>{});$('#motion-toggle').textContent=motionPaused?'▷':'Ⅱ';$('#motion-toggle').setAttribute('aria-pressed',String(motionPaused));$('#motion-toggle').setAttribute('aria-label',motionPaused?t('Reanudar movimiento','Resume motion'):t('Pausar movimiento','Pause motion'));if(window.gsap){if(motionPaused){gsap.globalTimeline.pause();$$('.reveal,.process-track article,.manifesto h2,.hero h1>span,.hero h1>em,.hero-copy,.hero-buttons').forEach(e=>{e.style.opacity='1';e.style.transform='none'})}else gsap.globalTimeline.resume()}};
if('IntersectionObserver'in window){const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');if(window.gsap&&!reduce&&!motionPaused)gsap.fromTo(e.target,{opacity:0,y:35},{opacity:1,y:0,duration:.85,ease:'power3.out'});reveal.unobserve(e.target)}}),{threshold:.07});$$('.reveal').forEach(e=>reveal.observe(e))}
if(window.gsap&&!reduce){if(window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);$$('.manifesto-image img,.moto-banner>img').forEach(img=>gsap.to(img,{yPercent:-12,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));gsap.from('.process-track article',{y:40,opacity:0,stagger:.18,duration:.8,scrollTrigger:{trigger:'.process-track',start:'top 83%',once:true}});gsap.from('.manifesto h2',{x:45,opacity:0,duration:1,scrollTrigger:{trigger:'.manifesto h2',start:'top 85%',once:true}});gsap.to('.process-track article',{borderColor:'#ff303b',stagger:.2,scrollTrigger:{trigger:'.process-track',start:'top 70%',end:'bottom 40%',scrub:1}})}if(matchMedia('(pointer:fine)').matches)$$('.service,.plan-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(motionPaused)return;const r=card.getBoundingClientRect();gsap.to(card,{rotationX:-(e.clientY-r.top-r.height/2)/70,rotationY:(e.clientX-r.left-r.width/2)/70,transformPerspective:1000,duration:.4})});card.addEventListener('pointerleave',()=>gsap.to(card,{rotationX:0,rotationY:0,duration:.4}))})}
let scrollTick=false;addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#scroll-progress').style.width=(max?scrollY/max*100:0)+'%';$('header').classList.toggle('scrolled',scrollY>16);$('#back-top').classList.toggle('visible',scrollY>700);$$('nav a').forEach(a=>{const section=$(a.getAttribute('href'));a.classList.toggle('active',!!section&&section.getBoundingClientRect().top<180&&section.getBoundingClientRect().bottom>180)});scrollTick=false})},{passive:true});$('#back-top').onclick=()=>scrollTo({top:0,behavior:reduce?'instant':'smooth'});
$('#comparison').oninput=e=>$('.compare').style.setProperty('--split',e.target.value+'%');
function filter(bar,items){$$(bar+' button').forEach(b=>b.onclick=()=>{$$(bar+' button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});$$(items).forEach(item=>{item.hidden=b.dataset.filter!=='all'&&item.dataset.category!==b.dataset.filter;if(!item.hidden&&window.gsap&&!reduce)gsap.fromTo(item,{opacity:0,y:15},{opacity:1,y:0,duration:.4})});window.ScrollTrigger?.refresh()})}filter('#service-filter','.service');
function show(title,body,cta=false){$('#dialog-title').textContent=title;$('#dialog-body').textContent=body;$('#dialog-cta').hidden=!cta;$('#dialog').showModal()}
const descriptions={'Detailing Premium':['Evaluamos el acabado y adaptamos limpieza, corrección y protección al estado de la pintura. El presupuesto se acuerda tras valorar el vehículo.','We assess the finish and adapt cleaning, correction and protection to the paint condition. Pricing is agreed after inspection.'],'Mecánica Avanzada':['Diagnóstico y mantenimiento de coches y motos. Descríbenos síntomas, historial y uso del vehículo para preparar la valoración.','Diagnostics and servicing for cars and motorcycles. Describe symptoms, history and use to help us prepare the assessment.'],'Restauración de Faros':['Valoración de las ópticas, corrección de superficie y protección. Los daños internos o profundos pueden requerir otra solución.','Headlight assessment, surface correction and protection. Internal or deep damage may need a different solution.'],'Suspensión y Llantas':['Revisión del estado de suspensión y llantas. Cualquier modificación se valora según compatibilidad y requisitos del vehículo.','Assessment of suspension and wheel condition. Any modification is evaluated for compatibility and vehicle requirements.']};
let chosenService='Detailing Premium';$$('[data-service]').forEach(b=>b.onclick=()=>{chosenService=b.dataset.service;show(serviceLabel(chosenService),descriptions[chosenService][lang==='es'?0:1],true)});$('#dialog-cta').onclick=e=>{e.preventDefault();startBooking({service:chosenService})};
function recommendation(){const goal=$('#finder-goal').value;return {shine:['Detailing Premium','correction'],protect:['Detailing Premium','protection'],maintenance:['Mecánica Avanzada','custom'],lights:['Restauración de Faros','custom'],handling:['Suspensión y Llantas','custom']}[goal]}
function updateFinder(){const [service,pack]=recommendation();$('#finder-result').textContent=serviceLabel(service).toUpperCase();const daily=$('input[name="finder-use"]:checked').value==='daily';$('#finder-description').textContent=descriptions[service][lang==='es'?0:1]+' '+(daily?t('Pensado para el uso diario.','Tailored for everyday use.'):t('Cuéntanos cómo disfrutas de tus escapadas.','Tell us how you enjoy your weekend drives.'))}
$$('#selector input,#selector select').forEach(e=>e.addEventListener('change',updateFinder));$('#finder-book').onclick=()=>{const [service,pack]=recommendation();startBooking({service,package:pack,vehicleType:$('input[name="finder-vehicle"]:checked').value})};$$('[data-package]').forEach(b=>b.onclick=()=>startBooking({service:'Detailing Premium',package:b.dataset.package}));$('#moto-book').onclick=()=>startBooking({vehicleType:'moto'});$$('[data-book]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();startBooking()}));
let galleryFilter='all',galleryLimit=8,galleryMatches=[],lightboxZoom=false;
function searchKey(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function filterGallery(reset=true){if(reset)galleryLimit=8;const query=searchKey($('#gallery-search').value.trim());galleryMatches=$$('.gallery-item').filter(item=>(galleryFilter==='all'||item.dataset.category===galleryFilter)&&searchKey(item.dataset.titleEs+' '+item.dataset.titleEn).includes(query));$$('.gallery-item').forEach(item=>item.hidden=true);galleryMatches.slice(0,galleryLimit).forEach(item=>{item.hidden=false;const img=item.querySelector('img');if(img.dataset.full)img.src=img.dataset.full});$('#gallery-count').textContent=t('Mostrando ','Showing ')+Math.min(galleryLimit,galleryMatches.length)+' / '+galleryMatches.length+t(' fotografías',' photographs');$('#gallery-more').hidden=galleryLimit>=galleryMatches.length;window.ScrollTrigger?.refresh()}
$$('#gallery-filter button').forEach(b=>b.onclick=()=>{galleryFilter=b.dataset.filter;$$('#gallery-filter button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});filterGallery()});$('#gallery-search').oninput=()=>filterGallery();$('#gallery-more').onclick=()=>{galleryLimit+=8;filterGallery(false)};
function galleryItems(){return galleryMatches}
function renderGallery(){const a=galleryItems();if(!a.length)return;galleryIndex=(galleryIndex+a.length)%a.length;const item=a[galleryIndex];const title=item.dataset[lang==='es'?'titleEs':'titleEn'];$('#lightbox-image').src=item.dataset.image;$('#lightbox-image').alt=title;$('#lightbox-caption').textContent=title;$('#lightbox-counter').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+a.length;setZoom(false);const thumbs=$('#lightbox-thumbs');thumbs.replaceChildren();a.forEach((photo,i)=>{const b=button('',()=>{galleryIndex=i;renderGallery()},i===galleryIndex?'selected':'');b.setAttribute('aria-label',photo.dataset[lang==='es'?'titleEs':'titleEn']);b.setAttribute('aria-pressed',String(i===galleryIndex));const img=node('img');img.src=photo.dataset.image.replace('.webp','-thumb.webp');img.alt='';img.loading='lazy';b.append(img);thumbs.append(b)});thumbs.children[galleryIndex]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})}
function openPhoto(slug){const item=$$('.gallery-item').find(x=>x.dataset.slug===slug);if(!item)return;if(!galleryMatches.includes(item)){galleryFilter='all';$('#gallery-search').value='';$$('#gallery-filter button').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='all');b.setAttribute('aria-pressed',String(b.dataset.filter==='all'))});filterGallery()}galleryIndex=galleryMatches.indexOf(item);openDialog('#gallery-dialog');renderGallery()}
$$('.gallery-item').forEach(b=>b.onclick=()=>openPhoto(b.dataset.slug));$('#hero-photo').onclick=()=>openPhoto('ibiza_limpio');
$('#gallery-prev').onclick=()=>{galleryIndex--;renderGallery()};$('#gallery-next').onclick=()=>{galleryIndex++;renderGallery()};$('#gallery-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();$('#gallery-prev').click()}if(e.key==='ArrowRight'){e.preventDefault();$('#gallery-next').click()}});
function setZoom(value){lightboxZoom=value;$('.lightbox-viewport').classList.toggle('zoomed',value);$('#gallery-zoom').setAttribute('aria-pressed',String(value));$('#gallery-zoom').textContent=value?t('Reducir','Zoom out'):t('Ampliar','Zoom in')}
$('#gallery-zoom').onclick=()=>setZoom(!lightboxZoom);$('#lightbox-image').ondblclick=()=>setZoom(!lightboxZoom);let touchStart=0;$('#lightbox-image').addEventListener('touchstart',e=>touchStart=e.touches[0].clientX,{passive:true});$('#lightbox-image').addEventListener('touchend',e=>{if(lightboxZoom)return;const delta=e.changedTouches[0].clientX-touchStart;if(Math.abs(delta)>60){galleryIndex+=delta<0?1:-1;renderGallery()}},{passive:true});
async function shareLink(key,value,title){const url=new URL(location.href);url.search='';url.searchParams.set(key,value);url.hash=key==='photo'?'galeria':'resultados';try{if(navigator.share)await navigator.share({title,url:url.href});else if(navigator.clipboard){await navigator.clipboard.writeText(url.href);toast(t('Enlace copiado','Link copied'))}else{show(t('ENLACE AL TRABAJO','LINK TO THE WORK'),url.href)}}catch(e){if(e.name!=='AbortError')show(t('ENLACE AL TRABAJO','LINK TO THE WORK'),url.href)}}
$('#gallery-share').onclick=()=>{const item=galleryItems()[galleryIndex];if(item)shareLink('photo',item.dataset.slug,item.dataset.titleEs)};$('#gallery-book').onclick=()=>{const item=galleryItems()[galleryIndex];startBooking({service:item?.dataset.category==='wheels'?'Suspensión y Llantas':'Detailing Premium'});if(item&&!form.elements.message.value)form.elements.message.value=t('Me interesa un trabajo como: ','I am interested in a treatment like: ')+item.dataset[lang==='es'?'titleEs':'titleEn']};
const comparisonCases={engine:['motor_sucio','motor_limpio','Limpieza del vano motor','Engine bay cleaning'],interior:['interior_citroen_sucio','interior_citroen_limpio','Citroën · limpieza de interior','Citroën · interior cleaning'],door:['puertas_citroen_sucio','puertas_citroen_limpio','Citroën · panel de puerta','Citroën · door panel'],exterior:['exterior_sucio_ibiza_amarillo','exterior_limpio_ibiza_amarillo','SEAT Ibiza · acabado exterior','SEAT Ibiza · exterior finish']};let selectedCase='engine',compareFrame=0;
function setComparison(value){const v=Math.round(value);$('#comparison').value=v;$('.compare').style.setProperty('--split',v+'%');$('#compare-value').textContent=v+' / '+(100-v);$('#comparison').setAttribute('aria-valuetext',t(v+'% antes; '+(100-v)+'% después',v+'% before; '+(100-v)+'% after'))}
function stopComparison(){cancelAnimationFrame(compareFrame);compareFrame=0;$('#compare-animate').setAttribute('aria-pressed','false')}
function setCase(key){if(!comparisonCases[key])return;stopComparison();selectedCase=key;const item=comparisonCases[key];$('#compare-before').src='work/'+item[0]+'.webp';$('#compare-after').src='work/'+item[1]+'.webp';$('#compare-before').alt=item[lang==='es'?2:3]+t(' · antes',' · before');$('#compare-after').alt=item[lang==='es'?2:3]+t(' · después',' · after');$('#case-caption').textContent=item[lang==='es'?2:3];$('#case-number').textContent=String(Object.keys(comparisonCases).indexOf(key)+1).padStart(2,'0');$$('[data-case]').forEach(b=>{b.classList.toggle('active',b.dataset.case===key);b.setAttribute('aria-pressed',String(b.dataset.case===key))});setComparison(50)}
$$('[data-case]').forEach(b=>b.onclick=()=>setCase(b.dataset.case));$('#comparison').oninput=e=>{stopComparison();setComparison(Number(e.target.value))};$('#compare-animate').onclick=()=>{if(compareFrame){stopComparison();return}if(reduce||motionPaused){setComparison(Number($('#comparison').value)===0?100:0);return}const start=performance.now();$('#compare-animate').setAttribute('aria-pressed','true');function tick(now){const p=Math.min((now-start)/2400,1);setComparison(50+48*Math.sin(p*Math.PI*2));if(p<1)compareFrame=requestAnimationFrame(tick);else stopComparison()}compareFrame=requestAnimationFrame(tick)};$('#compare-share').onclick=()=>shareLink('case',selectedCase,$('#case-caption').textContent);
const wheelStages=[['llantas_malas','EL PUNTO DE PARTIDA.','THE STARTING POINT.','El estado inicial, documentado antes de comenzar el trabajo.','The original condition, documented before work begins.'],['llantas_proceso','EL TRABAJO INVISIBLE.','THE WORK BEHIND THE FINISH.','La preparación forma parte del resultado. Cada fase cuenta.','Preparation is part of the result. Every stage matters.'],['llantas_pintadas2','NUEVO CARÁCTER.','A NEW CHARACTER.','El acabado blanco cambia por completo la presencia de las llantas.','The white finish gives these wheels a completely new presence.']];let wheelStage=0;
function setWheel(index){wheelStage=index;const item=wheelStages[index];$('#wheel-image').src='work/'+item[0]+'.webp';$('#wheel-image').alt=item[lang==='es'?1:2];$('#wheel-title').textContent=item[lang==='es'?1:2];$('#wheel-description').textContent=item[lang==='es'?3:4];$('#wheel-counter').textContent='0'+(index+1)+' / 03';$$('[data-stage]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.stage)===index);b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===index))});if(window.gsap&&!reduce&&!motionPaused)gsap.fromTo('#wheel-image',{opacity:.4,scale:1.025},{opacity:1,scale:1,duration:.5})}
$$('[data-stage]').forEach(b=>b.onclick=()=>setWheel(Number(b.dataset.stage)));$('#wheel-book').onclick=()=>startBooking({service:'Suspensión y Llantas'});

function validHttpUrl(value){
  if(!value)return '';
  try{const url=new URL(value);return url.protocol==='https:'?url.href:''}catch{return ''}
}
function normalizedPhone(value){return String(value||'').replace(/\D/g,'').replace(/^00/,'')}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||''))?String(value).trim():''}
function privacy(){
  const channel=settings.whatsapp?t('WhatsApp','WhatsApp'):settings.email?t('correo electrónico','email'):t('copia local','local copy');
  const extra=settings.privacyContact?' '+t('Contacto de privacidad: ','Privacy contact: ')+settings.privacyContact:'';
  show(t('TUS DATOS, CON CUIDADO.','YOUR DATA, HANDLED WITH CARE.'),t('Este sitio está alojado en GitHub Pages y no guarda tu solicitud en una base de datos. Los datos del formulario se procesan en tu navegador y, al enviar, se preparan para ','This site is hosted on GitHub Pages and does not store your request in a database. Form data is processed in your browser and, on submit, is prepared for ')+channel+'. '+t('Tu idioma sí se guarda localmente en este navegador.','Your language preference is stored locally in this browser.')+extra)
}
$('#privacy').onclick=privacy;$('#booking-privacy').onclick=privacy;
function applySettings(){
  const address=String(settings.address||'').trim();
  $('#workshop-address').textContent=address||'Vecindario · Santa Lucía de Tirajana · Gran Canaria';
  $('#workshop-hours').textContent=String(settings.hours||'').trim();
  const socials=$('#official-socials');socials.replaceChildren();
  for(const key of ['instagram','tiktok']){
    const href=validHttpUrl(settings[key]);
    if(href){const a=node('a',key==='instagram'?'Instagram':'TikTok');a.href=href;a.target='_blank';a.rel='noopener noreferrer';socials.append(a)}
  }
  const phone=normalizedPhone(settings.whatsapp);
  $('#floating-label').textContent=phone?'WhatsApp':t('Pedir cita','Request a visit');
  $('#whatsapp').setAttribute('aria-label',phone?t('Contactar por WhatsApp','Contact via WhatsApp'):t('Solicitar cita','Request an appointment'));
}
$('#whatsapp').onclick=()=>{
  const phone=normalizedPhone(settings.whatsapp);
  if(phone)window.open('https://wa.me/'+phone,'_blank','noopener,noreferrer');
  else startBooking();
};
$('#map-toggle').onclick=()=>{
  const c=$('#map-container');if(c.firstChild){c.replaceChildren();return}
  const address=String(settings.address||'Vecindario Gran Canaria').trim();
  const f=document.createElement('iframe');f.title=t('Ubicación del taller','Workshop location');f.src='https://www.google.com/maps?q='+encodeURIComponent(address)+'&output=embed';f.loading='lazy';f.referrerPolicy='no-referrer';c.append(f)
};
const form=$('#booking-form');form.noValidate=true;
function canaryDate(offsetDays=0){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const p=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
  const d=new Date(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day)+offsetDays,12));
  return d.toISOString().slice(0,10)
}
const dateInput=form.elements.preferredDate;dateInput.min=canaryDate(0);dateInput.max=canaryDate(179);
function setStep(n){step=n;$$('[data-step]').forEach(e=>e.hidden=Number(e.dataset.step)!==n);$$('.booking-steps span').forEach((e,i)=>{e.classList.toggle('active',i===n);e.classList.toggle('complete',i<n)});$('#booking-back').hidden=n===0;$('#booking-next').hidden=n===3;$('#booking-submit').hidden=n!==3;$('#booking-status').textContent='';if(n===3)renderSummary();$('#booking-dialog').scrollTop=0;const first=$(`[data-step="${n}"] input,[data-step="${n}"] select`);first?.focus({preventScroll:true})}
function currentValid(n){for(const e of $$(`[data-step="${n}"] input,[data-step="${n}"] select,[data-step="${n}"] textarea`)){if(!e.checkValidity()){e.reportValidity();return false}}return true}
function collect(){const d=Object.fromEntries(new FormData(form));return {...d,id:requestId,consent:form.elements.consent.checked,package:form.elements.service.value==='Detailing Premium'?d.package:'custom'}}
function renderSummary(){const d=collect(),box=$('#booking-summary');box.replaceChildren();const entries=[[t('Tratamiento','Treatment'),serviceLabel(d.service)+' · '+d.package],[t('Vehículo','Vehicle'),d.vehicle],[t('Preferencia','Preference'),d.preferredDate+' · '+({morning:t('mañana','morning'),afternoon:t('tarde','afternoon'),flexible:t('flexible','flexible')}[d.timeSlot])],[t('Contacto','Contact'),d.name+' · '+d.phone],[t('Email','Email'),d.email],[t('Notas','Notes'),d.message||t('Sin notas','No notes')]];for(const [label,value]of entries){const div=node('div');div.append(node('small',label),node('strong',value));box.append(div)}}
function startBooking(options={}){if(sending)return;$('#booking-success').hidden=true;form.hidden=false;for(const [key,value]of Object.entries(options)){if(key==='vehicleType'){form.querySelector(`input[name="vehicleType"][value="${value==='moto'?'moto':'car'}"]`).checked=true}else if(form.elements[key])form.elements[key].value=value}$('#package-field').hidden=form.elements.service.value!=='Detailing Premium';setStep(0);openDialog('#booking-dialog')}
form.elements.service.onchange=()=>$('#package-field').hidden=form.elements.service.value!=='Detailing Premium';$('#booking-next').onclick=()=>{if(currentValid(step))setStep(step+1)};$('#booking-back').onclick=()=>setStep(step-1);
function requestText(d){
  const slot={morning:t('Mañana','Morning'),afternoon:t('Tarde','Afternoon'),flexible:t('Flexible','Flexible')}[d.timeSlot];
  return [
    'BcMotorsport — '+t('Solicitud de cita','Appointment request'),
    '',
    t('Servicio','Service')+': '+serviceLabel(d.service)+(d.service==='Detailing Premium'?' · '+d.package:''),
    t('Vehículo','Vehicle')+': '+(d.vehicleType==='moto'?t('Moto','Motorcycle'):t('Coche','Car'))+' · '+d.vehicle,
    t('Fecha preferida','Preferred date')+': '+d.preferredDate+' · '+slot,
    t('Nombre','Name')+': '+d.name,
    t('Teléfono','Phone')+': '+d.phone,
    'Email: '+d.email,
    t('Notas','Notes')+': '+(d.message||t('Sin notas','No notes')),
    '',
    t('Entiendo que esta solicitud necesita confirmación del taller.','I understand this request requires workshop confirmation.')
  ].join('\n')
}
function download(text,name,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function copyText(text){try{if(navigator.clipboard&&isSecureContext){await navigator.clipboard.writeText(text);return true}}catch{}return false}
form.onsubmit=async e=>{
  e.preventDefault();if(sending)return;if(step<3){$('#booking-next').click();return}
  for(let i=0;i<3;i++){setStep(i);if(!currentValid(i))return}setStep(3);
  const d=collect(),text=requestText(d),phone=normalizedPhone(settings.whatsapp),email=validEmail(settings.email);
  sending=true;$('#booking-submit').disabled=true;$('#booking-status').textContent=t('Preparando tu solicitud…','Preparing your request…');
  let result='local';
  try{
    if(phone){
      const url='https://wa.me/'+phone+'?text='+encodeURIComponent(text);const opened=window.open(url,'_blank','noopener,noreferrer');if(opened)result='whatsapp';else{await copyText(text);download(text,'BcMotorsport-solicitud.txt')}
    }else if(email){
      const subject=t('Solicitud de cita BcMotorsport','BcMotorsport appointment request');location.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);result='email'
    }else{
      const copied=await copyText(text);download(text,'BcMotorsport-solicitud.txt');result=copied?'copy':'download'
    }
    form.hidden=true;$('#booking-success').hidden=false;
    $('#booking-reference').textContent=result==='whatsapp'?t('WhatsApp abierto con el mensaje preparado.','WhatsApp opened with the prepared message.'):result==='email'?t('Se ha abierto tu aplicación de correo con el mensaje preparado.','Your email app was opened with the prepared message.'):t('No hay un contacto configurado todavía: hemos preparado una copia local de la solicitud.','No contact channel is configured yet: a local copy of the request has been prepared.');
    form.reset();requestId=crypto.randomUUID();
  }finally{sending=false;$('#booking-submit').disabled=false}
};

function setupMotionDetails(){
  const ticker=$('.ticker');
  if(ticker&&!ticker.querySelector('.ticker-track')){
    const originals=[...ticker.children].map(el=>el.cloneNode(true));
    const track=node('div',undefined,'ticker-track');
    for(let copy=0;copy<2;copy++){
      const set=node('div',undefined,'ticker-set');set.setAttribute('aria-hidden',copy?'true':'false');
      originals.forEach(el=>set.append(el.cloneNode(true)));track.append(set)
    }
    ticker.replaceChildren(track)
  }
  const entrance=$$('.plan-card,.process-track article,.gallery-item,.finder-panel,.wheel-stage');
  if(!reduce&&'IntersectionObserver'in window){
    entrance.forEach(el=>el.classList.add('motion-in'));
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-seen');io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -4%'});
    entrance.forEach(el=>io.observe(el));
  }else entrance.forEach(el=>el.classList.add('motion-seen'));
  if(matchMedia('(pointer:fine)').matches){
    $$('.service,.plan-card').forEach(card=>card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');card.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')}));
  }
}
setupMotionDetails();
translate();filterGallery();setCase('engine');setWheel(0);
const initialParams=new URLSearchParams(location.search);if(initialParams.has('case'))setCase(initialParams.get('case'));if(initialParams.has('photo'))setTimeout(()=>openPhoto(initialParams.get('photo')),900);
const baseTranslate=translate;$('#language').onclick=()=>{lang=lang==='es'?'en':'es';baseTranslate();filterGallery(false);setCase(selectedCase);setWheel(wheelStage);if($('#gallery-dialog').open)renderGallery();try{localStorage.setItem('bc-language',lang)}catch{}};
