const FLAVOR_OPTIONS = [
  'refreshing', 'citrusy', 'bitter', 'creamy', 'sweet',
  'fruity', 'herbal', 'spicy', 'smoky', 'spirit-forward'
];

const state = {
  imagePath: '',
  flavorTags: [],
  inferredIngredients: [],
  caption: '',
  recommendations: [],
  seenRecommendationIds: [],
  selectedCocktailId: null,
  selectedCocktail: null,
  modelMessage: 'Loading model status...'
};

const $ = (id) => document.getElementById(id);

const imagePreview = $('image-preview');
const imagePathText = $('image-path');
const flavorTagsWrap = $('flavor-tags');
const resultPanel = $('result-panel');
const myDrinksList = $('my-drinks-list');
const homebarBottles = $('homebar-bottles');
const homebarResults = $('homebar-results');
const loadingBarContainer = $('loading-bar-container');
const loadingBarFill = $('loading-bar-fill');
const modelStatusText = $('model-status-text');

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function tagHtml(tags = []) {
  return tags.map((tag) => `<span class="inline-tag">${escapeHtml(tag)}</span>`).join('');
}

function renderFlavorTags() {
  flavorTagsWrap.innerHTML = FLAVOR_OPTIONS.map((tag) => `
    <button class="tag-chip" data-tag="${tag}" data-active="${state.flavorTags.includes(tag)}">${tag}</button>
  `).join('');

  flavorTagsWrap.querySelectorAll('.tag-chip').forEach((button) => {
    button.addEventListener('click', () => {
      const { tag } = button.dataset;
      if (state.flavorTags.includes(tag)) {
        state.flavorTags = state.flavorTags.filter((item) => item !== tag);
      } else {
        state.flavorTags.push(tag);
      }
      renderFlavorTags();
    });
  });
}

function setLoading(isLoading) {
  loadingBarContainer.style.display = isLoading ? 'block' : 'none';
  loadingBarFill.style.width = isLoading ? '65%' : '0%';
}

function renderImagePreview() {
  if (!state.imagePath) {
    imagePreview.innerHTML = '<div class="empty-preview">No image selected</div>';
    imagePathText.textContent = '';
    return;
  }

  const safePath = state.imagePath.replaceAll('\\', '/');
  imagePreview.innerHTML = `<img src="file://${encodeURI(safePath)}" alt="Selected drink image" />`;
  imagePathText.textContent = state.imagePath;
}

function renderResults() {
  if (!state.recommendations.length) {
    resultPanel.innerHTML = `
      <div class="pixel-card mt-20">
        <p class="muted">Upload an image and choose taste cues to see recommendations.</p>
      </div>
    `;
    return;
  }

  const selectedRecipe = state.selectedCocktail ? `
    <section class="recipe-card mt-20">
      <p class="label">Step 4: Recipe</p>
      <h4>${escapeHtml(state.selectedCocktail.name)}</h4>
      <div class="card-meta">${escapeHtml(state.selectedCocktail.description || '')}</div>
      <div>
        <strong>Ingredients</strong>
        <ul class="ingredient-list">
          ${(state.selectedCocktail.baseIngredients || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          ${(state.selectedCocktail.optionalIngredients || []).map((item) => `<li>${escapeHtml(item)} (optional)</li>`).join('')}
        </ul>
      </div>
      <div>
        <strong>Steps</strong>
        <ol class="step-list">
          ${(state.selectedCocktail.steps || []).map((step) => `<li><span>${escapeHtml(step)}</span></li>`).join('')}
        </ol>
      </div>
      <div class="inline-actions">
        <button class="pixel-btn save-cocktail-btn" data-id="${state.selectedCocktail.id}">Save to Library</button>
        <button class="ghost-btn" id="back-to-matches-btn">Back to Matches</button>
      </div>
    </section>
  ` : '';

  resultPanel.innerHTML = `
    <div class="section-header mt-20">
      <p class="label">AI analysis</p>
      <h3>${escapeHtml(state.caption || 'Drink analyzed')}</h3>
    </div>

    <div class="tag-wrap mt-10">
        ${state.inferredIngredients.map(ing => `<span class="inline-tag">${escapeHtml(ing)}</span>`).join('')}
        ${state.flavorTags.map(tag => `<span class="inline-tag active">${escapeHtml(tag)}</span>`).join('')}
    </div>

    <section class="matches-grid mt-20">
      <p class="label">Step 3: Matches (Pick 1)</p>
      ${state.recommendations.map((item) => `
        <article class="cocktail-card ${state.selectedCocktailId === item.id ? 'selected' : ''}">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="card-meta">${escapeHtml(item.description)}</div>
          <div class="card-meta"><em>${escapeHtml(item.reason || '')}</em></div>
          <div class="inline-actions">
            <button class="pixel-btn select-cocktail-btn" data-id="${item.id}">Detailed Steps</button>
          </div>
        </article>
      `).join('')}
    </section>

    <div class="inline-actions mt-10">
      <button id="more-cocktails-btn" class="ghost-btn full-width">Not satisfied? Show 3 more</button>
    </div>

    <div id="recipe-display-area">
        ${selectedRecipe}
    </div>
  `;

  // Bind Match Actions
  resultPanel.querySelectorAll('.select-cocktail-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const cocktailId = button.dataset.id;
      const cocktail = await window.sipcity.selectCocktail({ cocktailId });
      state.selectedCocktailId = cocktailId;
      state.selectedCocktail = cocktail;
      renderResults();
      document.getElementById('recipe-display-area').scrollIntoView({ behavior: 'smooth' });
    });
  });

  resultPanel.querySelectorAll('.save-cocktail-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const cocktail = state.selectedCocktail;
      if (!cocktail) return;

      await window.sipcity.saveDrink({
        cocktailId: cocktail.id,
        name: cocktail.name,
        description: cocktail.description,
        ingredients: state.inferredIngredients,
        flavorTags: state.flavorTags,
        baseIngredients: cocktail.baseIngredients,
        reason: cocktail.reason
      });
      button.textContent = 'Saved!';
      button.disabled = true;
      await loadMyDrinks();
    });
  });

  const moreBtn = $('more-cocktails-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', async () => {
      const payload = await window.sipcity.generateMoreCocktails({
        ingredients: state.inferredIngredients,
        flavorTags: state.flavorTags,
        seenRecommendationIds: state.seenRecommendationIds
      });

      state.recommendations = payload.recommendations || [];
      state.seenRecommendationIds = payload.seenRecommendationIds || [];
      state.selectedCocktailId = null;
      state.selectedCocktail = null;
      renderResults();
    });
  }

  const backBtn = $('back-to-matches-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.selectedCocktail = null;
      state.selectedCocktailId = null;
      renderResults();
    });
  }
}

