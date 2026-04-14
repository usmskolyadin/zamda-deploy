(function () {
  var wait = setInterval(function () {
    if (window.django && django.jQuery) {
      window.jQuery = django.jQuery;
      window.$ = django.jQuery;
    }

    if (window.jQuery && window.$) {
      clearInterval(wait);
    }
  }, 10);
})();