const WEBHOOK_URL = '/api/submit'; 

function setLang(lang) {
  // Для корректной работы HTML-тега
  const htmlLang = lang === 'ua' ? 'uk' : lang;
  document.documentElement.setAttribute('lang', htmlLang);
  
  // Обновляем классы активной кнопки
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`) || document.querySelector(`.lang-btn[onclick="setLang('${htmlLang}')"]`);
  if (activeBtn) activeBtn.classList.add('active');
  
  localStorage.setItem('inked_lang', htmlLang);
}

// Новая функция: читаем URL и ищем там нужный язык
function getLangFromUrl() {
  const url = window.location.href.toLowerCase();
  if (url.includes('/ru') || url.includes('?lang=ru') || url.includes('#ru')) return 'ru';
  if (url.includes('/en') || url.includes('?lang=en') || url.includes('#en')) return 'en';
  if (url.includes('/ua') || url.includes('/uk') || url.includes('?lang=ua') || url.includes('#ua')) return 'uk';
  return null;
}

// Сначала проверяем URL. Если там пусто — берем из памяти браузера. Если и там пусто — ставим 'uk'
const urlLang = getLangFromUrl();
const savedLang = urlLang || localStorage.getItem('inked_lang') || 'uk';
setLang(savedLang);

(() => {
  const loader = document.getElementById('loader');
  const typedBrand = document.getElementById('typedBrand');
  const progressBar = document.getElementById('progressBar');
  const loadPercent = document.getElementById('loadPercent');
  const word = 'INKED';
  let idx = 0;
  
  function typeWord(){
    if(idx <= word.length){
      typedBrand.textContent = word.slice(0, idx);
      idx++;
      setTimeout(typeWord, idx === 1 ? 160 : 115);
    } else {
      setTimeout(() => { if(progressBar) progressBar.style.width = '100%'; }, 100);
      let n = 0;
      const timer = setInterval(() => {
        n += Math.ceil((100 - n) / 7);
        if(n >= 100){
          n = 100;
          clearInterval(timer);
          setTimeout(() => {
            loader.classList.add('done');
            document.body.classList.remove('is-loading');
          }, 350);
        }
        if(loadPercent) loadPercent.textContent = String(n).padStart(2,'0') + '%';
      }, 24);
    }
  }
  window.addEventListener('load', () => setTimeout(typeWord, 220));

  const header = document.getElementById('header');
  const modal = document.getElementById('modal');
  const close = document.getElementById('close');
  const openButtons = [...document.querySelectorAll('[data-open]')];
  const planButtons = [...document.querySelectorAll('[data-plan]')];

  function openModal(plan=''){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    
    const task = modal.querySelector('textarea');
    const modalForm = document.getElementById('modalForm');
    
    if(plan){
      if(task) task.value = 'Цікавить пакет: ' + plan + '\n\n';
      
      let planDetails = plan;
      if (plan === 'Launch') planDetails = 'Launch ($500+)';
      if (plan === 'Growth') planDetails = 'Growth ($1000+)';
      if (plan === 'Scale') planDetails = 'Scale ($1500+)';

      modalForm.dataset.source = 'ЗАПИТ ПАКЕТУ: ' + planDetails;
    } else {
      if(task) task.value = '';
      modalForm.dataset.source = 'ШВИДКИЙ ЗАПИТ (ПОП-АП)';
    }
  }
  
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  
  openButtons.forEach(b => b.addEventListener('click', () => openModal()));
  planButtons.forEach(b => b.addEventListener('click', () => openModal(b.dataset.plan)));
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if(e.target === modal) closeModal() });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal() });

  window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20), {passive:true});

  document.querySelectorAll('[data-slider="true"]').forEach(slider => {
    const track = slider.querySelector('.slider-track');
    const prev = slider.querySelector('.slider-prev');
    const next = slider.querySelector('.slider-next');
    const slides = slider.querySelectorAll('.slider-slide');
    let currentIndex = 0;

    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    next.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    });

    prev.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    });
  });

  async function submitSecurely(data, form, noticeId) {
    const btn = form.querySelector('button[type="submit"]');
    const notice = document.getElementById(noticeId);
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="uk">Відправка...</span><span class="ru">Отправка...</span><span class="en">Sending...</span>';
    btn.disabled = true;
    notice.className = 'notice';

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        notice.classList.add('show', 'success');
        notice.innerHTML = '<span class="uk">Заявка успішно відправлена!</span><span class="ru">Заявка успешно отправлена!</span><span class="en">Request sent successfully!</span>';
        form.reset();
      } else {
        notice.classList.add('show', 'error');
        notice.innerHTML = 'Помилка на сервері.';
      }
    } catch (error) {
      notice.classList.add('show', 'error');
      notice.innerHTML = 'Помилка мережі.';
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const data = {
      source: 'ПОВНА ФОРМА (ФУТЕР)',
      name: fd.get('name'),
      contact: fd.get('contact'),
      service: fd.get('service') || '—',
      task: fd.get('task')
    };
    submitSecurely(data, this, 'notice');
  });

  document.getElementById('modalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const data = {
      source: this.dataset.source || 'ШВИДКИЙ ЗАПИТ (ПОП-АП)',
      name: fd.get('name'),
      contact: fd.get('contact'),
      service: '—', 
      task: fd.get('task')
    };
    submitSecurely(data, this, 'modalNotice');
  });

})();