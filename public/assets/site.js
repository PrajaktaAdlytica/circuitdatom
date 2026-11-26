(() => {
  const get = id => document.getElementById(id);
  const page = document.body.dataset.page;
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let motionPreference = false;
  try { motionPreference = localStorage.getItem('circuitdatum-motion') === 'off'; } catch {}
  let lenis, context, raf, galleryTrigger;
  const gallery=document.querySelector('.use-window');
  const gallerySection=gallery?.closest('.use-section');
  const galleryViewport=matchMedia('(min-width: 720px) and (min-height: 700px) and (pointer: fine)');
  const galleryDistance=()=>gallery.scrollWidth-gallery.clientWidth;
  const navHeight=()=>document.querySelector('.site-header').offsetHeight;

  function visualMotion(section) {
    const sequence=(root,steps)=>{
      const timeline=gsap.timeline({scrollTrigger:{
        trigger:root,start:'top 89%',end:'top 40%',scrub:.34
      }});
      for(const [selector,from,to,position] of steps){
        const elements=root.querySelectorAll(selector);
        if(elements.length)timeline.fromTo(elements,from,to,position);
      }
    };
    section.querySelectorAll('.inspection-visual').forEach(visual=>sequence(visual,[
      ['img',{scale:1.15},{scale:1,duration:1.4,ease:'power2.out'},0],
      ['.inspection-scan',{yPercent:-94,opacity:0},{yPercent:94,opacity:.9,duration:1.1,ease:'none'},0],
      ['.inspection-scan',{opacity:.9},{opacity:0,duration:.18},1.1],
      ['.inspection-reticle',{scale:.75,opacity:0},{scale:1,opacity:1,duration:.46},.39],
      ['.inspection-tag',{x:16,opacity:.38},{x:0,opacity:1,duration:.47},.72]
    ]));
    section.querySelectorAll('.workflow-map').forEach(map=>sequence(map,[
      ['.workflow-row',{x:15,opacity:.50},{x:0,opacity:1,duration:.40,stagger:.23},0],
      ['.workflow-node',{scale:.83},{scale:1,duration:.36,stagger:.23,ease:'back.out(1.5)'},.07],
      ['.workflow-row:not(:last-child)',{'--line-scale':0},{'--line-scale':1,duration:.28,stagger:.23},.16]
    ]));
    section.querySelectorAll('.example-panel').forEach(panel=>sequence(panel,[
      ['.example-queue > span',{x:-8,opacity:.45},{x:0,opacity:1,duration:.35,stagger:.10},0],
      ['.map-pads i',{y:8,opacity:.45},{y:0,opacity:1,duration:.29,stagger:.065},.15],
      ['.map-pads .hot',{outlineOffset:8},{outlineOffset:3,duration:.34},.59],
      ['.example-rule',{y:8,opacity:.45},{y:0,opacity:1,duration:.33},.72],
      ['.example-citation',{x:8,opacity:.45},{x:0,opacity:1,duration:.34},.81],
      ['.example-disposition',{y:9,opacity:.45},{y:0,opacity:1,duration:.38},1.02]
    ]));
    const targets='.paper-doc > :is(div,small), .pack-doc > :is(div,b), .revision-map > *, .map-pads i, .score-preview > b, .feedback > p';
    section.querySelectorAll('.artifact, .score-preview, .feedback').forEach(visual=>{
      if(visual.closest('.example-panel,.use-track'))return;
      sequence(visual,[[targets,{y:8,opacity:.55},{y:0,opacity:1,duration:.35,stagger:.12},0]]);
    });
  }

  function installGallery(section) {
    gsap.to(gallery,{
      scrollLeft:galleryDistance,ease:'none',invalidateOnRefresh:true,
      scrollTrigger:{
        trigger:section,pin:true,start:()=> 'top top+=' + navHeight(),
        end:()=>'+=' + Math.max(420,galleryDistance()),scrub:.38,
        onUpdate:self=>section.style.setProperty('--use-progress',self.progress),
        onRefresh:self=>{galleryTrigger=self;section.style.setProperty('--use-progress',self.progress)}
      }
    });
  }

  function showGalleryOffset(offset) {
    const distance=galleryDistance();
    const left=Math.max(0,Math.min(distance,offset));
    if(galleryTrigger&&distance>0){
      const {start,end}=galleryTrigger;
      window.cdScrollTo(start+(end-start)*left/distance,{offset:0});
    }else{
      gallery.scrollTo({left,behavior:window.cdMotionOff()?'instant':'smooth'});
    }
  }
  const validActions = new Set(['open-source','compare','export','reject','open','request-source','reset']);
  const modules = ['datasheet-intake','component-fit-review','qualification-pack','component-change-monitor'];
  window.cdTrack = (type, data = {}) => {
    let properties;
    if(type==='offer_view' && modules.includes(data.module)) properties={module:data.module,area:'product'};
    if(type==='demo_start') properties={entry:data.entry==='case'?'case':'demo'};
    if(type==='pilot_cta_click') properties={area:data.area==='home'?'home':data.area==='demo'?'demo':'site',...(modules.includes(page)?{module:page}:{})};
    if(type==='reviewer_interaction' && validActions.has(data.action)) properties={action:data.action};
    if(!properties)return;
    window.dispatchEvent(new CustomEvent('circuitdatum:analytics',{detail:{type,properties}}));
  };
  window.cdDownload=(name,data)=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');
    anchor.download=name;anchor.href=url;document.body.append(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  };
  if(modules.includes(page)) window.cdTrack('offer_view',{module:page});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-pilot-cta]'))window.cdTrack('pilot_cta_click',{area:page});
  });
  window.cdMotionOff=()=>motionPreference||systemMotion.matches;
  window.cdScrollTo=(target,options={})=>{
    const offset=options.offset ?? -getComputedStyle(document.documentElement).getPropertyValue('--nav').trim().replace('px','')-8;
    if(lenis){lenis.scrollTo(target,{offset,immediate:options.immediate||false});return;}
    if(typeof target==='number'){window.scrollTo(0,target+offset);return;}
    target.scrollIntoView({behavior:'instant'});
  };
  function runMotion() {
    const off=window.cdMotionOff();
    document.documentElement.dataset.motion=off?'off':'on';
    const toggle=get('motion-switch');
    toggle.setAttribute('aria-pressed',String(off));
    toggle.querySelector('[data-label]').textContent=off?'Motion reduced':'Reduce motion';
    if(raf)window.gsap?.ticker.remove(raf);
    lenis?.destroy();
    lenis=null;
    context?.revert();
    context=null;
    galleryTrigger=null;
    gallerySection?.classList.remove('is-scroll-gallery');
    gallerySection?.style.removeProperty('--use-progress');
    document.querySelectorAll('main > section, .footer').forEach(section=>{
      section.style.removeProperty('--chapter-progress');
      section.style.removeProperty('--chapter-drift');
    });
    if(!off&&window.gsap&&window.ScrollTrigger&&window.Lenis){
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({smoothWheel:true,autoRaf:false,duration:1.02,allowNestedScroll:true});
      lenis.on('scroll',ScrollTrigger.update);
      raf=time=>lenis?.raf(time*1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      if(gallery&&galleryViewport.matches)gallerySection.classList.add('is-scroll-gallery');
      context=gsap.context(()=>{
        const sections=[...document.querySelectorAll('main > section:not(.film), .footer')];
        for(const [chapterIndex,section] of sections.entries()){
          if(section===gallerySection&&section.classList.contains('is-scroll-gallery'))installGallery(section);
          visualMotion(section);
          const range={progress:0};
          gsap.to(range,{progress:1,ease:'none',onUpdate:()=>{
            section.style.setProperty('--chapter-progress',range.progress.toFixed(3));
            section.style.setProperty('--chapter-drift',((range.progress-.5)*22).toFixed(1)+'px');
          },scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:.32}});
          const targets=[...section.querySelectorAll([
            '.section-heading','.page-hero .split > div','.quiet-hero > h1',
            '[data-reveal]','.fact-strip > div','.offer','.workbench-head',
            '.queue','.case-main','.source-panel','.scope-card','.intake-form','.signin-form','.signin-link-card',
            '.faq details','.pricing-grid article','.doc-body article','.use-grid .use-card',
            '.footer-head','.footer-grid > div','.footer-base'
          ].join(','))].filter(node=>{
            const parent=node.parentElement?.closest('.section-heading,.offer,.scope-card,.case-main,.intake-form,.page-hero .split > div');
            return !parent||parent===section||!section.contains(parent);
          });
          for(const [index,node] of targets.entries()){
            const box=node.getBoundingClientRect();
            if(box.top<innerHeight*.86)continue;
            const direction=node.dataset.reveal||(['up','right','left','down'][(chapterIndex+index)%4]);
            const x=direction==='left'?-30:direction==='right'?30:0;
            const y=direction==='up'?28:direction==='down'?-24:0;
            gsap.fromTo(node,{x,y,opacity:.35},{
              x:0,y:0,opacity:1,duration:.62,delay:Math.min(index,3)*.028,ease:'power2.out',
              clearProps:'transform,opacity',scrollTrigger:{trigger:node,start:'top 94%',once:true}
            });
          }
        }
      });
      ScrollTrigger.refresh();
    }
    window.dispatchEvent(new Event('circuitdatum:motion'));
  }
  runMotion();
  systemMotion.addEventListener('change',runMotion);
  if(gallery)galleryViewport.addEventListener('change',runMotion);
  get('motion-switch').addEventListener('click',()=>{
    motionPreference=!motionPreference;
    try{localStorage.setItem('circuitdatum-motion',motionPreference?'off':'on')}catch{}
    runMotion();
  });
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});

  const nav=get('site-nav'), menu=get('menu-toggle');
  const closeMenu=()=>{nav.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')};
  menu.addEventListener('click',()=>{
    const next=!nav.classList.contains('menu-open');
    nav.classList.toggle('menu-open',next);menu.setAttribute('aria-expanded',String(next));
  });
  const dropdowns=[...nav.querySelectorAll('details')];
  dropdowns.forEach(node=>node.addEventListener('toggle',()=>{
    if(node.open)dropdowns.forEach(other=>{if(other!==node)other.open=false});
  }));
  document.addEventListener('click',e=>{
    if(!e.target.closest('.site-header')){dropdowns.forEach(node=>node.open=false);closeMenu()}
    const anchor=e.target.closest('a[href^="#"]');
    if(!anchor||anchor.id==='skip-intro')return;
    const target=get(anchor.getAttribute('href').slice(1));
    if(!target)return;
    e.preventDefault();
    closeMenu();
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    window.cdScrollTo(target);
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const opened=dropdowns.find(node=>node.open);
    if(opened){opened.open=false;opened.querySelector('summary').focus();}
    else if(nav.classList.contains('menu-open')){closeMenu();menu.focus();}
  });

  if(gallery){
    const cards=[...gallery.querySelectorAll('.use-card')];
    const stops=()=>[...new Set(cards.map(card=>Math.min(galleryDistance(),card.offsetLeft-cards[0].offsetLeft)))];
    function stepGallery(direction) {
      const offsets=stops();
      const left=galleryTrigger?
        Math.max(0,Math.min(1,(scrollY-galleryTrigger.start)/(galleryTrigger.end-galleryTrigger.start)))*galleryDistance():
        gallery.scrollLeft;
      const next=direction>0?offsets.find(offset=>offset>left+4):offsets.slice().reverse().find(offset=>offset<left-4);
      if(next!==undefined)showGalleryOffset(next);
    }
    document.querySelectorAll('[data-carousel]').forEach(button=>button.addEventListener('click',()=>{
      stepGallery(button.dataset.carousel==='next'?1:-1);
    }));
    gallery.addEventListener('keydown',event=>{
      if(event.target!==gallery||!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();
      stepGallery(event.key==='ArrowRight'?1:-1);
    });
    gallery.addEventListener('focusin',event=>{
      if(!galleryTrigger)return;
      const card=event.target.closest('.use-card');
      if(!card)return;
      const viewport=gallery.getBoundingClientRect();
      const item=card.getBoundingClientRect();
      if(item.left<viewport.left+8||item.right>viewport.right-8){
        showGalleryOffset(card.offsetLeft-cards[0].offsetLeft);
      }
    });
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        if(!window.cdMotionOff()&&window.gsap){
          const parts=entry.target.querySelectorAll('.map-pads i,.pack-doc>div,.revision-map > *');
          if(parts.length)context?.add(()=>gsap.fromTo(parts,{opacity:.55,y:9},{
            opacity:1,y:0,duration:.42,stagger:.055,clearProps:'transform,opacity'
          }));
        }
        observer.unobserve(entry.target);
      });
    },{root:gallery,threshold:.35});
    cards.forEach(card=>observer.observe(card));
  }

  const interest = new URLSearchParams(location.search).get('interest');
  document.querySelectorAll('[data-intake]').forEach(form=>{
    const field=form.elements.interest;
    if(interest&&[...field.options].some(o=>o.value===interest))field.value=interest;
    const status=form.querySelector('.form-result');
    let draft;
    form.querySelector('[data-prepare-draft]').addEventListener('click',()=>form.requestSubmit());
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const values=Object.fromEntries(new FormData(form));
      draft={type:form.dataset.intake,preview:true,createdAt:new Date().toISOString(),...values,
        waitlist:values.waitlist==='yes',followUp:values.followUp==='yes'};
      status.hidden=false;
      status.innerHTML='<strong>Draft ready.</strong> Your information has not been sent. <button type="button" class="small-button">Download draft</button>';
      status.querySelector('button').focus();
    });
    status.addEventListener('click',e=>{
      if(e.target.tagName==='BUTTON'&&draft)window.cdDownload('circuitdatum-inquiry-draft.json',draft);
    });
    form.addEventListener('input',()=>{status.hidden=true;draft=undefined;});
  });
  document.querySelector('[data-sign-in]')?.addEventListener('submit',event=>{
    event.preventDefault();
    event.currentTarget.querySelector('[role=status]').hidden=false;
  });
})();
