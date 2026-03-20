const colorPalette = [
  "#7C3AED",
  "#ED4956",
  "#FFD166",
  "#0EA5E9",
  "#6EE7B7",
  "#FBBF24",
  "#EC4899",
  "#FB7185",
  "#BAE6FD",
  "#3BC9DB",
  "#9A6EBE",
  "#DC267F"
];

export function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash % colorPalette.length)];
}