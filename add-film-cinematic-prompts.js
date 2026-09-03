/**
 * 追加 4 条经典电影电影感 Midjourney / Flux / Runway / Sora 提示词（用户投稿）
 * 构成"好莱坞电影感 Midjourney 提示词专区"扩展：黑客帝国 / 银翼杀手2049 / 教父 / 星际穿越
 * 运行: node add-film-cinematic-prompts.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const source = '用户投稿（好莱坞电影感 Midjourney 提示词专区）';
const sourceUrl = '';
const contributor = '@用户';

// 组合：主「工业级提示词」+ 空行 + 视频运镜参数标注（Runway / Sora 可用）
const videoTag = '\n\n[视频运镜参数 · Runway / Sora]\n';

const newItems = [
  {
    id: 'cinematic-film-matrix-subway',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '黑客帝国', '赛博朋克', '黑色电影', 'AI绘画'],
    title: 'Stoic Figure in Abandoned Subway Tunnel (Matrix Green)',
    titleZh: '《黑客帝国》式·废弃地铁隧道中的冷峻身影',
    prompt:
`Cinematography Specification: Master shot inspired by The Matrix (1999), directed by the Wachowskis, cinematography by Bill Pope.
Camera & Optics: Shot on ARRIFLEX 435 with Panavision C-Series Anamorphic prime lenses, 40mm focal length, f/2.8, cinema shutter angle at 180 degrees. Prominent horizontal green-tinted anamorphic streaks, elliptical bokeh, subtle optical chromatic aberration at the extreme edges.
Subject & Wardrobe: A stoic figure wearing a heavy, bespoke high-gloss black leather trench coat with stiff tailored shoulders and deep micro-creases in the hide. Wearing vintage frameless oval dark sunglasses reflecting two small, sharp points of distant tungsten lamps. Standing motionless in the center of an abandoned, damp subway tunnel.
Lighting & Rig: High-contrast film-noir key lighting. Overhead industrial fluorescent strip lights (Kino Flo fluorescent tubes emitting 5400K daylight filtered through deep industrial green gels), casting dramatic top-down shadows across the subject's cheekbones and jawline. Pure black negative fill on the off-camera side creating deep shadow falloff.
Color Grading & Science: Emulating Kodak Vision 200T 5274 film stock with a specialized bleach-bypass cross-process; shadow tones and midtones pushed heavily into monochromatic phosphor-green and toxic olive-cyan, absolute black floor with zero red channel information, clean white highlights with a faint yellowish-green tint.
Environment & Micro-details: Sweating cracked ceramic green-tiled walls covered in microscopic grime, condensation droplets actively sliding down metallic electrical conduits, rain-slicked concrete floor with puddles exhibiting precise mirror reflections of overhead flickering fixtures, heavy suspended humid mist and micro-dust illuminated in the green beam paths, 35mm photochemical film grain texture, hyper-realistic tactile surfaces, 8k resolution, widescreen. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Continuous slow Steadicam push-in directly toward the subject's face at 24fps motion cadence, subtle lens breathing, fluorescent light flickering erratically at 60Hz, water droplets dripping in rhythmic slow-motion.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 520, copies: 52, score: 7.7
  },
  {
    id: 'cinematic-film-blade-runner-2049-monument',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '银翼杀手', '罗杰狄金斯', '科幻', 'AI绘画'],
    title: 'Wanderer at Ruined Brutalist Monument (Deakins Amber)',
    titleZh: '《银翼杀手2049》式·废墟巨像前的独行者',
    prompt:
`Cinematography Specification: Atmospheric grand-scale frame in the signature aesthetic of Denis Villeneuve and Roger Deakins' Blade Runner 2049 (2017).
Camera & Optics: Shot on ARRI ALEXA 65 with ARRI Prime DNA 35mm lens, open gate format, t/2.0 aperture, pristine optical clarity with perfectly controlled spherical aberration and subtle vignetting.
Subject & Scene: A solitary wanderer in a weathered, shearling-lined canvas trench coat stands on the cracked stone steps of a ruined brutalist museum pavilion. Massive monolithic stone statues partially submerged in radioactive red-orange fallout dust in the distant background.
Lighting & Rig: Giant bouncing soft lighting. An immense off-frame diffused backlight simulating a dying orange sun through heavy particulate haze, casting razor-sharp architectural shadows against the vast dust storm. Strong amber rim lighting outlining the subject's silhouette against an oppressive, murky horizon. No fill light—pure chiaroscuro silhouette effect.
Color Pipeline & LUT: Radical monochromatic sodium-vapor amber and dense crimson-apricot palette. Highly saturated cadmium orange atmosphere with deep bronze midtones and charcoal-grey negative space; muted cyan highlights suppressed to near-zero.
Environment & Atmospheric Physics: Heavy volumetric particulate dust suspended in the air, dense radioactive sandstorm haze causing extreme Tyndall light rays, macro-texture of weathered sandstone with erosion cracks, granular dust settling on the shoulders of the canvas coat, fine-grained digital cinema sensor noise, ultra-high dynamic range (HDR), breathtaking composition, museum-quality photorealism, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Slow, monumental low-angle tracking shot drifting horizontally from left to right, revealing the colossal scale of the background monument, swirling orange dust particles caught in the backlight at 24fps, cinematic stillness.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 540, copies: 54, score: 7.7
  },
  {
    id: 'cinematic-film-godfather-don-portrait',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '教父', '戈登威利斯', '黑色电影', 'AI绘画'],
    title: 'Aging Mafia Don in Shadowed Armchair (Willis Top-Light)',
    titleZh: '《教父》式·阴影中的年迈教父肖像',
    prompt:
`Cinematography Specification: Intimate dramatic cinematic portrait in the distinct visual style of Gordon Willis' cinematography for The Godfather (1972).
Camera & Optics: Shot on 35mm Kodak 5254 color negative film with Panavision C-Series vintage prime lenses, 75mm portrait focal length, stopped down to f/4.0 for rich depth and edge-to-edge organic softness. Warm halation glow around high-contrast edges.
Subject & Wardrobe: An aging Italian mafia don seated in an antique hand-carved mahogany armchair, wearing an immaculate bespoke charcoal wool tuxedo, crisp white pleated dress shirt, and an ultra-detailed blood-red fresh rose boutonnière pinned to the left lapel. Weathered skin with deep facial lines, silver-grey hair brushed back with vintage pomade sheen.
Lighting & Top-Light Setup: Willis' signature radical top-down overhead practical lighting. A single low-hanging amber-shaded chandelier positioned directly above, casting deep, impenetrable black voids inside the eye sockets, carving sharp shadows under the brow bone and nose, while leaving the entire background in underexposed pitch-black darkness (Zone II on the Zone System).
Color Grading & Film Stock: Warm vintage Technicolor palette; rich sepia, burnished gold, deep mahogany leather tones, muted olive shadows. Heavy celluloid organic film grain, uncompressed shadow density, authentic 1970s analog warmth.
Atmosphere & Physical Props: Swirling ribbons of translucent blue cigar smoke lazily cutting through the downward golden light cone, micro-pores and sweat on aged skin, gold cufflinks reflecting tiny warm specular highlights, heavy velvet curtains absorbing all stray light, masterpiece historical oil-painting aesthetic, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Extremely slow cinematic push-in (creeping dolly zoom) moving in inches per second toward the Don's shadowed eyes, delicate ribbon of cigar smoke twisting upwards through the beam of light, completely stable tripod shot.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 510, copies: 51, score: 7.6
  },
  {
    id: 'cinematic-film-interstellar-blackhole',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '星际穿越', '诺兰', '太空', 'AI绘画'],
    title: 'Endurance Orbiting a Scientifically Accurate Black Hole',
    titleZh: '《星际穿越》式·环绕黑洞的"坚忍号"',
    prompt:
`Cinematography Specification: Majestic hard science-fiction IMAX space shot inspired by Christopher Nolan's Interstellar (2014), cinematography by Hoyte van Hoytema, physics modeled by Kip Thorne.
Camera & Optics: Shot on IMAX 70mm 15-perf film with custom Hasselblad 50mm spherical prime lens, pristine optical sharpness, zero barrel distortion, subtle horizontal light flares with prismatic split chromatic dispersion on specular reflections.
Subject & Scene: The modular spacecraft Endurance (a ring of interconnected white pressurized modules and solar arrays) floating weightlessly in the foreground. In the background looms a scientifically accurate supermassive black hole: a pitch-black spherical event horizon warped by gravitational lensing, surrounded by a swirling, multi-layered accretion disk of incandescent golden-white plasma bending above and below the shadow.
Lighting & Shadow Physics: True outer space hard lighting. Single-source, blindingly sharp unfiltered solar sunlight hitting one side of the spacecraft at 6000K daylight balance, creating extreme specular highlights on thermal white tiles and gold foil insulation, while the unlit side falls into pure, stark vacuum shadow without atmospheric bounce.
Color Grading & Texture: Clean Kodak Vision3 5207 250D film palette. Pure obsidian space void, blinding hydrogen-white and deep stellar amber accretion plasma. Visible microscopic rivets, carbon fiber weave, micrometeorite abrasions on spacecraft hull plates, real 70mm analog celluloid grain, grand cosmic scale, photorealistic, 8k. --ar 1.43:1 --style raw --v 6.1` +
videoTag +
`Slow, mathematically smooth zero-gravity orbital flyby past the spacecraft's heat shields, accretion disk plasma swirling in physically accurate relativistic motion, silent cosmic grandeur, 24fps motion blur on spinning module.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 560, copies: 56, score: 7.8
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
