let selectedFuel = 'all';
let currentResults = [];
let compareList = [null, null, null];
let activeDepChart = null;
let showcaseIndex = 0;
let showcaseTimer = null;

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDashboardCharts();
  animateCounters();
  initParticles();
  initScrollEffects();
  populateCompareSelects();
  populateAllCompareSlotsWithCars();
  initCarShowcase();
});

// ── CAR SHOWCASE CAROUSEL ─────────────────────
function showCar(index) {
  const slides = document.querySelectorAll('.car-showcase-slide');
  const dots   = document.querySelectorAll('.showcase-dot');
  if (!slides.length) return;
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d  => d.classList.remove('active'));
  showcaseIndex = index % slides.length;
  slides[showcaseIndex].classList.add('active');
  if (dots[showcaseIndex]) dots[showcaseIndex].classList.add('active');
}

function initCarShowcase() {
  // Auto-rotate every 4 seconds
  showcaseTimer = setInterval(() => {
    showCar(showcaseIndex + 1);
  }, 4000);

  // Pause on hover
  const showcase = document.querySelector('.car-showcase');
  if (showcase) {
    showcase.addEventListener('mouseenter', () => clearInterval(showcaseTimer));
    showcase.addEventListener('mouseleave', () => {
      showcaseTimer = setInterval(() => showCar(showcaseIndex + 1), 4000);
    });
  }
}


// ── NAVBAR SCROLL ─────────────────────────────
function initScrollEffects() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ── PARTICLES ─────────────────────────────────
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position:absolute;
      width:${2 + Math.random()*4}px;
      height:${2 + Math.random()*4}px;
      background:rgba(0,212,170,${0.1 + Math.random()*0.3});
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation: floatParticle ${8 + Math.random()*12}s linear infinite;
      animation-delay:${-Math.random()*10}s;
    `;
    container.appendChild(particle);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translate(${(Math.random()-0.5)*200}px, -200px) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ── COUNTER ANIMATION ─────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.dataset.target);
        const isDecimal = target % 1 !== 0;
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = isDecimal
            ? current.toFixed(1)
            : Math.floor(current).toLocaleString('en-IN');
        }, 25);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── NAVIGATION ────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── MODEL UPDATE ─────────────────────────────
function updateModels() {
  const brand = document.getElementById('brandSelect').value;
  const modelSelect = document.getElementById('modelSelect');
  modelSelect.innerHTML = '<option value="">Select Model</option>';
  if (brand && BRAND_MODELS[brand]) {
    BRAND_MODELS[brand].forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modelSelect.appendChild(opt);
    });
  }
}

// ── FUEL TOGGLE ───────────────────────────────
function setFuel(btn) {
  document.querySelectorAll('.fuel-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedFuel = btn.dataset.fuel;
}

// ── BUDGET PRESETS ────────────────────────────
function setBudget(min, max) {
  document.getElementById('budgetMin').value = min;
  document.getElementById('budgetMax').value = max;
}

// ── YEAR SLIDER ───────────────────────────────
function updateYearLabel(val) {
  document.getElementById('yearLabel').textContent = `${val} or newer`;
}

// ── QUICK HERO SEARCH ─────────────────────────
function runQuickSearch() {
  const query = document.getElementById('heroSearchInput').value.toLowerCase();
  scrollToSection('search');

  setTimeout(() => {
    if (query) {
      const matched = CAR_DATABASE.filter(c =>
        c.brand.toLowerCase().includes(query) ||
        c.model.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        c.fuel.toLowerCase().includes(query)
      );
      renderResults(matched, `Results for "${query}"`);
    } else {
      renderResults(CAR_DATABASE, 'All Available Cars');
    }
  }, 500);
}

// ── MAIN SEARCH ───────────────────────────────
function searchCars() {
  const btn = document.getElementById('searchBtn');
  btn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
  btn.disabled = true;

  setTimeout(() => {
    const location = document.getElementById('locationSelect').value;
    const brand = document.getElementById('brandSelect').value;
    const model = document.getElementById('modelSelect').value;
    const budgetMin = parseInt(document.getElementById('budgetMin').value) || 0;
    const budgetMax = parseInt(document.getElementById('budgetMax').value) || Infinity;
    const yearMin = parseInt(document.getElementById('yearSlider').value);

    let results = CAR_DATABASE.filter(car => {
      if (location && !car.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (brand && car.brand !== brand) return false;
      if (model && car.model !== model) return false;
      if (selectedFuel !== 'all' && car.fuel !== selectedFuel) return false;
      if (car.resalePrice < budgetMin) return false;
      if (budgetMax < Infinity && car.resalePrice > budgetMax) return false;
      if (car.year < yearMin) return false;
      return true;
    });

    const title = results.length > 0
      ? `Found ${results.length} matching car${results.length > 1 ? 's' : ''}`
      : 'Showing all available cars';

    if (results.length === 0) results = CAR_DATABASE;

    renderResults(results, title);
    btn.innerHTML = '<span class="btn-icon">🤖</span> Analyze & Find Cars';
    btn.disabled = false;
    scrollToSection('resultsSection');
    document.getElementById('resultsSection').style.display = 'block';
  }, 1200);
}

function resetSearch() {
  document.getElementById('locationSelect').value = '';
  document.getElementById('brandSelect').value = '';
  document.getElementById('modelSelect').innerHTML = '<option value="">Select Model</option>';
  document.getElementById('budgetMin').value = '';
  document.getElementById('budgetMax').value = '';
  document.getElementById('yearSlider').value = 2018;
  document.getElementById('yearLabel').textContent = '2018 or newer';
  selectedFuel = 'all';
  document.querySelectorAll('.fuel-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.fuel-btn[data-fuel="all"]').classList.add('active');
  document.getElementById('resultsSection').style.display = 'none';
}

// ── RENDER CAR CARDS ──────────────────────────
function renderResults(cars, title = '') {
  currentResults = cars;
  document.getElementById('resultCount').textContent = cars.length;
  document.getElementById('resultsSection').style.display = 'block';
  if (title) document.getElementById('resultsTitle').innerHTML = `
    Found <span id="resultCount">${cars.length}</span> Cars
    <small style="font-size:0.8rem;color:#94a3b8;font-weight:400;margin-left:0.5rem;">${title}</small>
  `;

  const grid = document.getElementById('carGrid');
  grid.innerHTML = '';

  cars.forEach((car, i) => {
    const health = getCarHealthScore(car);
    const saving = car.originalPrice - car.resalePrice;
    const savingPct = Math.round(saving / car.originalPrice * 100);
    const card = document.createElement('div');
    card.className = 'car-card';
    card.style.animationDelay = `${i * 0.05}s`;
    card.style.animation = 'fadeInUp 0.4s ease both';
    card.innerHTML = `
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.brand} ${car.model}" class="car-card-photo" loading="lazy" />
        <div class="car-badge-wrap">
          <span class="car-badge ${getVerdictBadgeClass(car.verdict)}">${car.verdict}</span>
          ${car.tags[0] ? `<span class="car-badge badge-fair">${car.tags[0]}</span>` : ''}
        </div>
        <span class="fuel-badge">${car.fuel}</span>
        <div class="car-number-plate" style="${car.plateStyle || 'bottom: 8%; left: 50%; transform: translateX(-50%);'}"></div>
      </div>
      <div class="car-card-body">
        <div class="car-card-title">${car.brand} ${car.model}</div>
        <div class="car-card-subtitle">${car.variant} · ${car.location}</div>
        <div class="car-card-specs">
          <div class="car-spec"><strong>${car.year}</strong></div>
          <div class="car-spec"><strong>${(car.km/1000).toFixed(0)}k km</strong></div>
          <div class="car-spec"><strong>${car.ownership} Owner</strong></div>
          <div class="car-spec"><strong>${car.transmission}</strong></div>
        </div>
        <div class="car-card-price">
          <span class="price-resale">${formatINR(car.resalePrice)}</span>
          <span class="price-original">${formatINR(car.originalPrice)}</span>
          <span class="price-saving">Save ${savingPct}%</span>
        </div>
        <div class="health-bar-wrap">
          <div class="health-bar-label">
            <span>Car Health Score</span>
            <span style="color:${getHealthColor(health)};font-weight:700;">${health}/100</span>
          </div>
          <div class="health-bar">
            <div class="health-bar-fill" style="width:${health}%;background:${getHealthColor(health)}"></div>
          </div>
        </div>
        <div class="car-card-actions" style="margin-top:0.75rem;">
          <button class="btn-card-primary" onclick="openCarDetail(${car.id})">View Details</button>
          <button class="btn-card-secondary" onclick="addToCompareFromCard(${car.id})" title="Add to compare">⚖️</button>
          <button class="btn-card-secondary" onclick="analyzeDepreciation(${car.id})" title="Depreciation">📉</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── SORT RESULTS ──────────────────────────────
