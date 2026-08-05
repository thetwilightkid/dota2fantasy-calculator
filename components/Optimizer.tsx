"use client";

import { useEffect, useMemo, useState } from "react";
import { Player, PlayerMember, roleStats, Role, StatKey } from "../data/players";
import {
  bannerSlotColors,
  scoringRules,
  statColors,
  tierBonuses,
  traitDescriptions,
  Tier,
  Trait
} from "../data/rules";
import {
  prefixes,
  suffixes,
  PrefixKey,
  SuffixKey,
  SuffixCategory
} from "../data/titles";
import { datasets, DatasetKey } from "../data/datasets";
import { statLabels } from "../data/labels";
import { playerTeam } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { rankPlayers, EmblemInput, ScoreContribution } from "../lib/optimizer";
import { Language } from "../lib/language";

type BannerState = Record<Role, EmblemInput[]>;
type TeamEntry = { team: string; roles: Partial<Record<Role, { name: string; score: number }>>; total: number };

const roles: Role[] = ["core", "mid", "support"];
const prefixKeys = Object.keys(prefixes) as PrefixKey[];
const suffixKeys = Object.keys(suffixes) as SuffixKey[];

const text = {
  en: {
    kicker: "THE INTERNATIONAL 2026", title: "Dota 2 Fantasy Optimizer",
    subtitle: "Build all three banners, compare roster combinations and understand exactly where every projected point comes from.",
    builder: "Banner builder", results: "Best roster", teams: "Teams", titles: "Title", leaderboard: "Leaderboard",
    teamsSubtitle: "Teams represented by players in the currently selected dataset.",
    traits: "Traits", rerolls: "Reroll guide", rules: "Rules", methodology: "Methodology",
    core: "Core", mid: "Mid", support: "Support", pair: "same-team pair", single: "one player",
    emblem: "Emblem", tier: "Tier", trait: "Trait", optimize: "Optimize roster", reset: "Reset banners",
    simpleModeLabel: "Simple", advancedModeLabel: "Advanced", customPercent: "Value % (100 = base)",
    total: "Projected roster score", score: "Projected score", alternatives: "Top alternatives",
    dataset: "Dataset",
    matches: "matches in the source dataset",
    matchesRecorded: "Matches recorded", topPrefixes: "Most-played hero colors (frequency, not value)", suffixChances: "Suffix chances for this team",
    availableTotal: "Available-role total", red: "red", blue: "blue", green: "green",
    titleIntro: "Choose one Prefix + Suffix for the entire Fantasy roster. Both bonuses apply independently to each player’s game score when their conditions are met. Changing the title does not use roll tokens.",
    prefix: "Prefix", suffix: "Suffix", expectedBonus: "Expected Prefix bonus", selectedFrequency: "Historical match rate",
    recommendedPrefix: "Recommended Prefix", useRecommended: "Use recommended", prefixRanking: "Best Prefixes for this roster",
    suffixScenario: "Score if Suffix triggers", conditionalBonus: "Conditional bonus", suffixNote: "Suffix events cannot be projected reliably before the games. The value below adds the Suffix bonus to the base roster score independently from the expected Prefix bonus.",
    stable: "Stable", gamble: "Gamble", avoid: "Avoid", pairAverage: "pair average",
    titleMethod: "Prefix projections use each player's historical trigger rate. Pair entries use the simple average of both players because the source score is stored as a pair.",
    prefixContribution: "Expected Prefix", suffixContribution: "Expected Suffix",
    recommendedSubtitle: "Recommended Subtitle", subtitleRanking: "Best Subtitles for this roster",
    expectedSubtitleBonus: "Suffix bonus (if it triggers)", subtitleProbability: "Roster trigger chance",
    notComputable: "⚠ Not computable from available data — manual pick only, excluded from the recommendation.",
    subtitleMethod: "Subtitle events are team-wide (any player on a real team can trigger them). Probability is \"at least one of the represented teams' games triggers it\" across the distinct teams behind your current Core/Mid/Support picks.",
    upTo: "up to", showDistribution: "Show distribution", hideDistribution: "Hide distribution",
    choose: "Choose", chosen: "Chosen", manuallySelected: "Manually selected", resetToBest: "Reset to best pick",
    gameMultiplier: "Games shown", perGame: "per game", withTitle: "With Prefix + Suffix"
  },
  ru: {
    kicker: "THE INTERNATIONAL 2026", title: "Оптимизатор Dota 2 Fantasy",
    subtitle: "Соберите сразу три знамени, сравните связки и увидьте, откуда берётся каждое прогнозное очко.",
    builder: "Калькулятор знамён", results: "Лучший состав", teams: "Команды", titles: "Титул", leaderboard: "Таблица лидеров",
    teamsSubtitle: "Команды, игроки которых представлены в выбранном датасете.",
    traits: "Свойства", rerolls: "Что роллить", rules: "Правила", methodology: "Методика расчёта",
    core: "Основа", mid: "Центр", support: "Поддержка", pair: "пара из одной команды", single: "1 игрок",
    emblem: "Эмблема", tier: "Разряд", trait: "Свойство", optimize: "Подобрать состав", reset: "Сбросить настройки",
    simpleModeLabel: "Просто", advancedModeLabel: "Подробно", customPercent: "Значение % (100 = база)",
    total: "Прогноз состава", score: "Прогнозный счёт", alternatives: "Лучшие альтернативы",
    dataset: "Датасет",
    matches: "матчей в исходном датасете",
    matchesRecorded: "Записано матчей", topPrefixes: "Чаще всего играют (частота, не выгода)", suffixChances: "Шансы суффиксов команды",
    availableTotal: "Сумма доступных ролей", red: "красный", blue: "синий", green: "зелёный",
    titleIntro: "Выберите один общий Prefix + Suffix для всего Fantasy-состава. Оба бонуса независимо применяются к счёту каждого игрока за игру, если выполнены их условия. Смена титула не расходует жетоны.",
    prefix: "Префикс", suffix: "Суффикс", expectedBonus: "Ожидаемый бонус префикса", selectedFrequency: "Историческая частота",
    recommendedPrefix: "Рекомендуемый префикс", useRecommended: "Выбрать", prefixRanking: "Лучшие префиксы для состава",
    suffixScenario: "Счёт, если суффикс сработает", conditionalBonus: "Условный бонус", suffixNote: "События суффиксов нельзя надёжно предсказать до игр. Значение ниже независимо добавляет бонус суффикса к базовому счёту состава, не усиливая ожидаемый бонус префикса.",
    stable: "Стабильный", gamble: "Азартный", avoid: "Лучше избегать", pairAverage: "среднее пары",
    titleMethod: "Прогноз префикса использует историческую частоту каждого игрока. Для пар берётся простое среднее двух игроков, потому что исходный счёт хранится общей парой.",
    prefixContribution: "Ожидаемый префикс", suffixContribution: "Ожидаемый суффикс",
    recommendedSubtitle: "Рекомендуемый суффикс", subtitleRanking: "Лучшие суффиксы для состава",
    expectedSubtitleBonus: "Бонус суффикса (если сработает)", subtitleProbability: "Шанс срабатывания в составе",
    notComputable: "⚠ Нельзя посчитать по имеющимся данным — только ручной выбор, исключён из рекомендации.",
    subtitleMethod: "События суффиксов общекомандные (сработать может любой игрок реальной команды). Вероятность — «сработает хотя бы у одной из представленных команд» по уникальным командам текущих пиков Core/Mid/Support.",
    upTo: "до", showDistribution: "Показать распределение", hideDistribution: "Скрыть распределение",
    choose: "Выбрать", chosen: "Выбрано", manuallySelected: "Выбрано вручную", resetToBest: "Сбросить на лучший пик",
    gameMultiplier: "Игр в расчёте", perGame: "за игру", withTitle: "С учётом префикса и суффикса"
  }
} as const;

