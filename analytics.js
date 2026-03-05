(function () {
  const gaId = 'G-34FYRQVZMN';

  const script = document.createElement('script');
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', gaId);
})();
