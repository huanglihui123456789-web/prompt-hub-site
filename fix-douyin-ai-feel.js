/**
 * 原地重写 6 条抖音(泡面AIGC)诺兰提示词，去除"AI 味"
 * 注意：这 6 条 source 标注为 @泡面AIGC（外部源）。按用户 2026-09-03 明示选择，
 *       接受"外部源零改动"红线被弯曲，整条原地替换；source/contributor 元数据保持不动。
 * 去除：photorealistic / ultra detailed / hyperrealistic / ultra fine detail 等质量词；
 *       6 条重复的 "Christopher Nolan cinematic shot, IMAX 70mm film" 套话开头；
 *       填空式情绪结尾（mysterious vast atmosphere / epic solemn tragic atmosphere 等）。
 * 运行: node fix-douyin-ai-feel.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const revised = {
  'douyin-paomian-nolan-dunkirk-wreck':
`A lone man seen from behind stands on a desolate tidal beach, watching a burning crashed fighter-plane wreck. Medium-wide shot, the figure in the foreground and the blazing wreck in the mid-ground, the flat endless shore running to the horizon. Dusk twilight, low ambient light — the fire throws a warm reflection across the wet sand while the evening sky stays cool and dim, flame-orange against teal shadow. Scorched metal, thick billowing black smoke, damp muddy ground; coarse 70mm IMAX grain. --ar 16:9 --style raw`,

  'douyin-paomian-nolan-interstellar-library':
`A lone astronaut floats inside the Interstellar tesseract — infinite stacked mirrored cubic library layers, a surreal fold of time and space. Circular portal framing, the figure centered, deep radial perspective pulling the eye inward. Cool metallic reflective light with glowing golden strip accents, deep black shadow behind, polished surfaces throwing refraction streaks; heavy 70mm IMAX grain. --ar 1:1 --style raw`,

  'douyin-paomian-nolan-inception-paris':
`A surreal folding Paris street, the dream-reality distortion drawn tight — stacked bending layers of buildings folding over one another. A man at bottom-left looks up toward the twisted architecture. Low-angle street perspective, bright crisp daylight, soft but hard-edged building shadows, warm beige-ochre stone facades, a vivid clear blue sky. Detailed old Parisian architecture, iron balcony railings, asphalt texture; subtle 70mm IMAX grain. --ar 4:5 --style raw`,

  'douyin-paomian-nolan-trojan-horse':
`An ancient Trojan horse on a stormy seashore; crowds of tiny men haul the huge wooden structure with thick ropes along the beach. Vertical composition, wide low-angle shot, the horizon pinned to the lower third with a large empty sky above. Dramatic backlight from a sun piercing heavy storm clouds, strong silhouettes, rim lighting; a desaturated muted grey-green palette like a vintage faded photograph, heavy grain with old scratch texture, rough sand, turbulent waves, a moody cloudy sky. --ar 9:16 --style raw`,

  'douyin-paomian-nolan-joker-mask':
`A man seen from behind walks across a downtown city street, a clown mask held in one hand — quiet inner tension, urban solitude. Medium shot, the figure centered in the foreground, a long straight street receding into the distance. Bright harsh midday sunlight, crisp hard pavement shadows, a natural muted urban grade, concrete high-rises and street signs, weathered dark suit fabric; fine 70mm IMAX grain. --ar 1:1 --style raw`,

  'douyin-paomian-nolan-ancient-warrior-horse':
`An ancient warrior rides a white horse along a desert shore at golden sunset, a grand solemn pre-war stillness. Vertical wide composition, rider and horse at left foreground, a massive sunset sky with large negative space, a long distant line of troops. Low golden backlight, long soft ground shadows, the sun near the horizon; a warm honey-gold and sand-beige palette, wet reflective shore sand, desert dune texture, hazy distant army silhouettes; 70mm IMAX grain. --ar 9:16 --style raw`
};

let n = 0;
for (const p of prompts) {
  if (revised[p.id]) {
    if (p.prompt === revised[p.id]) {
      console.log('无变化 (跳过):', p.id);
    } else {
      p.prompt = revised[p.id];
      n++;
      console.log('已重写:', p.id);
    }
  }
}
if (n === 0) {
  console.log('没有需要改写的条目，退出');
  process.exit(0);
}
fs.writeFileSync(path, prefix + JSON.stringify(prompts, null, 1) + suffix, 'utf8');
console.log(`完成，共重写 ${n} 条，母本现在 ${prompts.length} 条`);
