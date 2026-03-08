const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const value = (match[2] || '').replace(/^['"]|['"]$/g, '');
        process.env[match[1]] = value;
      }
    });
  }
} catch (error) {
  console.log('Could not read .env:', error.message);
}

let mainWindow;
const userDataDir = app.getPath('userData');
const drinksPath = path.join(userDataDir, 'sipcity-drinks.json');
const homebarPath = path.join(userDataDir, 'sipcity-homebar.json');

const COCKTAIL_LIBRARY = [
  {
    id: 'margarita',
    name: 'Margarita',
    tags: ['refreshing', 'citrusy', 'spirit-forward'],
    baseIngredients: ['tequila', 'lime', 'triple sec'],
    optionalIngredients: ['salt rim'],
    description: 'Bright, sharp, and classic with tequila and lime.',
    steps: [
      'Add tequila, lime juice, and triple sec to a shaker with ice.',
      'Shake until cold.',
      'Strain into a salt-rimmed glass.',
      'Garnish with a lime wheel.'
    ]
  },
  {
    id: 'paloma',
    name: 'Paloma',
    tags: ['refreshing', 'citrusy', 'fruity'],
    baseIngredients: ['tequila', 'grapefruit', 'lime'],
    optionalIngredients: ['soda water', 'salt'],
    description: 'A sparkling tequila highball with grapefruit lift.',
    steps: [
      'Fill a glass with ice.',
      'Add tequila, grapefruit juice, and lime juice.',
      'Top with soda water.',
      'Stir gently and garnish with grapefruit or lime.'
    ]
  },
  {
    id: 'mojito',
    name: 'Mojito',
    tags: ['refreshing', 'herbal', 'citrusy'],
    baseIngredients: ['rum', 'mint', 'lime'],
    optionalIngredients: ['soda water', 'sugar'],
    description: 'Minty, cool, and easy-drinking.',
    steps: [
      'Gently muddle mint, lime, and sugar in a glass.',
      'Add rum and ice.',
      'Top with soda water.',
      'Stir lightly and garnish with more mint.'
    ]
  },
  {
    id: 'daiquiri',
    name: 'Daiquiri',
    tags: ['refreshing', 'citrusy', 'spirit-forward'],
    baseIngredients: ['rum', 'lime', 'sugar'],
    optionalIngredients: [],
    description: 'Simple rum, lime, and sugar done right.',
    steps: [
      'Add rum, lime juice, and simple syrup to a shaker with ice.',
      'Shake hard until cold.',
      'Strain into a chilled coupe.',
      'Serve immediately.'
    ]
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    tags: ['citrusy', 'sweet', 'spirit-forward'],
    baseIngredients: ['whiskey', 'lemon', 'sugar'],
    optionalIngredients: ['egg white'],
    description: 'Balanced whiskey with citrus and soft sweetness.',
    steps: [
      'Add whiskey, lemon juice, and syrup to a shaker.',
      'Dry shake first if using egg white.',
      'Add ice and shake again.',
      'Strain into a rocks glass and garnish.'
    ]
  },
  {
    id: 'old-fashioned',
    name: 'Old Fashioned',
    tags: ['spirit-forward', 'bitter', 'sweet'],
    baseIngredients: ['whiskey', 'bitters', 'sugar'],
    optionalIngredients: ['orange peel'],
    description: 'Rich, boozy, and stirred down.',
    steps: [
      'Add sugar, bitters, and a splash of water to a mixing glass.',
      'Stir to dissolve, then add whiskey and ice.',
      'Stir until chilled.',
      'Strain over fresh ice and express an orange peel.'
    ]
  },
  {
    id: 'negroni',
    name: 'Negroni',
    tags: ['bitter', 'spirit-forward', 'herbal'],
    baseIngredients: ['gin', 'campari', 'sweet vermouth'],
    optionalIngredients: ['orange peel'],
    description: 'A bitter, herbal classic with equal-parts structure.',
    steps: [
      'Add gin, Campari, and sweet vermouth to a mixing glass with ice.',
      'Stir until cold.',
      'Strain over ice in a rocks glass.',
      'Garnish with orange peel.'
    ]
  },
  {
    id: 'espresso-martini',
    name: 'Espresso Martini',
    tags: ['sweet', 'creamy', 'spirit-forward'],
    baseIngredients: ['vodka', 'espresso', 'coffee liqueur'],
    optionalIngredients: ['simple syrup'],
    description: 'Cold, caffeinated, and smooth with foam on top.',
    steps: [
      'Add vodka, espresso, and coffee liqueur to a shaker with ice.',
      'Shake hard until frothy.',
      'Double strain into a chilled coupe.',
      'Garnish with coffee beans.'
    ]
  },
  {
    id: 'pina-colada',
    name: 'Piña Colada',
    tags: ['creamy', 'sweet', 'fruity'],
    baseIngredients: ['rum', 'pineapple', 'coconut'],
    optionalIngredients: ['lime'],
    description: 'Tropical, creamy, and dessert-like.',
    steps: [
      'Blend rum, pineapple juice, coconut cream, and ice until smooth.',
      'Pour into a chilled glass.',
      'Garnish with pineapple or cherry.',
      'Serve immediately.'
    ]
  },
  {
    id: 'cosmopolitan',
    name: 'Cosmopolitan',
    tags: ['citrusy', 'fruity', 'sweet'],
    baseIngredients: ['vodka', 'cranberry', 'lime', 'triple sec'],
    optionalIngredients: ['orange peel'],
    description: 'Clean, tart, and pink-toned.',
    steps: [
      'Add vodka, cranberry, lime, and triple sec to a shaker with ice.',
      'Shake until cold.',
      'Strain into a chilled coupe.',
      'Garnish with orange peel.'
    ]
  },
  {
    id: 'mai-tai',
    name: 'Mai Tai',
    tags: ['fruity', 'citrusy', 'spirit-forward'],
    baseIngredients: ['rum', 'lime', 'orange liqueur', 'orgeat'],
    optionalIngredients: ['mint'],
    description: 'Layered, tropical, and nutty with citrus.',
    steps: [
      'Add rum, lime juice, orange liqueur, and orgeat to a shaker with ice.',
      'Shake until chilled.',
      'Strain over crushed ice.',
      'Garnish with mint and lime shell.'
    ]
  },
  {
    id: 'martini',
    name: 'Martini',
    tags: ['spirit-forward', 'herbal'],
    baseIngredients: ['gin', 'dry vermouth'],
    optionalIngredients: ['olive', 'lemon twist'],
    description: 'Crisp, cold, and minimalist.',
    steps: [
      'Add gin and dry vermouth to a mixing glass with ice.',
      'Stir until very cold.',
      'Strain into a chilled martini glass.',
      'Garnish with an olive or lemon twist.'
    ]
  }
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 960,
    minHeight: 720,
    title: 'SipCity MVP',
    backgroundColor: '#111827',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function normalize(value = '') {
  return String(value).toLowerCase().trim();
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function inferIngredientsFromFilename(imagePath, flavorTags = []) {
  const lower = normalize(path.basename(imagePath));
  const found = [];
  const hints = {
    tequila: ['tequila', 'marg', 'paloma'],
    rum: ['rum', 'mojito', 'daiquiri', 'mai', 'pina'],
    gin: ['gin', 'martini', 'negroni'],
    vodka: ['vodka', 'cosmo', 'espresso'],
    whiskey: ['whiskey', 'bourbon', 'oldfashioned', 'sour'],
    lime: ['lime', 'green', 'citrus'],
    lemon: ['lemon', 'yellow'],
    mint: ['mint'],
    pineapple: ['pineapple'],
    coconut: ['coconut'],
    cranberry: ['cranberry'],
    espresso: ['espresso', 'coffee'],
    campari: ['campari'],
    vermouth: ['vermouth'],
    grapefruit: ['grapefruit']
  };

  for (const [ingredient, words] of Object.entries(hints)) {
    if (words.some((word) => lower.includes(word))) {
      found.push(ingredient);
    }
  }

  if (flavorTags.includes('citrusy')) found.push('lime');
  if (flavorTags.includes('herbal')) found.push('mint');
  if (flavorTags.includes('creamy')) found.push('coconut');
  if (flavorTags.includes('bitter')) found.push('campari');
  if (flavorTags.includes('spirit-forward')) found.push('whiskey');
  if (flavorTags.includes('fruity')) found.push('pineapple');
  if (flavorTags.includes('sweet')) found.push('triple sec');
  if (flavorTags.includes('refreshing')) found.push('soda water');

  return unique(found).slice(0, 6);
}

async function inferIngredientsWithGemini(imagePath, flavorTags = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const imageBuffer = await fsp.readFile(imagePath);
  const mimeType = imagePath.toLowerCase().endsWith('.png')
    ? 'image/png'
    : imagePath.toLowerCase().endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

  const prompt = [
    'Analyze this uploaded drink image.',
    'Return strict JSON only.',
    'Use keys: caption, inferredIngredients.',
    'caption must be one short sentence.',
    'inferredIngredients must be an array of 3 to 6 likely cocktail ingredients in lowercase English.',
    `Taste cues: ${flavorTags.join(', ') || 'none'}.`
  ].join(' ');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBuffer.toString('base64') } }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return null;
  }

  const parsed = JSON.parse(text);
  return {
    caption: parsed.caption || 'AI analyzed your uploaded drink image.',
    inferredIngredients: unique((parsed.inferredIngredients || []).map(normalize)).slice(0, 6)
  };
}

