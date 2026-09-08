// ================================
// META PIXEL
// ================================

const PIXEL_ID = '974420555696388';

// Подключаем Meta Pixel
!function(f,b,e,v,n,t,s) {
    if (f.fbq) return;

    n = f.fbq = function() {
        n.callMethod ?
            n.callMethod.apply(n, arguments) :
            n.queue.push(arguments);
    };

    if (!f._fbq) f._fbq = n;

    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    t = b.createElement(e);
    t.async = true;
    t.src = v;

    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);

}(window, document, 'script',
  'https://connect.facebook.net/en_US/fbevents.js');

// Запускаем пиксель
fbq('init', PIXEL_ID);

// Просмотр страницы
fbq('track', 'PageView');


// ================================
// LEAD
// ================================

document.addEventListener('DOMContentLoaded', function() {

    // Отправка Lead
    function sendLead(name) {
        if (typeof fbq !== 'function') {
            console.log('Meta Pixel не загрузился');
            return;
        }

        fbq('track', 'Lead', {
            content_name: name,
            content_category: 'Conversion'
        });

        console.log('Meta Pixel Lead:', name);
    }


    // ================================
    // ФОРМЫ
    // ================================

    document.querySelectorAll('form').forEach(function(form) {

        form.addEventListener('submit', function() {

            const name =
                form.id === 'modalForm'
                    ? 'Modal Form'
                    : 'Footer Form';

            sendLead(name);

        });

    });


    // ================================
    // TELEGRAM
    // ================================

    document.body.addEventListener('click', function(e) {

        const link = e.target.closest('a');

        if (!link) return;

        if (link.href && link.href.includes('t.me')) {
            sendLead('Telegram Click');
        }

    });

});