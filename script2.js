/* ============================================================
   script2.js — 포트폴리오 기본 인터랙션
   1) 모바일 메뉴 토글
   2) 메뉴 클릭 시 해당 영역으로 이동 (모바일 메뉴 자동 닫기)
   3) 스크롤 위치에 따른 현재 메뉴 표시 (scroll spy)
   4) 이메일 복사 + 토스트 알림
   외부 라이브러리 없이 바닐라 JavaScript로만 작성했습니다.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();
    initEmailCopy();
  });

  /* ---------- 1. 모바일 메뉴 토글 ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
    }

    function openMenu() {
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // 메뉴 항목 클릭 시 닫기 (모바일)
    menu.addEventListener('click', function (event) {
      if (event.target.closest('.nav-link')) {
        closeMenu();
      }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // 메뉴 바깥 클릭 시 닫기
    document.addEventListener('click', function (event) {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    // 화면이 넓어지면 메뉴 상태 초기화
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 769) {
        closeMenu();
      }
    });
  }

  /* ---------- 2. 메뉴 클릭 시 부드러운 이동 ---------- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;

        var target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();

        var header = document.querySelector('.header');
        var headerHeight = header ? header.offsetHeight : 0;
        var targetTop =
          target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetTop < 0 ? 0 : targetTop,
          behavior: 'smooth'
        });

        // 주소창에 현재 위치 반영 (뒤로가기 지원)
        if (history.replaceState) {
          history.replaceState(null, '', targetId);
        }

        // 키보드 사용자를 위해 이동한 영역에 포커스
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- 3. 스크롤 위치에 따른 현재 메뉴 표시 ---------- */
  function initScrollSpy() {
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    // IntersectionObserver 미지원 브라우저 대비 폴백
    if (typeof IntersectionObserver !== 'function') {
      window.addEventListener('scroll', function () {
        var current = sections[0].id;
        sections.forEach(function (section) {
          if (window.pageYOffset >= section.offsetTop - 120) {
            current = section.id;
          }
        });
        setActive(current);
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-45% 0px -50% 0px',
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- 4. 이메일 복사 + 토스트 ---------- */
  function initEmailCopy() {
    var button = document.getElementById('copyEmail');
    var toast = document.getElementById('toast');
    if (!button) return;

    var email = button.getAttribute('data-email') || '';
    var toastTimer = null;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toast.classList.remove('show');
      }, 2200);
    }

    function fallbackCopy(text) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      var copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }

      document.body.removeChild(textarea);

      if (copied) {
        showToast('이메일 주소를 복사했습니다.');
      } else {
        showToast('복사에 실패했습니다. 주소를 직접 선택해 주세요.');
      }
    }

    button.addEventListener('click', function () {
      if (!email) return;

      // Clipboard API 미지원 환경(구형 브라우저 / 비보안 컨텍스트) 대비
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(email)
          .then(function () {
            showToast('이메일 주소를 복사했습니다.');
          })
          .catch(function () {
            fallbackCopy(email);
          });
      } else {
        fallbackCopy(email);
      }
    });
  }
})();
