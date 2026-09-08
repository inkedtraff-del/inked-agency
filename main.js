// --- БЕЗОПАСНАЯ ОТПРАВКА ДАННЫХ ---
// Укажи здесь URL своего вебхука (Make.com, Formspree, или свой бэкенд на Vercel/Netlify)
const WEBHOOK_URL = '/api/submit'; 
// ---------------------------------

function setLang(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');
  localStorage.setItem('inked_lang', lang);
}
const savedLang = localStorage.getItem('inked_lang') || 'uk';
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
    if(plan){
      const task = modal.querySelector('textarea');
      if(task) task.value = 'Цікавить пакет / Интересует пакет: ' + plan + '\n';
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

  // Логика работы слайдеров в кейсах
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

  // Безопасная отправка формы
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
        notice.innerHTML = 'Настройте WEBHOOK_URL в JS коде.';
      }
    } catch (error) {
      notice.classList.add('show', 'error');
      notice.innerHTML = 'Сетевая ошибка или отсутствует бэкенд.';
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  // Обработчик основной формы "Поговоримо"
  document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const data = {
      source: 'Головна форма',
      name: fd.get('name'),
      contact: fd.get('contact'),
      service: fd.get('service') || 'Не обрано',
      task: fd.get('task')
    };
    submitSecurely(data, this, 'notice');
  });

  // Обработчик формы в модалке "Обговорити пакет"
  document.getElementById('modalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const data = {
      source: 'Модалка (Пакет)',
      name: fd.get('name'),
      contact: fd.get('contact'),
      task: fd.get('task')
    };
    submitSecurely(data, this, 'modalNotice');
  });

})();