export type DynoType = "number" | "string" | "checkbox" | "select";

export function getType(rawValue: string): DynoType {
  const value = rawValue.trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    return "select";
  } else if (value === "true" || value === "false") {
    return "checkbox";
  } else if (Number.isFinite(+value)) {
    return "number";
  }
  return "string";
}
