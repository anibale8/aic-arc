/* ============================================================
   main.js
   ============================================================ */

const isProjectPage = document.getElementById('project-stage') !== null;
const isIndexPage   = document.getElementById('projects-table') !== null;

document.addEventListener('DOMContentLoaded', () => {
  bindNavDropdown();
  if (isIndexPage)   initIndex();
  if (isProjectPage) initProject();
});

/* Projects dropdown also works by click/tap (hover doesn't exist on touch) */
function bindNavDropdown() {
  const proj = document.querySelector('.nav-projects');
  if (!proj) return;
  const label = proj.querySelector('.nav-label');
  const drop  = proj.querySelector('.nav-dropdown');
  label.addEventListener('click', () => {
    drop.classList.remove('force-closed');
    drop.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!proj.contains(e.target)) drop.classList.remove('open');
  });
  // Picking Image or Text closes the dropdown right away
  drop.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      drop.classList.remove('open');
      drop.classList.add('force-closed'); // beats the hover state until the mouse leaves
    });
  });
  proj.addEventListener('mouseleave', () => drop.classList.remove('force-closed'));
}

/* ══════════════════════════════════════════════
   INDEX PAGE
══════════════════════════════════════════════ */

function initIndex() {
  let activeFilters = { year: [], location: [], format: [] };
  let map = null;
  let mapProject = null;
  let mapPhoto = 0;
  let mapMarkers = []; // { p, marker } — so filters can show/hide them

  buildTableRows();
  buildStrip();
  buildFilterOptions();
  bindViewToggle();
  bindFilterPanel();

  // Deep links: index.html#image opens the image view, #filter opens the panel.
  // The hash is dropped right away so any reload always lands on the
  // Text view (the main view) with the filter panel closed.
  if (window.location.hash === '#image') {
    setView('images');
  } else if (window.location.hash === '#map') {
    setView('map');
  } else {
    setView('table'); // Text view is the main/default view
  }
  if (window.location.hash === '#filter') {
    document.getElementById('filter-panel').classList.add('open');
    document.getElementById('filter-toggle').classList.add('active');
    updateClearBtn();
  }
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }

  /* ── Text view (table) ──────────────────── */
  function buildTableRows() {
    const container = document.getElementById('table-rows');
    container.innerHTML = '';
    projects.forEach(p => {
      const row = document.createElement('a');
      row.className = 'table-row';
      row.href      = `project.html?slug=${p.slug}&from=text`;
      row.dataset.year     = p.year;
      row.dataset.location = p.location;
      row.dataset.format   = p.format;
      row.innerHTML = `
        <span class="table-cell">${p.code}</span>
        <span class="table-cell">${p.title}</span>
        <span class="table-cell">${p.format}</span>
        <span class="table-cell">${p.location}</span>
        <span class="table-cell">${p.year}</span>`;
      container.appendChild(row);
    });
  }

  /* ── Image view (horizontal strip) ──────── */
  function buildStrip() {
    const strip = document.getElementById('projects-strip');
    strip.innerHTML = '';
    projects.forEach(p => {
      const item = document.createElement('a');
      item.className = 'strip-item';
      item.href      = `project.html?slug=${p.slug}&from=image`;
      item.dataset.year     = p.year;
      item.dataset.location = p.location;
      item.dataset.format   = p.format;
      item.innerHTML = `
        <div class="strip-item-label">${p.code} ${p.title}</div>
        <div class="strip-item-img"><img src="${p.cover}" alt="${p.title}" loading="lazy"></div>`;
      strip.appendChild(item);
    });
  }

  /* ── View toggle ────────────────────────── */
  function bindViewToggle() {
    document.getElementById('btn-images').addEventListener('click', () => setView('images'));
    document.getElementById('btn-table').addEventListener('click',  () => setView('table'));
    document.getElementById('btn-map').addEventListener('click',    () => { closeFilterIfOpen(); setView('map'); });
    // Clicking "Projects" (not Image/Text) clears and closes the filter
    const projLabel = document.querySelector('.nav-projects .nav-label');
    if (projLabel) projLabel.addEventListener('click', closeFilterIfOpen);
  }

  /* Moving to another section with the filter open: clear all + close it */
  function closeFilterIfOpen() {
    const panel = document.getElementById('filter-panel');
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open');
    document.getElementById('filter-toggle').classList.remove('active');
    clearFilters();
  }

  function setView(view) {
    const table    = document.getElementById('projects-table');
    const strip    = document.getElementById('projects-strip');
    const mapEl    = document.getElementById('projects-map');
    const btnImgs  = document.getElementById('btn-images');
    const btnTable = document.getElementById('btn-table');
    const btnMap   = document.getElementById('btn-map');

    table.style.display = view === 'table' ? '' : 'none';
    strip.classList.toggle('active', view === 'images');
    mapEl.classList.toggle('active', view === 'map');
    btnImgs.classList.toggle('active', view === 'images');
    btnTable.classList.toggle('active', view === 'table');
    btnMap.classList.toggle('active', view === 'map');
    document.body.classList.toggle('no-scroll', view === 'map');

    if (view === 'map') {
      initMap();
      setTimeout(() => map.invalidateSize(), 50);
    } else {
      closeMapProject();
    }
  }

  /* ── Map view ───────────────────────────── */
  function initMap() {
    if (map) return;
    map = L.map('projects-map', {
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 18
    }).setView([38, 0], 3);

    // Plain single-tone landmass, no country borders: countries drawn
    // with the same fill and stroke colour so no lines show
    fetch('https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json')
      .then(r => r.json())
      .then(geo => {
        L.geoJSON(geo, {
          interactive: false,
          style: {
            fillColor: '#dcdcdc',
            fillOpacity: 1,
            color: '#dcdcdc',
            weight: 0.7
          }
        }).addTo(map);
      })
      .catch(() => {
        // Fallback if the geometry file cannot be fetched
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
      });

    projects.forEach(p => {
      if (!p.coords) return;
      const icon = L.divIcon({
        className: 'map-marker',
        html: `<img src="${p.cover}" alt="${p.title}">`,
        iconSize: [56, 56],
        iconAnchor: [28, 28]
      });
      const marker = L.marker(p.coords, { icon }).on('click', () => openMapProject(p));
      mapMarkers.push({ p, marker });
    });
    syncMapMarkers();
  }

  /* Only markers matching the active filters are on the map */
  function syncMapMarkers() {
    if (!map) return;
    mapMarkers.forEach(({ p, marker }) => {
      if (matchesProject(p)) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  }

  /* Project window over the map: browse the photos, close, keep navigating */
  function openMapProject(p) {
    mapProject = p;
    document.getElementById('map-modal-info').innerHTML = `
      <span>${p.code}</span>
      <span>${p.title}</span>`;
    showMapPhoto(0);
    document.getElementById('map-modal').classList.add('open');
  }

  function closeMapProject() {
    mapProject = null;
    document.getElementById('map-modal').classList.remove('open');
  }

  function showMapPhoto(i) {
    if (!mapProject) return;
    const n = mapProject.images.length;
    mapPhoto = (i + n) % n;
    const img = document.getElementById('map-modal-photo');
    img.src = mapProject.images[mapPhoto].url;
    img.alt = `${mapProject.title} — ${mapPhoto + 1}`;
    document.getElementById('map-modal-counter').textContent = `${mapPhoto + 1}/${n}`;
  }

  document.getElementById('map-modal-prev').addEventListener('click', () => showMapPhoto(mapPhoto - 1));
  document.getElementById('map-modal-next').addEventListener('click', () => showMapPhoto(mapPhoto + 1));
  document.getElementById('map-modal-close').addEventListener('click', closeMapProject);
  document.addEventListener('keydown', e => {
    if (!mapProject) return;
    if (e.key === 'Escape')     closeMapProject();
    if (e.key === 'ArrowLeft')  showMapPhoto(mapPhoto - 1);
    if (e.key === 'ArrowRight') showMapPhoto(mapPhoto + 1);
  });

  /* ── Filter panel ───────────────────────── */
  function buildFilterOptions() {
    const years     = [...new Set(projects.map(p => p.year))].sort((a, b) => b - a);
    const locations = [...new Set(projects.map(p => p.location.split(',')[0].trim()))].sort();
    const formats   = [...new Set(projects.map(p => p.format))].sort();

    renderFilterGroup('filter-years',     years,     'year');
    renderFilterGroup('filter-locations', locations, 'location');
    renderFilterGroup('filter-formats',  formats,   'format');
  }

  function renderFilterGroup(containerId, values, type) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    values.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'filter-option';
      btn.textContent = val;
      btn.addEventListener('click', () => toggleFilter(type, val, btn));
      el.appendChild(btn);
    });
  }

  function bindFilterPanel() {
    const toggle = document.getElementById('filter-toggle');
    const panel  = document.getElementById('filter-panel');
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      toggle.classList.toggle('active');
      updateClearBtn();
    });
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    const clearMobile = document.getElementById('clear-filters-mobile');
    if (clearMobile) clearMobile.addEventListener('click', clearFilters);
  }

  /* "Clear all" (next to Filter) shows while the panel is open
     or while any filter is active */
  function updateClearBtn() {
    const open  = document.getElementById('filter-panel').classList.contains('open');
    const total = activeFilters.year.length + activeFilters.location.length + activeFilters.format.length;
    document.getElementById('clear-filters').classList.toggle('visible', open || total > 0);
  }

  function toggleFilter(type, value, btn) {
    const arr = activeFilters[type];
    const idx = arr.indexOf(value);
    if (idx === -1) {
      arr.push(value);
      btn.classList.add('active');
    } else {
      arr.splice(idx, 1);
      btn.classList.remove('active');
    }
    applyFilters();
  }

  function clearFilters() {
    activeFilters = { year: [], location: [], format: [] };
    document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
    applyFilters();
  }

  function applyFilters() {
    const total = activeFilters.year.length + activeFilters.location.length + activeFilters.format.length;
    const countEl = document.getElementById('filter-count');
    countEl.textContent  = total;
    countEl.style.display = total > 0 ? 'inline-flex' : 'none';
    updateClearBtn();

    document.querySelectorAll('.table-row, .strip-item').forEach(item => {
      item.classList.toggle('hidden', !matchesFilters(item));
    });
    syncMapMarkers();

    // Nothing matches: say so instead of showing an empty page
    const anyMatch = projects.some(matchesProject);
    document.getElementById('no-results').style.display = anyMatch ? 'none' : 'block';
  }

  function matchesFilters(item) {
    const yr  = parseInt(item.dataset.year);
    const loc = item.dataset.location.split(',')[0].trim();
    const fmt = item.dataset.format;

    if (activeFilters.year.length     && !activeFilters.year.includes(yr))      return false;
    if (activeFilters.location.length && !activeFilters.location.includes(loc)) return false;
    if (activeFilters.format.length   && !activeFilters.format.includes(fmt))   return false;
    return true;
  }

  function matchesProject(p) {
    const loc = p.location.split(',')[0].trim();
    if (activeFilters.year.length     && !activeFilters.year.includes(p.year))     return false;
    if (activeFilters.location.length && !activeFilters.location.includes(loc))    return false;
    if (activeFilters.format.length   && !activeFilters.format.includes(p.format)) return false;
    return true;
  }
}

