document.addEventListener('DOMContentLoaded', function () {
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navLinks = document.querySelectorAll('.nav-menu a');
  var sections = document.querySelectorAll('main section');

  // 모바일 메뉴 열기/닫기
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('open');
  });

  // 메뉴 클릭 시 해당 영역으로 부드럽게 이동
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      navMenu.classList.remove('open');
    });
  });

  // 스크롤 위치에 따라 현재 메뉴 강조
  function updateActiveLink() {
    var scrollPos = window.scrollY + 100;
    var currentId = sections[0].id;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();
});
