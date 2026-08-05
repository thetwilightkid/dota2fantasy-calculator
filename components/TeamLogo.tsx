export default function TeamLogo({ team, size = "md" }: { team: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`team-logo team-logo-${size}`} title={team} role="img" aria-label={team} />;
}
