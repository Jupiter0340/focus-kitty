(() => {
  'use strict';
  const $ = id => document.getElementById(id), KEY = 'focus-kitty-v1';
  let state, stored = true, audio, modalAction = null, toastTimer, petTimer, lastNotice = null;
  try { state = KittyState.restore(localStorage.getItem(KEY)); } catch { state = KittyState.fresh(); stored = false; }
  const roasts = ['我的可乐还没开，你的专注就结束了？', '说好一起努力，你却先下班了。那我也躺平三秒。', '你这专注时长，比我拆一包薯片还短。', '我已经把键盘让给你了，你居然不用？', '行吧，批准你去休息。回来记得带上毅力和薯片。'];
  const pets = ['摸摸收到！今天也会好好陪你。', '嘿嘿……再夸我一下也不是不行。', '薯片可以晚点，打气不能少。', '别光顾着看我啦，一起认真一会儿再追番！'];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));stored=true;}catch{stored=false;}$('saveNote').textContent=stored?'进度自动保存在此浏览器':'无法保存进度，请检查浏览器存储权限';}
  function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}
  function enableAudio(){try{audio ||= new (window.AudioContext || window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{toast('此浏览器暂不支持音效。');}}
  function chime(kind){if(!state.sound)return;enableAudio();if(!audio)return;const notes=kind==='complete'?[523.25,659.25,783.99,1046.5]:kind==='cancel'?[392,329.63]:[659.25,783.99];try{notes.forEach((n,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.14;oscillator.type='triangle';oscillator.frequency.value=n;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.075,at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+.24);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.25);});}catch{}}
  function modal(title,html,primary='好，继续慢慢来',action=null,secondary=false){
    modalAction=action;$('modalTitle').textContent=title;$('modalBody').innerHTML=html;$('modalPrimary').textContent=primary;$('modalSecondary').hidden=!secondary;
    if(!$('modal').open)$('modal').showModal();
  }
  function close(){ $('modal').close();modalAction=null; }
  $('closeModal').onclick=close;$('modalSecondary').onclick=close;
  $('modalPrimary').onclick=()=>{const action=modalAction;close();if(action)action();};
  $('modal').addEventListener('click',event=>{if(event.target===$('modal')){const r=$('modal').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
  function notice(){if(!state.notice||state.notice===lastNotice)return;lastNotice=state.notice;const n=state.notice;
    if(n.type==='complete'){
      KittyRoom.pet();animateUmaru();$('speech').textContent='你认真做事的样子，值得一整包薯片！';
      modal(n.upgraded?'小埋升级啦！':'这一段专注，做得真好。',`<p>你和小埋一起度过了 <strong>${Number(n.minutes)||0} 分钟</strong>。</p><p>获得 <strong>+${Number(n.reward)||0} XP</strong>${n.upgraded?'，小埋又长大了一点。':'，每一点认真都算数。'}</p><p>现在伸个懒腰，喝口水吧。</p>`);
    } else {const line=roasts[Math.floor(Math.random()*roasts.length)];$('speech').textContent=line;modal('小埋有一点点意见。',`<p>“${line}”</p><p>这次没有获得经验。休息好了，随时再来。</p>`,'好，下次认真');}
    state={...state,notice:null};save();
  }
  function render(){
    const active=!!state.session,l=KittyState.level(state.xp),remaining=KittyState.remaining(state,Date.now()),seconds=Math.ceil(remaining/1000),clock=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    $('clock').textContent=clock;document.title=active?`${clock} · 小埋陪你专注`:'小埋陪你专注 · Focus Umaru';
    document.body.classList.toggle('running',active);KittyRoom.setRunning(active);
    $('start').hidden=active;$('stop').hidden=!active;$('durationControls').disabled=active;
    $('timerState').textContent=active?'慢慢来，小埋陪着你':'准备好就出发';$('roomStatus').textContent=active?'正在陪你专注':'小埋已就位';
    $('timerDescription').textContent=active?'先做好眼前这一件小事。':'从一小段专注开始就很好。';
    $('mood').textContent=active?'嘘，小埋在陪你认真做事':'小埋今天也想陪着你';
    const fraction=active?Math.min(100,Math.max(0,(1-remaining/(state.session.minutes*60000))*100)):0;
    $('timerFill').style.width=fraction+'%';$('timerFill').parentElement.setAttribute('aria-valuenow',Math.round(fraction));
    $('level').textContent=`Lv. ${l.level}`;$('xpLabel').textContent=`${l.progress} / ${l.needed} XP`;$('xpFill').style.width=(l.progress/l.needed*100)+'%';$('xpFill').parentElement.setAttribute('aria-valuemax',l.needed);$('xpFill').parentElement.setAttribute('aria-valuenow',l.progress);
    $('catTitle').textContent=l.level<2?'披着仓鼠斗篷的宅家搭子':l.level<4?'渐渐默契的小伙伴':l.level<7?'形影不离的老朋友':'专注大师的最佳拍档';
    $('totalMinutes').textContent=state.totalMinutes;$('sessions').textContent=state.sessions;$('nextXP').textContent=l.needed-l.progress;
    $('sound').textContent=`音效：${state.sound?'开':'关'}`;$('sound').setAttribute('aria-pressed',state.sound);
    $('reward').innerHTML=`${active?'完成本次专注':'完成这次专注'}，小埋将获得 <strong>${(state.session?state.session.minutes:state.selected)*2} XP</strong>`;
    document.querySelectorAll('[data-minutes]').forEach(b=>{const selected=Number(b.dataset.minutes)===state.selected;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected);});
    const historySignature=JSON.stringify(state.history.slice(0,3));
    if($('history').dataset.signature!==historySignature){$('history').dataset.signature=historySignature;if(state.history.length){$('history').replaceChildren();state.history.slice(0,3).forEach(h=>{const row=document.createElement('div');row.className='history-row';const description=document.createElement('span'),time=document.createElement('small'),reward=document.createElement('strong');description.textContent=`一起专注了 ${h.minutes} 分钟 `;time.textContent=new Date(h.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});description.append(time);reward.textContent=`+${h.minutes*2} XP`;row.append(description,reward);$('history').append(row);});}}
  }
  function synchronize(){const next=KittyState.tick(state,Date.now());if(next!==state){state=next;save();chime('complete');}render();notice();}
  function select(){const input=$('minutes').value,n=Number(input);if(input.trim()===''||!Number.isInteger(n)||n<1||n>180){$('durationError').textContent='请输入 1–180 之间的整数分钟。';return false;}$('durationError').textContent='';state={...state,selected:n};save();render();return true;}
  document.querySelectorAll('[data-minutes]').forEach(b=>b.onclick=()=>{$('minutes').value=b.dataset.minutes;select();});
  $('minutes').addEventListener('input',select);
  $('start').onclick=()=>{if(!select()){$('minutes').focus();return;}if(state.sound)enableAudio();state=KittyState.start(state,state.selected,Date.now());save();$('speech').textContent='你忙你的，我在这里，哪儿也不去。';chime('start');render();};
  $('stop').onclick=()=>{synchronize();if(!state.session)return;modal('要提前结束这次专注吗？','<p>提前结束不会获得经验。<br>如果你需要休息，小埋也会理解的。</p>','结束这次专注',()=>{state=KittyState.cancel(state,Date.now());save();chime(state.notice?.type==='complete'?'complete':'cancel');render();notice();},true);};
  $('sound').onclick=()=>{state={...state,sound:!state.sound};if(state.sound){enableAudio();chime('start');}save();render();};
  $('pet').onclick=()=>{KittyRoom.pet();animateUmaru();$('speech').textContent=pets[Math.floor(Math.random()*pets.length)];chime('pet');clearTimeout(petTimer);petTimer=setTimeout(()=>{$('speech').textContent=state.session?'你忙你的，我在这里，哪儿也不去。':'先摸摸我，再一起开工吧。';},5000);};
  $('help').onclick=()=>modal('和小埋一起，慢慢专注。','<p>① 选择 1–180 分钟，点击「开始专注」。<br>② 完整陪伴一分钟，小埋就获得 2 XP。<br>③ 首次升级需要 100 XP，之后每级递增 100 XP。<br>④ 点击小屋，可以摸摸小埋。</p><p>刷新页面后计时继续；关闭页面后，下次回来会按经过的时间结算。建议专注时保留网页，及时听到完成提示音。</p><p>存档仅在当前浏览器内，不会跨设备同步；清除浏览器数据会丢失进度。音效默认关闭，可随时开启。</p>','知道啦，开始陪伴');
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)synchronize();});
  window.addEventListener('storage',event=>{if(event.key===KEY){state=KittyState.restore(event.newValue);$('minutes').value=state.selected;synchronize();}});
  function animateUmaru(){const el=document.querySelector('.character-anchor');el.classList.remove('cheer');void el.offsetWidth;el.classList.add('cheer');setTimeout(()=>el.classList.remove('cheer'),2200);}
  $('brandAvatar').src=$('umaruPortrait').src;document.querySelector('link[rel="icon"]').href=$('umaruPortrait').src;
  KittyRoom.init($('room'));$('minutes').value=state.selected;save();synchronize();setInterval(synchronize,500);
})();
