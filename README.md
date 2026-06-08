# 🚗 AutoTrust — AI-Powered Pre-Owned Car Platform

> India's most trusted pre-owned car intelligence platform with real-time pricing, depreciation analytics, AI recommendations, and smart insights.

![AutoTrust Preview](images/car_black.png)

---

## ✨ Features

- **🔍 Smart Car Search** — Filter by brand, model, city, fuel type, budget, and year with AI-driven results
- **📊 Market Analytics Dashboard** — Live charts for price trends, fuel share, mileage impact, brand popularity, and depreciation curves
- **⚖️ Side-by-Side Comparison** — Compare up to 3 cars across all key specs
- **📉 Depreciation Calculator** — Estimate how any car's value changes over time
- **🤖 AI Car Advisor Chatbot** — Get personalized buying advice through conversational AI
- **🎬 3D Animated Video Background** — Immersive HLS video background powered by Mux

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Structure    | HTML5 (Semantic)                    |
| Styling      | Vanilla CSS (Glassmorphism, Grids)  |
| Logic        | Vanilla JavaScript (ES6+)          |
| Charts       | Chart.js 4.x                       |
| Fonts        | Google Fonts (Inter, Outfit)        |
| Video        | HLS.js + Mux streaming             |

---

## 📁 Project Structure

```
car-resale/
├── index.html        # Main HTML — all sections & layout
├── styles.css        # Full design system & responsive styles
├── app.js            # Core app logic, search, compare, depreciation
├── charts.js         # Chart.js dashboard initialisation
├── chatbot.js        # AI chatbot conversation engine
├── data.js           # Car listings dataset
├── images/
│   ├── car_black.png # Hero showcase image 1
│   └── car_red.png   # Hero showcase image 2
├── .gitignore        # Git ignore rules
├── LICENSE           # MIT License
└── README.md         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Any local HTTP server (optional but recommended for HLS video)

### Run Locally

**Option 1 — Using npx (recommended):**
```bash
npx serve
```

**Option 2 — Using Python:**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```


## 📸 Sections

| Section              | Description                                              |
| -------------------- | -------------------------------------------------------- |
| **Hero**             | Animated hero with car showcase carousel & quick search  |
| **Search**           | Multi-filter car search with fuel toggles & budget range |
| **Dashboard**        | 5 interactive Chart.js visualisations + KPI cards        |
| **Compare**          | Side-by-side spec comparison for up to 3 cars            |
| **Depreciation**     | Year-over-year value calculator with chart output        |
| **AI Chatbot**       | Context-aware car advisor with quick replies             |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Chart.js](https://www.chartjs.org/) — Beautiful charts
- [HLS.js](https://github.com/video-dev/hls.js/) — HLS video playback
- [Mux](https://mux.com/) — Video streaming infrastructure
- [Google Fonts](https://fonts.google.com/) — Inter & Outfit typefaces

---

<p align="center">
  <strong>© 2026 AutoTrust</strong> · AI-Powered Resale Car Intelligence Platform
</p>