function scoreCocktail(cocktail, ingredients = [], flavorTags = []) {
  let score = 0;

  for (const ingredient of ingredients) {
    if (cocktail.baseIngredients.includes(ingredient)) score += 5;
    if ((cocktail.optionalIngredients || []).includes(ingredient)) score += 2;
  }

  for (const tag of flavorTags) {
    if (cocktail.tags.includes(tag)) score += 3;
  }

  return score;
}

function buildReason(cocktail, ingredients = [], flavorTags = []) {
  const ingredientHits = ingredients.filter((item) => cocktail.baseIngredients.includes(item));
  const tagHits = flavorTags.filter((item) => cocktail.tags.includes(item));
  const parts = [];

  if (ingredientHits.length) {
    parts.push(`matches ${ingredientHits.join(', ')}`);
  }
  if (tagHits.length) {
    parts.push(`fits ${tagHits.join(', ')} taste cues`);
  }
  if (!parts.length) {
    parts.push('closest match from the current cocktail library');
  }

  return parts.join(' and ');
}

function recommendCocktails({ ingredients = [], flavorTags = [], seenRecommendationIds = [] }) {
  const ranked = COCKTAIL_LIBRARY
    .map((cocktail) => ({
      ...cocktail,
      score: scoreCocktail(cocktail, ingredients, flavorTags)
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  let pool = ranked.filter((item) => !seenRecommendationIds.includes(item.id));
  if (pool.length < 3) {
    pool = ranked;
  }

  const recommendations = pool.slice(0, 3).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    tags: item.tags,
    baseIngredients: item.baseIngredients,
    optionalIngredients: item.optionalIngredients,
    steps: item.steps,
    reason: buildReason(item, ingredients, flavorTags)
  }));

  return {
    recommendations,
    seenRecommendationIds: unique([...seenRecommendationIds, ...recommendations.map((item) => item.id)])
  };
}

