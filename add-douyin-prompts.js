/**
 * 添加抖音泡面AIGC《审美积累》合集第34集（诺兰电影美学下）5条Midjourney提示词
 * 运行: node add-douyin-prompts.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const source = '泡面AIGC（抖音《审美积累》合集第34集：诺兰电影美学下）';
const sourceUrl = 'https://v.douyin.com/tsMVeTiMDAc/';
const contributor = '@泡面AIGC';
const douyinLikes = 1070;
const douyinCollects = 1023;

const newItems = [
  {
    id: 'douyin-paomian-nolan-dunkirk-wreck',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '敦刻尔克', 'AI绘画'],
    title: 'Dunkirk Beach: Burning Fighter Wreck',
    titleZh: '诺兰·敦刻尔克海滩战机残骸',
    prompt: 'Christopher Nolan cinematic scene, IMAX 70mm film photograph, lone man viewed from behind stands on desolate tidal beach, watching burning crashed fighter plane wreck, solemn post-disaster desolate silence mood, medium-wide shot, figure in foreground, blazing wreck in mid-ground, flat endless beach horizon, dusk twilight low ambient light, bright fire casts warm reflection across wet sand, cool dim evening sky, fiery orange flame contrasted with teal shadow, scorched metal wreck texture, thick billowing black smoke, damp muddy beach ground, photorealistic, ultra detailed, 70mm IMAX film grain --ar 16:9 --style raw',
    titleEn: '',
    promptEn: '',
    source,
    sourceUrl,
    contributor,
    heat: 4,
    verified: false,
    community: true,
    lang: 'en',
    views: douyinLikes,
    copies: Math.round(douyinCollects / 10),
    score: 7.0
  },
  {
    id: 'douyin-paomian-nolan-interstellar-library',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '星际穿越', 'AI绘画'],
    title: 'Interstellar: Tesseract Mirrored Library',
    titleZh: '诺兰·星际穿越五维镜面图书馆',
    prompt: 'Christopher Nolan cinematic shot, IMAX 70mm film, Interstellar tesseract multi-dimensional space, lone astronaut floating inside infinite stacked mirrored cubic library layers, surreal cosmic time-space distortion, mysterious vast atmosphere, circular portal framing, astronaut centered, deep radial perspective, cool metallic reflective lighting, glowing golden light strip accents, deep black shadow background, polished reflective metallic surface texture, light refraction streaks, heavy IMAX 70mm film grain, hyperrealistic sci-fi movie shot --ar 1:1 --style raw',
    titleEn: '',
    promptEn: '',
    source,
    sourceUrl,
    contributor,
    heat: 4,
    verified: false,
    community: true,
    lang: 'en',
    views: douyinLikes,
    copies: Math.round(douyinCollects / 10),
    score: 7.0
  },
  {
    id: 'douyin-paomian-nolan-inception-paris',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '盗梦空间', 'AI绘画'],
    title: 'Inception: Folding Paris Street',
    titleZh: '诺兰·盗梦空间折叠巴黎街道',
    prompt: 'Christopher Nolan cinematic shot, IMAX 70mm film, surreal folding Paris city street, dream-reality distortion effect, stacked bending multi-layer city buildings, man at bottom left looking up toward twisted architecture, mysterious surreal atmosphere, low-angle street perspective, bright crisp natural daylight, soft sharp building shadows, warm beige ochre stone facades, vivid clear blue sky, detailed old Parisian architecture, iron balcony railings, city street asphalt texture, subtle 70mm IMAX film grain, photorealistic Inception movie still --ar 4:5 --style raw',
    titleEn: '',
    promptEn: '',
    source,
    sourceUrl,
    contributor,
    heat: 4,
    verified: false,
    community: true,
    lang: 'en',
    views: douyinLikes,
    copies: Math.round(douyinCollects / 10),
    score: 7.0
  },
  {
    id: 'douyin-paomian-nolan-trojan-horse',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '特洛伊', 'AI绘画'],
    title: 'Trojan Horse on Stormy Shore',
    titleZh: '诺兰·暴风雨海岸的特洛伊木马',
    prompt: 'Christopher Nolan cinematic shot, IMAX 70mm film, ancient Trojan horse on stormy seashore, crowds of tiny ancient men pull huge wooden Trojan horse with thick ropes along beach, epic solemn tragic atmosphere, vertical composition, wide low-angle shot, horizon on lower third, large empty sky space, dramatic backlight from sun piercing heavy storm clouds, strong silhouette, rim lighting, desaturated muted grey-green monochrome palette, vintage faded photograph, heavy film grain, old scratch texture, rough sand texture, turbulent ocean waves, moody cloudy sky, hyperrealistic, gritty historical texture --ar 9:16 --style raw',
    titleEn: '',
    promptEn: '',
    source,
    sourceUrl,
    contributor,
    heat: 4,
    verified: false,
    community: true,
    lang: 'en',
    views: douyinLikes,
    copies: Math.round(douyinCollects / 10),
    score: 7.0
  },
  {
    id: 'douyin-paomian-nolan-joker-mask',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '小丑', 'AI绘画'],
    title: 'Joker Prequel: Man with Clown Mask',
    titleZh: '诺兰·小丑前夜持面具独行',
    prompt: 'Christopher Nolan cinematic shot, IMAX 70mm film, back view of man walking across downtown city street, holding clown mask in one hand, quiet inner tension, urban solitude, medium shot, figure centered foreground, long straight city street receding to distant background, bright harsh midday city sunlight, crisp hard pavement shadows, natural muted realistic urban color grading, concrete high-rise office buildings, city street signs, weathered dark suit fabric texture, fine 70mm IMAX film grain, photorealistic movie still --ar 1:1 --style raw',
    titleEn: '',
    promptEn: '',
    source,
    sourceUrl,
    contributor,
    heat: 4,
    verified: false,
    community: true,
    lang: 'en',
    views: douyinLikes,
    copies: Math.round(douyinCollects / 10),
    score: 7.0
  }
];

// 校验ID唯一性
const ids = new Set(prompts.map(p => p.id));
for (const item of newItems) {
  if (ids.has(item.id)) throw new Error(`ID 冲突: ${item.id}`);
  ids.add(item.id);
}

prompts.push(...newItems);
fs.writeFileSync(path, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`已添加 ${newItems.length} 条，母本现在 ${prompts.length} 条`);
console.log('新增 ID:', newItems.map(x => x.id).join(', '));