const labels = statLabels;

const formulas: Record<StatKey, { en: string; ru: string }> = {
  kills:{en:"107 × kills",ru:"107 × убийства"}, deaths:{en:"1950 − 195 × deaths",ru:"1950 − 195 × смерти"},
  creeps:{en:"3 × creeps",ru:"3 × крипы"}, gpm:{en:"2 × GPM",ru:"2 × З/М"},
  madstones:{en:"13 × madstones",ru:"13 × подобранные безумруды"}, towers:{en:"352 × towers",ru:"352 × башни"},
  wards:{en:"117 × wards placed",ru:"117 × установленные варды"}, stacks:{en:"234 × camps stacked",ru:"234 × стаки лагерей"},
  runes:{en:"141 × runes",ru:"141 × руны"}, watchers:{en:"147 × watchers captured",ru:"147 × захваченные смотрители"},
  lotuses:{en:"176 × lotuses (approx.)",ru:"176 × собранные лотосы (приблизительно)"},
  smokes:{en:"293 × Smoke of Deceit uses",ru:"293 × применения Smoke of Deceit"},
  teamfight:{en:"2124 × teamfight participation",ru:"2124 × участие в командных сражениях"},
  stuns:{en:"10 × stun duration",ru:"10 × длительность оглушений"}, firstBlood:{en:"1934 × first blood",ru:"1934 × первая кровь"},
  tormentor:{en:"879 × Tormentor kills",ru:"879 × убийства Терзателей"}, roshan:{en:"1172 × Roshan kills",ru:"1172 × убийства Рошана"},
  courier:{en:"703 × courier kills",ru:"703 × убийства курьеров"}
};

const methodology = {
  en:["Each game is scored separately.","The source collection methodology sums the two highest-scoring games in a series.","Use the ×1/×2 toggle above the results to project a single game or a two-game match.","Death score is not clamped at zero and can become negative.","Lotus data is approximate because OpenDota does not expose the exact pickup event.","Prefix expected value equals projected player score × historical trigger rate × Prefix bonus.","Prefix and Suffix bonuses both apply to the roster and stack together — e.g. a player's score can receive both a Prefix bonus (like Crimson) and a Suffix bonus (like Lucky) at once.","Some Suffixes are extremely difficult to detect and count reliably from available data; where that's the case they're marked as not computed rather than estimated.","Trait effects are applied multiplicatively to the tier-adjusted emblem contribution."],
  ru:["Каждая игра оценивается отдельно.","Методика сбора исходных данных суммирует две лучшие игры серии.","Используйте переключатель ×1/×2 над результатами, чтобы посчитать одну игру или матч из двух игр.","Очки за смерти не ограничиваются нулём и могут стать отрицательными.","Данные по лотосам приблизительные: OpenDota не отдаёт точное событие подбора.","Ожидаемый вклад префикса: прогноз игрока × историческая частота × бонус префикса.","Бонусы префикса и суффикса применяются к составу одновременно и складываются — например, за счёт игрока можно получить и бонус префикса (например, Багровый), и бонус суффикса (например, Везунчик) сразу.","Некоторые суффиксы крайне сложно надёжно обнаружить и посчитать по доступным данным; в этом случае они помечены как не рассчитанные, а не оценены приблизительно.","Эффекты свойств применяются мультипликативно к вкладу эмблемы после учёта разряда."]
};

