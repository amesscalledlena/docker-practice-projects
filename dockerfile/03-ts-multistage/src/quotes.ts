export interface Quote {
  id: number;
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  { id: 1, text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { id: 2, text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { id: 3, text: "Programs must be written for people to read.", author: "Harold Abelson" },
  { id: 4, text: "Premature optimization is the root of all evil.", author: "Donald Knuth" },
];

export function randomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
