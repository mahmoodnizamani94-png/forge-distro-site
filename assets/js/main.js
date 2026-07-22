document.addEventListener('DOMContentLoaded',()=>{
  const body=document.body;
  const header=document.querySelector('.site-header');
  const progress=document.querySelector('.scroll-progress');
  const backTop=document.querySelector('.back-to-top');
  let ticking=false;
  const onScroll=()=>{
    const y=window.scrollY||document.documentElement.scrollTop;
    header?.classList.toggle('scrolled',y>20);
    backTop?.classList.toggle('show',y>500);
    const max=document.documentElement.scrollHeight-window.innerHeight;
    if(progress) progress.style.transform=`scaleX(${max>0?y/max:0})`;
    ticking=false;
  };
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true;}},{passive:true});
  onScroll();
  backTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  const revealNodes=document.querySelectorAll('.section,.info-card,.overlay-card,.product-card,.faq-category,.video-card,.form-panel');
  revealNodes.forEach((node,index)=>{node.classList.add('reveal');node.style.transitionDelay=`${Math.min(index%3*55,110)}ms`;});
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.06,rootMargin:'0px 0px -25px'});
    revealNodes.forEach(node=>observer.observe(node));
  }else revealNodes.forEach(node=>node.classList.add('visible'));

  document.querySelectorAll('.desktop-dropdown').forEach(item=>{
    const toggle=item.querySelector('.dropdown-toggle');
    const open=()=>{item.classList.add('show');toggle?.setAttribute('aria-expanded','true');};
    const close=()=>{item.classList.remove('show');toggle?.setAttribute('aria-expanded','false');};
    item.addEventListener('mouseenter',open);
    item.addEventListener('mouseleave',close);
    item.addEventListener('focusin',open);
    item.addEventListener('focusout',event=>{if(!item.contains(event.relatedTarget))close();});
    toggle?.addEventListener('click',()=>item.classList.contains('show')?close():open());
  });

  const shell=document.getElementById('mobileNav');
  const trigger=document.querySelector('.mobile-nav-trigger');
  const closeButtons=shell?[...shell.querySelectorAll('.mobile-nav-close')]:[];
  const submenus=shell?[...shell.querySelectorAll('.mobile-submenu')]:[];
  const submenuButtons=shell?[...shell.querySelectorAll('[data-submenu]')]:[];
  const resetSubmenus=()=>submenus.forEach(menu=>{menu.classList.remove('open');menu.setAttribute('aria-hidden','true');});
  const openMenu=()=>{if(!shell)return;shell.classList.add('open');shell.setAttribute('aria-hidden','false');trigger?.setAttribute('aria-expanded','true');body.classList.add('menu-open');setTimeout(()=>shell.querySelector('.mobile-nav-close')?.focus(),400);};
  const closeMenu=()=>{if(!shell)return;shell.classList.remove('open');shell.setAttribute('aria-hidden','true');trigger?.setAttribute('aria-expanded','false');body.classList.remove('menu-open');resetSubmenus();};
  trigger?.addEventListener('click',openMenu);
  closeButtons.forEach(button=>button.addEventListener('click',closeMenu));
  submenuButtons.forEach(button=>button.addEventListener('click',()=>{
    const menu=document.getElementById(button.dataset.submenu);
    resetSubmenus();
    menu?.classList.add('open');menu?.setAttribute('aria-hidden','false');
    setTimeout(()=>menu?.querySelector('.submenu-back')?.focus(),400);
  }));
  shell?.querySelectorAll('.submenu-back').forEach(button=>button.addEventListener('click',()=>{
    const menu=button.closest('.mobile-submenu');
    menu?.classList.remove('open');menu?.setAttribute('aria-hidden','true');
  }));
  shell?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!shell?.classList.contains('open'))return;
    const active=shell.querySelector('.mobile-submenu.open');
    if(active){active.classList.remove('open');active.setAttribute('aria-hidden','true');}else closeMenu();
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>=1200)closeMenu();},{passive:true});

  const tabs=[...document.querySelectorAll('[data-catalog-tab]')];
  const panels=[...document.querySelectorAll('[data-catalog-panel]')];
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    const key=tab.dataset.catalogTab;
    tabs.forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',active?'true':'false');});
    panels.forEach(panel=>panel.classList.toggle('active',panel.dataset.catalogPanel===key));
  }));

  document.querySelectorAll('.site-form').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.checkValidity()){form.classList.add('was-validated');return;}
    const data=new FormData(form);
    const bodyText=[...data.entries()].map(([key,value])=>`${key.replaceAll('_',' ')}: ${value}`).join('\n');
    window.location.href=`mailto:robolawnus@gmail.com?subject=${encodeURIComponent(form.dataset.subject||'RoboLawn Website Inquiry')}&body=${encodeURIComponent(bodyText)}`;
  }));
});
