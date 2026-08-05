import { PrefixKey } from "./titles";

export type Role = "core" | "mid" | "support";

export type StatKey =
  | "gpm"
  | "deaths"
  | "creeps"
  | "madstones"
  | "kills"
  | "towers"
  | "teamfight"
  | "stuns"
  | "tormentor"
  | "roshan"
  | "firstBlood"
  | "courier"
  | "wards"
  | "stacks"
  | "lotuses"
  | "watchers"
  | "runes"
  | "smokes";

export type PlayerMember = {
  name: string;
  stats: Partial<Record<StatKey, number>>;
  // Shrinkage-adjusted per-player title probability (Prefix key -> %, sums to ~100).
  titleProbability: Partial<Record<PrefixKey, number>>;
  statRange: Partial<Record<StatKey, { min: number; max: number; median: number }>>;
  // % of games with a non-zero value, for the "rare event" green stats only
  // (roshan, courier, tormentor, firstBlood).
  probability?: Partial<Record<StatKey, number>>;
};

export type Player = {
  id: string;
  name: string;
  team: string;
  role: Role;
  stats: Partial<Record<StatKey, number>>;
  // Present only for datasets that expose per-member breakdowns (e.g. the "mine" dataset).
  // Length 1 for solo mid players, length 2 for core/support pairs.
  members?: PlayerMember[];
};

