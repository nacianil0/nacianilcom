/** Latin brand labels — CSS `uppercase` on TR pages maps i→İ (e.g. LinkedIn→LİNKEDİN). */
export function brandLabel(label: string): string {
  return label.toLocaleUpperCase('en-US');
}