const mineMethodologyExtra = {
  en:["My Dataset values are computed as (per-game average stat × the official Fantasy formula constant); Core/Support pairs average their two members rather than summing them, matching how the Fantasy system itself combines a pair.","Prefix bonus for My Dataset uses each player's own shrinkage-adjusted title probability (e.g. one member of a pair might favor Cerulean heroes while the other doesn't); the pair's two probabilities are averaged, then applied to the pair's combined score.","Suffix probabilities in My Dataset are computed directly from team-wide summary rates for five categories (Tormented, Flayed Twins, Patient, Decisive, Lucky); the remaining three (Underdog, Clutch, Cruel) have no basis in the collected data and use only the flat base bonus if picked manually.","Lotus and other rare-event figures in My Dataset come from directly collected per-game counts, more accurate than the community dataset's OpenDota-based approximation."],
  ru:["Значения My Dataset считаются как (среднее значение статы за игру × официальный коэффициент формулы Fantasy); пары Core/Support усредняют показатели двух игроков, а не суммируют их — так же, как сама система Fantasy объединяет пару.","Бонус префикса в My Dataset использует собственную вероятность титула каждого игрока (с поправкой на усадку) — например, один игрок пары может чаще играть на героях Cerulean, а другой нет; вероятности пары усредняются, а затем применяются к общему счёту пары.","Вероятности суффиксов в My Dataset считаются напрямую по общекомандным показателям для пяти категорий (Мученик, Жрец Бескожих близнецов, Выжидатель, Удалец, Везунчик); оставшиеся три (Аутсайдер, Творец победы, Мучитель) не имеют основы в собранных данных и используют только базовый бонус при ручном выборе.","Данные по лотосам и другим редким событиям в My Dataset взяты из напрямую собранных счётчиков по каждой игре — точнее, чем приближение датасета сообщества через OpenDota."]
};

const traitLabels: Record<Trait,{en:string;ru:string}> = {
  none:{en:"No trait",ru:"Без свойства"}, fractal:{en:"Fractal",ru:"Фрактальная"},
  benevolent:{en:"Benevolent",ru:"Благотворная"}, vampiric:{en:"Vampiric",ru:"Вампирическая"},
  unique:{en:"Unique",ru:"Уникальная"}, friendly:{en:"Friendly",ru:"Дружелюбная"}
};

const defaults: BannerState = {
  core:[{stat:"creeps",tier:"III",trait:"none"},{stat:"teamfight",tier:"III",trait:"none"},{stat:"gpm",tier:"III",trait:"none"}],
  mid:[{stat:"kills",tier:"III",trait:"none"},{stat:"runes",tier:"III",trait:"none"},{stat:"teamfight",tier:"III",trait:"none"}],
  support:[{stat:"wards",tier:"III",trait:"none"},{stat:"teamfight",tier:"III",trait:"none"},{stat:"stacks",tier:"III",trait:"none"}]
};

function categoryLabel(category:SuffixCategory, language:Language){ return text[language][category]; }

// Every scoring formula in play (including the affine `deaths` formula) is linear, so scaling an
// already-computed score by a constant factor is equivalent to recomputing it from scaled raw
// stats - safe to apply once here rather than at every display call site.
function scaleStats(stats:Partial<Record<StatKey,number>>, factor:number):Partial<Record<StatKey,number>>{
  const out:Partial<Record<StatKey,number>>={};
  (Object.keys(stats) as StatKey[]).forEach(key=>{ out[key]=(stats[key] as number)*factor; });
  return out;
}
function scaleRange(range:PlayerMember["statRange"], factor:number):PlayerMember["statRange"]{
  const out:PlayerMember["statRange"]={};
  (Object.keys(range) as StatKey[]).forEach(key=>{
    const r=range[key]; if(!r) return;
    out[key]={min:r.min*factor,max:r.max*factor,median:r.median*factor};
  });
  return out;
}
function pickFor<T extends {player:{id:string}}>(list:T[], pinnedId:string|null):T|undefined{
  if(pinnedId){
    const found=list.find(entry=>entry.player.id===pinnedId);
    if(found) return found;
  }
  return list[0];
}

type OptimizerProps = {
  datasetKey: DatasetKey; onDatasetChange: (key: DatasetKey) => void;
  language: Language; onLanguageChange: (language: Language) => void;
  children?: React.ReactNode;
};