function sortResults() {
  const method = document.getElementById('sortSelect').value;
  let sorted = [...currentResults];

  if (method === 'price_asc') sorted.sort((a,b) => a.resalePrice - b.resalePrice);
  else if (method === 'price_desc') sorted.sort((a,b) => b.resalePrice - a.resalePrice);
  else if (method === 'year_desc') sorted.sort((a,b) => b.year - a.year);
  else if (method === 'km_asc') sorted.sort((a,b) => a.km - b.km);
  else if (method === 'value') {
    sorted.sort((a,b) => {
      const valA = (a.originalPrice - a.resalePrice) / a.originalPrice;
      const valB = (b.originalPrice - b.resalePrice) / b.originalPrice;
      return valB - valA;
    });
  }

  const grid = document.getElementById('carGrid');
  grid.innerHTML = '';
  sorted.forEach((car, i) => {
    const health = getCarHealthScore(car);
    const saving = car.originalPrice - car.resalePrice;
    const savingPct = Math.round(saving / car.originalPrice * 100);
    const card = document.createElement('div');
    card.className = 'car-card';
    card.style.animation = `fadeInUp 0.3s ease ${i*0.05}s both`;
    card.innerHTML = `
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.brand} ${car.model}" class="car-card-photo" loading="lazy" />
        <div class="car-badge-wrap">
          <span class="car-badge ${getVerdictBadgeClass(car.verdict)}">${car.verdict}</span>
        </div>
        <span class="fuel-badge">${car.fuel}</span>
        <div class="car-number-plate" style="${car.plateStyle || 'bottom: 8%; left: 50%; transform: translateX(-50%);'}"></div>
      </div>
      <div class="car-card-body">
        <div class="car-card-title">${car.brand} ${car.model}</div>
        <div class="car-card-subtitle">${car.variant} · ${car.location}</div>
        <div class="car-card-specs">
          <div class="car-spec"><strong>${car.year}</strong></div>
          <div class="car-spec"><strong>${(car.km/1000).toFixed(0)}k km</strong></div>
          <div class="car-spec"><strong>${car.ownership} Owner</strong></div>
          <div class="car-spec"><strong>${car.transmission}</strong></div>
        </div>
        <div class="car-card-price">
          <span class="price-resale">${formatINR(car.resalePrice)}</span>
          <span class="price-original">${formatINR(car.originalPrice)}</span>
          <span class="price-saving">Save ${savingPct}%</span>
        </div>
        <div class="health-bar-wrap">
          <div class="health-bar-label">
            <span>Car Health Score</span>
            <span style="color:${getHealthColor(health)};font-weight:700;">${health}/100</span>
          </div>
          <div class="health-bar">
            <div class="health-bar-fill" style="width:${health}%;background:${getHealthColor(health)}"></div>
          </div>
        </div>
        <div class="car-card-actions" style="margin-top:0.75rem;">
          <button class="btn-card-primary" onclick="openCarDetail(${car.id})">View Details</button>
          <button class="btn-card-secondary" onclick="addToCompareFromCard(${car.id})" title="Add to compare">⚖️</button>
          <button class="btn-card-secondary" onclick="analyzeDepreciation(${car.id})" title="Depreciation">📉</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── CAR DETAIL MODAL ──────────────────────────
function openCarDetail(id) {
  const car = CAR_DATABASE.find(c => c.id === id);
  if (!car) return;
  const health = getCarHealthScore(car);
  const saving = car.originalPrice - car.resalePrice;
  const savingPct = Math.round(saving / car.originalPrice * 100);
  const maintCost = getMaintenanceCost(car);
  const age = 2026 - car.year;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'carModal';
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <div class="modal-title">${car.brand} ${car.model} ${car.variant}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-car-preview">
          <img src="${car.image}" alt="${car.brand} ${car.model}" class="modal-car-photo" />
          <div style="position:absolute;top:0.75rem;left:0.75rem;z-index:2;">
            <span class="car-badge ${getVerdictBadgeClass(car.verdict)}">${car.verdict}</span>
          </div>
          <div style="position:absolute;top:0.75rem;right:0.75rem;z-index:2;background:rgba(8,12,22,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.25rem 0.6rem;font-size:0.72rem;font-weight:600;">Color: ${car.color}</div>
          <div class="car-number-plate" style="${car.plateStyle || 'bottom: 8%; left: 50%; transform: translateX(-50%);'}"></div>
        </div>

        <div class="modal-price-row">
          <div class="modal-price-main">${formatINR(car.resalePrice)}</div>
          <div style="color:#4a5568;text-decoration:line-through;font-size:1rem;">${formatINR(car.originalPrice)}</div>
          <div class="price-saving">You Save ${formatINR(saving)} (${savingPct}%)</div>
        </div>

        <div class="modal-specs-grid">
          <div class="modal-spec-item">
            <div class="modal-spec-value">${car.year}</div>
            <div class="modal-spec-label">Year of Mfg.</div>
          </div>
          <div class="modal-spec-item">
            <div class="modal-spec-value">${(car.km/1000).toFixed(0)}k km</div>
            <div class="modal-spec-label">KM Driven</div>
          </div>
          <div class="modal-spec-item">
            <div class="modal-spec-value">${car.fuel}</div>
            <div class="modal-spec-label">Fuel Type</div>
          </div>
          <div class="modal-spec-item">
            <div class="modal-spec-value">${car.ownership}</div>
            <div class="modal-spec-label">Ownership</div>
          </div>
          <div class="modal-spec-item">
            <div class="modal-spec-value">${car.transmission}</div>
            <div class="modal-spec-label">Transmission</div>
          </div>
          <div class="modal-spec-item">
            <div class="modal-spec-value" style="color:#f59e0b;">${car.rating}/5.0</div>
            <div class="modal-spec-label">User Rating</div>
          </div>
        </div>

        <div style="margin-bottom:1.5rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;">
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1rem;text-align:center;">
              <div style="font-size:1.3rem;font-weight:800;color:#00d4aa;">${formatINR(car.emi12)}</div>
              <div style="font-size:0.72rem;color:#4a5568;margin-top:0.25rem;">EMI / 12 months</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1rem;text-align:center;">
              <div style="font-size:1.3rem;font-weight:800;color:#a78bfa;">${formatINR(car.emi24)}</div>
              <div style="font-size:0.72rem;color:#4a5568;margin-top:0.25rem;">EMI / 24 months</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:1rem;text-align:center;">
              <div style="font-size:1.3rem;font-weight:800;color:#f59e0b;">${formatINR(car.emi36)}</div>
              <div style="font-size:0.72rem;color:#4a5568;margin-top:0.25rem;">EMI / 36 months</div>
            </div>
          </div>
        </div>

        <div class="modal-insights">
          <h4>🤖 AI Insights</h4>
          <div class="insight-tags">
            <span class="insight-tag tag-${car.verdict === 'Undervalued' ? 'good' : 'info'}">${car.verdict} Pricing</span>
            <span class="insight-tag tag-${car.maintenance === 'Low' || car.maintenance === 'Very Low' ? 'good' : car.maintenance === 'High' ? 'warn' : 'info'}">Maintenance: ${car.maintenance}</span>
            <span class="insight-tag tag-good">Next Year Value: ~${formatINR(car.nextYearValue)}</span>
            <span class="insight-tag tag-info">Annual Service: ~${formatINR(maintCost)}</span>
            ${car.tags.map(t => `<span class="insight-tag tag-good">${t}</span>`).join('')}
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:1rem;margin-bottom:1.5rem;">
          <div style="font-weight:700;margin-bottom:0.5rem;font-size:0.9rem;">🏪 Dealer Details</div>
          <div style="color:#94a3b8;font-size:0.85rem;">${car.dealerName}</div>
          <div style="color:#00d4aa;font-size:0.85rem;margin-top:0.25rem;">📞 ${car.dealerPhone}</div>
          <div style="color:#4a5568;font-size:0.8rem;margin-top:0.25rem;">📍 ${car.area}, ${car.location}</div>
          <div style="color:${car.insurance.includes('Expired') ? '#ef4444' : '#10b981'};font-size:0.8rem;margin-top:0.25rem;">🛡️ ${car.insurance}</div>
        </div>

        <div class="modal-actions">
          <button class="btn-primary" style="flex:1;" onclick="analyzeDepreciation(${car.id});closeModal();">📉 Depreciation Analysis</button>
          <button class="btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 200);
  }
}

// ── DEPRECIATION ANALYSIS ─────────────────────
function analyzeDepreciation(carId) {
  const car = carId ? CAR_DATABASE.find(c => c.id === carId) : null;
  if (car) {
    document.getElementById('depCarName').value = `${car.brand} ${car.model}`;
    document.getElementById('depOriginalPrice').value = car.originalPrice;
    document.getElementById('depYear').value = car.year;
    document.getElementById('depFuel').value = car.fuel;
  }
  scrollToSection('depreciation');
  setTimeout(calculateDepreciation, 300);
}

function calculateDepreciation() {
  const name = document.getElementById('depCarName').value || 'Your Car';
  const originalPrice = parseFloat(document.getElementById('depOriginalPrice').value);
  const purchaseYear = parseInt(document.getElementById('depYear').value);
  const fuel = document.getElementById('depFuel').value;

  if (!originalPrice || !purchaseYear) {
    alert('Please fill in the original price and year of purchase.');
    return;
  }

  const rates = DEPRECIATION_RATES[fuel] || DEPRECIATION_RATES.Petrol;
  const years = [];
  const values = [];
  let currentValue = originalPrice;
  const currentYear = 2026;

  for (let i = 0; i <= 9; i++) {
    years.push(purchaseYear + i);
    values.push(Math.round(currentValue));
    if (i < rates.length - 1) currentValue *= (1 - rates[i + 1]);
  }

  const currentAge = currentYear - purchaseYear;
  const currentValueNow = values[Math.min(currentAge, 9)];
  const totalDrop = originalPrice - currentValueNow;
  const dropPct = Math.round(totalDrop / originalPrice * 100);
  const futureValue2 = values[Math.min(currentAge + 2, 9)];

  // Summary
  document.getElementById('depSummary').innerHTML = `
    <div class="dep-stat">
      <div class="dep-stat-value">${formatINR(originalPrice)}</div>
      <div class="dep-stat-label">Original Price</div>
    </div>
    <div class="dep-stat">
      <div class="dep-stat-value" style="color:#f59e0b;">${formatINR(currentValueNow)}</div>
      <div class="dep-stat-label">Current Value (${currentYear})</div>
    </div>
    <div class="dep-stat">
      <div class="dep-stat-value" style="color:#10b981;">${formatINR(futureValue2)}</div>
      <div class="dep-stat-label">Est. Value in 2 Years</div>
    </div>
  `;

  // Insights
  document.getElementById('depInsights').innerHTML = `
    <h4>📊 Depreciation Insights for ${name}</h4>
    <ul>
      <li>Total value lost so far: <strong>${formatINR(totalDrop)}</strong> (${dropPct}% of original)</li>
      <li>Estimated annual depreciation from now: <strong>${formatINR(Math.round((currentValueNow - futureValue2)/2))}/year</strong></li>
      <li>Best time to sell: <strong>Within next 12–18 months</strong> for maximum value</li>
      <li>Depreciation for ${fuel} cars in India averages <strong>${fuel === 'Electric' ? '8–15%' : fuel === 'Diesel' ? '9–20%' : '10–18%'}  per year</strong></li>
      <li>Resale tip: Keep full service records to boost resale by 8–12%</li>
    </ul>
  `;

  document.getElementById('depOutput').style.display = 'block';
  renderDepreciationChart({ years, values });
  document.getElementById('depOutput').style.animation = 'fadeInUp 0.4s ease';
}

// ── COMPARE ───────────────────────────────────
function populateCompareSelects() {
  const selects = document.querySelectorAll('.slot-select');
  selects.forEach(sel => {
    CAR_DATABASE.forEach(car => {
      const opt = document.createElement('option');
      opt.value = car.id;
      opt.textContent = `${car.brand} ${car.model} (${car.year})`;
      sel.appendChild(opt.cloneNode(true));
    });
  });
}

function populateAllCompareSlotsWithCars() {
  const selects = document.querySelectorAll('.slot-select');
  const defaults = [1, 2, 3]; // Pre-select first 3 cars
  defaults.forEach((id, i) => {
    if (selects[i]) selects[i].value = id;
    compareList[i] = CAR_DATABASE.find(c => c.id === id);
  });
}

function addToCompare(sel, slot) {
  const id = parseInt(sel.value);
  compareList[slot - 1] = id ? CAR_DATABASE.find(c => c.id === id) : null;
}

function addToCompareFromCard(id) {
  const car = CAR_DATABASE.find(c => c.id === id);
  const emptySlot = compareList.findIndex(c => !c);
  if (emptySlot === -1) {
    compareList[0] = car;
    document.querySelectorAll('.slot-select')[0].value = id;
  } else {
    compareList[emptySlot] = car;
    document.querySelectorAll('.slot-select')[emptySlot].value = id;
  }
  scrollToSection('compare');
}

function runComparison() {
  const active = compareList.filter(Boolean);
  if (active.length < 2) {
    alert('Please select at least 2 cars to compare.');
    return;
  }

  const metrics = [
    { key: 'resalePrice', label: '💰 Resale Price', format: formatINR, better: 'low' },
    { key: 'originalPrice', label: '🏭 Original Price', format: formatINR, better: 'none' },
    { key: 'year', label: '📅 Year', format: v => v, better: 'high' },
    { key: 'km', label: '🏎️ KM Driven', format: v => `${(v/1000).toFixed(0)}k`, better: 'low' },
    { key: 'fuel', label: '⛽ Fuel Type', format: v => v, better: 'none' },
    { key: 'ownership', label: '👤 Ownership', format: v => v, better: 'none' },
    { key: 'transmission', label: '⚙️ Transmission', format: v => v, better: 'none' },
    { key: 'rating', label: '⭐ Rating', format: v => `${v}/5`, better: 'high' },
    { key: 'maintenance', label: '🔧 Maintenance', format: v => v, better: 'none' },
    { key: null, label: '💰 Savings (vs OG)', format: null, better: 'high', custom: car => {
      const s = car.originalPrice - car.resalePrice;
      return { raw: s, display: `${formatINR(s)} (${Math.round(s/car.originalPrice*100)}%)` };
    }},
    { key: null, label: '🔋 Health Score', format: null, better: 'high', custom: car => {
      const h = getCarHealthScore(car);
      return { raw: h, display: `${h}/100` };
    }},
    { key: 'nextYearValue', label: '📈 Value in 1 Year', format: formatINR, better: 'high' },
    { key: 'verdict', label: '🤖 AI Verdict', format: v => v, better: 'none' },
  ];

  let html = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="comp-label" style="text-align:left;">Feature</th>
          ${active.map(c => `<th>${c.emoji} ${c.brand} ${c.model}<br><small style="color:#94a3b8;font-weight:400;">${c.year}</small></th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  metrics.forEach(metric => {
    html += '<tr>';
    html += `<td class="comp-label">${metric.label}</td>`;
    const values = active.map(car => {
      if (metric.custom) return metric.custom(car);
      return { raw: car[metric.key], display: metric.format(car[metric.key]) };
    });

    const raws = values.map(v => v.raw);
    const maxRaw = Math.max(...raws.filter(v => typeof v === 'number'));
    const minRaw = Math.min(...raws.filter(v => typeof v === 'number'));

    values.forEach((val, i) => {
      let cls = '';
      if (metric.better === 'high' && val.raw === maxRaw) cls = 'comp-best';
      if (metric.better === 'low' && val.raw === minRaw) cls = 'comp-best';
      html += `<td class="${cls}">${val.display}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';
  const result = document.getElementById('comparisonResult');
  result.innerHTML = html;
  result.style.display = 'block';
  result.style.animation = 'fadeInUp 0.4s ease';
}

// Prevent default for style tag
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `@keyframes fadeOut { from { opacity:1; } to { opacity:0; } }`;
document.head.appendChild(fadeOutStyle);

// ── KEYBOARD TRIGGERS & HERO BADGE FILTERS ──
function handleKey(event, action) {
  if (event.key === 'Enter') {
    if (action === 'quickSearch') {
      runQuickSearch();
    } else if (action === 'search') {
      searchCars();
    } else if (action === 'depreciation') {
      calculateDepreciation();
    }
  }
}

function filterHeroBadge(type) {
  scrollToSection('search');
  setTimeout(() => {
    let matched = [];
    let title = '';
    if (type === 'savings') {
      matched = CAR_DATABASE.filter(c => {
        const s = (c.originalPrice - c.resalePrice) / c.originalPrice;
        return s >= 0.25;
      });
      title = 'High Savings Deals (25%+ Off Original)';
    } else if (type === 'fair') {
      matched = CAR_DATABASE.filter(c => c.verdict === 'Fair');
      title = 'Fair Price Rated Cars';
    } else if (type === 'rating') {
      matched = CAR_DATABASE.filter(c => c.rating >= 4.7);
      title = 'Top Customer Rated Cars (4.7+ ★)';
    }
    renderResults(matched, title);
    document.getElementById('resultsSection').style.display = 'block';
    scrollToSection('resultsSection');
  }, 500);
}

// ── EMI CALCULATOR MODAL ──
function openEMICalculatorModal(defaultAmount) {
  const amount = defaultAmount || 600000;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'emiModal';
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 680px;">
      <div class="modal-header">
        <div class="modal-title">💰 Smart EMI Calculator</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="emi-calc-grid">
          <div class="emi-inputs-panel">
            <div class="emi-slider-group">
              <div class="emi-slider-header">
                <span>Loan Amount (₹)</span>
                <span id="emiAmountVal" style="color: var(--accent-primary); font-weight:700;">${formatINR(amount)}</span>
              </div>
              <input type="range" class="emi-slider" id="emiAmountSlider" min="50000" max="5000000" step="10000" value="${amount}" oninput="runEmiCalc()" />
            </div>

            <div class="emi-slider-group">
              <div class="emi-slider-header">
                <span>Interest Rate (% p.a.)</span>
                <span id="emiRateVal" style="color: var(--accent-primary); font-weight:700;">9.5%</span>
              </div>
              <input type="range" class="emi-slider" id="emiRateSlider" min="5" max="20" step="0.1" value="9.5" oninput="runEmiCalc()" />
            </div>

            <div class="emi-slider-group">
              <div class="emi-slider-header">
                <span>Loan Tenure</span>
                <span id="emiTenureVal" style="color: var(--accent-primary); font-weight:700;">3 Years (36 mos)</span>
              </div>
              <input type="range" class="emi-slider" id="emiTenureSlider" min="1" max="7" step="1" value="3" oninput="runEmiCalc()" />
            </div>
          </div>

          <div class="emi-pie-visual">
            <div style="text-align:center; margin-bottom: 0.5rem;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Estimated Monthly EMI</div>
              <div id="emiOutputVal" style="font-size: 1.8rem; font-weight:900; color: var(--accent-success); margin: 0.25rem 0;">₹0</div>
            </div>
            
            <div class="emi-bar-chart">
              <div class="emi-bar-fill-principal" id="emiPrincipalBar" style="width: 70%"></div>
              <div class="emi-bar-fill-interest" id="emiInterestBar" style="width: 30%"></div>
            </div>

            <div class="emi-breakdown">
              <div class="emi-breakdown-row">
                <span>Principal Amount:</span>
                <strong id="emiPrincipalVal">₹0</strong>
              </div>
              <div class="emi-breakdown-row">
                <span>Total Interest:</span>
                <strong id="emiInterestVal" style="color: var(--accent-primary);">₹0</strong>
              </div>
              <div class="emi-breakdown-row" style="border-top: 1px solid rgba(0,0,0,0.06); padding-top:0.4rem; margin-top:0.4rem; font-weight:700;">
                <span>Total Amount:</span>
                <strong id="emiTotalVal" style="color: var(--text-primary);">₹0</strong>
              </div>
            </div>

            <div class="emi-legend">
              <div class="emi-legend-item">
                <span class="emi-legend-color" style="background: var(--accent-secondary);"></span>
                <span>Principal</span>
              </div>
              <div class="emi-legend-item">
                <span class="emi-legend-color" style="background: var(--accent-primary);"></span>
                <span>Interest</span>
              </div>
            </div>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.02); border: 1px solid var(--glass-border); border-radius:12px; padding:0.85rem; margin-top:1.25rem; font-size:0.78rem; color:var(--text-secondary);">
          🛡️ <strong>Note:</strong> Used car interest rates usually range from 8.5% to 14.5% based on CIBIL score. Banks finance up to 85% of the car value. Calculated values are indicative.
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  runEmiCalc();
}

function runEmiCalc() {
  const amount = parseFloat(document.getElementById('emiAmountSlider').value);
  const rate = parseFloat(document.getElementById('emiRateSlider').value);
  const years = parseInt(document.getElementById('emiTenureSlider').value);

  document.getElementById('emiAmountVal').textContent = formatINR(amount);
  document.getElementById('emiRateVal').textContent = `${rate}%`;
  document.getElementById('emiTenureVal').textContent = `${years} Year${years > 1 ? 's' : ''} (${years * 12} mos)`;

  const r = rate / 12 / 100;
  const n = years * 12;
  let emi = 0;
  if (r > 0) {
    emi = Math.round(amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  } else {
    emi = Math.round(amount / n);
  }

  const totalPayment = emi * n;
  const totalInterest = totalPayment - amount;

  document.getElementById('emiOutputVal').textContent = formatINR(emi);
  document.getElementById('emiPrincipalVal').textContent = formatINR(amount);
  document.getElementById('emiInterestVal').textContent = formatINR(totalInterest);
  document.getElementById('emiTotalVal').textContent = formatINR(totalPayment);

  const principalPct = totalPayment > 0 ? (amount / totalPayment) * 100 : 100;
  const interestPct = 100 - principalPct;

  document.getElementById('emiPrincipalBar').style.width = `${principalPct}%`;
  document.getElementById('emiInterestBar').style.width = `${interestPct}%`;
}

// ── DEALER LOCATOR MODAL ──
const DEALER_DATA = {
  "Bangalore": [
    { id: 101, name: "True Value Koramangala", rating: 4.8, phone: "+91 9876543210", address: "80 Feet Road, Koramangala 4th Block", type: "Maruti Suzuki Specialist", pin: { top: "35%", left: "45%" } },
    { id: 102, name: "Kia Select Whitefield", rating: 4.7, phone: "+91 9876543216", address: "ITPL Main Road, Whitefield", type: "Premium SUV Dealer", pin: { top: "50%", left: "70%" } },
    { id: 103, name: "Spinny Car Hub Bangalore", rating: 4.9, phone: "+91 9876543250", address: "Outer Ring Road, Marathahalli", type: "Multi-brand Certified", pin: { top: "20%", left: "30%" } }
  ],
  "Mumbai": [
    { id: 201, name: "Hyundai Promise Mumbai", rating: 4.6, phone: "+91 9876543211", address: "S.V. Road, Andheri West", type: "Hyundai Specialist", pin: { top: "40%", left: "35%" } },
    { id: 202, name: "Toyota Sure Thane", rating: 4.7, phone: "+91 9876543217", address: "Ghodbunder Road, Thane", type: "Toyota & Utility Vehicles", pin: { top: "25%", left: "60%" } },
    { id: 203, name: "Cars24 Hub Mumbai", rating: 4.8, phone: "+91 9876543260", address: "Link Road, Malad West", type: "Multi-brand Hatchbacks", pin: { top: "65%", left: "45%" } }
  ],
  "Delhi": [
    { id: 301, name: "Tata Nexon EV Hub Dwarka", rating: 4.9, phone: "+91 9876543212", address: "Sector 12, Dwarka", type: "EV & Green Tech Specialist", pin: { top: "55%", left: "20%" } },
    { id: 302, name: "True Value Rohini", rating: 4.5, phone: "+91 9876543218", address: "Sector 8, Rohini", type: "Maruti Suzuki Specialist", pin: { top: "30%", left: "55%" } },
    { id: 303, name: "CarDekho Gaadi Store", rating: 4.7, phone: "+91 9876543270", address: "Connaught Place", type: "Premium Sedans", pin: { top: "45%", left: "40%" } }
  ],
  "Hyderabad": [
    { id: 401, name: "Honda Certified Banjara Hills", rating: 4.6, phone: "+91 9876543213", address: "Road No. 2, Banjara Hills", type: "Honda Specialist", pin: { top: "40%", left: "50%" } },
    { id: 402, name: "VW Certified Gachibowli", rating: 4.8, phone: "+91 9876543219", address: "Hitech City Road, Gachibowli", type: "European Build Cars", pin: { top: "60%", left: "30%" } }
  ],
  "Pune": [
    { id: 501, name: "True Value Baner", rating: 4.7, phone: "+91 9876543214", address: "Baner Road, Baner", type: "Maruti Suzuki Specialist", pin: { top: "35%", left: "40%" } },
    { id: 502, name: "Hyundai Promise Kothrud", rating: 4.8, phone: "+91 9876543222", address: "Paud Road, Kothrud", type: "Hyundai Specialist", pin: { top: "50%", left: "60%" } }
  ],
  "Chennai": [
    { id: 601, name: "Mahindra Certified Anna Nagar", rating: 4.9, phone: "+91 9876543215", address: "2nd Avenue, Anna Nagar", type: "Mahindra Utility & SUVs", pin: { top: "45%", left: "50%" } },
    { id: 602, name: "MG Select Velachery", rating: 4.5, phone: "+91 9876543221", address: "Velachery Main Road", type: "Internet Cars & SUVs", pin: { top: "65%", left: "55%" } }
  ],
  "Kolkata": [
    { id: 701, name: "Honda Certified Salt Lake", rating: 4.4, phone: "+91 9876543223", address: "Sector V, Salt Lake", type: "Honda & Hatchbacks", pin: { top: "45%", left: "45%" } }
  ],
  "Ahmedabad": [
    { id: 801, name: "Tata Motors Ahmedabad", rating: 4.7, phone: "+91 9876543220", address: "Satellite Road, Ahmedabad", type: "Tata Assured Cars", pin: { top: "40%", left: "40%" } }
  ],
  "Jaipur": [
    { id: 901, name: "Tata Harrier Hub Jaipur", rating: 4.8, phone: "+91 9876543224", address: "Vaishali Nagar, Jaipur", type: "Tata Specialist", pin: { top: "35%", left: "50%" } }
  ]
};

let selectedDealerCity = "Bangalore";

function openDealerLocatorModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'dealerModal';
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 800px;">
      <div class="modal-header">
        <div class="modal-title">🏪 AutoTrust Dealer Locator</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="dealer-city-select">
          <label class="form-label">Select City</label>
          <select class="form-select" id="dealerCitySelector" onchange="changeDealerCity(this.value)" style="width: 100%;">
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Jaipur">Jaipur</option>
          </select>
        </div>
        
        <div class="dealer-layout">
          <div class="dealer-list" id="dealerListContainer">
            <!-- Dealers injected here -->
          </div>
          <div class="mock-map-container">
            <div class="mock-map-grid"></div>
            <div class="map-pin" id="mapPinEl" style="top: 50%; left: 50%;"></div>
            <div class="map-overlay-card">
              <div style="font-weight: 700; color: var(--accent-primary);" id="mapOverlayTitle">No Dealer Selected</div>
              <div style="color: #cbd5e1; font-size: 0.7rem; margin-top: 0.15rem;" id="mapOverlayAddr">Click a dealer card to locate on GPS.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  changeDealerCity(selectedDealerCity);
}

function changeDealerCity(city) {
  selectedDealerCity = city;
  const container = document.getElementById('dealerListContainer');
  const dealers = DEALER_DATA[city] || [
    { id: 999, name: "AutoTrust Premium Hub", rating: 4.8, phone: "+91 9999988888", address: "City Center Boulevard", type: "Multi-brand Certified", pin: { top: "45%", left: "45%" } }
  ];

  container.innerHTML = dealers.map((d, index) => `
    <div class="dealer-card" id="dealerCard-${d.id}" onclick="selectDealer(${JSON.stringify(d).replace(/"/g, '&quot;')})" style="cursor: pointer;">
      <div class="dealer-card-title">
        <span>${d.name}</span>
        <span class="dealer-card-rating">★ ${d.rating}</span>
      </div>
      <div style="font-size: 0.72rem; color: var(--accent-primary); font-weight: 600; margin-top: 0.15rem;">${d.type}</div>
      <div class="dealer-card-detail">📍 ${d.address}</div>
      <div class="dealer-card-detail" style="color: var(--accent-secondary); margin-top:0.25rem;">📞 ${d.phone}</div>
    </div>
  `).join('');

  // Default to selecting the first dealer
  if (dealers.length > 0) {
    selectDealer(dealers[0]);
  }
}

function selectDealer(dealer) {
  // Highlight active card
  document.querySelectorAll('.dealer-card').forEach(el => el.style.borderColor = 'var(--glass-border)');
  const activeCard = document.getElementById(`dealerCard-${dealer.id}`);
  if (activeCard) {
    activeCard.style.borderColor = 'var(--accent-primary)';
  }

  // Update map pin coordinates
  const pin = document.getElementById('mapPinEl');
  if (pin) {
    pin.style.top = dealer.pin.top;
    pin.style.left = dealer.pin.left;
  }

  // Update map overlay card details
  document.getElementById('mapOverlayTitle').textContent = dealer.name;
  document.getElementById('mapOverlayAddr').textContent = dealer.address;
}

// ── CAR REVIEWS MODAL ──
const REVIEW_DATABASE = {
  "Swift": [
    { user: "Rohan Sharma", rating: 5, text: "Excellent city car! Very easy to maneuver in tight traffic. The AMT automatic gearbox is very convenient. Service costs are negligible.", pros: "High mileage, cheap service", cons: "Build quality feels light" },
    { user: "Priya Patel", rating: 4, text: "Very practical and reliable. Holds its value incredibly well when selling. Standard interior is a bit plain but functional.", pros: "Great resale value, engine responsiveness", cons: "Plasty interior" }
  ],
  "i20": [
    { user: "Amit Deshmukh", rating: 5, text: "The cabin feels premium. Loaded with tech features. Smooth IVT transmission makes driving a breeze. Highly recommend the Sportz variant.", pros: "Premium cabin, smooth CVT/IVT", cons: "Slightly low fuel efficiency in heavy traffic" },
    { user: "Sunita Reddy", rating: 4, text: "Great family hatchback. Looks very sharp from the front. Legroom is excellent in the back seat.", pros: "Rear legroom, features list", cons: "Suspension is slightly stiff" }
  ],
  "Nexon EV": [
    { user: "Vikram Malhotra", rating: 5, text: "Switched from petrol and saved ₹8,000 every month on commute! Real-world range is around 310km. Charging at home is seamless.", pros: "Instant power, massive cost savings", cons: "Public fast chargers are sometimes busy" }
  ]
};

let selectedReviewModel = "Swift";
let selectedFormStars = 5;

function getReviewsForCar(model) {
  if (REVIEW_DATABASE[model]) {
    return REVIEW_DATABASE[model];
  }
  // Generate generic default reviews
  return [
    { user: "Suresh Kumar", rating: 4, text: `Great experience owning the ${model}. The ride quality is superb and fuel economy is consistent. Maintenance is reasonable.`, pros: "Reliability, cabin space", cons: "Highway sound isolation" },
    { user: "Ananya Sen", rating: 5, text: `Absolutely love this car. The styling is bold and performance is top notch. Best in class resale value as well.`, pros: "Driving dynamics, engine performance", cons: "Dealer network response time" }
  ];
}

function openCarReviewsModal() {
  const models = [...new Set(CAR_DATABASE.map(c => c.model))];

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'reviewsModal';
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  modal.innerHTML = `
    <div class="modal-box" style="max-width: 800px;">
      <div class="modal-header">
        <div class="modal-title">⭐ AutoTrust Car Reviews & Ratings</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="dealer-city-select">
          <label class="form-label">Select Car Model</label>
          <select class="form-select" id="reviewModelSelector" onchange="changeReviewModel(this.value)" style="width: 100%;">
            ${models.map(m => `<option value="${m}" ${m === selectedReviewModel ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>

        <div class="reviews-dashboard-layout">
          <div>
            <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-primary);">Owner Reviews</h4>
            <div class="reviews-list" id="reviewsListContainer">
              <!-- Reviews list injected here -->
            </div>
          </div>
          
          <div class="rating-breakdown">
            <h4 style="margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-primary);">Rating Breakdown</h4>
            <div class="rating-big-num" id="ratingBigNumEl">4.8</div>
            <div class="rating-big-stars" id="ratingBigStarsEl">★★★★★</div>
            
            <div id="ratingDistributionContainer">
              <!-- Star distribution injected here -->
            </div>

            <div class="new-review-form">
              <h5 style="margin-bottom: 0.5rem; font-size: 0.85rem; font-weight:700; color: var(--text-primary);">Write a Review</h5>
              <div class="form-group" style="margin-bottom: 0.6rem;">
                <label class="form-label">Rating</label>
                <div class="star-selector" id="formStarSelector">
                  <span onclick="setFormStars(1)">★</span>
                  <span onclick="setFormStars(2)">★</span>
                  <span onclick="setFormStars(3)">★</span>
                  <span onclick="setFormStars(4)">★</span>
                  <span onclick="setFormStars(5)" class="selected">★</span>
                </div>
              </div>
              <div class="form-group" style="margin-bottom: 0.6rem;">
                <input type="text" class="form-input" id="revName" placeholder="Your Name" style="padding: 0.5rem 0.75rem; font-size:0.85rem;" />
              </div>
              <div class="form-group" style="margin-bottom: 0.6rem;">
                <textarea class="form-input" id="revText" placeholder="Share your experience..." rows="2" style="font-family:var(--font-primary); padding: 0.5rem 0.75rem; font-size:0.85rem; resize:none;"></textarea>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; margin-bottom: 0.75rem;">
                <input type="text" class="form-input" id="revPros" placeholder="Pros (e.g. mileage)" style="padding: 0.5rem 0.75rem; font-size:0.85rem;" />
                <input type="text" class="form-input" id="revCons" placeholder="Cons (e.g. noise)" style="padding: 0.5rem 0.75rem; font-size:0.85rem;" />
              </div>
              <button class="btn-primary" onclick="submitReview()" style="width: 100%; justify-content:center; padding: 0.5rem 1rem; font-size:0.85rem;">Submit Review</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  setFormStars(5);
  changeReviewModel(selectedReviewModel);
}

function setFormStars(val) {
  selectedFormStars = val;
  const stars = document.querySelectorAll('#formStarSelector span');
  stars.forEach((s, idx) => {
    if (idx < val) {
      s.classList.add('selected');
    } else {
      s.classList.remove('selected');
    }
  });
}

function changeReviewModel(model) {
  selectedReviewModel = model;
  const reviews = getReviewsForCar(model);
  const container = document.getElementById('reviewsListContainer');

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-header">
        <span class="review-user">${r.user}</span>
        <span class="review-stars">${"★".repeat(r.rating) + "☆".repeat(5-r.rating)}</span>
      </div>
      <div class="review-text">"${r.text}"</div>
      <div class="review-pros-cons">
        <div class="review-pro">🟢 Pros: ${r.pros}</div>
        <div class="review-con">🔴 Cons: ${r.cons}</div>
      </div>
    </div>
  `).join('');

  // Calculate Average Rating
  const avg = (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  document.getElementById('ratingBigNumEl').textContent = avg;
  document.getElementById('ratingBigStarsEl').textContent = "★".repeat(Math.round(avg)) + "☆".repeat(5-Math.round(avg));

  // Rating distribution
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if(counts[r.rating] !== undefined) counts[r.rating]++; });

  const distContainer = document.getElementById('ratingDistributionContainer');
  distContainer.innerHTML = [5,4,3,2,1].map(starsCount => {
    const pct = reviews.length > 0 ? (counts[starsCount] / reviews.length) * 100 : 0;
    return `
      <div class="rating-dist-row">
        <span class="dist-label">${starsCount} ★</span>
        <div class="dist-bar">
          <div class="dist-fill" style="width: ${pct}%;"></div>
        </div>
        <span class="dist-val">${Math.round(pct)}%</span>
      </div>
    `;
  }).join('');
}

function submitReview() {
  const name = document.getElementById('revName').value.trim() || "Anonymous Owner";
  const text = document.getElementById('revText').value.trim();
  const pros = document.getElementById('revPros').value.trim() || "N/A";
  const cons = document.getElementById('revCons').value.trim() || "N/A";

  if (!text) {
    alert("Please write some comments before submitting.");
    return;
  }

  const newRev = {
    user: name,
    rating: selectedFormStars,
    text: text,
    pros: pros,
    cons: cons
  };

  // Add to DATABASE
  if (!REVIEW_DATABASE[selectedReviewModel]) {
    REVIEW_DATABASE[selectedReviewModel] = getReviewsForCar(selectedReviewModel);
  }
  REVIEW_DATABASE[selectedReviewModel].unshift(newRev); // Add to top

  // Reset Form
  document.getElementById('revName').value = '';
  document.getElementById('revText').value = '';
  document.getElementById('revPros').value = '';
  document.getElementById('revCons').value = '';
  setFormStars(5);

  // Refresh
  changeReviewModel(selectedReviewModel);
}