async function loadMyDrinks() {
  const drinks = await window.sipcity.getDrinks();
  if (!drinks.length) {
    myDrinksList.innerHTML = '<div class="pixel-card mt-10">No saved drinks yet.</div>';
    return;
  }

  myDrinksList.innerHTML = drinks.map((drink) => `
    <article class="cocktail-card">
      <h4>${escapeHtml(drink.name || 'Saved drink')}</h4>
      <div class="card-meta">${escapeHtml(drink.reason || '')}</div>
      <div class="tag-wrap">${drink.flavorTags.map(t => `<span class="inline-tag active">${escapeHtml(t)}</span>`).join('')}</div>
    </article>
  `).join('');
}

function renderHomebarResults(bottles) {
  if (!bottles.length) {
    homebarResults.innerHTML = '<div class="pixel-card mt-10">Empty homebar.</div>';
    return;
  }

  homebarResults.innerHTML = `
    <div class="pixel-card mt-10">
      <p class="label">Current bottles</p>
      <div class="tag-wrap">
        ${bottles.map((item) => `<span class="inline-tag active">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  `;
}

async function loadHomebar() {
  const bottles = await window.sipcity.getHomebar();
  homebarBottles.value = (bottles || []).join(', ');
  renderHomebarResults(bottles || []);
}

function setupTabs() {
  const buttons = document.querySelectorAll('[data-tab-target]');
  const pages = document.querySelectorAll('.page');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tabTarget;

      buttons.forEach(btn => {
        btn.classList.remove('active');
        const underline = btn.querySelector('.underline');
        if (underline) underline.remove();
      });

      button.classList.add('active');
      const underline = document.createElement('div');
      underline.classList.add('underline');
      button.appendChild(underline);

      pages.forEach(page => {
        page.classList.remove('active');
        const pageIdMap = { scan: 'scan-page', mydrinks: 'my-drinks', homebar: 'homebar' };
        if (page.id === pageIdMap[target]) page.classList.add('active');
      });
    });
  });
}

async function handlePickImage() {
  const result = await window.sipcity.pickImage();
  if (result.canceled) return;
  state.imagePath = result.filePath;
  renderImagePreview();
}

async function handleAnalyze() {
  if (!state.imagePath) {
    resultPanel.innerHTML = '<div class="pixel-card mt-20">Please choose an image.</div>';
    return;
  }

  setLoading(true);
  try {
    const payload = await window.sipcity.startRecognition({
      imagePath: state.imagePath,
      flavorTags: state.flavorTags
    });

    loadingBarFill.style.width = '100%';
    state.caption = payload.caption || '';
    state.inferredIngredients = payload.inferredIngredients || [];
    state.recommendations = payload.recommendations || [];
    state.seenRecommendationIds = payload.seenRecommendationIds || [];
    state.selectedCocktailId = null;
    state.selectedCocktail = null;
    renderResults();
  } catch (error) {
    resultPanel.innerHTML = `<div class="pixel-card mt-20">${escapeHtml(error.message)}</div>`;
  } finally {
    setTimeout(() => setLoading(false), 200);
  }
}

async function handleSaveHomebar() {
  const bottles = homebarBottles.value.split(',').map(s => s.trim()).filter(Boolean);
  await window.sipcity.saveHomebar({ bottles });
  renderHomebarResults(bottles);
}

function bindEvents() {
  $('pick-image-btn').addEventListener('click', handlePickImage);
  $('analyze-btn').addEventListener('click', handleAnalyze);
  $('save-homebar-btn').addEventListener('click', handleSaveHomebar);
}

async function initModelStatus() {
  const status = await window.sipcity.getModelStatus();
  state.modelMessage = status?.message || 'Ready.';
  if (modelStatusText) modelStatusText.textContent = state.modelMessage;

  window.sipcity.onModelStatus((payload) => {
    state.modelMessage = payload?.message || state.modelMessage;
    if (modelStatusText) modelStatusText.textContent = state.modelMessage;
  });
}

async function init() {
  renderFlavorTags();
  renderImagePreview();
  renderResults();
  setupTabs();
  bindEvents();
  await initModelStatus();
  await loadMyDrinks();
  await loadHomebar();
}

init();
