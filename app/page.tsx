"use client";

import { useEffect, useState } from "react";
import Optimizer from "../components/Optimizer";
import Leaderboard from "../components/Leaderboard";
import { DatasetKey } from "../data/datasets";
import { Language } from "../lib/language";

const DATASET_STORAGE_KEY = "dota-fantasy-dataset";

export default function Home() {
  const [datasetKey, setDatasetKey] = useState<DatasetKey>("mine");
  const [language, setLanguage] = useState<Language>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem(DATASET_STORAGE_KEY);
    if (stored === "mine" || stored === "legacy") setDatasetKey(stored);
  }, []);
  useEffect(() => {
    window.localStorage.setItem(DATASET_STORAGE_KEY, datasetKey);
  }, [datasetKey]);

  return (
    <Optimizer datasetKey={datasetKey} onDatasetChange={setDatasetKey} language={language} onLanguageChange={setLanguage}>
      <Leaderboard language={language} onLanguageChange={setLanguage} />
    </Optimizer>
  );
}
