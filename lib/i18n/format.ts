// Tiny {placeholder} interpolation helper, e.g. format("Hi {name}", { name: "Ali" })
export function format(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}
