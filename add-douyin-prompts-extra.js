/**
 * 补充抖音泡面AIGC《审美积累》合集第34集（诺兰电影美学下）遗漏的1条Midjourney提示词
 * 运行: node add-douyin-prompts-extra.js
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
    id: 'douyin-paomian-nolan-ancient-warrior-horse',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '诺兰', '史诗', 'AI绘画'],
    title: 'Ancient Warrior on White Horse at Golden Sunset',
    titleZh: '诺兰·落日白马上的古代战士',
    prompt: 'Christopher Nolan epic historical IMAX 70mm film still, ancient warrior rides white horse along desert shore beach at golden sunset, grand solemn pre-war atmosphere, vertical wide landscape composition, rider-horse on left foreground, massive sunset sky with large negative space, long distant line of troops, low golden sunset backlight, long soft ground shadows, sun low near horizon, warm honey-gold and sand-beige palette, wet reflective shore sand, desert dune texture, hazy distant army silhouettes, photorealistic, ultra fine detail, 70mm IMAX film grain --ar 9:16 --style raw',
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

const ids = new Set(prompts.map(p => p.id));
for (const item of newItems) {
  if (ids.has(item.id)) throw new Error(`ID 冲突: ${item.id}`);
  ids.add(item.id);
}

prompts.push(...newItems);
fs.writeFileSync(path, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`已添加 ${newItems.length} 条，母本现在 ${prompts.length} 条`);
console.log('新增 ID:', newItems.map(x => x.id).join(', '));