function broadcastModelStatus() {
  if (!mainWindow) return;

  mainWindow.webContents.send('model-status', {
    ready: true,
    mode: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
    message: process.env.GEMINI_API_KEY
      ? 'Gemini API configured.'
      : 'Running in demo mode without Gemini API.'
  });
}

ipcMain.handle('pick-image', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select a cocktail image',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  return { canceled: false, filePath: result.filePaths[0] };
});

ipcMain.handle('start-recognition', async (_, payload) => {
  const imagePath = payload?.imagePath;
  const flavorTags = Array.isArray(payload?.flavorTags) ? payload.flavorTags : [];

  if (!imagePath) {
    throw new Error('No image selected.');
  }

  let caption = 'AI analyzed your uploaded drink image.';
  let inferredIngredients = [];

  try {
    const geminiResult = await inferIngredientsWithGemini(imagePath, flavorTags);
    if (geminiResult) {
      caption = geminiResult.caption;
      inferredIngredients = geminiResult.inferredIngredients;
    } else {
      inferredIngredients = inferIngredientsFromFilename(imagePath, flavorTags);
      caption = 'Demo analysis based on your selected taste cues and image filename.';
    }
  } catch (error) {
    inferredIngredients = inferIngredientsFromFilename(imagePath, flavorTags);
    caption = 'Gemini failed, so local demo matching was used instead.';
  }

  if (!inferredIngredients.length) {
    inferredIngredients = ['lime', 'vodka', 'mint'];
  }

  const recommendationPayload = recommendCocktails({
    ingredients: inferredIngredients,
    flavorTags,
    seenRecommendationIds: []
  });

  return {
    caption,
    inferredIngredients,
    recommendations: recommendationPayload.recommendations,
    seenRecommendationIds: recommendationPayload.seenRecommendationIds
  };
});

ipcMain.handle('generate-more-cocktails', async (_, payload) => {
  return recommendCocktails({
    ingredients: Array.isArray(payload?.ingredients) ? payload.ingredients : [],
    flavorTags: Array.isArray(payload?.flavorTags) ? payload.flavorTags : [],
    seenRecommendationIds: Array.isArray(payload?.seenRecommendationIds) ? payload.seenRecommendationIds : []
  });
});

ipcMain.handle('select-cocktail', async (_, payload) => {
  const cocktailId = payload?.cocktailId;
  const cocktail = COCKTAIL_LIBRARY.find((item) => item.id === cocktailId);

  if (!cocktail) {
    throw new Error('Cocktail not found.');
  }

  return cocktail;
});

ipcMain.handle('save-drink', async (_, payload) => {
  if (!payload) {
    throw new Error('No drink payload provided.');
  }

  const existing = await readJson(drinksPath, []);
  const saved = [{ ...payload, savedAt: new Date().toISOString() }, ...existing];
  await writeJson(drinksPath, saved);
  return { ok: true };
});

ipcMain.handle('get-drinks', async () => readJson(drinksPath, []));
ipcMain.handle('get-homebar', async () => readJson(homebarPath, []));
ipcMain.handle('save-homebar', async (_, payload) => {
  const bottles = Array.isArray(payload?.bottles) ? payload.bottles : [];
  await writeJson(homebarPath, bottles);
  return { ok: true };
});

ipcMain.handle('get-model-status', async () => ({
  ready: true,
  mode: process.env.GEMINI_API_KEY ? 'gemini' : 'demo',
  message: process.env.GEMINI_API_KEY
    ? 'Gemini API configured.'
    : 'Running in demo mode without Gemini API.'
}));

app.whenReady().then(() => {
  createWindow();
  setTimeout(broadcastModelStatus, 200);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
