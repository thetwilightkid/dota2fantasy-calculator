"use client";

import { useEffect, useMemo, useState } from "react";
import { Player, PlayerMember, Role, StatKey, roleStats } from "../data/players";
import { statColors } from "../data/rules";
import { datasets, DatasetKey } from "../data/datasets";
import { statLabels } from "../data/labels";
import { playerTeam } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { Language } from "../lib/language";

const statColorVar = { red: "var(--red)", blue: "var(--blue)", green: "var(--green)" } as const;

type RoleFilter = "all" | Role;

const roles: Role[] = ["core", "mid", "support"];
const allStats: StatKey[] = Array.from(new Set([...roleStats.core, ...roleStats.mid, ...roleStats.support]));

const text = {
  en: {
    eyebrow: "04 · STAT LEADERBOARD",
    title: "Player stat leaderboard",
    subtitle: "Pick any tracked stat and see every Core/Mid/Support pick ranked by it, independent of the Banner Builder above. The % multiplier is a standalone \"what if this stat were worth X%\" exploration tool.",
    perGameNote: "Results shown here are per 1 game (unlike the ×1/×2 toggle in the calculator above).",
    stat: "Stat", role: "Role", allRoles: "All roles", multiplier: "Multiplier",
    rank: "#", player: "Player", points: "Points", details: "Details", hide: "Hide",
    core: "Core", mid: "Mid", support: "Support",
    max: "up to", probability: "chance per game", noRows: "No players have data for this stat yet.",
    dataset: "Dataset"
  },
  ru: {
    eyebrow: "04 · ТАБЛИЦА ЛИДЕРОВ",
    title: "Таблица лидеров по статам",
    subtitle: "Выберите любую статистику и посмотрите все связки Core/Mid/Support, отсортированные по ней, независимо от калькулятора выше. Множитель % — отдельный инструмент \"что если эта стата стоила бы X%\".",
    perGameNote: "Результаты здесь показаны за 1 игру (в отличие от переключателя ×1/×2 в калькуляторе выше).",
    stat: "Стата", role: "Роль", allRoles: "Все роли", multiplier: "Множитель",
    rank: "#", player: "Игрок", points: "Очки", details: "Детали", hide: "Скрыть",
    core: "Основа", mid: "Центр", support: "Поддержка",
    max: "до", probability: "шанс за игру", noRows: "Пока нет игроков с данными по этой стате.",
    dataset: "Датасет"
  }
} as const;

type LeaderboardProps = {
  datasetKey: DatasetKey; onDatasetChange: (key: DatasetKey) => void;
  language: Language; onLanguageChange: (language: Language) => void;
};

export default function Leaderboard({ datasetKey, onDatasetChange, language, onLanguageChange }: LeaderboardProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [stat, setStat] = useState<StatKey>("kills");
  const [pct, setPct] = useState<number>(100);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const t = text[language];
  const locale = language === "ru" ? "ru-RU" : "en-US";
  const dataset = datasets[datasetKey];

  const availableStats = roleFilter === "all" ? allStats : roleStats[roleFilter];

  useEffect(() => {
    if (!availableStats.includes(stat)) setStat(availableStats[0]);
  }, [roleFilter]);

  // Switching what's being ranked makes any previously-expanded member detail stale, so collapse
  // everything rather than leave old rows pinned open under a new stat/dataset.
  useEffect(() => {
    setExpanded(new Set());
  }, [stat, datasetKey]);

  const factor = (Number.isFinite(pct) ? pct : 100) / 100;

  const rows = useMemo(() => {
    return dataset.players
      .filter((p) => (roleFilter === "all" || p.role === roleFilter) && p.stats[stat] !== undefined)
      .map((p) => ({ player: p, value: (p.stats[stat] as number) * factor }))
      .sort((a, b) => b.value - a.value);
  }, [dataset, roleFilter, stat, factor]);

  const toggleExpanded = (id: string) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const memberDetail = (member: PlayerMember) => {
    const range = member.statRange[stat];
    const probability = member.probability?.[stat];
    return (
      <div className="leaderboard-member" key={member.name}>
        <span className="leaderboard-member-name">{member.name}</span>
        <span className="leaderboard-member-value">{Math.round((member.stats[stat] ?? 0) * factor).toLocaleString(locale)}</span>
        {range && <span className="leaderboard-member-range">{t.max} {Math.round(range.max * factor).toLocaleString(locale)}</span>}
        {probability !== undefined && <span className="leaderboard-member-probability">{probability}% {t.probability}</span>}
      </div>
    );
  };

  return (
    <section className="section leaderboard-section" id="leaderboard">
      <div className="leaderboard-heading">
        <div>
          <div className="eyebrow">{t.eyebrow}</div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
          <p className="leaderboard-per-game-note">{t.perGameNote}</p>
        </div>
        <div className="leaderboard-tools">
          <div className="language-switch" title={t.dataset}>
            <button className={datasetKey === "mine" ? "active" : ""} onClick={() => onDatasetChange("mine")}>{datasets.mine.label[language]}</button>
            <button className={datasetKey === "legacy" ? "active" : ""} onClick={() => onDatasetChange("legacy")}>{datasets.legacy.label[language]}</button>
          </div>
          <div className="language-switch">
            <button className={language === "en" ? "active" : ""} onClick={() => onLanguageChange("en")}>EN</button>
            <button className={language === "ru" ? "active" : ""} onClick={() => onLanguageChange("ru")}>RU</button>
          </div>
        </div>
      </div>

      <div className="leaderboard-controls">
        <label>{t.role}
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}>
            <option value="all">{t.allRoles}</option>
            {roles.map((role) => <option key={role} value={role}>{t[role]}</option>)}
          </select>
        </label>
        <label>{t.stat}
          <select value={stat} onChange={(e) => setStat(e.target.value as StatKey)}>
            {availableStats.map((s) => <option key={s} value={s} style={{ color: statColorVar[statColors[s]] }}>{statLabels[s][language]}</option>)}
          </select>
        </label>
        <label>{t.multiplier}
          <input type="number" min={0} step={10} value={pct} onChange={(e) => setPct(e.target.valueAsNumber)} />
        </label>
      </div>

      <div className="leaderboard-table" role="table" aria-label={t.title}>
        <div className="leaderboard-row leaderboard-head" role="row">
          <span role="columnheader">{t.rank}</span>
          <span role="columnheader">{t.player}</span>
          <span role="columnheader">{t.role}</span>
          <span role="columnheader">{t.points}</span>
        </div>
        {rows.length === 0 && <p className="leaderboard-empty">{t.noRows}</p>}
        {rows.map(({ player, value }, index) => {
          const team = playerTeam(player.id, player.team);
          const isExpanded = expanded.has(player.id);
          return (
            <div className="leaderboard-entry" key={player.id}>
              <div className="leaderboard-row" role="row">
                <span className="rank-number" role="cell">{index + 1}</span>
                <span className="leaderboard-player" role="cell">
                  {team && <TeamLogo team={team} size="sm" />}
                  <span>
                    <strong>{player.name}</strong>
                    {team && <small className="team-label">{team}</small>}
                  </span>
                </span>
                <span role="cell">{t[player.role]}</span>
                <span className="leaderboard-points" role="cell">
                  {Math.round(value).toLocaleString(locale)}
                  {player.members && (
                    <button className="text-button leaderboard-toggle" onClick={() => toggleExpanded(player.id)}>
                      {isExpanded ? t.hide : t.details}
                    </button>
                  )}
                </span>
              </div>
              {isExpanded && player.members && (
                <div className="leaderboard-detail">
                  {player.members.map((member) => memberDetail(member))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
