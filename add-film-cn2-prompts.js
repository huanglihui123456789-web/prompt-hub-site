/**
 * 追加第 2 批 6 条华语经典电影电影感 Midjourney / Flux / Runway / Sora 提示词（WorkBuddy 原创）
 * 严格沿用 add-film-cn-prompts.js 的样式：分段结构 + 末尾 [视频运镜参数 · Runway / Sora]
 * 影片：霸王别姬 / 东邪西毒 / 一一 / 饮食男女 / 无间道 / 城南旧事
 * 运行: node add-film-cn2-prompts.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const source = 'WorkBuddy 原创（经典电影电影感 Midjourney 提示词专区）';
const sourceUrl = '';
const contributor = '@WorkBuddy';

const videoTag = '\n\n[视频运镜参数 · Runway / Sora]\n';

const newItems = [
  {
    id: 'cinematic-film-cn-farewell-my-concubine-stage',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '霸王别姬', '陈凯歌', 'AI绘画'],
    title: 'Androgynous Dan Character on Operatic Stage (Chen Kaige Crimson-Gold)',
    titleZh: '《霸王别姬》式·浓墨重彩戏台上的旦角',
    prompt:
`Cinematography Specification: Opulent, dreamlike Peking-opera spectacle in the visual style of Chen Kaige's Farewell My Concubine (1993), cinematography by Gu Changwei.
Camera & Optics: Shot on ARRIFLEX 535B with Cooke S4 spherical prime lenses, 50mm focal length, f/2.8, slow hovering dolly moves with deliberate, theatrical pacing. Soft halation around stage lanterns, gentle internal flare, a faint double-exposure ghosting where backstage mirror meets the stage.
Subject & Wardrobe: A slender performer in full female dan regalia, an embroidered crimson opera robe with sweeping sleeves, an ornate headdress of seed pearls and mirrored fins, elaborate painted face in white, vermilion and ink. Poised mid-gesture, fingers curved like petals, gaze both vacant and burning.
Lighting & Rig: Warm footlight wash from the stage apron in amber and rose, crossed with a cold top key from the flies, carving the face into relief. Heavy practical lanterns in the wings throw elongated shadows across brocade curtains; the audience swallowed in near-total black.
Color Grading & Science: Saturated vermilion and imperial gold dominating the frame, with cool teal shadows for contrast; skin tones pushed toward porcelain. Emulating Kodak Vision 500T with a dyed, theatrical transfer; fine period grain; a gilded, painted-opera density.
Environment & Micro-details: Dust motes drifting in the footlight beams, the cracked lacquer of a backstage mirror, sweat beading beneath the makeup, sequins glinting on the headdress, frayed tassels of the sleeves, incense smoke curling at the wings, 35mm photochemical grain, photorealistic, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Slow push-in toward the painted face as the performer holds the gesture, a single lantern swaying casting moving shadow, mirror reflection dissolving into the stage at 24fps, theatrical stillness.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 500, copies: 50, score: 7.7
  },
  {
    id: 'cinematic-film-cn-ashes-of-time-desert',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '东邪西毒', '王家卫', 'AI绘画'],
    title: 'Lonely Swordsman in Golden Desert (Wong Kar-wai Wasteland)',
    titleZh: '《东邪西毒》式·泛黄荒漠里的孤身剑客',
    prompt:
`Cinematography Specification: Fragmented, melancholic wuxia in the visual style of Wong Kar-wai's Ashes of Time (1994), cinematography by Christopher Doyle.
Camera & Optics: Shot on ARRIFLEX 535B with Cooke S4 spherical primes, 40mm focal length, f/2.0, restless hand-held drifting with abrupt, breath-held pauses. Strong anamorphic-style flare, heavy halation, occasional jump-cut ellipsis leaving the subject displaced in frame.
Subject & Scene: A lone swordsman in worn leather armor and a sun-bleached cloak sitting by a shallow desert watering hole, a rusted sword planted in the sand beside him, a single vulture circling overhead. Behind, endless ochre dunes meet a bleached sky.
Lighting & Rig: Harsh slanted desert sun at low angle, producing long raking shadows and blinding rim light on the brow and shoulder. Minimal fill; the wind-blown dust catches the light into thin gold veils. A frame-within-frame of a cracked adobe doorway isolating the figure.
Color Grading & Science: Heavy yellow-amber monochrome push, skies and sand fused into a single sun-bleached register, with cool cyan only in rare water reflections. Emulating Kodak Vision 500T cross-processed toward sepia; coarse, sun-warped grain; a faded, memory-eroded palette.
Environment & Micro-details: Ripples on the water hole, cracked mud at its rim, wind-carved dune ridges, the frayed edge of the cloak, sand grains clinging to leather, a discarded gourd, heat shimmer over the horizon, 35mm photochemical grain, photorealistic, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Slow lateral drift across the dunes toward the seated figure, a cut to his mirrored reflection in the water, vulture wheeling overhead, dust veils crossing the lens at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 510, copies: 51, score: 7.7
  },
  {
    id: 'cinematic-film-cn-yi-yi-rain-window',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '一一', '杨德昌', 'AI绘画'],
    title: 'Quiet Taipei Family Behind Rain-Streaked Glass (Edward Yang Realism)',
    titleZh: '《一一》式·雨痕玻璃后的台北中产家庭',
    prompt:
`Cinematography Specification: Understated urban realism in the visual style of Edward Yang's Yi Yi (2000), cinematography by Yang's regular team.
Camera & Optics: Shot on ARRIFLEX 535B with Cooke S4 spherical primes, 32mm focal length, f/4.0 for deep, honest focus, locked-off frames and patient slow pans. Restrained, almost documentary optics with no flare, no diffusion.
Subject & Scene: A middle-class Taipei apartment interior seen partly through a rain-streaked window; an elderly woman resting in a hospital bed, a young boy crouched by a fish tank, everyday clutter of a lived-in home in soft focus behind. The city skyline blurred through condensation.
Lighting & Rig: Flat, overcast daylight from a wide window, cool and even, with a single warm practical lamp on a side table. No film lights; the natural grey light of a Taipei afternoon, honest and unhurried.
Color Grading & Science: Muted, desaturated urban palette of pale grey-green, concrete beige and faint fluorescent blue; restrained, low-contrast. Emulating Kodak 5247 with a clean, contemporary grade; fine, unobtrusive grain; truthful shadow detail.
Environment & Micro-details: Rain tracks on the window glass, a bubble in the fish tank, peeled label on a medicine bottle, creased newspaper on the floor, dust on a computer monitor, a plastic chair, distant traffic blur, 35mm photochemical grain, photorealistic, 8k. --ar 1.85:1 --style raw --v 6.1` +
videoTag +
`Completely static frame on the window, then a slow imperceptible pan from the rain glass to the resting figure, a raindrop sliding down the pane at 24fps, quiet domestic time.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 480, copies: 48, score: 7.6
  },
  {
    id: 'cinematic-film-cn-eat-drink-man-woman-kitchen',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '饮食男女', '李安', 'AI绘画'],
    title: 'Lavish Banquet Spread in Warm Kitchen (Ang Lee Hearth-Glow)',
    titleZh: '《饮食男女》式·暖光厨房里的丰盛家宴',
    prompt:
`Cinematography Specification: Warm, sensual domestic intimacy in the visual style of Ang Lee's Eat Drink Man Woman (1994), cinematography by Lin Yong-hong.
Camera & Optics: Shot on ARRIFLEX 535B with Cooke S4 spherical primes, 40mm focal length, f/2.8, gentle handheld drifting between counter and table, close tactile inserts. Soft natural rendering with delicate highlights on glistening food.
Subject & Scene: A bustling traditional Chinese kitchen, an aged master chef in a white tunic plating a staggering spread, steamed fish, lacquered duck, braised pork, jade vegetables, a round dining table set for a family reunion. Steam rising from bamboo baskets.
Lighting & Rig: Warm tungsten practicals from hanging kitchen lamps, supplemented by soft window daylight; a gentle top key on the food producing glossy speculars. No hard shadows, an enveloping hearth glow; occasional cool daylight spill from the yard for contrast.
Color Grading & Science: Rich, appetizing palette of burnished gold, deep mahogany and emerald greens, skin and broth warmed to amber. Emulating Kodak Vision 500T with a gentle, food-friendly grade; fine grain; honest, lived-in warmth.
Environment & Micro-details: Beads of oil on roasted skin, steam curling under the lamp light, the grain of a wooden cutting board, condensation on a porcelain bowl, chopstick shadows on linen, a simmering pot, fallen scallion bits, 35mm photochemical grain, photorealistic, 8k. --ar 1.85:1 --style raw --v 6.1` +
videoTag +
`Slow creeping move from the sizzling wok to the laid table, steam billowing past the lens, a hand placing the final dish, warm flicker of the hanging lamp at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 500, copies: 50, score: 7.6
  },
  {
    id: 'cinematic-film-cn-infernal-affairs-rooftop',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '无间道', '刘伟强', 'AI绘画'],
    title: 'Two Suits Confronting on Rain-Soaked Rooftop (Andrew Lau Neon-Noir)',
    titleZh: '《无间道》式·雨夜天台上的双雄对峙',
    prompt:
`Cinematography Specification: Tense Hong Kong neon-noir in the visual style of Andrew Lau's Infernal Affairs (2002), cinematography by Lai Yiu-fai and Ng Man-ching.
Camera & Optics: Shot on ARRIFLEX 435 with Cooke S4 spherical primes, 35mm focal length, f/2.0, restless hand-held with aggressive push-ins and abrupt cuts. Strong anamorphic-style flare, wet reflections, hard speculars off rain.
Subject & Scene: Two men in dark suits standing face to face on a rain-lashed rooftop above a glittering skyline, one holding a pistol low at his side, the other motionless, a concrete water tower looming behind. Neon signs blur in the deep background.
Lighting & Rig: Cold blue city spill from below, crossed with a single warm tungsten practical near the door, carving hard rim light on wet shoulders. Dramatic overhead flood catching the rain into silver threads; deep shadow swallowing the rooftop edges.
Color Grading & Science: Cold teal-and-blue urban night with isolated warm amber accents; high contrast, inky blacks. Emulating Kodak Vision 500T pushed with a noir grade; fine, crisp grain; a fatalistic, surveilled density.
Environment & Micro-details: Rain striking the concrete into splashes, puddle reflections of distant neon, the wet sheen on the suit fabric, cigarette smoke cut by the floodlight, a discarded shell casing, dripping water tower, 35mm photochemical grain, photorealistic, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Tight push-in alternating between the two faces in shot-reverse-shot, rain hammering between them, a slow tilt up to the cold skyline, hold on the gun at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 520, copies: 52, score: 7.7
  },
  {
    id: 'cinematic-film-cn-old-beijing-hutong',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '城南旧事', '吴贻弓', 'AI绘画'],
    title: 'Child in Republic-Era Hutong, Soft Nostalgia (Wu Yigong Warm-Haze)',
    titleZh: '《城南旧事》式·民国北平胡同里的童真',
    prompt:
`Cinematography Specification: Tender, poetic period nostalgia in the visual style of Wu Yigong's My Memories of Old Beijing (1983), cinematography by Cao Wei-ye.
Camera & Optics: Shot on ARRIFLEX 35-3 with spherical prime lenses, 40mm focal length, f/2.8, slow, floaty dolly moves at a child's eye level. Soft, gentle halation, an almost storybook diffusion; occasional frame-within-frame of a lattice window.
Subject & Scene: A small girl in a padded cotton jacket standing at the mouth of a narrow Beijing hutong, an old camphor-wood trunk beside her, a camel caravan faintly passing in the distance, gray-brick courtyards receding into haze. Paper lanterns strung overhead.
Lighting & Rig: Soft, diffuse winter sunlight filtered through bare branches, warm and low-contrast, with a faint golden backlight through the alley. No hard key; a gentle, memory-soft glow enveloping the scene.
Color Grading & Science: Warm sepia and faded brick-red palette, skies a pale washed blue, gentle overall lift. Emulating Kodak 5247 with a nostalgic, literary grade; fine, unobtrusive grain; a faded-photograph softness.
Environment & Micro-details: Cracks in the gray brick, frost on the eaves, the weave of the cotton jacket, fallen elm seeds on the ground, steam from a distant food stall, a stray cat in the shadows, dust motes in the low sun, 35mm photochemical grain, photorealistic, 8k. --ar 1.66:1 --style raw --v 6.1` +
videoTag +
`Slow float at child height down the hutong, pausing at the lattice window framing the distance, a lantern swaying, the camel caravan fading into haze at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 470, copies: 47, score: 7.6
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
