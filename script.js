/**
 * Simple & Clean Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function initStableViewportHeight() {
    const root = document.documentElement;
    const isKakaoWebView = /KAKAOTALK/i.test(navigator.userAgent);
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (isKakaoWebView) root.classList.add('is-kakao-webview');
    if (!isKakaoWebView && !isTouchDevice) return;

    let viewportWidth = window.innerWidth;
    let resizeTimer = null;

    const applyHeight = () => {
      root.style.setProperty('--stable-viewport-height', `${window.innerHeight}px`);
      viewportWidth = window.innerWidth;
    };

    const updateAfterOrientationChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyHeight, 250);
    };

    applyHeight();

    window.addEventListener('orientationchange', updateAfterOrientationChange, { passive: true });
    window.addEventListener('resize', () => {
      // Mobile browser chrome changes only the height while scrolling. Ignore it.
      if (Math.abs(window.innerWidth - viewportWidth) < 80) return;
      updateAfterOrientationChange();
    }, { passive: true });
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  function formatCoverDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const period = d.getHours() < 12 ? 'am' : 'pm';
    return `${year}.${month}.${date}. ${days[d.getDay()]}. ${hours}:${minutes}${period}`;
  }

  function numberedImagePaths(folder, count) {
    return Array.from({ length: count }, (_, index) => `images/${folder}/${index + 1}.jpg`);
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Background Music
     ═══════════════════════════════════════════ */

  function initBgm() {
    const audio = $('#bgmAudio');
    const btn = $('#bgmToggle');
    if (!audio || !btn) return;

    audio.volume = 0.6;

    btn.addEventListener('click', async () => {
      if (audio.paused) {
        try {
          await audio.play();
          btn.classList.add('is-playing');
          btn.textContent = 'Ⅱ';
          btn.setAttribute('aria-label', '배경음악 정지');
          btn.setAttribute('aria-pressed', 'true');
        } catch {
          showToast('music/bgm.mp3 파일을 확인해 주세요');
        }
      } else {
        audio.pause();
        btn.classList.remove('is-playing');
        btn.textContent = '♪';
        btn.setAttribute('aria-label', '배경음악 재생');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain (Simple Overlay)
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');

    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    document.body.classList.add('no-scroll');

    btn.addEventListener('click', () => {
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
      }, 500);
    });
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    $('#heroPhoto').src = 'images/hero/1.jpg';
    $('#heroEnglishNames').textContent = `${CONFIG.groom.englishName || CONFIG.groom.name} · ${CONFIG.bride.englishName || CONFIG.bride.name}`;
    const heroNames = $('#heroNames');
    const heroHeart = document.createElement('span');
    heroHeart.className = 'hero__heart';
    heroHeart.textContent = '♥';
    heroNames.replaceChildren(
      document.createTextNode(`${CONFIG.groom.name} `),
      heroHeart,
      document.createTextNode(` ${CONFIG.bride.name}`)
    );
    $('#heroDate').textContent = formatCoverDate(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroVenue').textContent = CONFIG.wedding.venue;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;
      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '00';
        $('#countMinutes').textContent = '00';
        $('#countSeconds').textContent = '00';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? ' deceased' : '';
      const md = motherDeceased ? ' deceased' : '';
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}의 아들 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}의 딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $('#calendarGrid');

    grid.innerHTML = `<div class="calendar__header">${month + 1}월</div>`;

    // Weekdays
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
    $('#icsDownloadBtn').addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      a.click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    const moreWrap = $('#galleryMoreWrap');
    const moreBtn = $('#galleryMoreBtn');
    const initialCount = 9;
    const thumbnailImages = galleryImages.map((_, i) => `images/gallery-thumbs/${i + 1}.jpg`);

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    function createGalleryItem(src, i) {
      const div = document.createElement('div');
      div.className = 'gallery__item animate-item';
      div.setAttribute('data-animate', 'fade-up');

      const img = document.createElement('img');
      img.src = thumbnailImages[i];
      img.alt = `갤러리 사진 ${i + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.fetchPriority = 'low';
      img.width = 480;
      img.height = 480;
      img.addEventListener('error', () => {
        if (img.src.endsWith(src)) return;
        img.src = src;
      }, { once: true });

      div.appendChild(img);
      div.addEventListener('click', () => openPhotoModal(galleryImages, i, { thumbnailImages }));
      return div;
    }

    function appendGalleryItems(start, end, revealImmediately = false) {
      const fragment = document.createDocumentFragment();
      const addedItems = [];

      galleryImages.slice(start, end).forEach((src, offset) => {
        const item = createGalleryItem(src, start + offset);
        addedItems.push(item);
        fragment.appendChild(item);
      });

      grid.appendChild(fragment);

      if (revealImmediately) {
        requestAnimationFrame(() => {
          addedItems.forEach((item) => item.classList.add('is-visible'));
        });
      }
    }

    appendGalleryItems(0, Math.min(initialCount, galleryImages.length));

    if (galleryImages.length <= initialCount) {
      moreWrap.hidden = true;
      return;
    }

    moreBtn.addEventListener('click', () => {
      appendGalleryItems(initialCount, galleryImages.length, true);
      moreBtn.setAttribute('aria-expanded', 'true');
      moreWrap.hidden = true;
    }, { once: true });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchCurrentX = 0;
  let touchStartY = 0;
  let touchCurrentY = 0;
  let isModalDragging = false;
  let modalShowCounter = true;
  let modalImageAlt = '사진';

  function buildModalSlides(options) {
    const track = $('#modalTrack');
    const thumbnailImages = options.thumbnailImages || [];
    track.replaceChildren();

    modalImages.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'photo-modal__slide';

      const media = document.createElement('div');
      media.className = 'photo-modal__media';

      if (thumbnailImages[i]) {
        media.style.backgroundImage = `url('${thumbnailImages[i]}')`;
      }

      const img = document.createElement('img');
      img.className = 'photo-modal__img';
      img.src = src;
      img.alt = modalImages.length > 1 ? `${modalImageAlt} ${i + 1}` : modalImageAlt;
      img.loading = 'eager';
      img.decoding = 'async';
      img.draggable = false;

      const revealImage = () => img.classList.add('is-loaded');
      img.addEventListener('load', revealImage, { once: true });
      if (img.complete && img.naturalWidth > 0) revealImage();

      media.appendChild(img);
      slide.appendChild(media);
      track.appendChild(slide);
    });
  }

  function setModalTrackPosition(animate = true, dragOffset = 0) {
    const track = $('#modalTrack');
    track.style.transition = animate
      ? 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';
    track.style.transform = `translate3d(calc(${-modalIndex * 100}% + ${dragOffset}px), 0, 0)`;
  }

  function openPhotoModal(images, index, options = {}) {
    const modal = $('#photoModal');
    modalImages = images;
    modalIndex = index;
    modalShowCounter = options.showCounter !== false;
    modalImageAlt = options.alt || '사진';
    modal.classList.toggle('is-map', options.isMap === true);
    modal.setAttribute('aria-label', options.dialogLabel || '사진 보기');
    buildModalSlides(options);
    showModalImage(false);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    document.body.style.overflow = '';
    isModalDragging = false;
  }

  function showModalImage(animate = true) {
    const counter = $('#modalCounter');
    setModalTrackPosition(animate);
    counter.textContent = `${modalIndex + 1} / ${modalImages.length}`;
    counter.hidden = !modalShowCounter;
    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    } else {
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', closePhotoModal);
    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer' || e.target.classList.contains('photo-modal__slide')) {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      if (modalImages.length <= 1) return;
      touchStartX = e.touches[0].clientX;
      touchCurrentX = touchStartX;
      touchStartY = e.touches[0].clientY;
      touchCurrentY = touchStartY;
      isModalDragging = true;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!isModalDragging) return;

      touchCurrentX = e.touches[0].clientX;
      touchCurrentY = e.touches[0].clientY;

      const deltaX = touchCurrentX - touchStartX;
      const deltaY = touchCurrentY - touchStartY;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      e.preventDefault();
      const isOutOfBounds = (modalIndex === 0 && deltaX > 0)
        || (modalIndex === modalImages.length - 1 && deltaX < 0);
      setModalTrackPosition(false, isOutOfBounds ? deltaX * 0.28 : deltaX);
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      if (!isModalDragging) return;
      touchCurrentX = e.changedTouches[0].clientX;
      touchCurrentY = e.changedTouches[0].clientY;
      isModalDragging = false;
      handleSwipe();
    }, { passive: true });

    container.addEventListener('touchcancel', () => {
      if (!isModalDragging) return;
      isModalDragging = false;
      showModalImage();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchCurrentX;
    const diffY = touchStartY - touchCurrentY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) {
      showModalImage();
      return;
    }

    if (diffX > 0) {
      modalNavigate(1);
    } else {
      modalNavigate(-1);
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    const mapPath = 'images/location/map.png';
    const mapImg = $('#locationMapImg');
    $('#locationVenue').textContent = w.venue;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    mapImg.src = mapPath;
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#locationMapBtn').addEventListener('click', () => {
      openPhotoModal([mapPath], 0, {
        showCounter: false,
        isMap: true,
        dialogLabel: '약도 크게 보기',
        alt: '오시는 길 약도 확대 이미지'
      });
    });

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    $$('.animate-item').forEach((el) => observer.observe(el));

  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  function init() {
    initStableViewportHeight();
    setMetaTags();
    initBgm();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    initPhotoModal();
    initLocation();
    initAccounts();
    initFooter();

    const galleryImages = numberedImagePaths('gallery', CONFIG.images.galleryCount);

    initGallery(galleryImages);
    initScrollAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
