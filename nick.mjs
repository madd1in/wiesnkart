// Wiesn Kart R66: automatische Spitznamen fuer Online-Spieler (Nutzerwunsch). Vorsilbe + Wiesn-Figur + Zahl, hoechstens
// 12 Zeichen (so lang darf ein Name online sein), ohne Artikel/Endungen - passt fuer jede Figur.
export const NICK_PRE = ['Turbo', 'Pixel', 'Blitz', 'Wiesn', 'Mega', 'Donner', 'Drift', 'Nitro', 'Disco', 'Alpen', 'Zucker', 'Brezn', 'Hopsi', 'Raketen'];
export const NICK_NOUN = ['Brezn', 'Seppl', 'Wastl', 'Vroni', 'Resi', 'Gams', 'Dackl', 'Knödl', 'Radi', 'Haxn', 'Fuchs', 'Biber', 'Spatz', 'Hirsch', 'Dirndl', 'Kuh', 'Hase', 'Luchs', 'Adler'];
export const NICK_MAX = 12;
export function autoNick(rnd = Math.random) {
  const pick = a => a[Math.floor(rnd() * a.length) % a.length];
  let pre = pick(NICK_PRE), noun = pick(NICK_NOUN);
  if (pre === noun) noun = NICK_NOUN[(NICK_NOUN.indexOf(noun) + 1) % NICK_NOUN.length];
  let name = pre + noun;
  if (name.length > NICK_MAX) name = pre.slice(0, NICK_MAX - noun.length) + noun;
  const room = NICK_MAX - name.length;
  if (room >= 2) name += 10 + Math.floor(rnd() * 90);
  else if (room === 1) name += 1 + Math.floor(rnd() * 9);
  return name;
}
