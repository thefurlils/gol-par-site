const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const el = document.querySelector(a.getAttribute("href"));
    if (el) { e.preventDefault(); el.scrollIntoView({behavior:"smooth", block:"start"}); }

    
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const navWrapper = document.querySelector('.nav-wrapper');
  
  // Eğer nav-wrapper yoksa kodu durdur (hata vermemesi için)
  if (!navWrapper) return; 

  window.addEventListener('scroll', function() {
    // Sayfa 50 pikselden fazla kaydırıldıysa kapsüle dönüştür
    if (window.scrollY > 50) {
      navWrapper.classList.add('scrolled');
    } else {
      // Sayfa en üstteyse eski düz haline geri dön
      navWrapper.classList.remove('scrolled');
    }
  });
});
