// ═══════════════════════════════════════════════
// CHATBOT.JS — AI Car Advisor Logic
// ═══════════════════════════════════════════════

let chatState = {
  step: 'idle',
  preferences: {},
  awaitingBudget: false,
  awaitingCity: false,
};

const BOT_RESPONSES = {
  greet: ["Hi there! 👋 I'm AutoIQ, your car buying advisor. What can I help you with?"],
  thanks: ["You're welcome! Happy to help you find the perfect car. 😊", "Glad I could help! Feel free to ask anything else about cars."],
  bye: ["Take care! Come back when you're ready to buy. 🚗💨", "Goodbye! Hope you find your perfect car soon!"],
};

function appendMessage(content, isUser = false, isTyping = false) {
  const msgs = document.getElementById('chatMessages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'} ${isTyping ? 'typing-indicator' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = 'bubble-avatar';
  avatar.textContent = isUser ? '👤' : '🤖';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'bubble-content';
  if (isTyping) {
    contentDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  } else {
    contentDiv.innerHTML = content;
  }

  bubble.appendChild(avatar);
  bubble.appendChild(contentDiv);
  msgs.appendChild(bubble);
  msgs.scrollTop = msgs.scrollHeight;
  return bubble;
}

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

async function processUserMessage(text) {
  try {
    const dbSummary = CAR_DATABASE.map(c => `${c.brand} ${c.model} (${c.year}) - ₹${c.resalePrice}`).join(', ');
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `You are AutoIQ, an expert AI car advisor. Please reply ONLY with nicely formatted HTML (using <p>, <ul>, <li>, <strong>, etc.). Do not include markdown code block syntax like \`\`\`html.
The user says: "${text}"

Available cars in database:
${dbSummary}

Keep your answer friendly, concise, and helpful. Focus on car buying advice based on the database.`
        }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error("Failed API Call");
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (botReply) {
      return { html: botReply.replace(/```html|```/g, '').trim() };
    }
    throw new Error("Empty Response from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return processUserMessageLocal(text);
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, true);
  input.value = '';

  const typingBubble = appendMessage('', false, true);

  const response = await processUserMessage(text);
  typingBubble.remove();
  
  appendMessage(response.html);
}

function sendQuickReply(text) {
  const input = document.getElementById('chatInput');
  input.value = text;
  sendMessage();
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendMessage();
}

function clearChat() {
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = '';
  appendMessage(`
    <p>Chat cleared! I'm ready to help you again. 🚗</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Show me cars under 10 lakh')">Cars under ₹10L</button>
      <button class="quick-reply" onclick="sendQuickReply('What car should I buy for family use')">Family cars</button>
    </div>
  `);
}

function processUserMessageLocal(text) {
  const lower = text.toLowerCase();

  // Budget extraction
  const budgetMatch = lower.match(/(\d+)\s*(lakh|l|lakhs)/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) * 100000 : null;

  // City extraction
  const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata', 'ahmedabad', 'jaipur'];
  const foundCity = cities.find(c => lower.includes(c));

  // Brand extraction
  const brands = ['maruti', 'swift', 'baleno', 'hyundai', 'creta', 'i20', 'tata', 'nexon', 'punch', 'honda', 'city', 'toyota', 'mahindra', 'kia', 'seltos', 'volkswagen', 'mg', 'hector'];
  const foundBrand = brands.filter(b => lower.includes(b));

  // Intent detection
  if (lower.includes('emi') || lower.includes('loan')) return handleEMI(text, budget);
  if (lower.includes('electric') || lower.includes('ev')) return handleElectric();
  if (lower.includes('compare') || lower.includes('vs')) return handleCompareIntent(text);
  if (lower.includes('depreciation') || lower.includes('value drop') || lower.includes('resale value')) return handleDepreciation(text);
  if (lower.includes('maintenance') || lower.includes('service cost')) return handleMaintenance(text);
  if (lower.includes('best') && lower.includes('family')) return handleFamilyCars();
  if (lower.includes('city') && !foundCity) return handleCityDriving();
  if (lower.includes('low maintenance')) return handleLowMaintenance();
  if (lower.includes('first car') || lower.includes('beginner')) return handleFirstCar();
  if (lower.includes('diesel')) return handleDiesel(budget);
  if (lower.includes('cng')) return handleCNG();
  if (lower.includes('suv')) return handleSUV(budget);
  if (budget && foundCity) return handleBudgetCitySearch(budget, foundCity, text);
  if (budget) return handleBudgetSearch(budget, text);
  if (lower.includes('recommend') || lower.includes('suggest')) return handleRecommendation();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return handleGreet();
  if (lower.includes('thanks') || lower.includes('thank you')) return { html: BOT_RESPONSES.thanks[Math.floor(Math.random() * 2)] };
  if (lower.includes('bye') || lower.includes('goodbye')) return { html: BOT_RESPONSES.bye[Math.floor(Math.random() * 2)] };
  if (lower.includes('dealer') || lower.includes('showroom')) return handleDealer(foundCity);

  // Default to smart response
  return handleGeneral(text);
}

function handleGreet() {
  return { html: `
    <p>Hello! 👋 Welcome to <strong>AutoIQ</strong> – your AI-powered car shopping assistant!</p>
    <p>Here's what I can help you with:</p>
    <ul>
      <li>🔍 Find cars matching your budget & preferences</li>
      <li>📊 Analyze depreciation and fair market pricing</li>
      <li>⚖️ Compare multiple cars side-by-side</li>
      <li>💰 Calculate EMI and ownership costs</li>
      <li>🔧 Estimate maintenance expenses</li>
    </ul>
    <p>What are you looking for today?</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Find me a car under 8 lakh in Bangalore')">Cars under ₹8L</button>
      <button class="quick-reply" onclick="sendQuickReply('Best family SUV under 20 lakh')">Family SUV</button>
      <button class="quick-reply" onclick="sendQuickReply('Show me electric cars available')">Electric Cars</button>
    </div>
  ` };
}

function handleBudgetCitySearch(budget, city, text) {
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const filtered = CAR_DATABASE.filter(c => c.resalePrice <= budget * 1.05);
  const results = filtered.slice(0, 3);

  if (results.length === 0) {
    return { html: `
      <p>😔 I couldn't find cars under <strong>${formatINR(budget)}</strong> in our database right now. Here's what I'd suggest:</p>
      <ul>
        <li>📈 Consider increasing your budget by ₹1–2L for better options</li>
        <li>🔄 Try nearby cities like Mumbai, Delhi, or Bangalore</li>
        <li>⏳ Diesel cars often depreciate more – great value opportunity!</li>
      </ul>
    ` };
  }

  const cardList = results.map(car => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;margin-top:0.6rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${car.emoji} ${car.brand} ${car.model}</strong>
        <span style="color:#00d4aa;font-weight:700;">${formatINR(car.resalePrice)}</span>
      </div>
      <div style="color:#94a3b8;font-size:0.82rem;margin-top:0.3rem;">${car.year} · ${(car.km/1000).toFixed(0)}k km · ${car.fuel} · ${car.ownership} owner</div>
      <div style="margin-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${car.tags.map(t => `<span style="background:rgba(0,212,170,0.1);color:#00d4aa;padding:0.15rem 0.5rem;border-radius:50px;font-size:0.72rem;">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');

  return { html: `
    <p>🎯 Found <strong>${filtered.length} cars</strong> under <strong>${formatINR(budget)}</strong>${city ? ` near <strong>${cityName}</strong>` : ''}! Here are the top picks:</p>
    ${cardList}
    <p style="margin-top:0.75rem;color:#94a3b8;font-size:0.85rem;">📌 Tip: Check the full dashboard above for interactive charts and detailed comparison!</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Tell me more about the cheapest option')">Cheapest option details</button>
      <button class="quick-reply" onclick="sendQuickReply('Calculate EMI for these cars')">Calculate EMI</button>
    </div>
  ` };
}

function handleBudgetSearch(budget, text) {
  const filtered = CAR_DATABASE.filter(c => c.resalePrice <= budget * 1.1).sort((a,b) => b.rating - a.rating);

  if (filtered.length === 0) {
    return { html: `<p>I couldn't find cars exactly in that range. Could you share your preferred city too? That helps me narrow it down better.</p>` };
  }

  const top = filtered[0];
  const options = filtered.slice(0, 4);

  return { html: `
    <p>📊 I found <strong>${filtered.length} cars</strong> under <strong>${formatINR(budget)}</strong>! My top recommendation is:</p>
    <div style="background:rgba(0,212,170,0.06);border:1px solid rgba(0,212,170,0.2);border-radius:14px;padding:1rem;margin:0.75rem 0;">
      <div style="font-size:1.1rem;font-weight:700;">${top.emoji} ${top.brand} ${top.model} ${top.variant}</div>
      <div style="color:#94a3b8;font-size:0.85rem;margin:0.3rem 0;">${top.year} · ${(top.km/1000).toFixed(0)}k km · ${top.fuel} · ${top.ownership} Owner</div>
      <div style="color:#00d4aa;font-size:1.2rem;font-weight:800;">${formatINR(top.resalePrice)} <span style="color:#4a5568;font-size:0.8rem;font-weight:400;text-decoration:line-through;">${formatINR(top.originalPrice)}</span></div>
      <div style="margin-top:0.5rem;color:#10b981;font-size:0.82rem;font-weight:600;">💰 Savings: ${formatINR(top.originalPrice - top.resalePrice)} (${Math.round((top.originalPrice - top.resalePrice)/top.originalPrice*100)}% off original)</div>
    </div>
    <p>Other good options in this range:</p>
    <ul>${options.slice(1).map(c => `<li>${c.emoji} <strong>${c.brand} ${c.model}</strong> – ${formatINR(c.resalePrice)} (${c.year})</li>`).join('')}</ul>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('What is the EMI for the top pick')">EMI for top pick</button>
      <button class="quick-reply" onclick="sendQuickReply('Show maintenance costs')">Maintenance costs</button>
    </div>
  ` };
}

function handleEMI(text, budget) {
  const amount = budget || 800000;
  const rates = { '12': 0.012, '24': 0.009, '36': 0.007 };

  function calcEMI(principal, rate, months) {
    const r = rate / 12;
    return Math.round(principal * r * Math.pow(1+r, months) / (Math.pow(1+r, months) - 1));
  }

  const emi12 = calcEMI(amount * 0.85, rates['12'], 12);
  const emi24 = calcEMI(amount * 0.85, rates['24'], 24);
  const emi36 = calcEMI(amount * 0.85, rates['36'], 36);

  return { html: `
    <p>💳 <strong>EMI Estimate</strong> for <strong>${formatINR(amount)}</strong></p>
    <p style="color:#94a3b8;font-size:0.82rem;">(Assuming 85% financing at competitive interest rates)</p>
    <div style="margin-top:0.75rem;">
      <div style="display:grid;gap:0.5rem;">
        <div style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);border-radius:10px;padding:0.75rem;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 12 Months</span>
          <strong style="color:#00d4aa;">${formatINR(emi12)}/month</strong>
        </div>
        <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:0.75rem;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 24 Months</span>
          <strong style="color:#a78bfa;">${formatINR(emi24)}/month</strong>
        </div>
        <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:0.75rem;display:flex;justify-content:space-between;align-items:center;">
          <span>📅 36 Months</span>
          <strong style="color:#f59e0b;">${formatINR(emi36)}/month</strong>
        </div>
      </div>
    </div>
    <p style="margin-top:0.75rem;font-size:0.82rem;color:#94a3b8;">💡 Tip: Most banks offer 7.5%–12% interest on used car loans. Compare SBI, HDFC, and ICICI for best rates!</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('What documents do I need for car loan')">Documents needed</button>
    </div>
  ` };
}

function handleElectric() {
  const evCars = CAR_DATABASE.filter(c => c.fuel === 'Electric');
  return { html: `
    <p>⚡ <strong>Electric Cars</strong> – The Smart Future Choice!</p>
    <p>Here are the EVs available right now:</p>
    ${evCars.map(car => `
      <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:0.85rem;margin-top:0.5rem;">
        <div style="font-weight:700;">${car.emoji} ${car.brand} ${car.model} ${car.variant}</div>
        <div style="color:#94a3b8;font-size:0.82rem;">${car.year} · ${(car.km/1000).toFixed(0)}k km · ⚡ Electric · ${car.ownership} Owner</div>
        <div style="color:#3b82f6;font-weight:700;font-size:1.1rem;margin-top:0.3rem;">${formatINR(car.resalePrice)}</div>
      </div>
    `).join('')}
    <br>
    <p><strong>🌟 Why go Electric?</strong></p>
    <ul>
      <li>⚡ Fuel savings: ₹4–6k/month vs ₹8–12k on petrol</li>
      <li>🔧 Very low maintenance (no engine oil, fewer moving parts)</li>
      <li>🌍 Zero emission – better for the environment</li>
      <li>📈 Government subsidies & tax benefits available</li>
    </ul>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Compare Nexon EV vs MG ZS EV')">Compare EVs</button>
      <button class="quick-reply" onclick="sendQuickReply('EV charging infrastructure India')">Charging info</button>
    </div>
  ` };
}

function handleCompareIntent(text) {
  const lower = text.toLowerCase();
  const mentionedCars = [];
  CAR_DATABASE.forEach(c => {
    if (lower.includes(c.model.toLowerCase()) || lower.includes(c.brand.toLowerCase())) {
      mentionedCars.push(c);
    }
  });

  const cars = mentionedCars.slice(0, 2);
  if (cars.length < 2) {
    return { html: `
      <p>🔄 I'd love to compare cars for you! Here are some popular comparisons:</p>
      <div class="quick-replies">
        <button class="quick-reply" onclick="sendQuickReply('Compare Swift vs Baleno vs i20')">Swift vs Baleno vs i20</button>
        <button class="quick-reply" onclick="sendQuickReply('Compare Creta vs Seltos vs Nexon')">Creta vs Seltos vs Nexon</button>
        <button class="quick-reply" onclick="sendQuickReply('Compare Nexon EV vs Tata Punch EV')">Nexon EV vs Punch EV</button>
      </div>
    ` };
  }

  const [c1, c2] = cars;
  return { html: `
    <p>⚖️ <strong>${c1.brand} ${c1.model}</strong> vs <strong>${c2.brand} ${c2.model}</strong></p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin:0.75rem 0;">
      ${[c1,c2].map(c => `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;text-align:center;">
          <div style="font-size:2rem;">${c.emoji}</div>
          <div style="font-weight:700;margin-top:0.25rem;">${c.brand} ${c.model}</div>
          <div style="color:#00d4aa;font-weight:700;">${formatINR(c.resalePrice)}</div>
          <div style="color:#94a3b8;font-size:0.78rem;">${c.year} · ${(c.km/1000).toFixed(0)}k km</div>
          <div style="color:#94a3b8;font-size:0.78rem;">${c.fuel} · ${c.ownership} Owner</div>
          <div style="margin-top:0.4rem;font-size:0.78rem;"><strong>${c.verdict}</strong> Pricing</div>
        </div>
      `).join('')}
    </div>
    <p><strong>🏆 My Pick: ${c1.resalePrice < c2.resalePrice ? c1.brand + ' ' + c1.model : c2.brand + ' ' + c2.model}</strong></p>
    <p style="color:#94a3b8;font-size:0.85rem;">For a detailed feature-by-feature comparison, use the Compare section above! ☝️</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="scrollToSection('compare')">Open Compare Tool</button>
    </div>
  ` };
}

function handleDepreciation(text) {
  return { html: `
    <p>📉 <strong>How Car Depreciation Works in India</strong></p>
    <ul>
      <li>📅 <strong>Year 1:</strong> Biggest drop – 15–22% of value lost just by registering</li>
      <li>📅 <strong>Year 2–3:</strong> Another 10–15% depreciation per year</li>
      <li>📅 <strong>Year 4–6:</strong> Slows to 7–10% per year</li>
      <li>📅 <strong>Year 7+:</strong> 4–6% per year – value stabilizes</li>
    </ul>
    <br>
    <p><strong>🚀 Low Depreciation Cars (Hold Value Well):</strong></p>
    <ul>
      <li>🥇 Toyota Innova – loses only ~12% in Year 1</li>
      <li>🥈 Maruti Swift – consistent demand keeps value high</li>
      <li>🥉 Hyundai Creta – premium appeal, holds well</li>
    </ul>
    <p style="margin-top:0.5rem;color:#94a3b8;font-size:0.85rem;">💡 Use the <strong>Depreciation Calculator</strong> section above to calculate exact values for any car!</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="scrollToSection('depreciation')">Open Calculator</button>
      <button class="quick-reply" onclick="sendQuickReply('Which cars have lowest depreciation')">Low depreciation cars</button>
    </div>
  ` };
}

function handleMaintenance(text) {
  return { html: `
    <p>🔧 <strong>Annual Maintenance Cost Estimates</strong></p>
    <div style="display:grid;gap:0.5rem;margin-top:0.5rem;">
      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:0.75rem;">
        <strong style="color:#10b981;">💚 Very Low</strong> (₹5,000–₹10,000/year)
        <div style="color:#94a3b8;font-size:0.82rem;">Electric vehicles, Maruti CNG models</div>
      </div>
      <div style="background:rgba(0,212,170,0.06);border:1px solid rgba(0,212,170,0.2);border-radius:10px;padding:0.75rem;">
        <strong style="color:#00d4aa;">🟢 Low</strong> (₹10,000–₹18,000/year)
        <div style="color:#94a3b8;font-size:0.82rem;">Maruti Swift, Baleno, Alto – small petrol cars</div>
      </div>
      <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:0.75rem;">
        <strong style="color:#f59e0b;">🟡 Medium</strong> (₹18,000–₹30,000/year)
        <div style="color:#94a3b8;font-size:0.82rem;">Hyundai i20, Creta, Kia Seltos, Honda City</div>
      </div>
      <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:0.75rem;">
        <strong style="color:#ef4444;">🔴 High</strong> (₹35,000–₹60,000+/year)
        <div style="color:#94a3b8;font-size:0.82rem;">MG Hector, Volkswagen Taigun, luxury brands</div>
      </div>
    </div>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Best low maintenance cars under 10 lakh')">Low maintenance under ₹10L</button>
    </div>
  ` };
}

function handleFamilyCars() {
  const familyCars = CAR_DATABASE.filter(c => ['Innova Crysta', 'XUV700', 'Creta', 'Hector', 'Harrier'].includes(c.model));
  return { html: `
    <p>👨‍👩‍👧‍👦 <strong>Best Family Cars – My Top Picks!</strong></p>
    ${familyCars.map(c => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;margin-top:0.5rem;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:700;">${c.emoji} ${c.brand} ${c.model}</div>
          <div style="color:#94a3b8;font-size:0.82rem;">${c.year} · ${c.fuel} · ${(c.km/1000).toFixed(0)}k km</div>
          <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-top:0.3rem;">${c.tags.map(t=>`<span style="background:rgba(0,212,170,0.1);color:#00d4aa;padding:0.1rem 0.4rem;border-radius:50px;font-size:0.7rem;">${t}</span>`).join('')}</div>
        </div>
        <div style="color:#00d4aa;font-weight:800;font-size:1.1rem;">${formatINR(c.resalePrice)}</div>
      </div>
    `).join('')}
    <p style="margin-top:0.75rem;font-size:0.85rem;color:#94a3b8;">💡 For large families: Innova Crysta 7-seater is unbeatable. For SUV experience: XUV700 or Harrier.</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('EMI for XUV700')">EMI for XUV700</button>
      <button class="quick-reply" onclick="sendQuickReply('Compare Creta vs Harrier')">Creta vs Harrier</button>
    </div>
  ` };
}

function handleCityDriving() {
  return { html: `
    <p>🏙️ <strong>Best Cars for City Driving!</strong></p>
    <ul>
      <li>🥇 <strong>Maruti Swift</strong> – Nimble, easy to park, great mileage</li>
      <li>🥈 <strong>Tata Punch</strong> – High ground clearance for bad roads</li>
      <li>🥉 <strong>Honda Jazz</strong> – Magic seats, very spacious inside</li>
      <li>⚡ <strong>Tata Nexon EV</strong> – Zero fuel cost for city commutes</li>
      <li>💨 <strong>Maruti Ertiga CNG</strong> – ₹1.5/km running cost!</li>
    </ul>
    <p style="margin-top:0.5rem;color:#94a3b8;font-size:0.85rem;">Key city car features: <strong>tight turning radius, good boot space, under-body clearance, fuel efficiency</strong></p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Cheapest city car with automatic transmission')">Cheap automatic city car</button>
    </div>
  ` };
}

function handleLowMaintenance() {
  return { html: `
    <p>🔧 <strong>Lowest Maintenance Cars in India</strong></p>
    <div style="margin-top:0.5rem;">
      <div style="font-weight:700;margin-bottom:0.4rem;">⚡ Electric Cars (₹5K–₹10K/year):</div>
      <ul><li>Tata Nexon EV, Tata Tiago EV – no engine oil, fewer parts</li></ul>
      <div style="font-weight:700;margin-top:0.5rem;margin-bottom:0.4rem;">💨 CNG Cars (₹8K–₹12K/year):</div>
      <ul><li>Maruti Ertiga CNG, Wagon R CNG – cheap fuel + low service cost</li></ul>
      <div style="font-weight:700;margin-top:0.5rem;margin-bottom:0.4rem;">🚗 Petrol Hatchbacks (₹10K–₹18K/year):</div>
      <ul><li>Maruti Swift, Alto K10 – massive service network nationwide</li></ul>
    </div>
    <p style="margin-top:0.5rem;font-size:0.85rem;color:#94a3b8;">📍 Maruti has the best service network with 4,200+ service centers across India – parts are affordable everywhere!</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Find me a low maintenance car under 7 lakh')">Low maintenance under ₹7L</button>
    </div>
  ` };
}

function handleFirstCar() {
  return { html: `
    <p>🎉 <strong>Buying Your First Car? Here's My Advice!</strong></p>
    <p><strong>🏆 Top First Car Picks:</strong></p>
    <ul>
      <li>1️⃣ <strong>Maruti Swift (2022–23)</strong> – Easy to drive, service everywhere, great resale</li>
      <li>2️⃣ <strong>Hyundai i20</strong> – More premium feel, loaded features</li>
      <li>3️⃣ <strong>Tata Punch</strong> – Safest car in segment (5-star GNCAP)</li>
      <li>4️⃣ <strong>Honda Amaze</strong> – Spacious, comfortable, reliability king</li>
    </ul>
    <p><strong>✅ What to check before buying:</strong></p>
    <ul>
      <li>📋 Get an RC check (verify registration certificate)</li>
      <li>🔫 Check for accident history / flood damage</li>
      <li>🔧 Get independent inspection from trusted mechanic</li>
      <li>📑 Verify insurance validity and no pending loans</li>
      <li>🏦 Prefer 1st owner cars for better peace of mind</li>
    </ul>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Show me Swift and Punch comparison')">Swift vs Punch</button>
      <button class="quick-reply" onclick="sendQuickReply('How to check if a used car is good')">Inspection checklist</button>
    </div>
  ` };
}

function handleDiesel(budget) {
  const dieselCars = CAR_DATABASE.filter(c => c.fuel === 'Diesel' && (!budget || c.resalePrice <= budget * 1.1));
  return { html: `
    <p>🛢️ <strong>Diesel Cars Available${budget ? ` under ${formatINR(budget)}` : ''}</strong></p>
    ${dieselCars.map(c => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;margin-top:0.5rem;">
        <div style="font-weight:700;">${c.emoji} ${c.brand} ${c.model} – ${formatINR(c.resalePrice)}</div>
        <div style="color:#94a3b8;font-size:0.82rem;">${c.year} · ${(c.km/1000).toFixed(0)}k km · 🛢️ Diesel · ${c.ownership} Owner · ${c.location}</div>
      </div>
    `).join('')}
    <p style="margin-top:0.75rem;font-size:0.85rem;">💡 <strong>Diesel is ideal for:</strong> Highway driving, >1500 km/month usage, large families needing torque. Not recommended for pure city use.</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Diesel vs petrol which is better for me')">Diesel vs Petrol advice</button>
    </div>
  ` };
}

function handleCNG() {
  const cngCars = CAR_DATABASE.filter(c => c.fuel === 'CNG');
  return { html: `
    <p>💨 <strong>CNG Cars – Lowest Running Cost!</strong></p>
    ${cngCars.map(c => `
    <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:0.85rem;margin-top:0.5rem;">
      <div style="font-weight:700;">${c.emoji} ${c.brand} ${c.model} – ${formatINR(c.resalePrice)}</div>
      <div style="color:#94a3b8;font-size:0.82rem;">${c.year} · ${(c.km/1000).toFixed(0)}k km · 💨 CNG · ${c.location}</div>
    </div>
    `).join('')}
    <p style="margin-top:0.75rem;font-size:0.85rem;color:#94a3b8;">🏆 CNG running cost is just ₹1.5–₹2/km vs ₹8–12/km for petrol – massive savings for high daily mileage!</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('CNG fitting cost for used car')">Aftermarket CNG cost</button>
    </div>
  ` };
}

function handleSUV(budget) {
  const suvs = CAR_DATABASE.filter(c => ['Nexon', 'XUV700', 'Seltos', 'Creta', 'Hector', 'Harrier', 'Punch'].includes(c.model) && (!budget || c.resalePrice <= budget * 1.1));
  return { html: `
    <p>🚙 <strong>SUVs Available${budget ? ` under ${formatINR(budget)}` : ''}</strong></p>
    ${suvs.slice(0,4).map(c => `
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.85rem;margin-top:0.5rem;">
        <div style="display:flex;justify-content:space-between;">
          <div>
            <div style="font-weight:700;">${c.emoji} ${c.brand} ${c.model}</div>
            <div style="color:#94a3b8;font-size:0.82rem;">${c.year} · ${c.fuel} · ${(c.km/1000).toFixed(0)}k km</div>
          </div>
          <div style="color:#00d4aa;font-weight:700;">${formatINR(c.resalePrice)}</div>
        </div>
      </div>
    `).join('')}
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Which SUV has best safety rating')">Safest SUV</button>
      <button class="quick-reply" onclick="sendQuickReply('Best 7 seater SUV under 20 lakh')">7-seater SUV</button>
    </div>
  ` };
}

function handleDealer(city) {
  return { html: `
    <p>🏪 <strong>Finding a Reliable Dealer</strong></p>
    <p>Here are the most trusted certified dealer networks:</p>
    <ul>
      <li>🔵 <strong>Maruti True Value</strong> – 1,500+ centers, certified pre-owned Marutis</li>
      <li>🔴 <strong>Hyundai H Promise</strong> – Certified with 150-point inspection</li>
      <li>🟠 <strong>Tata Assured</strong> – Certified Tata vehicles</li>
      <li>🟢 <strong>Toyota U Trust</strong> – Premium pre-owned Toyotas</li>
      <li>⚫ <strong>Spinny, Cars24, CarDekho</strong> – Online platforms with home delivery</li>
    </ul>
    <p style="margin-top:0.5rem;font-size:0.85rem;color:#94a3b8;">✅ Always prefer certified pre-owned (CPO) dealers – they offer warranty, inspection reports, and standardized pricing.</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('What questions to ask a car dealer')">Questions for dealer</button>
    </div>
  ` };
}

function handleRecommendation() {
  return { html: `
    <p>🌟 <strong>My Top AI Recommendations Right Now!</strong></p>
    <div style="margin-top:0.5rem;display:flex;flex-direction:column;gap:0.5rem;">
      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:0.85rem;">
        <div style="color:#10b981;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;">🏆 Best Value for Money</div>
        <div style="font-weight:700;margin-top:0.25rem;">Maruti Suzuki Baleno Alpha CVT (2023)</div>
        <div style="color:#94a3b8;font-size:0.82rem;">₹9.1L · 12k km · Almost New · Low Ownership Cost</div>
      </div>
      <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:0.85rem;">
        <div style="color:#f59e0b;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;">🏙️ Best City Car</div>
        <div style="font-weight:700;margin-top:0.25rem;">Tata Punch Accomplished AMT (2022)</div>
        <div style="color:#94a3b8;font-size:0.82rem;">₹7.2L · Compact SUV · 5-Star Safety · Auto</div>
      </div>
      <div style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:0.85rem;">
        <div style="color:#3b82f6;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.5px;">⚡ Best EV Deal</div>
        <div style="font-weight:700;margin-top:0.25rem;">Tata Nexon EV Max XZ+ (2023)</div>
        <div style="color:#94a3b8;font-size:0.82rem;">₹15.2L · 437km Range · Lowest Running Cost</div>
      </div>
    </div>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Tell me more about Baleno')">Baleno details</button>
      <button class="quick-reply" onclick="sendQuickReply('Tell me more about Nexon EV')">Nexon EV details</button>
    </div>
  ` };
}

function handleGeneral(text) {
  const responses = [
    `<p>That's a great question! 🤔 Let me help you with that. Could you share:</p>
    <ul><li>💰 Your budget range?</li><li>📍 Your city?</li><li>⛽ Preferred fuel type?</li></ul>
    <p>With that info, I can give you much better recommendations!</p>`,

    `<p>I'd love to help with that! 🚗 For the best car recommendations, it helps to know a few things:</p>
    <ul><li>Is this for daily commute or highway travel?</li><li>How many people will typically ride?</li><li>What's your monthly budget for EMI?</li></ul>`,

    `<p>Interesting! Let me get you the most relevant information. Here are some quick actions:</p>
    <div class="quick-replies">
      <button class="quick-reply" onclick="sendQuickReply('Best car under 10 lakh in India 2024')">Best under ₹10L</button>
      <button class="quick-reply" onclick="sendQuickReply('Show me all available listings')">All listings</button>
      <button class="quick-reply" onclick="sendQuickReply('What should I check before buying a used car')">Buying checklist</button>
    </div>`,
  ];
  return { html: responses[Math.floor(Math.random() * responses.length)] };
}
