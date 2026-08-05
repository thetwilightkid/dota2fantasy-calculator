import { StatKey } from "./players";

export const statLabels: Record<StatKey, { en: string; ru: string }> = {
  gpm:{en:"GPM",ru:"З/М"}, deaths:{en:"Deaths",ru:"Смерти"}, creeps:{en:"Creeps",ru:"Крипы"},
  madstones:{en:"Madstones",ru:"Подбор безумрудов"}, kills:{en:"Kills",ru:"Убийства"}, towers:{en:"Towers",ru:"Башни"},
  teamfight:{en:"Teamfight",ru:"Командные сражения"}, stuns:{en:"Stuns",ru:"Оглушения"}, tormentor:{en:"Tormentor kills",ru:"Убийства Терзателей"},
  roshan:{en:"Roshan kills",ru:"Убийства Рошана"}, firstBlood:{en:"First Blood",ru:"Первая кровь"}, courier:{en:"Courier kills",ru:"Убийства курьеров"},
  wards:{en:"Wards placed",ru:"Установка вардов"}, stacks:{en:"Camps stacked",ru:"Стак лагерей"}, lotuses:{en:"Lotuses",ru:"Сбор лотосов ≈"},
  watchers:{en:"Watchers",ru:"Захват смотрителей"}, runes:{en:"Runes",ru:"Руны"}, smokes:{en:"Smoke uses",ru:"Применения Smoke of Deceit"}
};
