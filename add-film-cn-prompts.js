/**
 * 追加 6 条华语经典电影电影感 Midjourney / Flux / Runway / Sora 提示词（WorkBuddy 原创）
 * 严格沿用 add-film-cinematic-prompts.js 的样式：分段结构 + 末尾 [视频运镜参数 · Runway / Sora]
 * 影片：花样年华 / 英雄 / 卧虎藏龙 / 阳光灿烂的日子 / 红高粱 / 悲情城市
 * 运行: node add-film-cn-prompts.js
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
    id: 'cinematic-film-cn-in-the-mood-for-love-corridor',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '花样年华', '王家卫', 'AI绘画'],
    title: 'Qipao Woman in Nested Corridor Frames (Wong Kar-wai Red-Green)',
    titleZh: '《花样年华》式·框中框走廊里的旗袍身影',
    prompt:
`Cinematography Specification: Intimate restrained romantic frame in the distinct visual style of Wong Kar-wai's In the Mood for Love (2000), cinematography by Christopher Doyle and Mark Lee Ping-bing.
Camera & Optics: Shot on ARRIFLEX 535B with Cooke S4 spherical prime lenses, 40mm focal length, f/2.0, shallow depth of field isolating the subject against deep architectural recession. Subtle camera breathing, soft halation around practical lamps, gentle horizontal flare from corridor windows.
Subject & Wardrobe: A woman in a form-fitting qipao with intricate embroidered floral patterns, her back turned, standing in a narrow apartment-building corridor; a man in a slim tailored suit paused a few steps behind, neither facing the other. The patterned qipao fabric catches warm tungsten light.
Lighting & Rig: Warm practical tungsten key from a single overhead corridor bulb, supplemented by a green-tinted neon spill leaking from a side doorway. Hard frame-within-frame composition: the subject framed by a doorway, then by a wall mirror, then by the corridor perspective, multiple nested rectangles of negative space.
Color Grading & Science: Heavy saturation push on vermilion red and deep jade green; skin tones warmed to amber; shadows lifted slightly with a chocolate-brown floor. Emulating Kodak Vision2 500T with a cross-processed dye-transfer look; fine 1960s Hong Kong tenement grain.
Environment & Micro-details: Cracked mosaic floor tiles, a rattan chair with worn edges, wisps of cigarette smoke drifting through a shaft of amber light, a radio faintly glowing, condensation on a glass of iced tea, muted wallpaper patterns, 35mm photochemical grain, hyper-realistic textile weave, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Extremely slow lateral dolly tracking the subject along the corridor, pausing to let a doorway frame her, faint flicker of the overhead bulb at 50Hz, smoke curling in near-stillness at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 500, copies: 50, score: 7.7
  },
  {
    id: 'cinematic-film-cn-hero-autumn-forest',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '英雄', '张艺谋', 'AI绘画'],
    title: 'Crimson Duel Amid Swirling Golden Leaves (Zhang Yimou Monochrome)',
    titleZh: '《英雄》式·漫天黄叶中的红衣对决',
    prompt:
`Cinematography Specification: Grand color-coded wuxia tableau inspired by Zhang Yimou's Hero (2002), cinematography by Zhao Xiaoding.
Camera & Optics: Shot on ARRIFLEX 435 with Panavision C-Series anamorphic prime lenses, 50mm focal length, f/4.0 for expansive deep focus, pristine optical clarity with elongated horizontal flares. Slow meditative motion, locked-off wide masters punctuated by creeping dolly moves.
Subject & Scene: Two figures in flowing crimson robes dueling amid a storm of swirling golden leaves in an endless autumn forest; behind them a colossal lacquered Qin palace gate rising into mist. One warrior suspended mid-leap, sleeves trailing like brushstrokes.
Lighting & Rig: Soft overhead autumn sunlight diffused through dense canopy, casting dappled amber pools on the forest floor. No hard key, only naturalistic leaf-filtered light and a faint warm backlight rimming the figures against the haze. Deliberate negative space: the characters occupy a tiny fraction of an immense frame.
Color Grading & Science: Monochromatic vermilion chapter, every element pushed into a single saturated red-orange register, from the leaves to the robes to the soil. Clean highlights with a faint paper-yellow tint; shadows rendered as deep oxblood. Emulating Kodak Vision 200T with a theatrical dye-transfer palette; inky, calligraphic density.
Environment & Atmospheric Physics: Thousands of practical artificial leaves rigged on wires drifting in choreographed arcs, fine dust motes suspended in low amber light, rippling silk of the robes, lacquer cracks on the palace gate, layered depth haze, restrained 35mm grain, museum-quality composition, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Slow 360-degree orbit around the suspended leaping figure, leaves sweeping past the lens in rhythmic spirals, the palace gate revealed through parting mist at 24fps, complete stillness between sword strikes.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 520, copies: 52, score: 7.7
  },
  {
    id: 'cinematic-film-cn-crouching-tiger-bamboo',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '卧虎藏龙', '李安', 'AI绘画'],
    title: 'Weightless Duel in Emerald Bamboo Sea (Ang Lee Teal)',
    titleZh: '《卧虎藏龙》式·青绿竹海中的失重对决',
    prompt:
`Cinematography Specification: Weightless wuxia elegance in the signature visual style of Ang Lee's Crouching Tiger, Hidden Dragon (2000), cinematography by Peter Pau.
Camera & Optics: Shot on ARRIFLEX 535B with Panavision Primo anamorphic primes, 40mm focal length, f/2.8, graceful Steadicam floating moves. Soft, rounded optical rendering with delicate anamorphic bokeh; subtle diffusion for a painterly, ink-wash softness.
Subject & Scene: Two martial artists in a pale linen robe and an indigo tunic leaping weightlessly between towering emerald bamboo stalks, limbs extended in mid-air combat, a slender sword flashing. Below, a mist-filled forested valley recedes into teal distance.
Lighting & Rig: Cool diffused morning light breaking through high bamboo canopy, wrapped in heavy ground mist. Gentle top-light from a soft sky, no hard shadows, an even luminous emerald ambience. Occasional warm shaft of sunrise piercing the fog to rim the figures.
Color Grading & Texture: Dominant teal-green and jade palette with cool cyan shadows and a faint warm sunrise accent. Lifted blacks for an airy, ethereal quality; emulating Fujicolor negative with a soft pastel grade; fine analog grain like rice paper.
Environment & Micro-details: Swaying bamboo leaves catching dew, individual droplets arcing through the air, woven fiber of the robes, bark texture of ancient stalks, layered mountain haze, a distant temple roof emerging from cloud, moist atmospheric scatter, 35mm photochemical grain, photorealistic, 8k. --ar 2.39:1 --style raw --v 6.1` +
videoTag +
`Fluid Steadicam rising and circling the airborne duel, bamboo foreground swaying in parallax, mist rolling through the valley in slow undulation at 24fps, weightless drifting motion.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 510, copies: 51, score: 7.7
  },
  {
    id: 'cinematic-film-cn-heat-of-the-sun-rooftop',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '阳光灿烂的日子', '姜文', 'AI绘画'],
    title: 'Bare-Chested Boys on Sun-Bleached Rooftops (Jiang Wen Gold)',
    titleZh: '《阳光灿烂的日子》式·金黄屋顶上的少年',
    prompt:
`Cinematography Specification: Sun-drenched adolescent nostalgia in the visual style of Jiang Wen's In the Heat of the Sun (1994), cinematography by Gu Changwei.
Camera & Optics: Shot on ARRIFLEX 535 with Cooke S4 spherical primes, 32mm focal length, f/2.8 with intentional anamorphic-style flare, hand-held with loose, breathing camerawork. Heavy overt exposure, near-blown highlights, organic lens bloom.
Subject & Scene: A group of bare-chested teenage boys laughing on the rooftops of Soviet-style Beijing courtyard buildings, one mid-stride on a red-painted water tower, summer haze shimmering behind them. A bicycle leaning against a sun-bleached wall.
Lighting & Rig: Harsh overhead summer sun at golden hour, aggressive natural backlight producing blinding lens flares and chromatic fringing. Minimal fill, the sun does the work; practical bounce off pale walls. Deliberately overexposed to a dreamlike, memory-filtered glow.
Color Grading & Science: Intense warm push into amber and honey gold; skies bleached toward white; skin sunkissed. Emulating Kodak Vision 500T pushed and cross-processed for nostalgic heat; heavy halation around light sources; coarse 1970s grain.
Environment & Micro-details: Cracked concrete rooftops, peeling red paint, cicada-hum heat haze, dust motes in shafts of light, sweat sheen on skin, faded propaganda posters, dry grass, a radio on a windowsill, 35mm photochemical grain, hyper-realistic, 8k. --ar 1.85:1 --style raw --v 6.1` +
videoTag +
`Loose hand-held drift following the running boys across the rooftop, sudden flares as the lens catches the sun, a slow tilt up into the bleached summer sky at 24fps, restless adolescent energy.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 490, copies: 49, score: 7.6
  },
  {
    id: 'cinematic-film-cn-red-sorghum-sedan',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '红高粱', '张艺谋', 'AI绘画'],
    title: 'Crimson Bride in Swaying Sorghum Field (Zhang Yimou Blood-Red)',
    titleZh: '《红高粱》式·血红高粱地里的红衣新娘',
    prompt:
`Cinematography Specification: Raw, primal rural energy in the visual style of Zhang Yimou's Red Sorghum (1988), cinematography by Gu Changwei.
Camera & Optics: Shot on ARRIFLEX 35-3 with spherical prime lenses, 28mm wide focal length, f/4.0 for deep sun-baked focus, hand-held and low-slung. Naturalistic, unflinching optical hardness with minimal filtration.
Subject & Scene: A young woman in a crimson wedding dress riding in a swaying sedan chair through an endless field of blood-red sorghum, the stalks towering overhead; behind, a rowdy procession of villagers. Distant loess hills under a pitiless sun.
Lighting & Rig: Brutal direct noon sunlight with zero diffusion, hard, shadowless, bleached. Occasional warm bounce from the yellow earth. No artificial light; the harshness is the point, rendering the land as raw and alive.
Color Grading & Texture: Maximal saturation of scarlet sorghum and cadmium-yellow earth; skies a washed pale blue. Emulating Kodak 5247 with a heavy dye-transfer punch; gritty, sun-bleached grain; organic, almost documentary immediacy.
Environment & Micro-details: Individual sorghum stalks whipping past the lens, dry soil kicked up by feet, sweat on sunburnt skin, the rough weave of the sedan chair, flapping red fabric, dust devils on the horizon, cicada heat, 35mm photochemical grain, photorealistic, 8k. --ar 1.85:1 --style raw --v 6.1` +
videoTag +
`Low-angle tracking shot rushing through the swaying red sorghum at running pace, the sedan chair lurching in frame, dust and stalks whipping past, a sudden tilt to the blinding sun at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 500, copies: 50, score: 7.6
  },
  {
    id: 'cinematic-film-cn-a-city-of-sadness-parlor',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '华语电影', '悲情城市', '侯孝贤', 'AI绘画'],
    title: 'Family in Dim 1940s Parlor, Static Long Take (Hou Naturalism)',
    titleZh: '《悲情城市》式·幽暗客厅里的静默家族',
    prompt:
`Cinematography Specification: Quiet, observant period naturalism in the visual style of Hou Hsiao-hsien's A City of Sadness (1989), cinematography by Chen Huai-en.
Camera & Optics: Shot on ARRIFLEX 35-3 with Cooke S4 spherical primes, 50mm focal length, f/2.8, locked-off static tripod frames with deep focus from foreground to back wall. Patient, motionless camera; occasional slow, imperceptible pan.
Subject & Scene: A family gathered in a dimly lit 1940s Taiwanese mountain-village parlor, an elderly man seated in shadow near a paper-screened window, a child playing silently on the wooden floor, a radio faintly glowing on a side table. A figure occasionally crosses the deep background.
Lighting & Rig: Pure available natural light only, soft overcast daylight filtering through shoji screens and a single doorway, casting a gentle gradient from lit threshold to near-black interior corners. No film lights; the room breathes with real-time daylight shifts.
Color Grading & Science: Muted, earthy palette of weathered wood brown, faded indigo and dust-grey; restrained, low-contrast. Emulating Kodak 5247 with a desaturated, period-authentic grade; fine, unobtrusive grain; deep, honest shadow detail.
Environment & Micro-details: Grain of unfinished wooden floorboards, a hanging paper lantern, condensation on a glass jar, dust motes drifting through the doorway beam, faded calligraphy scrolls, a slow ceiling fan, rain on the tiled roof heard more than seen, 35mm photochemical grain, photorealistic, 8k. --ar 1.66:1 --style raw --v 6.1` +
videoTag +
`Completely static master shot held for a long duration, life unfolding within the frame, a figure slowly crossing the background, faint flicker of the radio dial, imperceptible daylight shift at 24fps.`,
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 480, copies: 48, score: 7.6
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