export default function Optimizer({datasetKey,onDatasetChange,language,onLanguageChange,children}:OptimizerProps){
  const [banners,setBanners]=useState<BannerState>(defaults);
  const [prefix,setPrefix]=useState<PrefixKey>("otherworldly");
  const [suffix,setSuffix]=useState<SuffixKey>("clutch");
  const [expandedWinners,setExpandedWinners]=useState<Set<Role>>(new Set());
  const [expandedAlternatives,setExpandedAlternatives]=useState<Set<string>>(new Set());
  const [selectedPlayerId,setSelectedPlayerId]=useState<Record<Role,string|null>>({core:null,mid:null,support:null});
  const [gameMultiplier,setGameMultiplier]=useState<1|2>(2);
  const [simpleMode,setSimpleMode]=useState(false);
  const t=text[language];
  const locale=language==="ru"?"ru-RU":"en-US";
  const dataset=datasets[datasetKey];
  const players=dataset.players;

  // Pinned picks belong to a specific dataset's player ids - clear them when the dataset changes.
  useEffect(()=>{ setSelectedPlayerId({core:null,mid:null,support:null}); },[datasetKey]);

  const scaledPlayers=useMemo(()=>players.map(p=>({
    ...p,
    stats:scaleStats(p.stats,gameMultiplier),
    members:p.members?.map(m=>({...m,stats:scaleStats(m.stats,gameMultiplier),statRange:scaleRange(m.statRange,gameMultiplier)}))
  })),[players,gameMultiplier]);

  const getPrefixEntriesFor=(playerId:string,selectedPrefix:PrefixKey)=>(dataset.prefixStatsByPlayerId[playerId]??[]).map(entry=>({name:entry.name,frequency:entry.values[selectedPrefix]??0}));
  const getAveragePrefixFrequencyFor=(playerId:string,selectedPrefix:PrefixKey)=>{
    const entries=getPrefixEntriesFor(playerId,selectedPrefix);
    if(!entries.length) return 0;
    return entries.reduce((sum,entry)=>sum+entry.frequency,0)/entries.length;
  };

  const baseRankings=useMemo(()=>({core:rankPlayers(scaledPlayers,"core",banners.core),mid:rankPlayers(scaledPlayers,"mid",banners.mid),support:rankPlayers(scaledPlayers,"support",banners.support)}),[scaledPlayers,banners]);

  const buildTitleRanking=(role:Role,selectedPrefix:PrefixKey)=>baseRankings[role].map(entry=>{
    // Each member's own title probability (e.g. Satanic might be on Cerulean heroes while
    // Noticed isn't) is averaged across the pair, then applied to the pair's combined score -
    // mathematically identical to summing each member's own probability-weighted bonus, since
    // both members share the same title bonus %.
    const prefixFrequency=getAveragePrefixFrequencyFor(entry.player.id,selectedPrefix);
    const expectedPrefixBonus=entry.score*(prefixFrequency/100)*(prefixes[selectedPrefix].bonus/100);
    return {...entry,baseScore:entry.score,prefixFrequency,expectedPrefixBonus,score:entry.score+expectedPrefixBonus};
  }).sort((a,b)=>b.score-a.score);

  const rankings=useMemo(()=>({core:buildTitleRanking("core",prefix),mid:buildTitleRanking("mid",prefix),support:buildTitleRanking("support",prefix)}),[baseRankings,prefix]);

  // If a role has a pinned pick, recommendations evaluate that fixed pick under every candidate
  // title rather than re-searching for the theoretically-best player per candidate - answers
  // "what's best for MY roster" once something is pinned, "what's best overall" otherwise
  // (pickFor falls back to index 0, so this is unchanged when nothing is pinned).
  const prefixRecommendations=useMemo(()=>prefixKeys.map(candidate=>{
    const roleEntries=roles.map(role=>pickFor(buildTitleRanking(role,candidate),selectedPlayerId[role]));
    const total=roleEntries.reduce((sum,entry)=>sum+(entry?.score??0),0);
    const base=roleEntries.reduce((sum,entry)=>sum+(entry?.baseScore??0),0);
    return {prefix:candidate,total,bonus:total-base};
  }).sort((a,b)=>b.total-a.total),[baseRankings,selectedPlayerId]);

  const totalScore=roles.reduce((sum,role)=>sum+(pickFor(rankings[role],selectedPlayerId[role])?.score??0),0);
  const baseTotalScore=roles.reduce((sum,role)=>sum+(pickFor(rankings[role],selectedPlayerId[role])?.baseScore??0),0);
  const selectedPrefixBonus=totalScore-baseTotalScore;
  const suffixFlatBonus=baseTotalScore*(suffixes[suffix].bonus/100);
  const suffixTriggeredScore=totalScore+suffixFlatBonus;

  // Suffixes are team-wide events (any of a real team's ~5 players can trigger them), so the
  // roster-wide probability is "at least one of the represented teams' games triggers it" -
  // computed across the distinct teams behind the current Core/Mid/Support picks.
  const winningTeams=useMemo(()=>Array.from(new Set(roles.map(role=>pickFor(rankings[role],selectedPlayerId[role])?.player.team).filter((team):team is string=>!!team))),[rankings,selectedPlayerId]);
  const suffixProbability=(candidate:SuffixKey)=>{
    const rates=winningTeams.map(team=>dataset.teamSuffixRates[team]?.[candidate]??0);
    return (1-rates.reduce((product,rate)=>product*(1-rate/100),1))*100;
  };
  const suffixRecommendations=useMemo(()=>dataset.computableSuffixes.map(candidate=>{
    const probability=suffixProbability(candidate);
    const bonus=baseTotalScore*(probability/100)*(suffixes[candidate].bonus/100);
    return {suffix:candidate,probability,bonus};
  }).sort((a,b)=>b.bonus-a.bonus),[winningTeams,baseTotalScore,dataset]);
  const selectedSuffixRecommendation=suffixRecommendations.find(r=>r.suffix===suffix);
  // Suffix bonus is applied as a flat percentage on top of the (already prefix-inclusive) total -
  // realistically a suffix event would only affect the specific group it happens to, but with no
  // reliable way to know which group in advance, the flat bonus is applied the same way Prefix's
  // own bonus already is once probability is folded in. The probability-weighted "expected value"
  // (selectedSuffixRecommendation) is used only for ranking which Suffix is statistically best in
  // the Recommended Subtitle list below, not for this headline number, so the two stay consistent.
  const suffixBonusAmount=suffixFlatBonus;
  const teamOverview=useMemo<TeamEntry[]>(()=>{
    const teams=new Map<string,TeamEntry>();
    roles.forEach(role=>rankings[role].forEach(entry=>{
      const team=playerTeam(entry.player.id,entry.player.team); if(!team)return;
      const current=teams.get(team)??{team,roles:{},total:0};
      if(!current.roles[role]||entry.score>current.roles[role]!.score){current.roles[role]={name:entry.player.name,score:entry.score};}
      teams.set(team,current);
    }));
    return Array.from(teams.values()).map(entry=>({...entry,total:roles.reduce((sum,role)=>sum+(entry.roles[role]?.score??0),0)})).sort((a,b)=>b.total-a.total);
  },[rankings]);

  // Team-level Prefix ranking: average every roster member's own title probability (5 players
  // per team - the two Core, the Mid, the two Support - regardless of which pick is currently
  // selected in the banner builder), then take the top 3. Works for both datasets since both
  // expose per-member entries in prefixStatsByPlayerId.
  const teamPrefixTop3=useMemo(()=>{
    const result:Record<string,{prefix:PrefixKey;value:number}[]>={};
    const byTeam=new Map<string,string[]>();
    players.forEach(p=>{
      const team=playerTeam(p.id,p.team); if(!team) return;
      const ids=byTeam.get(team)??[]; ids.push(p.id); byTeam.set(team,ids);
    });
    byTeam.forEach((ids,team)=>{
      const members=ids.flatMap(id=>dataset.prefixStatsByPlayerId[id]??[]);
      if(!members.length) return;
      result[team]=prefixKeys.map(key=>({
        prefix:key,
        value:members.reduce((sum,m)=>sum+(m.values[key]??0),0)/members.length
      })).sort((a,b)=>b.value-a.value).slice(0,3);
    });
    return result;
  },[players,dataset]);

  const averageEmblemValues=useMemo(()=>{
    const out={core:{} as Partial<Record<StatKey,number>>,mid:{} as Partial<Record<StatKey,number>>,support:{} as Partial<Record<StatKey,number>>};
    roles.forEach(role=>{
      const rolePlayers=scaledPlayers.filter(p=>p.role===role);
      const statKeys=new Set<StatKey>();
      rolePlayers.forEach(p=>Object.keys(p.stats).forEach(s=>statKeys.add(s as StatKey)));
      statKeys.forEach(stat=>{
        const values=rolePlayers.map(p=>p.stats[stat]).filter((v):v is number=>v!==undefined);
        if(values.length) out[role][stat]=Math.round(values.reduce((a,b)=>a+b,0)/values.length);
      });
    });
    return out;
  },[scaledPlayers]);

  const updateEmblem=(role:Role,index:number,patch:Partial<EmblemInput>)=>setBanners(c=>({...c,[role]:c[role].map((x,i)=>i===index?{...x,...patch}:x)}));
  const resetBanners=()=>setBanners({core:defaults.core.map(x=>({...x})),mid:defaults.mid.map(x=>({...x})),support:defaults.support.map(x=>({...x}))});
  // Simple mode is a clean slate - every emblem starts at 100 (pure base, no bonus) regardless
  // of whatever Tier/Trait was set in advanced mode; leaving simple mode clears customPercent so
  // Tier+Trait take back control of the score.
  const toggleSimpleMode=()=>setSimpleMode(current=>{
    const next=!current;
    setBanners(banners=>{
      const updated={} as BannerState;
      roles.forEach(role=>{
        updated[role]=banners[role].map(emblem=>({...emblem,customPercent:next?100:undefined}));
      });
      return updated;
    });
    return next;
  });
  const scrollToResults=()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth",block:"start"});
  const frequencyText=(playerId:string)=>getPrefixEntriesFor(playerId,prefix).map(entry=>`${entry.name} ${Math.round(entry.frequency*10)/10}%`).join(" · ");
  const contributionMax=(player:Player,contribution:ScoreContribution)=>{
    if(!player.members) return null;
    const maxs=player.members.map(m=>m.statRange[contribution.stat]?.max).filter((v):v is number=>v!==undefined);
    if(maxs.length!==player.members.length) return null;
    const max=(maxs.reduce((a,b)=>a+b,0)/maxs.length)*contribution.factor;
    return Math.round(max).toLocaleString(locale);
  };
  const toggleWinnerExpanded=(role:Role)=>setExpandedWinners(current=>{
    const next=new Set(current);
    if(next.has(role)) next.delete(role); else next.add(role);
    return next;
  });
  const toggleAlternativeExpanded=(key:string)=>setExpandedAlternatives(current=>{
    const next=new Set(current);
    if(next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const toggleChoose=(role:Role,playerId:string)=>setSelectedPlayerId(current=>({...current,[role]:current[role]===playerId?null:playerId}));
  const renderDistribution=(playerId:string,team:string)=>{
    const prefixEntries=dataset.prefixStatsByPlayerId[playerId]??[];
    const suffixRates=team?dataset.computableSuffixes.map(key=>({suffix:key,rate:dataset.teamSuffixRates[team]?.[key]})).filter(x=>x.rate!==undefined):[];
    return <div className="distribution-panel">
      <div className="distribution-prefix-grid">{prefixKeys.map(key=><div className="distribution-row" key={key}><span>{prefixes[key].label[language]}</span>{prefixEntries.map(entry=><b key={entry.name}>{entry.name}: {entry.values[key]??0}%</b>)}</div>)}</div>
      {suffixRates.length>0&&<div className="distribution-suffix-grid"><div className="eyebrow">{team}</div>{suffixRates.map(({suffix:key,rate})=><div className="distribution-row" key={key}><span>{suffixes[key].label[language]}</span><b>{rate}%</b></div>)}</div>}
    </div>;
  };

  return <main className="site-shell">
    <header className="topbar">
      <div className="topbar-row1">
        <a className="brand" href="#top"><span className="brand-mark">II</span><span>DOTA FANTASY 2026</span></a>
        <div className="language-switch dataset-switch" title={t.dataset}><button className={datasetKey==="mine"?"active":""} onClick={()=>onDatasetChange("mine")}>{datasets.mine.label[language]}</button><button className={datasetKey==="legacy"?"active":""} onClick={()=>onDatasetChange("legacy")}>{datasets.legacy.label[language]}</button></div>
        <div className="language-switch"><button className={language==="en"?"active":""} onClick={()=>onLanguageChange("en")}>EN</button><button className={language==="ru"?"active":""} onClick={()=>onLanguageChange("ru")}>RU</button></div>
      </div>
      <nav className="anchor-nav"><a href="#builder">{t.builder}</a><a href="#titles">{t.titles}</a><a href="#results">{t.results}</a><a href="#teams">{t.teams}</a><a href="#leaderboard">{t.leaderboard}</a><a href="#rules">{t.rules}</a><a href="#traits">{t.traits}</a><a href="#rerolls">{t.rerolls}</a></nav>
    </header>

    <section className="hero" id="top"><div className="hero-glow"/><div className="hero-copy"><div className="eyebrow">{t.kicker}</div><h1>{t.title}</h1><p>{t.subtitle}</p><div className="hero-actions"><button className="primary-button" onClick={scrollToResults}>{t.optimize}</button><button className="ghost-button" onClick={resetBanners}>{t.reset}</button></div></div><aside className="dataset-card"><span>{dataset.sourceLabel[language]}</span><strong>{dataset.matches}</strong><small>{t.matches}</small></aside></section>

    <section className="section" id="builder"><div className="section-title"><div><div className="eyebrow">01 · {t.builder}</div><h2>{t.builder}</h2></div><div className="section-title-actions"><div className="language-switch mode-switch"><button className={!simpleMode?"active":""} onClick={()=>simpleMode&&toggleSimpleMode()}>{t.advancedModeLabel}</button><button className={simpleMode?"active":""} onClick={()=>!simpleMode&&toggleSimpleMode()}>{t.simpleModeLabel}</button></div><button className="text-button" onClick={resetBanners}>{t.reset}</button></div></div>
      <div className="title-panel" id="titles">
        <div className="title-panel-heading"><div><div className="eyebrow">{t.titles}</div><h3>{t.titles}</h3><p>{t.titleIntro}</p></div><div className="title-score-chip"><span>{t.expectedBonus}</span><strong>+{Math.round(selectedPrefixBonus).toLocaleString(locale)}</strong></div></div>
        <div className="title-control-grid">
          <div className="title-control-card prefix-card"><label>{t.prefix}<select value={prefix} onChange={e=>setPrefix(e.target.value as PrefixKey)}>{prefixKeys.map(key=><option value={key} key={key}>{prefixes[key].label[language]} (+{prefixes[key].bonus}%)</option>)}</select></label><p>{prefixes[prefix].condition[language]}</p><div className="title-stat-line"><span>{t.expectedBonus}</span><b>+{Math.round(selectedPrefixBonus).toLocaleString(locale)}</b></div><small>{t.titleMethod}</small></div>
          <div className="title-control-card suffix-card"><div className="suffix-label-row"><label>{t.suffix}<select value={suffix} onChange={e=>setSuffix(e.target.value as SuffixKey)}>{suffixKeys.map(key=>{const computable=dataset.computableSuffixes.includes(key);return <option value={key} key={key}>{(!computable&&dataset.computableSuffixes.length>0)?"⚠ ":""}{suffixes[key].label[language]} (+{suffixes[key].bonus}%)</option>})}</select></label>{datasetKey==="legacy"&&<span className={`suffix-badge category-${suffixes[suffix].category}`}>{categoryLabel(suffixes[suffix].category,language)}</span>}</div><p>{suffixes[suffix].condition[language]}</p><div className="title-stat-line"><span>{t.suffixScenario}</span><b>{Math.round(suffixTriggeredScore).toLocaleString(locale)}</b></div><div className="title-stat-line"><span>{t.expectedSubtitleBonus}</span><b>+{Math.round(suffixBonusAmount).toLocaleString(locale)}</b></div>{selectedSuffixRecommendation?<div className="title-stat-line"><span>{t.subtitleProbability}</span><b>{Math.round(selectedSuffixRecommendation.probability*10)/10}%</b></div>:null}<small>{dataset.computableSuffixes.length>0&&!dataset.computableSuffixes.includes(suffix)?t.notComputable:t.suffixNote}</small></div>
        </div>
        <div className="prefix-recommendations"><div className="recommendation-heading"><div><span>{t.recommendedPrefix}</span><strong>{prefixes[prefixRecommendations[0].prefix].label[language]} · +{Math.round(prefixRecommendations[0].bonus).toLocaleString(locale)}</strong></div><button className="ghost-button compact-button" onClick={()=>setPrefix(prefixRecommendations[0].prefix)}>{t.useRecommended}</button></div><div className="prefix-rank-list">{prefixRecommendations.slice(0,4).map((entry,index)=><button key={entry.prefix} className={entry.prefix===prefix?"active":""} onClick={()=>setPrefix(entry.prefix)}><i>{index+1}</i><span>{prefixes[entry.prefix].label[language]}</span><b>+{Math.round(entry.bonus).toLocaleString(locale)}</b></button>)}</div></div>
        {suffixRecommendations.length>0&&<div className="prefix-recommendations"><div className="recommendation-heading"><div><span>{t.recommendedSubtitle}</span><strong>{suffixes[suffixRecommendations[0].suffix].label[language]} · +{Math.round(suffixRecommendations[0].bonus).toLocaleString(locale)}</strong></div><button className="ghost-button compact-button" onClick={()=>setSuffix(suffixRecommendations[0].suffix)}>{t.useRecommended}</button></div><div className="prefix-rank-list">{suffixRecommendations.map((entry,index)=><button key={entry.suffix} className={entry.suffix===suffix?"active":""} onClick={()=>setSuffix(entry.suffix)}><i>{index+1}</i><span>{suffixes[entry.suffix].label[language]}</span><b>+{Math.round(entry.bonus).toLocaleString(locale)}</b></button>)}</div><small>{t.subtitleMethod}</small></div>}
      </div>
      <div className="banner-board">
      {roles.map(role=><article className={`banner-column role-${role}`} key={role}><div className="banner-heading"><div><span>{t[role]}</span><small>{role==="mid"?t.single:t.pair}</small></div><b>{bannerSlotColors[role].map(c=>t[c]).join(" · ")}</b></div><div className="banner-slots">
        {banners[role].map((emblem,index)=>{const color=bannerSlotColors[role][index];const stats=roleStats[role].filter(s=>statColors[s]===color);return <div className={`slot-card color-${color}`} key={`${role}-${index}`}><div className="slot-topline"><span>{t.emblem} {index+1}</span><i>{t[color]}</i></div><select value={emblem.stat} onChange={e=>updateEmblem(role,index,{stat:e.target.value as StatKey})}>{stats.map(s=><option key={s} value={s}>{labels[s][language]}</option>)}</select>{simpleMode?<label className="percent-control">{t.customPercent}<div className="percent-input"><input type="number" step={10} value={emblem.customPercent??100} onChange={e=>updateEmblem(role,index,{customPercent:e.target.valueAsNumber})}/><span>%</span></div></label>:<div className="dual-control"><label>{t.tier}<select value={emblem.tier} onChange={e=>updateEmblem(role,index,{tier:e.target.value as Tier})}>{(Object.keys(tierBonuses) as Tier[]).map(x=><option key={x}>{x} (+{tierBonuses[x]}%)</option>)}</select></label><label>{t.trait}<select value={emblem.trait} onChange={e=>updateEmblem(role,index,{trait:e.target.value as Trait})}>{(Object.keys(traitLabels) as Trait[]).map(x=><option key={x} value={x}>{traitLabels[x][language]}</option>)}</select></label></div>}</div>})}
      </div></article>)}
    </div><div className="builder-footer"><p>{prefixes[prefix].label[language]} +{prefixes[prefix].bonus}% · {suffixes[suffix].label[language]} +{suffixes[suffix].bonus}%</p><button className="primary-button" onClick={scrollToResults}>{t.optimize}</button></div></section>

    <section className="section results-section" id="results"><div className="results-hero"><div><div className="eyebrow">02 · {t.results}</div><h2>{t.results}</h2><p>{dataset.sourceLabel[language]}</p></div><div className="total-score"><div className="game-multiplier-switch" title={t.gameMultiplier}><button className={gameMultiplier===1?"active":""} onClick={()=>setGameMultiplier(1)}>×1</button><button className={gameMultiplier===2?"active":""} onClick={()=>setGameMultiplier(2)}>×2</button></div><span>{t.total}</span><strong>{Math.round(totalScore).toLocaleString(locale)}</strong><div className="combined-score-line"><span>{t.withTitle}</span><b>{Math.round(suffixTriggeredScore).toLocaleString(locale)}</b></div></div></div><div className="winner-grid">
      {roles.map(role=>{
        const winner=pickFor(rankings[role],selectedPlayerId[role]);if(!winner)return null;
        const team=playerTeam(winner.player.id,winner.player.team);
        const isExpanded=expandedWinners.has(role);
        return <article className="winner-card" key={role}>
          <div className="winner-role"><span>{t[role]}</span><small>{role==="mid"?t.single:t.pair}</small></div>
          <div className="winner-identity">{team&&<TeamLogo team={team} size="lg"/>}<div><div className="winner-name">{winner.player.name}</div>{team&&<div className="winner-team">{team}</div>}<div className="prefix-frequency">{frequencyText(winner.player.id)}</div></div></div>
          <div className="winner-score"><span>{t.score}</span><strong>{Math.round(winner.score).toLocaleString(locale)}</strong></div>
          <div className="winner-breakdown">{winner.contributions.map(x=>{const max=contributionMax(winner.player,x);return <div key={x.stat}><span>{labels[x.stat][language]}</span><span className="breakdown-value">{max&&<small>{t.upTo} {max}</small>}<b>{Math.round(x.weightedValue).toLocaleString(locale)}</b></span></div>})}<div className="prefix-breakdown"><span>{t.prefixContribution}</span><b>+{Math.round(winner.expectedPrefixBonus).toLocaleString(locale)}</b></div>{selectedSuffixRecommendation&&<div className="prefix-breakdown"><span>{t.suffixContribution}</span><b>+{Math.round(winner.baseScore*(selectedSuffixRecommendation.probability/100)*(suffixes[suffix].bonus/100)).toLocaleString(locale)}</b></div>}</div>
          <button className="text-button distribution-toggle" onClick={()=>toggleWinnerExpanded(role)}>{isExpanded?t.hideDistribution:t.showDistribution}</button>
          {selectedPlayerId[role]&&<div className="manual-pick-note">{t.manuallySelected} · <button className="text-button" onClick={()=>setSelectedPlayerId(c=>({...c,[role]:null}))}>{t.resetToBest}</button></div>}
          {isExpanded&&renderDistribution(winner.player.id,team)}
        </article>;
      })}
    </div><div className="alternatives-grid">{roles.map(role=><article className="alternatives-card" key={role}><div className="alternatives-heading"><h3>{t[role]}</h3><span>{t.alternatives} · {prefixes[prefix].label[language]}</span></div>{rankings[role].slice(0,8).map((entry,index)=>{
      const team=playerTeam(entry.player.id,entry.player.team);
      const altKey=`${role}-${entry.player.id}`;
      const isAltExpanded=expandedAlternatives.has(altKey);
      const isChosen=selectedPlayerId[role]===entry.player.id;
      return <div className="alternative-entry" key={entry.player.id}>
        <button className="alternative-row" onClick={()=>toggleAlternativeExpanded(altKey)}>
          <span className="rank-number">{index+1}</span>{team&&<TeamLogo team={team} size="sm"/>}
          <div><strong>{entry.player.name}</strong>{team&&<small className="team-label">{team}</small>}<small className="prefix-frequency">{frequencyText(entry.player.id)}</small></div>
          <b>{Math.round(entry.score).toLocaleString(locale)}</b>
        </button>
        <div className="alternative-actions"><button className={`choose-button${isChosen?" active":""}`} onClick={()=>toggleChoose(role,entry.player.id)}>{isChosen?t.chosen:t.choose}</button></div>
        {isAltExpanded&&renderDistribution(entry.player.id,team)}
      </div>;
    })}</article>)}</div></section>

    <section className="section" id="teams"><div className="section-title"><div><div className="eyebrow">03 · {t.teams}</div><h2>{t.teams}</h2><p>{t.teamsSubtitle}</p></div></div><div className="team-grid">{teamOverview.map(entry=>{
      const matches=dataset.teamMatches[entry.team];
      const suffixRates=dataset.computableSuffixes.map(key=>({suffix:key,rate:dataset.teamSuffixRates[entry.team]?.[key]})).filter(x=>x.rate!==undefined);
      const topPrefixes=teamPrefixTop3[entry.team]??[];
      return <article className="team-card" key={entry.team}>
        <div className="team-card-header"><div className="team-card-title"><TeamLogo team={entry.team} size="lg"/><h3>{entry.team}</h3></div><strong>{Math.round(entry.total).toLocaleString(locale)}</strong></div>
        <small>{t.availableTotal}</small>
        <div className="team-role-list">{roles.map(role=>entry.roles[role]?<div key={role}><span>{t[role]}</span><b>{entry.roles[role]!.name}</b><em>{Math.round(entry.roles[role]!.score).toLocaleString(locale)}</em></div>:null)}</div>
        <footer className="team-footer">
          {matches!==undefined&&<div className="team-matches">{t.matchesRecorded}<b>{matches.toLocaleString(locale)}</b></div>}
          {topPrefixes.length>0&&<div className="team-prefix-list"><span>{t.topPrefixes}</span>{topPrefixes.map(p=><div key={p.prefix}><b>{prefixes[p.prefix].label[language]}</b><em>{Math.round(p.value*10)/10}%</em></div>)}</div>}
          {suffixRates.length>0&&<div className="team-suffix-list"><span>{t.suffixChances}</span>{suffixRates.map(({suffix:key,rate})=><div key={key}><b>{suffixes[key].label[language]}</b><em>{rate}%</em></div>)}</div>}
        </footer>
      </article>;
    })}</div></section>

    {children}

    <section className="section" id="rules"><div className="section-title"><div><div className="eyebrow">05 · {t.rules}</div><h2>{t.rules}</h2></div></div><div className="rules-grid">{Object.keys(scoringRules).map(stat=><article className="rule-tile" key={stat}><span>{labels[stat as StatKey][language]}</span><b>{formulas[stat as StatKey][language]}</b></article>)}</div><div className="methodology"><h3>{t.methodology}</h3><ul>{[...methodology[language],...(datasetKey==="mine"?mineMethodologyExtra[language]:[])].map(note=><li key={note}>{note}</li>)}</ul></div></section>

    <section className="section split-section" id="traits"><div><div className="eyebrow">06 · {t.traits}</div><h2>{t.traits}</h2></div><div className="trait-grid">{(Object.keys(traitDescriptions) as Trait[]).filter(x=>x!=="none").map(x=><article className="info-tile" key={x}><span>{traitLabels[x][language]}</span><p>{traitDescriptions[x][language]}</p></article>)}</div></section>

    <section className="section" id="rerolls"><div className="section-title"><div><div className="eyebrow">07 · {t.rerolls}</div><h2>{t.rerolls}</h2></div></div><div className="reroll-grid">{roles.map(role=>{const values=averageEmblemValues[role];const ranking=roleStats[role].filter(s=>values[s]!==undefined).map(s=>({stat:s,value:values[s]??0})).sort((a,b)=>b.value-a.value);return <article className="reroll-card" key={role}><h3>{t[role]}</h3>{ranking.map((x,i)=><div key={x.stat}><span><i>{i+1}</i>{labels[x.stat][language]} <small>{t[statColors[x.stat]]}</small></span><b>{x.value.toLocaleString(locale)}</b></div>)}</article>})}</div></section>
  </main>;
}
