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
  const IMAGE_ASSET_VERSION = '20260902-1';

  function imageAsset(path) {
    return `${path}?v=${IMAGE_ASSET_VERSION}`;
  }

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
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const period = d.getHours() < 12 ? 'AM' : 'PM';
    return `${year}.${month}.${date}. ${days[d.getDay()]}. ${hours}:${minutes}${period}`;
  }

  function numberedImagePaths(folder, count) {
    return Array.from(
      { length: count },
      (_, index) => imageAsset(`images/${folder}/${index + 1}.jpg`)
    );
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
    setMeta('property', 'og:image', new URL(imageAsset('images/og/1.jpg'), window.location.href).href);
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
      curtain.hidden = true;
      return;
    }

    curtain.hidden = false;
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
    const collapseWrap = $('#galleryCollapseWrap');
    const collapseBtn = $('#galleryCollapseBtn');
    const initialCount = 9;
    const itemsPerRow = 3;
    const rowDelay = 180;
    const rowTransitionDuration = 1400;
    const thumbnailImages = galleryImages.map((_, i) => imageAsset(`images/gallery-thumbs/${i + 1}.jpg`));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let collapseRevealTimer = null;

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

    function appendGalleryItems(start, end, revealByRow = false) {
      const fragment = document.createDocumentFragment();
      const addedItems = [];

      galleryImages.slice(start, end).forEach((src, offset) => {
        const item = createGalleryItem(src, start + offset);

        if (revealByRow) {
          const delay = reduceMotion ? 0 : Math.floor(offset / itemsPerRow) * rowDelay;
          item.classList.add('gallery__item--extra', 'gallery__item--row-reveal');
          item.style.transitionDelay = `${delay}ms`;
        }

        addedItems.push(item);
        fragment.appendChild(item);
      });

      grid.appendChild(fragment);

      if (revealByRow) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            addedItems.forEach((item) => item.classList.add('is-visible'));
          });
        });
      }

      const rowCount = Math.ceil(addedItems.length / itemsPerRow);
      return reduceMotion || !revealByRow
        ? 0
        : Math.max(0, rowCount - 1) * rowDelay + rowTransitionDuration;
    }

    appendGalleryItems(0, Math.min(initialCount, galleryImages.length));

    if (galleryImages.length <= initialCount) {
      moreWrap.hidden = true;
      return;
    }

    moreBtn.addEventListener('click', () => {
      const revealDuration = appendGalleryItems(initialCount, galleryImages.length, true);
      moreBtn.setAttribute('aria-expanded', 'true');
      moreWrap.hidden = true;
      collapseWrap.hidden = true;
      collapseWrap.classList.remove('is-visible');

      collapseRevealTimer = window.setTimeout(() => {
        collapseWrap.hidden = false;
        requestAnimationFrame(() => collapseWrap.classList.add('is-visible'));
      }, revealDuration);
    });

    collapseBtn.addEventListener('click', () => {
      if (collapseRevealTimer) window.clearTimeout(collapseRevealTimer);
      $$('.gallery__item--extra', grid).forEach((item) => item.remove());
      collapseWrap.hidden = true;
      collapseWrap.classList.remove('is-visible');
      moreWrap.hidden = false;
      moreWrap.classList.add('is-visible');
      moreBtn.setAttribute('aria-expanded', 'false');

      requestAnimationFrame(() => {
        moreBtn.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    });
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

  let naverMapApiPromise = null;

  function loadNaverMapApi(clientId) {
    if (window.naver && window.naver.maps) return Promise.resolve();
    if (naverMapApiPromise) return naverMapApiPromise;

    naverMapApiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
      script.async = true;
      script.dataset.naverMapApi = 'true';
      script.addEventListener('load', () => {
        if (window.naver && window.naver.maps) {
          resolve();
        } else {
          reject(new Error('NAVER Maps API is unavailable'));
        }
      }, { once: true });
      script.addEventListener('error', () => reject(new Error('NAVER Maps script failed to load')), { once: true });

      document.head.appendChild(script);
    });

    return naverMapApiPromise;
  }

  function initNaverMap(wedding) {
    const mapWrap = $('#locationMapWrap');
    const mapCanvas = $('#naverMap');
    const status = $('#locationMapStatus');
    const settings = wedding.naverMap;
    let tileObserver = null;
    let tileTimeoutId = null;
    let mapFailed = false;

    const stopWatchingTiles = () => {
      if (tileObserver) tileObserver.disconnect();
      if (tileTimeoutId) window.clearTimeout(tileTimeoutId);
    };

    const showFallback = (message) => {
      mapFailed = true;
      stopWatchingTiles();
      mapWrap.classList.remove('is-ready');
      mapWrap.classList.add('is-error');
      status.hidden = false;
      status.textContent = message;
    };

    if (!settings || !settings.clientId) {
      showFallback('지도 설정을 확인해 주세요.');
      return;
    }

    window.navermap_authFailure = () => {
      showFallback('네이버 지도 인증을 확인해 주세요.');
    };

    loadNaverMapApi(settings.clientId).then(() => {
      try {
        const position = new naver.maps.LatLng(settings.latitude, settings.longitude);
        const map = new naver.maps.Map('naverMap', {
          center: position,
          zoom: settings.zoom || 17,
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
          mapDataControl: false,
          scaleControl: false,
          mapTypeControl: false,
          scrollWheel: false,
          keyboardShortcuts: false
        });

        const marker = new naver.maps.Marker({
          position,
          map,
          title: wedding.venue
        });

        const infoWindow = new naver.maps.InfoWindow({
          content: `<div class="naver-map-info"><strong>${wedding.venue}</strong><span>${wedding.address}</span></div>`,
          borderWidth: 0,
          backgroundColor: 'transparent',
          disableAnchor: true,
          pixelOffset: new naver.maps.Point(0, -10)
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow.getMap()) {
            infoWindow.close();
          } else {
            infoWindow.open(map, marker);
          }
        });

        const revealMap = () => {
          if (mapFailed || mapWrap.classList.contains('is-ready')) return;
          stopWatchingTiles();
          mapWrap.classList.remove('is-error');
          mapWrap.classList.add('is-ready');
          status.hidden = true;
        };

        const checkMapTiles = () => {
          const tiles = mapCanvas.querySelectorAll('img[src*="pstatic.net/styles/"]');

          for (const tile of tiles) {
            if (tile.complete && tile.naturalWidth > 0) {
              revealMap();
              return;
            }

            if (!tile.dataset.loadObserved) {
              tile.dataset.loadObserved = 'true';
              tile.addEventListener('load', revealMap, { once: true });
            }
          }
        };

        tileObserver = new MutationObserver(checkMapTiles);
        tileObserver.observe(mapCanvas, { childList: true, subtree: true });
        checkMapTiles();

        tileTimeoutId = window.setTimeout(() => {
          if (!mapWrap.classList.contains('is-ready')) {
            showFallback('네이버 지도 타일을 불러오지 못했습니다.');
          }
        }, 20000);
      } catch (error) {
        showFallback('네이버 지도를 표시하지 못했습니다.');
      }
    }).catch(() => {
      showFallback('네이버 지도를 불러오지 못했습니다.');
    });
  }

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';
    initNaverMap(w);

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
      const copyNumber = String(acc.number || '').replace(/\D/g, '');
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
        <button class="account-item__copy" data-account="${copyNumber}">
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

  function sanitizePhoneNumber(phone) {
    const value = String(phone || '').trim();
    if (!value) return '';
    return value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  }

  function createPhoneIcon() {
    return `
      <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path d="M164.9 24.6C157.2 6 136.9-3.9 117.5 1.4l-88 24C12.1 30.2 0 46 0 64c0 247.4 200.6 448 448 448 18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368c-70.4-33.3-127.4-90.3-160.7-160.7l49.3-40.3c13.7-11.2 18.4-30 11.6-46.3l-40-96z"></path>
      </svg>
    `;
  }

  function createMessageIcon() {
    return `
      <svg viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4l217.6 163.2c11.4 8.5 27 8.5 38.4 0l217.6-163.2C504.9 141.3 512 127.1 512 112c0-26.5-21.5-48-48-48H48zM0 176v208c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path>
      </svg>
    `;
  }

  function renderContactList(contacts, containerId) {
    const container = $(`#${containerId}`);
    container.replaceChildren();

    contacts.forEach((contact) => {
      const person = document.createElement('div');
      person.className = 'contact-modal__person';

      const name = document.createElement('span');
      name.className = 'contact-modal__name';
      const displayName = [contact.role, contact.name].filter(Boolean).join(' ');
      if (contact.role) {
        const role = document.createElement('span');
        role.className = 'contact-modal__role';
        role.textContent = contact.role;
        name.append(role, document.createTextNode(` ${contact.name}`));
      } else {
        name.textContent = contact.name;
      }

      const phone = sanitizePhoneNumber(contact.phone);
      const actions = document.createElement('div');
      actions.className = 'contact-modal__actions';

      const message = document.createElement(phone ? 'a' : 'button');
      message.className = 'contact-modal__message';
      message.innerHTML = createMessageIcon();

      const call = document.createElement(phone ? 'a' : 'button');
      call.className = 'contact-modal__call';
      call.innerHTML = createPhoneIcon();

      if (phone) {
        message.href = `sms:${phone}`;
        message.setAttribute('aria-label', `${displayName}에게 문자 보내기`);
        call.href = `tel:${phone}`;
        call.setAttribute('aria-label', `${displayName}에게 전화하기`);
      } else {
        message.type = 'button';
        message.disabled = true;
        message.setAttribute('aria-label', `${displayName} 문자번호 미등록`);
        message.title = '전화번호가 아직 등록되지 않았습니다.';
        call.type = 'button';
        call.disabled = true;
        call.setAttribute('aria-label', `${displayName} 전화번호 미등록`);
        call.title = '전화번호가 아직 등록되지 않았습니다.';
      }

      actions.append(message, call);
      person.append(name, actions);
      container.appendChild(person);
    });
  }

  function initContactModal() {
    const modal = $('#contactModal');
    const panel = modal.querySelector('.contact-modal__panel');
    const openButton = $('#contactModalOpen');
    const closeButton = $('#contactModalClose');
    const contacts = CONFIG.contacts || { groom: [], bride: [] };
    let previousFocus = null;
    let previousOverflow = '';
    let previousPaddingRight = '';

    renderContactList(contacts.groom || [], 'groomContactList');
    renderContactList(contacts.bride || [], 'brideContactList');

    function openContactModal() {
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';

      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      requestAnimationFrame(() => closeButton.focus());
    }

    function closeContactModal() {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    }

    openButton.addEventListener('click', openContactModal);
    closeButton.addEventListener('click', closeContactModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeContactModal();
    });

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeContactModal();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = $$('a[href], button:not(:disabled)', panel);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
    initContactModal();
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
