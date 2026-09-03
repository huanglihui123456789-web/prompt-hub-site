/**
 * 追加 10 条好莱坞电影感 Midjourney 提示词（加长版，每条 120~150 词）
 * 来源：WorkBuddy 原创，构成"AI 美学绘画提示词"专区
 * 运行: node add-hollywood-prompts.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const source = 'WorkBuddy 原创（好莱坞电影感 Midjourney 提示词专区）';
const sourceUrl = '';
const contributor = '@WorkBuddy';

const newItems = [
  {
    id: 'hollywood-cinematic-nolan-space-station',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '诺兰', '太空', 'AI绘画'],
    title: 'Astronaut at Edge of Rotating Space Station',
    titleZh: '诺兰式·旋转空间站边缘的宇航员',
    prompt: 'A solitary astronaut in a weathered magnesium-white EVA suit standing at the extreme edge of a colossal slowly rotating O\'Neill cylinder space station, one hand resting on the railing, the curved interior habitat with terraced gardens and miniature cities far below, Earth\'s luminous blue crescent filling the panoramic viewport behind them, practical volumetric lighting mixed with hard directional sunlight raking across the hull, IMAX 65mm large-format captured on Panavision DXL2, coarse photochemical film grain, anamorphic lens flare blooming from the right, f/8 deep focus from foreground glove to infinite starfield, chiaroscuro contrast between sunlit metal and shadowed habitat, Hans Zimmer Interstellar gravitas, awe tempered with profound isolation, meticulous production design, photorealistic, cinematic teal-shadow and warm-key grade --ar 2.39:1 --style raw --stylize 250 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 880, copies: 90, score: 7.5
  },
  {
    id: 'hollywood-cinematic-blade-runner-boulevard',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '银翼杀手', '赛博朋克', 'AI绘画'],
    title: 'Detective in Neon Rain Boulevard',
    titleZh: '银翼杀手式·霓虹雨夜大道',
    prompt: 'A lone detective silhouette in a long tattered trench coat walking away from camera down the center of a rain-slicked neon boulevard, a massive holographic geisha advertisement flickering on the left, volumetric amber and cyan fog rolling between brutalist megastructures, reflections of signage smeared across the wet asphalt and cobblestones, shot on 35mm Kodak Vision3 500T pushed one stop, Roger Deakins cinematography, anamorphic Cooke S4 glass with characteristic blue-streak flares, shallow depth of field with the figure razor-sharp and the city melting into bokeh, desaturated teal-orange grade, dystopian humidity, every droplet catching neon, hyper-detailed, contemplative and noir, Brechtian scale of architecture dwarfing the human --ar 2.39:1 --style raw --stylize 200 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 920, copies: 95, score: 7.5
  },
  {
    id: 'hollywood-cinematic-dunkirk-beach',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '战争', '敦刻尔克', 'AI绘画'],
    title: 'Soldier at Besieged Shoreline',
    titleZh: '敦刻尔克式·被困海滩上的士兵',
    prompt: 'A kneeling soldier in mud-caked battlefield uniform clutching a rifle at the shallow shoreline of a besieged beach, hundreds of silent troops queuing along the breaking waves under a bruised smoky sky, a downed Spitfire smoldering at the water\'s edge, churning surf reflecting the orange glow of distant fires, shot on IMAX 65mm with documentary immediacy, Christopher Nolan Dunkirk aesthetic, desaturated steel-grey and ember palette, coarse large-format grain, handheld urgency with shallow depth of field isolating the soldier\'s weathered face, oppressive low clouds, salt-spray mist, tension and weary resignation, practical smoke effects, photorealistic --ar 2.39:1 --style raw --stylize 150 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 760, copies: 80, score: 7.3
  },
  {
    id: 'hollywood-cinematic-film-noir-bar',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '黑色电影', 'Noir', 'AI绘画'],
    title: 'Femme Fatale in Deserted Jazz Club',
    titleZh: '黑色电影·空荡爵士俱乐部里的蛇蝎美人',
    prompt: 'A femme fatale in a silk slip dress seated at a smoked-glass bar in a deserted jazz club at 3am, the only other soul a shadowed pianist mid-ballad, a single overhead pendant casting a hard pool of warm light that catches the rim of her martini glass, venetian blind shadows slicing diagonally across her face and bare shoulder, cigarette smoke curling through a shaft of backlight, shot on black-and-white 35mm Kodak Double-X, grain-rich high-contrast chiaroscuro, shallow focus isolating her eyes, Orson Welles Touch of Evil framing, every highlight razor-sharp against crushing blacks, longing and danger, film-noir mood, light and shadow as the only color --ar 4:5 --style raw --stylize 300 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 700, copies: 70, score: 7.2
  },
  {
    id: 'hollywood-cinematic-western-prairie',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '西部片', '宽银幕', 'AI绘画'],
    title: 'Gunslinger at Golden Hour Prairie',
    titleZh: '西部片·黄金时刻草原上的枪手',
    prompt: 'A lone gunslinger on a muscular Appaloosa horse silhouetted at golden hour on an endless windswept prairie, low raking sunlight throwing elongated shadows across knee-high grass, a distant frontier town smoldering on the horizon, dust motes dancing in the warm backlight, shot on anamorphic Panavision with classical Hollywood widescreen composition, Technicolor warmth with sun-bleached ochre and sage, sprawling negative space above the figure, John Ford Monument Valley grandeur, tactile leather and weathered denim detail, contemplative and mythic, fine 35mm grain, horizon pinned low for epic sky --ar 2.39:1 --style raw --stylize 200 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 680, copies: 65, score: 7.2
  },
  {
    id: 'hollywood-cinematic-wes-anderson-lobby',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '韦斯安德森', '对称构图', 'AI绘画'],
    title: 'Symmetrical Grand Hotel Lobby',
    titleZh: '韦斯·安德森式·对称大堂',
    prompt: 'A perfectly symmetrical Wes Anderson composition inside a pastel-pink grand hotel lobby, a centered concierge in a maroon uniform standing rigidly at an ornate reception desk, two identical potted palms flanking the frame, a grand staircase mirrored left and right, meticulous forensic production design with every prop placed by rule of thirds, shot on 35mm saturated film stock with candy-box color palette of rose, teal and mustard, deadpan frontal lighting, crisp and flat with zero shadow drama, whimsical and precisely controlled, rhythmic visual symmetry, noir-free pastel perfection --ar 1:1 --style raw --stylize 250 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 640, copies: 60, score: 7.1
  },
  {
    id: 'hollywood-cinematic-alien-cockpit',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '雷德利斯科特', '科幻', 'AI绘画'],
    title: 'Pilot in Futuristic Spacecraft Cockpit',
    titleZh: '雷德利·斯科特式·未来飞船驾驶舱',
    prompt: 'A cinematic interior of a futuristic spacecraft cockpit bathed in cold blue rim light, a lone pilot in a partial pressure suit slumped in a worn leather command chair, curved holographic displays projecting star charts and warning glyphs, practical console glow reflecting off brushed titanium surfaces, Ridley Scott Alien aesthetic with analog industrial texture, 65mm anamorphic with subtle photochemical grain, deep shadows swallowing the cabin corners, claustrophobic intimacy, bio-mechanical set design, tension of quiet before catastrophe, moisture-beaded pipes, photorealistic --ar 16:9 --style raw --stylize 200 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 720, copies: 75, score: 7.3
  },
  {
    id: 'hollywood-cinematic-lotr-mount-doom',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '指环王', '史诗奇幻', 'AI绘画'],
    title: 'Fellowship Against Mount Doom Eruption',
    titleZh: '指环王式·末日火山前的远征队',
    prompt: 'A Lord of the Rings scale wide shot of a fellowship of nine silhouetted against the cataclysmic eruption of Mount Doom at dawn, rivers of molten lava cascading down the mountainside, a vast roiling ash cloud swallowing the sky, New Zealand volumetric landscape with impossible scale, Peter Jackson epic realism, dramatic god-ray break in the clouds, tactile chainmail and weathered wool detail, Panavision anamorphic with deep focus from foreground figures to inferno, desaturated with ember and ash, mythic weight, embers drifting through the air --ar 2.39:1 --style raw --stylize 150 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 800, copies: 85, score: 7.4
  },
  {
    id: 'hollywood-cinematic-michael-mann-city',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '迈克尔曼', '都市夜景', 'AI绘画'],
    title: 'Lone Figure in Neon City Haze',
    titleZh: '迈克尔·曼式·霓虹都市中的孤影',
    prompt: 'A neo-noir cityscape at blue hour, rain-slicked boulevards reflecting a river of red taillights and cold white streetlamps, a lone figure in a sharp suit striding through volumetric haze, bokeh of distant skyscraper windows melting into the wet asphalt, shot on anamorphic with Michael Mann Heat aesthetic, teal and sodium-orange grade, 35mm Kodak Vision3 with fine grain, shallow depth of field isolating the silhouette, urban isolation and electric tension, hyper-detailed reflections, wet neon bleeding across the pavement --ar 2.39:1 --style raw --stylize 200 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 690, copies: 68, score: 7.2
  },
  {
    id: 'hollywood-cinematic-malick-chamber',
    cat: '设计',
    tags: ['设计', 'Midjourney', '电影美学', '好莱坞', '泰伦斯马力克', '传记历史', 'AI绘画'],
    title: 'Scholar Writing by Leaded Window',
    titleZh: '泰伦斯·马力克式·铅窗前书写的学者',
    prompt: 'A period-drama candlelit chamber where a solitary scholar in linen robes writes by a leaded window, soft naturalistic light spilling across weathered parchment and inkwell, dust motes drifting through a shaft of late-afternoon sun, a distant landscape visible through mullioned glass, shot with Terence Malick poetic realism on 35mm with painterly warmth, muted earth tones of ochre and umber, shallow golden-hour focus, contemplative and intimate, natural practical candlelight, tactile paper and wax texture, breath visible in the cold air --ar 3:2 --style raw --stylize 250 --v 6.0',
    titleEn: '',
    promptEn: '',
    source, sourceUrl, contributor,
    heat: 4, verified: false, community: true, lang: 'en',
    views: 600, copies: 55, score: 7.1
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
