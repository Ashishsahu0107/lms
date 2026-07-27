export function safeTrim(value) {
  return typeof value === "string" ? value.trim() : value;
}