// Community-derived TI 2026 fantasy values transcribed from the supplied tables.
// Core and support banners select a pair of players, so those entries are stored as pairs.
export const players: Player[] = [
  { id: "ysr-niu", name: "YSR-04E & niu", team: "", role: "core", stats: { gpm: 1269.5, deaths: 1462.5, creeps: 1167, madstones: 623.5, kills: 792.5, towers: 812, teamfight: 1470.5, stuns: 277, tormentor: 946.5, roshan: 541, firstBlood: 223.5, courier: 135 } },
  { id: "satanic-noticed", name: "Satanic & Noticed", team: "", role: "core", stats: { gpm: 1361.5, deaths: 1338.5, creeps: 1269.5, madstones: 646.5, kills: 804.5, towers: 848, teamfight: 1304, stuns: 303.5, tormentor: 611, roshan: 558.5, firstBlood: 243.5, courier: 131.5 } },
  { id: "yuma-wisper", name: "Yuma & Wisper", team: "", role: "core", stats: { gpm: 1322, deaths: 1179.5, creeps: 1376.5, madstones: 701.5, kills: 819.5, towers: 508.5, teamfight: 1364, stuns: 321, tormentor: 686, roshan: 630.5, firstBlood: 213.5, courier: 240.5 } },
  { id: "watson-dm", name: "watson & DM", team: "", role: "core", stats: { gpm: 1334, deaths: 1321.5, creeps: 1281.5, madstones: 687, kills: 739, towers: 628, teamfight: 1327, stuns: 298.5, tormentor: 723.5, roshan: 563, firstBlood: 252, courier: 197.5 } },
  { id: "kiritych-miero", name: "Kiritych & MieRo", team: "", role: "core", stats: { gpm: 1287, deaths: 1250.5, creeps: 1274, madstones: 658.5, kills: 675, towers: 777.5, teamfight: 1313.5, stuns: 265, tormentor: 767, roshan: 640.5, firstBlood: 216, courier: 118 } },
  { id: "skiter-atf", name: "skiter & ATF", team: "", role: "core", stats: { gpm: 1318.5, deaths: 1137.5, creeps: 1319, madstones: 479, kills: 793, towers: 744, teamfight: 1272, stuns: 298, tormentor: 753.5, roshan: 557, firstBlood: 156, courier: 286 } },
  { id: "ame-xxs", name: "Ame & Xxs", team: "", role: "core", stats: { gpm: 1275, deaths: 1218, creeps: 1372, madstones: 685.5, kills: 618, towers: 724, teamfight: 1297.5, stuns: 298.5, tormentor: 741, roshan: 481, firstBlood: 196, courier: 171.5 } },
  { id: "nightfall-ws", name: "Nightfall & Ws", team: "", role: "core", stats: { gpm: 1293, deaths: 1303, creeps: 1144.5, madstones: 598.5, kills: 784, towers: 619, teamfight: 1322.5, stuns: 327.5, tormentor: 681.5, roshan: 537.5, firstBlood: 177.5, courier: 153.5 } },
  { id: "pure-33", name: "Pure & 33", team: "", role: "core", stats: { gpm: 1340, deaths: 1113.5, creeps: 1324, madstones: 625, kills: 738, towers: 620.5, teamfight: 1310, stuns: 242, tormentor: 689, roshan: 502, firstBlood: 161.5, courier: 232 } },
  { id: "yatoro-collapse", name: "Yatoro & Collapse", team: "", role: "core", stats: { gpm: 1296.5, deaths: 1108, creeps: 1235.5, madstones: 587.5, kills: 731, towers: 693.5, teamfight: 1298, stuns: 305, tormentor: 678, roshan: 495.5, firstBlood: 225, courier: 194 } },
  { id: "shiro-bach", name: "shiro & Bach", team: "", role: "core", stats: { gpm: 1230.5, deaths: 1203.5, creeps: 1274.5, madstones: 626, kills: 588.5, towers: 654.5, teamfight: 1299.5, stuns: 337, tormentor: 756, roshan: 550.5, firstBlood: 177, courier: 85.5 } },
  { id: "ghost-fayde", name: "Ghost & Fayde", team: "", role: "core", stats: { gpm: 1246, deaths: 1080.5, creeps: 1219, madstones: 613, kills: 671.5, towers: 655, teamfight: 1296.5, stuns: 308, tormentor: 557, roshan: 448.5, firstBlood: 271, courier: 148 } },
  { id: "micke-ace", name: "miCKe & Ace", team: "", role: "core", stats: { gpm: 1237.5, deaths: 1143.5, creeps: 1211.5, madstones: 476.5, kills: 695, towers: 659.5, teamfight: 1303, stuns: 344, tormentor: 716.5, roshan: 414.5, firstBlood: 150, courier: 136 } },
  { id: "ssnovv-corrupted", name: "ssnovv1 & Corrupted", team: "", role: "core", stats: { gpm: 1243.5, deaths: 1120, creeps: 1168.5, madstones: 551.5, kills: 546.5, towers: 677, teamfight: 1297.5, stuns: 344, tormentor: 551.5, roshan: 364.5, firstBlood: 116, courier: 142.5 } },
  { id: "natsumi-raven", name: "Natsumi & Raven", team: "", role: "core", stats: { gpm: 1224.5, deaths: 1270.5, creeps: 1235.5, madstones: 569, kills: 564, towers: 549, teamfight: 1396.5, stuns: 192.5, tormentor: 421.5, roshan: 333, firstBlood: 194.5, courier: 154.5 } },
  { id: "sumail-davai", name: "SumaiL & Davai", team: "", role: "core", stats: { gpm: 1164.5, deaths: 1010, creeps: 1028.5, madstones: 446, kills: 703.5, towers: 354, teamfight: 1371, stuns: 401.5, tormentor: 429.5, roshan: 189.5, firstBlood: 166.5, courier: 231 } },

  { id: "nisha", name: "Nisha", team: "", role: "mid", stats: { gpm: 1267, deaths: 1262, creeps: 1212, madstones: 521, kills: 894, towers: 478, teamfight: 1483, stuns: 316, tormentor: 500, roshan: 293.00, firstBlood: 50.89, courier: 259.00, wards: 172.42, stacks: 508.03, watchers: 346.22, runes: 1601.09, smokes: 7.71 } },
  { id: "marl1ne", name: "Malr1ne", team: "", role: "mid", stats: { gpm: 1215, deaths: 1122, creeps: 1161, madstones: 532, kills: 837, towers: 383, teamfight: 1500, stuns: 494, tormentor: 677, roshan: 301.37, firstBlood: 303.91, courier: 230.99, wards: 185.53, stacks: 471.34, watchers: 180.60, runes: 1583.23, smokes: 58.60 } },
  { id: "gpk", name: "gpk", team: "", role: "mid", stats: { gpm: 1228, deaths: 1273, creeps: 1213, madstones: 536, kills: 831, towers: 345, teamfight: 1487, stuns: 352, tormentor: 579, roshan: 514.54, firstBlood: 141.51, courier: 214.33, wards: 195.48, stacks: 482.27, watchers: 358.54, runes: 1564.76, smokes: 10.72 } },
  { id: "lorenof", name: "lorenof", team: "", role: "mid", stats: { gpm: 1273, deaths: 1378, creeps: 1095, madstones: 405, kills: 849, towers: 525, teamfight: 1450, stuns: 279, tormentor: 324, roshan: 515.68, firstBlood: 77.36, courier: 421.80, wards: 210.60, stacks: 533.52, watchers: 94.08, runes: 1353.60, smokes: 11.72 } },
  { id: "echozz", name: "Echozz", team: "", role: "mid", stats: { gpm: 1104, deaths: 1425, creeps: 962, madstones: 616, kills: 520, towers: 217, teamfight: 1549, stuns: 278, tormentor: 541 } },
  { id: "mikoto", name: "Mikoto", team: "", role: "mid", stats: { gpm: 1239, deaths: 1414, creeps: 1170, madstones: 491, kills: 852, towers: 374, teamfight: 1446, stuns: 257, tormentor: 302, roshan: 229.30, firstBlood: 105.11, courier: 145.18, wards: 198.39, stacks: 310.30, watchers: 321.16, runes: 1603.11, smokes: 0 } },
  { id: "bzm", name: "bzm", team: "", role: "mid", stats: { gpm: 1265, deaths: 1045, creeps: 1203, madstones: 255, kills: 786, towers: 439, teamfight: 1481, stuns: 451, tormentor: 538, roshan: 314.87, firstBlood: 86.60, courier: 178.37, wards: 176.37, stacks: 722.96, watchers: 399.31, runes: 1403.69, smokes: 17.49 } },
  { id: "noone", name: "No[o]ne", team: "", role: "mid", stats: { gpm: 1220, deaths: 1324, creeps: 1079, madstones: 442, kills: 768, towers: 405, teamfight: 1496, stuns: 312, tormentor: 471, roshan: 303.85, firstBlood: 191.01, courier: 173.58, wards: 135.78, stacks: 407.33, watchers: 533.56, runes: 1415.22, smokes: 25.32 } },
  { id: "xm", name: "Xm", team: "", role: "mid", stats: { gpm: 1211, deaths: 1184, creeps: 1244, madstones: 570, kills: 728, towers: 258, teamfight: 1519, stuns: 311, tormentor: 482, roshan: 143.51, firstBlood: 118.41, courier: 229.55, wards: 176.69, stacks: 267.43, watchers: 411.00, runes: 1294.90, smokes: 0 } },
  { id: "tailung", name: "Tailung", team: "", role: "mid", stats: { gpm: 1230, deaths: 1133, creeps: 1285, madstones: 484, kills: 690, towers: 499, teamfight: 1395, stuns: 292, tormentor: 424, roshan: 435.31, firstBlood: 138.14, courier: 100.43, wards: 133.71, stacks: 494.74, watchers: 405.30, runes: 1305.26, smokes: 4.19 } },
  { id: "larl", name: "Larl", team: "", role: "mid", stats: { gpm: 1220, deaths: 1147, creeps: 1182, madstones: 527, kills: 847, towers: 277, teamfight: 1480, stuns: 333, tormentor: 447, roshan: 224.77, firstBlood: 79.48, courier: 115.56, wards: 128.22, stacks: 362.22, watchers: 390.66, runes: 1475.67, smokes: 12.04 } },
  { id: "chira", name: "CHIRA_JUNIOR", team: "", role: "mid", stats: { gpm: 1193, deaths: 1227, creeps: 1034, madstones: 369, kills: 763, towers: 429, teamfight: 1429, stuns: 393, tormentor: 474, roshan: 310.94, firstBlood: 197.35, courier: 301.29, wards: 198.18, stacks: 382.04, watchers: 282.00, runes: 1211.45, smokes: 0 } },
  { id: "rcy", name: "RCY", team: "", role: "mid", stats: { gpm: 1236, deaths: 1270, creeps: 1170, madstones: 407, kills: 867, towers: 362, teamfight: 1488, stuns: 295, tormentor: 367, roshan: 380.11, firstBlood: 0.00, courier: 247.00, wards: 234.00, stacks: 278.27, watchers: 369.49, runes: 1261.38, smokes: 23.76 } },
  { id: "nts", name: "NothingToSay", team: "", role: "mid", stats: { gpm: 1154, deaths: 1178, creeps: 1159, madstones: 462, kills: 673, towers: 176, teamfight: 1539, stuns: 363, tormentor: 473, roshan: 99.32, firstBlood: 163.90, courier: 202.56, wards: 184.42, stacks: 475.93, watchers: 368.75, runes: 1484.08, smokes: 4.97 } },
  { id: "mirage", name: "Mirage`", team: "", role: "mid", stats: { gpm: 1159, deaths: 1112, creeps: 1001, madstones: 397, kills: 767, towers: 194, teamfight: 1517, stuns: 344, tormentor: 220 } },
  { id: "yopaj", name: "Yopaj", team: "", role: "mid", stats: { gpm: 1080, deaths: 1224, creeps: 967, madstones: 453, kills: 734, towers: 281, teamfight: 1557, stuns: 324, tormentor: 312, roshan: 152.87, firstBlood: 84.09, courier: 30.57, wards: 239.09, stacks: 396.78, watchers: 191.74, runes: 1158.65, smokes: 12.74 } },

  { id: "thiolicor-kj", name: "Thiolicor & KJ", team: "", role: "support", stats: { wards: 1130, stacks: 1174.5, lotuses: 877.5, watchers: 1209, runes: 701.5, smokes: 1008, teamfight: 1359.5, stuns: 426, tormentor: 380, roshan: 74.5, firstBlood: 167, courier: 521 } },
  { id: "saksa-malady", name: "Saksa & Malady", team: "", role: "support", stats: { wards: 1006, stacks: 1019, lotuses: 682.5, watchers: 925, runes: 506.5, smokes: 852, teamfight: 1429.5, stuns: 383, tormentor: 452, roshan: 58, firstBlood: 253.5, courier: 404 } },
  { id: "tims-skem", name: "Tims & skem", team: "", role: "support", stats: { wards: 981, stacks: 1167, lotuses: 734, watchers: 980.5, runes: 416, smokes: 983, teamfight: 1418, stuns: 351.5, tormentor: 339, roshan: 67, firstBlood: 147, courier: 293.5 } },
  { id: "cr1t-sneyking", name: "Cr1t- & Sneyking", team: "", role: "support", stats: { wards: 1083, stacks: 957, lotuses: 675, watchers: 889.5, runes: 478.5, smokes: 952, teamfight: 1343, stuns: 374.5, tormentor: 533, roshan: 97.5, firstBlood: 167.5, courier: 323.5 } },
  { id: "fy-xnova", name: "fy & xNova", team: "", role: "support", stats: { wards: 1101, stacks: 948, lotuses: 606, watchers: 970, runes: 422, smokes: 1006.5, teamfight: 1431.5, stuns: 378, tormentor: 400, roshan: 53, firstBlood: 248, courier: 266 } },
  { id: "ari-whitemon", name: "Ari & Whitemon", team: "", role: "support", stats: { wards: 1066.5, stacks: 934.5, lotuses: 588, watchers: 957.5, runes: 370, smokes: 864, teamfight: 1409, stuns: 452, tormentor: 434, roshan: 32, firstBlood: 287, courier: 247.5 } },
  { id: "mira-kaori", name: "Mira & kaori", team: "", role: "support", stats: { wards: 1001, stacks: 794.5, lotuses: 595, watchers: 853, runes: 396.5, smokes: 929, teamfight: 1381.5, stuns: 475.5, tormentor: 466, roshan: 52, firstBlood: 242, courier: 327.5 } },
  { id: "omar-gh", name: "OmaR & GH", team: "", role: "support", stats: { wards: 994.5, stacks: 754, lotuses: 679.5, watchers: 925.5, runes: 347.5, smokes: 948, teamfight: 1377, stuns: 415.5, tormentor: 485.5, roshan: 61, firstBlood: 252, courier: 266 } },
  { id: "boxi-tofu", name: "Boxi & tofu", team: "", role: "support", stats: { wards: 1034.5, stacks: 883, lotuses: 581.5, watchers: 809, runes: 315.5, smokes: 921.5, teamfight: 1450, stuns: 363, tormentor: 564, roshan: 48, firstBlood: 229, courier: 295.5 } },
  { id: "rue-notme", name: "rue & not me", team: "", role: "support", stats: { wards: 1087, stacks: 947.5, lotuses: 757.5, watchers: 691, runes: 329.5, smokes: 864.5, teamfight: 1440.5, stuns: 509, tormentor: 348.5, roshan: 35, firstBlood: 200, courier: 229 } },
  { id: "xinq-y", name: "XinQ & y`", team: "", role: "support", stats: { wards: 1067, stacks: 732.5, lotuses: 554.5, watchers: 1158, runes: 426.5, smokes: 906.5, teamfight: 1461, stuns: 337.5, tormentor: 346.5, roshan: 25.5, firstBlood: 144, courier: 229.5 } },
  { id: "9class-dukalis", name: "9Class & Dukalis", team: "", role: "support", stats: { wards: 1019.5, stacks: 805.5, lotuses: 612, watchers: 614, runes: 384, smokes: 920.5, teamfight: 1388.5, stuns: 318.5, tormentor: 415.5, roshan: 45.5, firstBlood: 198, courier: 268.5 } },
  { id: "planet-zzq", name: "planet & zzq", team: "", role: "support", stats: { wards: 940.5, stacks: 920.5, lotuses: 493.5, watchers: 646.5, runes: 345, smokes: 943.5, teamfight: 1490.5, stuns: 273.5, tormentor: 505, roshan: 36.5, firstBlood: 30, courier: 350.5 } },
  { id: "save-kataomi", name: "Save- & Kataomi", team: "", role: "support", stats: { wards: 1095, stacks: 620, lotuses: 454.5, watchers: 658.5, runes: 364.5, smokes: 982.5, teamfight: 1420, stuns: 431, tormentor: 431.5, roshan: 62, firstBlood: 252, courier: 190 } },
  { id: "bignum-speeed", name: "Bignum & Speeed", team: "", role: "support", stats: { wards: 952, stacks: 840.5, lotuses: 435, watchers: 564.5, runes: 379, smokes: 1007, teamfight: 1404.5, stuns: 395, tormentor: 375.5, roshan: 45.5, firstBlood: 216, courier: 252.5 } },
  { id: "sayuw-respect", name: "sayuw & RESPECT", team: "", role: "support", stats: { wards: 947, stacks: 724.5, lotuses: 517, watchers: 627.5, runes: 365, smokes: 919.5, teamfight: 1433, stuns: 345, tormentor: 236, roshan: 9, firstBlood: 284.5, courier: 238.5 } }
];

export const roleStats: Record<Role, StatKey[]> = {
  core: ["creeps", "gpm", "deaths", "towers", "kills", "madstones", "roshan", "teamfight", "tormentor", "stuns", "courier", "firstBlood"],
  mid: ["creeps", "gpm", "deaths", "kills", "madstones", "towers", "wards", "stacks", "lotuses", "watchers", "runes", "smokes", "teamfight", "stuns", "tormentor", "roshan", "firstBlood", "courier"],
  support: ["wards", "smokes", "stacks", "watchers", "lotuses", "runes", "teamfight", "tormentor", "courier", "firstBlood", "roshan", "stuns"]
};