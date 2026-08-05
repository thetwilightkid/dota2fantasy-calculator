// Fallback team lookup for the legacy dataset, whose Player entries leave `team` empty.
// The "mine" dataset sets `team` directly on each Player, so this map is never consulted there.
export const teamByPlayerId: Record<string, string> = {
  "ysr-niu":"Team Resilience", "echozz":"Team Resilience", "planet-zzq":"Team Resilience",
  "satanic-noticed":"Team Vision", "noone":"Team Vision", "9class-dukalis":"Team Vision",
  "yuma-wisper":"LGD Gaming", "tailung":"LGD Gaming", "thiolicor-kj":"LGD Gaming",
  "watson-dm":"Team Yandex", "chira":"Team Yandex", "saksa-malady":"Team Yandex",
  "kiritych-miero":"BoomBoys", "gpk":"BoomBoys", "save-kataomi":"BoomBoys",
  "skiter-atf":"Team Falcons", "marl1ne":"Team Falcons", "cr1t-sneyking":"Team Falcons",
  "ame-xxs":"Xtreme Gaming", "nts":"Xtreme Gaming", "fy-xnova":"Xtreme Gaming",
  "nightfall-ws":"Aurora Gaming", "mikoto":"Aurora Gaming", "mira-kaori":"Aurora Gaming",
  "pure-33":"Iron Wing", "bzm":"Iron Wing", "ari-whitemon":"Iron Wing",
  "yatoro-collapse":"Team Spirit", "larl":"Team Spirit", "rue-notme":"Team Spirit",
  "shiro-bach":"Vici Gaming", "xm":"Vici Gaming", "xinq-y":"Vici Gaming",
  "ghost-fayde":"GamerLegion", "rcy":"GamerLegion", "bignum-speeed":"GamerLegion",
  "micke-ace":"Team Liquid", "nisha":"Team Liquid", "boxi-tofu":"Team Liquid",
  "ssnovv-corrupted":"HULIGANI", "mirage":"HULIGANI", "sayuw-respect":"HULIGANI",
  "natsumi-raven":"OG", "yopaj":"OG", "tims-skem":"OG",
  "sumail-davai":"Nigma Galaxy", "lorenof":"Nigma Galaxy", "omar-gh":"Nigma Galaxy"
};

export function playerTeam(id: string, stored: string) {
  return stored || teamByPlayerId[id] || "";
}
