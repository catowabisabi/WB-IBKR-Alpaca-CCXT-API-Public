export const getFrontPageHTML = () => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title id="pageTitle">WealthBehave</title>
        <style>
          :root {
            --primary-color: #007bff; /* A vibrant blue */
            --primary-hover-color: #0056b3;
            --secondary-color: #17a2b8; /* A teal/cyan for accents */
            --dark-bg: #121212; /* Dark background for high-tech feel */
            --light-bg: #1e1e1e; /* Slightly lighter dark for elements */
            --text-color: #e0e0e0;
            --text-muted-color: #a0a0a0;
            --border-color: #333333;
            --font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --font-family-chinese: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
          }

          body {
            font-family: var(--font-family);
            margin: 0;
            padding: 0;
            background: var(--dark-bg);
            color: var(--text-color);
            line-height: 1.7;
            font-size: 16px;
          }

          body[lang="zh-TW"], body[lang="zh-CN"] {
            font-family: var(--font-family-chinese), var(--font-family);
          }

          .container {
            width: 90%;
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 15px;
          }

          /* Navbar */
          .navbar {
            background: rgba(30, 30, 30, 0.85); /* Semi-transparent dark */
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-color);
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            transition: background 0.3s ease;
          }

          .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .navbar .brand {
            font-weight: bold;
            font-size: 1.8rem;
            color: var(--primary-color);
            text-decoration: none;
          }
          .navbar .brand span {
            font-weight: normal;
            color: var(--text-muted-color);
            font-size: 1.2rem;
          }

          .nav-links {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            align-items: center;
          }

          .nav-links li {
            margin-left: 20px;
          }

          .nav-links a, .lang-switcher button {
            color: var(--text-muted-color);
            text-decoration: none;
            font-size: 0.95rem;
            padding: 8px 12px;
            border-radius: 4px;
            transition: color 0.3s ease, background-color 0.3s ease;
            background: none;
            border: none;
            cursor: pointer;
            font-family: inherit;
          }

          .nav-links a:hover, .lang-switcher button:hover, .nav-links a.active, .lang-switcher button.active {
            color: var(--primary-color);
            background-color: rgba(0, 123, 255, 0.1);
          }

          /* Hero Section */
          .hero {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding-top: 120px; /* Space for fixed navbar */
            padding-bottom: 60px;
            background: linear-gradient(rgba(18, 18, 18, 0.8), rgba(18, 18, 18, 0.95)), url('https://images.unsplash.com/photo-1649003515353-c58a239cf662?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') no-repeat center center/cover;
            /* Placeholder image - replace with a more fitting high-tech finance image if possible */
          }

          .hero-content h1 {
            font-size: 3.5rem;
            margin-bottom: 0.5rem;
            color: #fff;
            font-weight: 700;
          }
          .hero-content .highlight {
            color: var(--primary-color);
          }
          .hero-content .subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            color: var(--text-muted-color);
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
          }
          .hero-content .brand-name {
            font-weight: bold;
          }

          .cta-button {
            background: var(--primary-color);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            font-size: 1.1rem;
            border-radius: 50px; /* Pill shape */
            transition: background-color 0.3s ease, transform 0.2s ease;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
          }

          .cta-button:hover {
            background-color: var(--primary-hover-color);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
          }

          /* Content Sections */
          .section {
            padding: 80px 0;
            text-align: center;
          }
          .section:nth-child(even) {
             background: var(--light-bg);
          }

          .section-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
          }
          .section-subtitle {
            font-size: 1.2rem;
            color: var(--text-muted-color);
            margin-bottom: 3rem;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            text-align: left;
          }

          .feature-item {
            background: var(--light-bg);
            padding: 2rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .section:nth-child(even) .feature-item {
            background: var(--dark-bg); /* Contrast with section bg */
          }

          .feature-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }

          .feature-item h3 {
            font-size: 1.5rem;
            color: var(--secondary-color);
            margin-bottom: 0.75rem;
          }
          .feature-item p {
            font-size: 1rem;
            color: var(--text-muted-color);
            line-height: 1.6;
          }

          /* Footer */
          .footer {
            background: var(--dark-bg);
            color: var(--text-muted-color);
            padding: 3rem 0;
            text-align: center;
            border-top: 1px solid var(--border-color);
            font-size: 0.9rem;
          }

          /* Responsive */
          @media (max-width: 992px) {
            .hero-content h1 {
              font-size: 2.8rem;
            }
            .hero-content .subtitle {
              font-size: 1.3rem;
            }
          }

          @media (max-width: 768px) {
            .navbar-container {
              flex-direction: column;
              align-items: flex-start;
            }
            .nav-links {
              margin-top: 1rem;
              width: 100%;
              flex-direction: column;
              align-items: flex-start;
            }
            .nav-links li {
              margin-left: 0;
              margin-bottom: 0.5rem;
              width: 100%;
            }
            .nav-links a, .lang-switcher button {
              display: block; /* Full width for easier tapping */
              padding: 10px;
            }
            .lang-switcher {
              width: 100%;
              margin-top: 10px;
            }
            .lang-switcher button {
              margin-right: 5px;
            }

            .hero {
              min-height: 70vh;
              padding-top: 180px; /* Adjust for taller mobile navbar */
            }
            .hero-content h1 {
              font-size: 2.2rem;
            }
            .hero-content .subtitle {
              font-size: 1.1rem;
            }
            .section-title {
              font-size: 2rem;
            }
            .section-subtitle {
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
             .hero-content h1 {
              font-size: 1.8rem;
            }
            .hero-content .subtitle {
              font-size: 1rem;
            }
            .cta-button {
              padding: 12px 25px;
              font-size: 1rem;
            }
          }

        </style>
      </head>
      <body data-lang="en"> <nav class="navbar">
          <div class="container navbar-container">
            <a href="#" class="brand" data-translate-key="brand_name">WealthBehave <span data-translate-key="brand_suffix">維必喜</span></a>
            <ul class="nav-links">
              <li class="lang-switcher">
                <button type="button" data-lang="en" class="active">EN</button>
                <button type="button" data-lang="zh-TW">繁體</button>
                <button type="button" data-lang="zh-CN">简体</button>
              </li>
              </ul>
          </div>
        </nav>

        <header class="hero">
          <div class="container hero-content">
            <h1 data-translate-key="hero_title">
              <span class="highlight" data-translate-key="hero_title_highlight_1">Automate</span> Your Trades,
              <br class="responsive-break"/>
              <span class="highlight" data-translate-key="hero_title_highlight_2">Amplify</span> Your Success with <span class="brand-name">WealthBehave</span>
            </h1>
            <p class="subtitle" data-translate-key="hero_subtitle">
              Seamlessly connect TradingView alerts to your brokerage accounts. Execute orders instantly, manage risk, and stay ahead with our intelligent, automated trading backend.
            </p>
            <a href="#features" class="cta-button" data-translate-key="hero_cta">Discover How It Works</a>
          </div>
        </header>

        <section id="features" class="section">
          <div class="container">
            <h2 class="section-title" data-translate-key="features_title">Why Choose WealthBehave?</h2>
            <p class="section-subtitle" data-translate-key="features_subtitle">
              Empowering traders with speed, reliability, and cutting-edge technology. Take control of your algorithmic trading strategies like never before.
            </p>
            <div class="features-grid">
              <div class="feature-item">
                <h3 data-translate-key="feature_1_title">Instant Webhook Execution</h3>
                <p data-translate-key="feature_1_desc">Receive TradingView webhook signals and execute orders in milliseconds. Never miss a market opportunity due to delays.</p>
              </div>
              <div class="feature-item">
                <h3 data-translate-key="feature_2_title">Multi-Broker & Exchange Support</h3>
                <p data-translate-key="feature_2_desc">Connect with a growing list of popular brokers and exchanges. Manage your portfolio across multiple platforms from one central hub.</p>
              </div>
              <div class="feature-item">
                <h3 data-translate-key="feature_3_title">Secure & Reliable</h3>
                <p data-translate-key="feature_3_desc">Built with security at its core. Your strategies and API keys are handled with enterprise-grade encryption and protocols.</p>
              </div>
              <div class="feature-item">
                <h3 data-translate-key="feature_4_title">Real-time Notifications</h3>
                <p data-translate-key="feature_4_desc">Stay informed with instant Telegram notifications for order placements, errors, and system status updates.</p>
              </div>
              <div class="feature-item">
                <h3 data-translate-key="feature_5_title">Advanced Order Management</h3>
                <p data-translate-key="feature_5_desc">Support for complex order types, risk management parameters, and customizable strategy settings.</p>
              </div>
              <div class="feature-item">
                <h3 data-translate-key="feature_6_title">For Every Trader</h3>
                <p data-translate-key="feature_6_desc">Whether you're a seasoned algo-trader or a quantitative enthusiast, WealthBehave provides the tools you need to succeed.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="section cta-section" style="background: var(--light-bg);">
             <div class="container">
                <h2 class="section-title" data-translate-key="cta_title">Ready to Elevate Your Trading?</h2>
                <p class="section-subtitle" data-translate-key="cta_subtitle">
                    Join the forefront of automated trading. Experience the WealthBehave difference today and transform your trading strategies into consistent results.
                </p>
                <a href="mailto:support@wealthbehave.com?subject=Inquiry%20about%20WealthBehave" class="cta-button" data-translate-key="cta_button_contact">Contact Us For Early Access</a>
                </div>
        </section>


        <footer class="footer">
          <div class="container">
            <p data-translate-key="footer_text">&copy; ${new Date().getFullYear()} WealthBehave. All Rights Reserved. Your Trusted Partner in Automated Trading.</p>
            <p><a href="#" data-translate-key="privacy_policy">Privacy Policy</a> | <a href="#" data-translate-key="terms_of_service">Terms of Service</a></p>
          </div>
        </footer>

        <script>
          const translations = {
            en: {
              pageTitle: "WealthBehave | Automated Trading Powerhouse",
              brand_name: "WealthBehave",
              brand_suffix: "AutoTrader",
              nav_features: "Features",
              nav_contact: "Contact",
              hero_title: "<span class='highlight'>Automate</span> Your Trades, <br class='responsive-break'/><span class='highlight'>Amplify</span> Your Success with <span class='brand-name'>WealthBehave</span>",
              hero_title_highlight_1: "Automate",
              hero_title_highlight_2: "Amplify",
              hero_subtitle: "Seamlessly connect TradingView alerts to your brokerage accounts. Execute orders instantly, manage risk, and stay ahead with our intelligent, automated trading backend.",
              hero_cta: "Discover How It Works",
              features_title: "Why Choose WealthBehave?",
              features_subtitle: "Empowering traders with speed, reliability, and cutting-edge technology. Take control of your algorithmic trading strategies like never before.",
              feature_1_title: "Instant Webhook Execution",
              feature_1_desc: "Receive TradingView webhook signals and execute orders in milliseconds. Never miss a market opportunity due to delays.",
              feature_2_title: "Multi-Broker & Exchange Support",
              feature_2_desc: "Connect with a growing list of popular brokers and exchanges. Manage your portfolio across multiple platforms from one central hub.",
              feature_3_title: "Secure & Reliable",
              feature_3_desc: "Built with security at its core. Your strategies and API keys are handled with enterprise-grade encryption and protocols.",
              feature_4_title: "Real-time Notifications",
              feature_4_desc: "Stay informed with instant Telegram notifications for order placements, errors, and system status updates.",
              feature_5_title: "Advanced Order Management",
              feature_5_desc: "Support for complex order types, risk management parameters, and customizable strategy settings.",
              feature_6_title: "For Every Trader",
              feature_6_desc: "Whether you're a seasoned algo-trader or a quantitative enthusiast, WealthBehave provides the tools you need to succeed.",
              cta_title: "Ready to Elevate Your Trading?",
              cta_subtitle: "Join the forefront of automated trading. Experience the WealthBehave difference today and transform your trading strategies into consistent results.",
              cta_button_contact: "Contact Us For Early Access",
              footer_text: "&copy; ${new Date().getFullYear()} WealthBehave. All Rights Reserved. Your Trusted Partner in Automated Trading.",
              privacy_policy: "Privacy Policy",
              terms_of_service: "Terms of Service"
            },
            'zh-TW': {
              pageTitle: "WealthBehave 維必喜 | 自動化交易引擎",
              brand_name: "WealthBehave",
              brand_suffix: " 貓咪神 | AI 自動交易引擎",
              nav_features: "產品特色",
              nav_contact: "聯繫我們",
              hero_title: "<span class='highlight'>自動化</span>您的交易，<br class='responsive-break'/><span class='highlight'>擴大</span>您的成功，<span class='brand-name'>WealthBehave</span> 為您實現",
              hero_title_highlight_1: "自動化",
              hero_title_highlight_2: "擴大",
              hero_subtitle: "無縫連接 TradingView 快訊至您的券商帳戶。即時執行訂單、管理風險，透過我們智能化的自動交易後端保持領先。",
              hero_cta: "探索運作方式",
              features_title: "為何選擇 WealthBehave 維必喜？",
              features_subtitle: "以速度、可靠性及尖端技術賦能交易者。以前所未有的方式掌控您的算法交易策略。",
              feature_1_title: "即時 Webhook 執行",
              feature_1_desc: "接收 TradingView Webhook 信號並在毫秒內執行訂單。不錯過任何因延遲造成的市場機會。",
              feature_2_title: "支援多家券商與交易所",
              feature_2_desc: "連接日益增長的熱門券商和交易所列表。從一個中心樞紐管理您在多個平台上的投資組合。",
              feature_3_title: "安全可靠",
              feature_3_desc: "以安全為核心構建。您的策略和 API 金鑰將以企業級加密和協議處理。",
              feature_4_title: "實時通知",
              feature_4_desc: "透過即時 Telegram 通知，隨時了解下單、錯誤和系統狀態更新。",
              feature_5_title: "高級訂單管理",
              feature_5_desc: "支援複雜訂單類型、風險管理參數及可自訂策略設置。",
              feature_6_title: "為每位交易者而生",
              feature_6_desc: "無論您是經驗豐富的算法交易者還是量化投資愛好者，WealthBehave 維必喜都能提供您成功所需的工具。",
              cta_title: "準備好提升您的交易水平了嗎？",
              cta_subtitle: "加入自動化交易的最前線。立即體驗 WealthBehave 維必喜的卓越之處，將您的交易策略轉化為持續的成果。",
              cta_button_contact: "聯繫我們以獲取早期體驗資格",
              footer_text: "&copy; ${new Date().getFullYear()} WealthBehave 維必喜. 保留所有權利. 您值得信賴的自動化交易夥伴。",
              privacy_policy: "隱私政策",
              terms_of_service: "服務條款"
            },
            'zh-CN': {
              pageTitle: "WealthBehave 维必喜 | 自动化交易引擎",
              brand_name: "WealthBehave",
              brand_suffix: " 维必喜 AI自动交易平台",
              nav_features: "产品特色",
              nav_contact: "联系我们",
              hero_title: "<span class='highlight'>自动化</span>您的交易，<br class='responsive-break'/><span class='highlight'>扩大</span>您的成功，<span class='brand-name'>WealthBehave</span> 为您实现",
              hero_title_highlight_1: "自动化",
              hero_title_highlight_2: "扩大",
              hero_subtitle: "无缝连接 TradingView 快讯至您的券商账户。即时执行订单、管理风险，通过我们智能化的自动交易后端保持领先。",
              hero_cta: "探索运作方式",
              features_title: "为何选择 WealthBehave 维必喜？",
              features_subtitle: "以速度、可靠性及尖端技术赋能交易者。以前所未有的方式掌控您的算法交易策略。",
              feature_1_title: "即时 Webhook 执行",
              feature_1_desc: "接收 TradingView Webhook 信号并在毫秒内执行订单。不错过任何因延迟造成的市场机会。",
              feature_2_title: "支持多家券商与交易所",
              feature_2_desc: "连接日益增长的热门券商和交易所列表。从一个中心枢纽管理您在多个平台上的投资组合。",
              feature_3_title: "安全可靠",
              feature_3_desc: "以安全为核心构建。您的策略和 API 密钥将以企业级加密和协议处理。",
              feature_4_title: "实时通知",
              feature_4_desc: "通过即时 Telegram 通知，随时了解下单、错误和系统状态更新。",
              feature_5_title: "高级订单管理",
              feature_5_desc: "支持复杂订单类型、风险管理参数及可自定义策略设置。",
              feature_6_title: "为每位交易者而生",
              feature_6_desc: "无论是经验丰富的算法交易者还是量化投资爱好者，WealthBehave 维必喜都能提供您成功所需的工具。",
              cta_title: "准备好提升您的交易水平了吗？",
              cta_subtitle: "加入自动化交易的最前沿。立即体验 WealthBehave 维必喜的卓越之处，将您的交易策略转化为持续的成果。",
              cta_button_contact: "联系我们以获取早期体验资格",
              footer_text: "&copy; ${new Date().getFullYear()} WealthBehave 维必喜. 保留所有权利. 您值得信赖的自动化交易伙伴。",
              privacy_policy: "隐私政策",
              terms_of_service: "服务条款"
            }
          };

          function S(key) { // Short for "getString"
            const lang = document.body.getAttribute('data-lang') || 'en';
            return translations[lang][key] || translations['en'][key] || key;
          }

          function applyTranslations() {
            document.querySelectorAll('[data-translate-key]').forEach(el => {
              const key = el.getAttribute('data-translate-key');
              // For elements that might contain HTML, use innerHTML
              if (['hero_title', 'footer_text'].includes(key)) {
                 el.innerHTML = S(key).replace('${new Date().getFullYear()}', new Date().getFullYear());
              } else if (el.tagName === 'INPUT' && el.type === 'submit' || el.tagName === 'BUTTON' && !el.closest('.lang-switcher')) {
                 el.value = S(key); // For button text if it's an input
                 el.textContent = S(key); // For button text
              } else if (el.tagName === 'A' && el.classList.contains('brand')){
                  // Special handling for brand with suffix if needed
                  const brandName = S('brand_name');
                  const brandSuffix = S('brand_suffix');
                  el.innerHTML = brandName + (brandSuffix ? \` <span>\${brandSuffix}</span>\` : '');
              }
              else {
                el.textContent = S(key);
              }
            });
            document.title = S('pageTitle');
            document.documentElement.lang = document.body.getAttribute('data-lang').substring(0,2); // Set html lang e.g. "en", "zh"
          }

          document.addEventListener('DOMContentLoaded', () => {
            const langButtons = document.querySelectorAll('.lang-switcher button');
            const storedLang = localStorage.getItem('preferredLang') || 'en';

            function setLanguage(lang) {
              document.body.setAttribute('data-lang', lang);
              document.documentElement.lang = lang.substring(0,2); // Set html lang e.g. "en", "zh"
              localStorage.setItem('preferredLang', lang);
              applyTranslations();
              langButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
              });
            }

            langButtons.forEach(button => {
              button.addEventListener('click', () => {
                setLanguage(button.getAttribute('data-lang'));
              });
            });

            // Set initial language
            setLanguage(storedLang);

            // Smooth scroll for anchor links (optional)
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });

          });
        </script>
      </body>
      </html>
    `}