/* ══════════════════════════════════════════════
   PROJECT PAGE — one photo at a time, click
   left/right side to move between photos
══════════════════════════════════════════════ */

function initProject() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');
  const from   = params.get('from'); // "image" | "text" — where the ✕ goes back to
  const stage  = document.getElementById('project-stage');
  let pIdx     = projects.findIndex(p => p.slug === slug);

  document.getElementById('project-close').href =
    from === 'image' ? 'index.html#image' : 'index.html';

  if (pIdx === -1) {
    stage.innerHTML =
      '<p style="padding:24px 14px;color:#8a8a8a">Project not found. <a href="index.html" style="text-decoration:underline">Back to index</a></p>';
    return;
  }

  const img     = document.getElementById('project-photo');
  const counter = document.getElementById('project-counter');
  const infoEl  = document.getElementById('project-info');
  const introEl = document.getElementById('project-intro');
  const plusBtn = document.getElementById('description-toggle');
  const descEl  = document.getElementById('project-description');
  let current = 0;
  let introT1 = null, introT2 = null;

  function infoCells(p) {
    return `
      <span class="table-cell">${p.code}</span>
      <span class="table-cell">${p.title}</span>
      <span class="table-cell">${p.format}</span>
      <span class="table-cell">${p.location}</span>
      <span class="table-cell">${p.year}</span>`;
  }

  function show(i) {
    const p = projects[pIdx];
    current = i;
    img.src = p.images[current].url;
    img.alt = `${p.title} — ${current + 1}`;
    counter.textContent = `${current + 1}/${p.images.length}`;
    descEl.innerHTML = `<p>${p.description || ''}</p>`;
    // Preload the neighbouring photos so switching feels instant
    [current + 1, current - 1].forEach(i => {
      const n = (i + p.images.length) % p.images.length;
      new Image().src = p.images[n].url;
    });
  }

  /* Project info centred over the blurred photo for 2s,
     then it rises to its usual place at the top */
  function playIntro() {
    clearTimeout(introT1);
    clearTimeout(introT2);
    document.body.classList.remove('intro-rise');
    document.body.classList.add('intro-hold');
    introT1 = setTimeout(() => {
      document.body.classList.remove('intro-hold');
      document.body.classList.add('intro-rise');
      introT2 = setTimeout(() => document.body.classList.remove('intro-rise'), 650);
    }, 2000);
  }

  function loadProject(idx, startAtLast) {
    pIdx = (idx + projects.length) % projects.length;
    const p = projects[pIdx];
    document.title = `aic.arc — ${p.title}`;
    history.replaceState(null, '', `project.html?slug=${p.slug}${from ? `&from=${from}` : ''}`);
    infoEl.innerHTML  = infoCells(p);
    introEl.innerHTML = infoCells(p);
    // Close the description panel when switching projects;
    // hide the + entirely if the project has no description yet
    descEl.classList.remove('open');
    plusBtn.textContent = '+';
    plusBtn.style.display = p.description ? '' : 'none';
    show(startAtLast ? p.images.length - 1 : 0);
    playIntro();
  }

  /* Navigation is locked while the intro is on screen */
  function introRunning() {
    return document.body.classList.contains('intro-hold') ||
           document.body.classList.contains('intro-rise');
  }

  /* Left/right navigation crosses into the previous/next project
     when the photos of the current one run out */
  function prev() {
    if (introRunning()) return;
    if (current > 0) show(current - 1);
    else loadProject(pIdx - 1, true);
  }

  function next() {
    if (introRunning()) return;
    if (current < projects[pIdx].images.length - 1) show(current + 1);
    else loadProject(pIdx + 1, false);
  }

  document.getElementById('stage-prev').addEventListener('click', prev);
  document.getElementById('stage-next').addEventListener('click', next);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  plusBtn.addEventListener('click', () => {
    const open = descEl.classList.toggle('open');
    plusBtn.textContent = open ? '−' : '+';
  });

  loadProject(pIdx, false);
}
