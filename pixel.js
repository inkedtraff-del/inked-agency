// Впиши сюда свой реальный ID пикселя Meta
const PIXEL_ID = 'ТВОЙ_ПИКСЕЛЬ_ID'; 

// 1. Базовая инициализация Meta Pixel
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', PIXEL_ID);

// Отстреливаем базовый просмотр страницы
fbq('track', 'PageView'); 

// 2. Профессиональный трекинг лидов
document.addEventListener('DOMContentLoaded', () => {

  // Функция-хелпер для отправки события Lead с параметрами
  const fireLeadEvent = (contentName) => {
    fbq('track', 'Lead', {
      content_name: contentName,
      content_category: 'Conversion'
    });
    console.log(`[Meta Pixel] Lead fired: ${contentName}`); // Оставил лог для удобной отладки в консоли
  };

  // А. Отслеживаем успешную отправку всех форм (Футер и Поп-ап)
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const formName = form.id === 'modalForm' ? 'Modal Form Submit' : 'Footer Form Submit';
      fireLeadEvent(formName);
    });
  });

  // Б. Глобальный перехватчик кликов (Telegram и целевые кнопки)
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    // Игнорируем кнопки Submit в формах (их мы уже ловим выше через событие 'submit', чтобы не было задвоения лидов)
    if (target.type === 'submit') return;

    // 1. Если кликнули на любую ссылку, ведущую в Telegram
    if (target.href && target.href.includes('t.me')) {
      fireLeadEvent('Telegram Click');
      return;
    }

    // 2. Если кликнули на любую целевую кнопку (CTA, тарифы, плавающая кнопка внизу)
    // Исключаем кнопки переключения языка и стрелочки слайдера, чтобы не засирать статистику
    const isTargetButton = target.classList.contains('btn') || target.classList.contains('sticky-contact');
    const isNotSystemButton = !target.classList.contains('lang-btn') && !target.classList.contains('slider-btn');

    if (isTargetButton && isNotSystemButton) {
      // Вытаскиваем текст кнопки, чтобы в Facebook было видно, на что именно нажали
      const btnText = target.innerText.trim() || 'CTA Button Click';
      fireLeadEvent(`Button Click: ${btnText}`);
    }
  });
});