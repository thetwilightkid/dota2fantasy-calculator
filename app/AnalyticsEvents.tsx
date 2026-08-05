"use client";

import { useEffect } from "react";
import { Analytics, track } from "@vercel/analytics/react";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function roleFromElement(element: Element | null) {
  const column = element?.closest(".banner-column");
  if (!column) return "unknown";
  if (column.classList.contains("role-core")) return "core";
  if (column.classList.contains("role-mid")) return "mid";
  if (column.classList.contains("role-support")) return "support";
  return "unknown";
}

function slotFromElement(element: Element | null) {
  const slot = element?.closest(".slot-card");
  const container = slot?.parentElement;
  if (!slot || !container) return 0;
  return Array.from(container.children).indexOf(slot) + 1;
}

export default function AnalyticsEvents() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer ? new URL(document.referrer).hostname : "direct";

    track("session_start", {
      referrer,
      utm_source: params.get("utm_source") ?? "none",
      utm_medium: params.get("utm_medium") ?? "none",
      utm_campaign: params.get("utm_campaign") ?? "none"
    });

    const engagementTimers = [30, 90, 180].map((seconds) =>
      window.setTimeout(() => track("engaged_time", { seconds }), seconds * 1000)
    );

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const clickable = target?.closest("a, button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!clickable) return;

      if (clickable instanceof HTMLAnchorElement) {
        const href = clickable.href;
        if (href.includes("#")) track("navigation_click", { section: href.split("#")[1] || "top" });
        return;
      }

      const text = normalizeText(clickable.textContent);
      if (text.includes("optimize roster") || text.includes("подобрать состав")) {
        track("optimize_roster");
        return;
      }

      if (text.includes("reset banners") || text.includes("сбросить настройки")) {
        track("reset_banners");
        return;
      }

      if (["en", "ru"].includes(text)) {
        track("language_change", { language: text });
      }
    };

    const onChange = (event: Event) => {
      const select = event.target as HTMLSelectElement | null;
      if (!select || select.tagName !== "SELECT") return;

      const slot = select.closest(".slot-card");
      if (!slot) return;

      const selects = Array.from(slot.querySelectorAll("select"));
      const index = selects.indexOf(select);
      const control = index === 0 ? "stat" : index === 1 ? "tier" : "trait";

      track("banner_change", {
        role: roleFromElement(select),
        slot: slotFromElement(select),
        control,
        value: select.value
      });
    };

    const observedSections = new Set<string>();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).id;
          if (!id || observedSections.has(id)) return;
          observedSections.add(id);
          track("section_view", { section: id });
        });
      },
      { threshold: 0.35 }
    );

    ["builder", "results", "teams", "traits", "rerolls", "rules", "leaderboard"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });

    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);

    return () => {
      engagementTimers.forEach(window.clearTimeout);
      sectionObserver.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
    };
  }, []);

  return <Analytics />;
}
