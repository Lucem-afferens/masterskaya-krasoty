/** Public assets and plain anchors need the same prefix as Next.js routes. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function sitePath(path: string) {
  return `${basePath}${path}`;
}
