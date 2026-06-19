// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  loadAndRenderContent();
  setupHeaderScroll();
});

// Загрузка динамического контента с сервера/диска
async function loadAndRenderContent() {
  try {
    // Внедряем cache-buster (?t=...), чтобы браузер не кэшировал старую версию при обновлении в админке
    const response = await fetch(`/data.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Не удалось загрузить data.json');
    }
    const data = await response.json();
    renderContent(data);
  } catch (error) {
    console.error('Ошибка рендеринга динамического контента:', error);
  }
}

// Заполнение страницы данными из JSON
function renderContent(data) {
  // 1. Герой-секция
  if (data.hero) {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroTitle) heroTitle.innerHTML = data.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = data.hero.subtitle;
    
    // Если в каталоге свежих цветов есть первая позиция, используем ее на превью (если элементы присутствуют)
    const firstFresh = data.catalog?.fresh?.[0];
    if (firstFresh) {
      const heroMainImg = document.getElementById('hero-main-img');
      const heroMainTitle = document.getElementById('hero-main-title');
      if (heroMainImg) heroMainImg.src = firstFresh.image;
      if (heroMainTitle) heroMainTitle.textContent = firstFresh.name;
    }
  }

  // 2. Преимущества
  if (data.features) {
    const grid = document.getElementById('features-grid');
    grid.innerHTML = data.features.map(f => `
      <div class="glass card feature-card glass-card">
        <h3>${f.title}</h3>
        <p>${f.description}</p>
      </div>
    `).join('');
  }

  // 3. Каталог
  if (data.catalog) {
    // Свежие цветы
    const gridFresh = document.getElementById('grid-fresh');
    gridFresh.innerHTML = (data.catalog.fresh || []).map(item => `
      <div class="product-card glass glass-card">
        <div class="product-img-wrapper">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='images/roses_red.jpg'">
          ${item.popular ? '<span class="product-tag">Популярно</span>' : ''}
          ${item.hit ? '<span class="product-tag">Хит сезона</span>' : ''}
        </div>
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');

    // Горшечные растения
    const gridPotted = document.getElementById('grid-potted');
    gridPotted.innerHTML = (data.catalog.potted || []).map(item => `
      <div class="product-card glass glass-card">
        <div class="product-img-wrapper">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='images/roses_red.jpg'">
          ${item.popular ? '<span class="product-tag">Популярно</span>' : ''}
          ${item.hit ? '<span class="product-tag">Хит сезона</span>' : ''}
        </div>
        <div class="product-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  }

  // 4. О магазине
  if (data.about) {
    const titleEl = document.getElementById('about-title');
    const desc1El = document.getElementById('about-desc1');
    const desc2El = document.getElementById('about-desc2');
    const addrEl = document.getElementById('about-address');
    const addrMobEl = document.getElementById('about-address-mob');
    const wtEl = document.getElementById('about-worktime');
    const wtMobEl = document.getElementById('about-worktime-mob');

    if (titleEl) titleEl.textContent = data.about.title;
    if (desc1El) desc1El.textContent = data.about.description1;
    if (desc2El) desc2El.textContent = data.about.description2;
    if (addrEl) addrEl.textContent = data.about.address;
    if (addrMobEl) addrMobEl.textContent = data.about.address;
    if (wtEl) wtEl.textContent = data.about.workTime;
    if (wtMobEl) wtMobEl.textContent = data.about.workTime;
  }

  // 5. Галерея
  if (data.gallery) {
    const track = document.getElementById('gallery-track');
    
    // Генерируем элементы
    const slidesHtml = (data.gallery || []).map(item => `
      <div class="gallery-item">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='images/roses_red.jpg'">
        <div class="gallery-overlay">
          <h4>${item.title}</h4>
          <p>${item.subtitle}</p>
        </div>
      </div>
    `).join('');
    
    // Дублируем слайды, чтобы скролл шел бесконечно и плавно
    track.innerHTML = slidesHtml + slidesHtml;
  }
}

// Функция переключения вкладок каталога
function switchCategory(category) {
  const btnFresh = document.getElementById('btn-fresh');
  const btnPotted = document.getElementById('btn-potted');
  const gridFresh = document.getElementById('grid-fresh');
  const gridPotted = document.getElementById('grid-potted');
  
  if (category === 'fresh') {
    btnFresh.classList.add('active');
    btnPotted.classList.remove('active');
    gridFresh.style.display = 'grid';
    gridPotted.style.display = 'none';
  } else if (category === 'potted') {
    btnFresh.classList.remove('active');
    btnPotted.classList.add('active');
    gridFresh.style.display = 'none';
    gridPotted.style.display = 'grid';
  }
}

// Функция быстрой предзаполненной формы заказа
function openOrder(itemName) {
  const msgField = document.getElementById('form-msg');
  const feedbackSection = document.getElementById('feedback');
  
  msgField.value = `Здравствуйте! Хочу заказать или узнать подробнее про: ${itemName}.`;
  
  feedbackSection.scrollIntoView({ behavior: 'smooth' });
  
  setTimeout(() => {
    document.getElementById('form-name').focus();
  }, 800);
}

// Отправка формы обратной связи на сервер
async function sendFeedback(event) {
  event.preventDefault();
  
  const form = document.getElementById('orderForm');
  const statusMsg = document.getElementById('form-status-msg');
  const submitBtn = form.querySelector('.form-submit-btn');
  
  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();
  const message = document.getElementById('form-msg').value.trim();
  
  if (phone.length < 6) {
    showStatus('Введите корректный номер телефона', 'error');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';
  statusMsg.className = 'form-status';
  statusMsg.style.display = 'none';
  
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone, message })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      if (result.warning) {
        showStatus(`Заявка принята! Предупреждение: ${result.warning}`, 'success');
      } else {
        showStatus('Заявка успешно отправлена! Наш флорист скоро свяжется с вами.', 'success');
      }
      form.reset();
    } else {
      showStatus(result.error || 'Произошла ошибка при отправке заявки. Попробуйте еще раз.', 'error');
    }
  } catch (error) {
    console.error('Ошибка отправки формы:', error);
    showStatus('Сервер недоступен. Пожалуйста, проверьте соединение с интернетом.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить заявку ➔';
  }
}

// Помощник для вывода статусных сообщений формы
function showStatus(text, type) {
  const statusMsg = document.getElementById('form-status-msg');
  statusMsg.textContent = text;
  statusMsg.className = `form-status ${type}`;
}

// Блюр для шапки при скролле
function setupHeaderScroll() {
  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 20) {
      header.style.background = 'rgba(255, 255, 255, 0.65)';
      header.style.boxShadow = '0 10px 30px rgba(100, 110, 140, 0.08)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.45)';
      header.style.boxShadow = 'var(--glass-shadow)';
    }
  });
}

// Функции мобильного меню (бургер)
function toggleMobileMenu() {
  const burgerBtn = document.getElementById('burger-btn');
  const navMenu = document.getElementById('nav-menu');
  
  if (burgerBtn && navMenu) {
    burgerBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
  }
}

function closeMobileMenu() {
  const burgerBtn = document.getElementById('burger-btn');
  const navMenu = document.getElementById('nav-menu');
  
  if (burgerBtn && navMenu) {
    burgerBtn.classList.remove('active');
    navMenu.classList.remove('active');
  }
}
