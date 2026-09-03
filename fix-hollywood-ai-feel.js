/**
 * 重写 10 条好莱坞电影感提示词，去除"AI 味"
 * 保留：真实署名锚定（Deakins / Nolan / 具体胶片型号）、具体场景与技术选择
 * 去除：photorealistic / hyper-detailed / meticulous 等质量词堆砌；
 *       "形容词 and 形容词"填空式情绪结尾；"every X" 填充句；tactile 等烂大街质感词
 * 运行: node fix-hollywood-ai-feel.js
 */
const fs = require('fs');

const path = 'assets/js/prompts.js';
const text = fs.readFileSync(path, 'utf8');
const prefix = text.slice(0, text.indexOf('['));
const suffix = text.slice(text.lastIndexOf(']') + 1);
const prompts = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));

const revised = {
  'hollywood-cinematic-nolan-space-station':
`A solitary astronaut in a weathered magnesium-white EVA suit stands at the extreme edge of a slowly rotating O'Neill cylinder, one hand resting on the railing, terraced gardens and miniature cities curving far below. Earth's luminous blue crescent fills the panoramic viewport behind him. Hard directional sunlight rakes across the hull while practical fixtures glow from the habitat interior, an anamorphic flare blooming off the right frame. Captured on the Panavision DXL2 in IMAX 65mm with coarse photochemical grain, an f/8 stop holding focus from his glove out to the infinite starfield. The grade keeps sunlit metal bright against the shadowed habitat — the hushed scale of Interstellar rather than its spectacle. --ar 2.39:1 --style raw --stylize 250 --v 6.0`,

  'hollywood-cinematic-blade-runner-boulevard':
`A lone detective in a long tattered trench coat walks away from camera down the center of a rain-slicked boulevard, a massive holographic geisha flickering on the left. Amber and cyan fog rolls between brutalist megastructures; signage smears across the wet asphalt. Shot on 35mm Kodak Vision3 500T pushed a stop, lit in the manner of Roger Deakins through Cooke S4 anamorphics that throw blue-streak flares. The figure stays razor-sharp while the city dissolves into bokeh, the air heavy with the wet heat of a city that never dries. --ar 2.39:1 --style raw --stylize 200 --v 6.0`,

  'hollywood-cinematic-dunkirk-beach':
`A kneeling soldier in mud-caked uniform clutches a rifle at the shallow shoreline of a besieged beach. Hundreds of silent troops queue along the breaking waves beneath a bruised smoky sky; a downed Spitfire smolders at the water's edge, its orange glow reflected in the churning surf. Shot on IMAX 65mm with documentary immediacy, handheld and close, the Dunkirk look — steel-grey and ember, coarse large-format grain, low clouds pressing down, salt-spray misting the lens. The frame holds on his weathered face and leaves the chaos to the periphery. --ar 2.39:1 --style raw --stylize 150 --v 6.0`,

  'hollywood-cinematic-film-noir-bar':
`A femme fatale in a silk slip dress sits at a smoked-glass bar in a deserted jazz club at 3am; the only other soul is a shadowed pianist mid-ballad. A single overhead pendant drops a hard pool of warm light that catches the rim of her martini glass, venetian-blind shadows slicing across her face and bare shoulder, cigarette smoke curling through a shaft of backlight. Shot in black-and-white on 35mm Kodak Double-X, grain-rich and high-contrast, framed in the low-angle manner of Touch of Evil so the highlights stay clean against the blacks. --ar 4:5 --style raw --stylize 300 --v 6.0`,

  'hollywood-cinematic-western-prairie':
`A lone gunslinger on a muscular Appaloosa sits silhouetted at golden hour on an endless windswept prairie, low raking sunlight stretching his shadow across knee-high grass. A distant frontier town smolders on the horizon; dust drifts in the warm backlight. Shot anamorphic on Panavision in the classical Hollywood widescreen frame, Technicolor warmth of sun-bleached ochre and sage, the horizon pinned low so the sky dominates and the figure stays small. The John Ford sense of land as character, rendered on fine 35mm grain. --ar 2.39:1 --style raw --stylize 200 --v 6.0`,

  'hollywood-cinematic-wes-anderson-lobby':
`A perfectly symmetrical composition inside a pastel-pink grand hotel lobby: a concierge in a maroon uniform stands centered at an ornate reception desk, two identical potted palms flanking the frame, a grand staircase mirrored left and right. Shot on 35mm saturated stock with a candy-box palette of rose, teal and mustard, deadpan frontal lighting, crisp and flat, every surface lit evenly. The symmetry is the joke and the discipline at once. --ar 1:1 --style raw --stylize 250 --v 6.0`,

  'hollywood-cinematic-alien-cockpit':
`A futuristic cockpit bathed in cold blue rim light; a lone pilot in a partial-pressure suit slumps in a worn leather command chair, curved holographic displays throwing star charts and warning glyphs across the glass. Console glow reflects off brushed titanium. Lit in the Alien manner of Ridley Scott — analog, industrial, the 65mm anamorphic grain kept subtle, the cabin corners lost to shadow. Pipes bead with condensation; the quiet feels loaded. --ar 16:9 --style raw --stylize 200 --v 6.0`,

  'hollywood-cinematic-lotr-mount-doom':
`A wide shot of a fellowship of nine silhouetted against the cataclysmic dawn eruption of Mount Doom, rivers of molten lava cascading down the mountainside, a vast ash cloud swallowing the sky. The New Zealand landscape lends it impossible scale; shot in the Peter Jackson epic manner with a god-ray break in the clouds. Panavision anamorphic holds deep focus from the foreground figures to the inferno, the palette desaturated to ember and ash, stray embers drifting through the frame. --ar 2.39:1 --style raw --stylize 150 --v 6.0`,

  'hollywood-cinematic-michael-mann-city':
`A neo-noir cityscape at blue hour: rain-slicked boulevards reflect a river of red taillights and cold white streetlamps, a lone figure in a sharp suit striding through volumetric haze, the bokeh of distant skyscraper windows melting into the wet asphalt. Shot anamorphic in the Heat manner of Michael Mann, teal against sodium-orange, 35mm Kodak Vision3 with fine grain, the silhouette held apart by shallow focus. Neon bleeds across the pavement like spilled ink. --ar 2.39:1 --style raw --stylize 200 --v 6.0`,

  'hollywood-cinematic-malick-chamber':
`A candlelit chamber where a solitary scholar in linen robes writes by a leaded window; soft naturalistic light spills across weathered parchment and an inkwell, dust motes drifting through a shaft of late-afternoon sun, a distant landscape visible through the mullioned glass. Shot in the poetic realism of Terence Malick on 35mm, painterly warmth, muted earth tones of ochre and umber, the focus shallow and golden. Candlelight is the only source; in the cold air his breath shows. --ar 3:2 --style raw --stylize 250 --v 6.0`
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
