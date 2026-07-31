"use client"
import { useMemo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

function inline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (!part) return null
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em] text-primary">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{inline(part.slice(2, -2))}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{inline(part.slice(1, -1))}</em>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
          {inline(link[1])}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

const KEYWORDS = new Set([
  "function", "const", "let", "var", "return", "if", "else", "for", "while", "do", "class", "new", "this", "super",
  "import", "export", "from", "default", "def", "public", "private", "protected", "static", "void", "int", "float",
  "double", "long", "char", "boolean", "bool", "string", "true", "false", "null", "undefined", "None", "print",
  "lambda", "async", "await", "try", "catch", "finally", "throw", "switch", "case", "break", "continue", "yield",
  "using", "fn", "struct", "enum", "interface", "type", "extends", "implements", "of", "in", "typeof", "instanceof",
])

function highlight(code: string): ReactNode[] {
  const tokenRe = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g
  const nodes: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = tokenRe.exec(code)) !== null) {
    if (m.index > last) nodes.push(<span key={k++}>{code.slice(last, m.index)}</span>)
    const tok = m[0]
    if (tok.startsWith("//") || tok.startsWith("#") || tok.startsWith("/*")) {
      nodes.push(<span key={k++} className="text-muted-foreground/60 italic">{tok}</span>)
    } else if (tok.startsWith('"') || tok.startsWith("'") || tok.startsWith("`")) {
      nodes.push(<span key={k++} className="text-green-400">{tok}</span>)
    } else if (/^\d/.test(tok)) {
      nodes.push(<span key={k++} className="text-orange-400">{tok}</span>)
    } else if (KEYWORDS.has(tok)) {
      nodes.push(<span key={k++} className="text-purple-400">{tok}</span>)
    } else {
      nodes.push(<span key={k++}>{tok}</span>)
    }
    last = tokenRe.lastIndex
  }
  if (last < code.length) nodes.push(<span key={k++}>{code.slice(last)}</span>)
  return nodes
}

type Block =
  | { kind: "code"; lang: string; code: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "hr" }
  | { kind: "p"; text: string }

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const codeMatch = line.match(/^```(\w*)\s*$/)
    if (codeMatch) {
      const lang = codeMatch[1]
      const buf: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++
      blocks.push({ kind: "code", lang, code: buf.join("\n") })
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] })
      i++
      continue
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ kind: "hr" })
      i++
      continue
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i])
        i++
      }
      if (tableLines.length >= 2) {
        const parseRow = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
        const header = parseRow(tableLines[0])
        const rows = tableLines.slice(2).map(parseRow)
        blocks.push({ kind: "table", header, rows })
      } else {
        blocks.push({ kind: "p", text: tableLines.join(" ") })
      }
      continue
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ""))
        i++
      }
      blocks.push({ kind: "ul", items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""))
        i++
      }
      blocks.push({ kind: "ol", items })
      continue
    }

    if (/^>\s?/.test(line)) {
      const text: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        text.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      blocks.push({ kind: "quote", text: text.join(" ") })
      continue
    }

    if (line.trim() === "") {
      i++
      continue
    }

    const buf: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6})\s/.test(lines[i]) && !/^```/.test(lines[i])) {
      buf.push(lines[i])
      i++
    }
    blocks.push({ kind: "p", text: buf.join(" ") })
  }
  return blocks
}

export function MarkdownPreview({ content, className }: { content: string; className?: string }) {
  const blocks = useMemo(() => parseBlocks(content || ""), [content])

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed", className)}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            const Tag = `h${Math.min(block.level, 4)}` as "h1" | "h2" | "h3" | "h4"
            return (
              <Tag key={i} className="font-semibold text-foreground">
                {inline(block.text)}
              </Tag>
            )
          case "code":
            return (
              <div key={i} className="overflow-hidden rounded-lg border border-border/50 bg-secondary/50">
                {block.lang && (
                  <div className="flex items-center justify-between border-b border-border/50 px-3 py-1 text-xs text-muted-foreground">
                    <span className="font-mono">{block.lang}</span>
                  </div>
                )}
                <pre className="overflow-x-auto p-3 font-mono text-xs text-foreground">
                  <code>{highlight(block.code)}</code>
                </pre>
              </div>
            )
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/50 text-left">
                      {block.header.map((h, j) => (
                        <th key={j} className="px-3 py-2 font-medium">{inline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className="border-b border-border/40 last:border-0">
                        {row.map((cell, k) => (
                          <td key={k} className="px-3 py-2">{inline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </ol>
            )
          case "quote":
            return (
              <blockquote key={i} className="border-l-2 border-primary/40 pl-3 text-muted-foreground">
                {inline(block.text)}
              </blockquote>
            )
          case "hr":
            return <hr key={i} className="border-border" />
          case "p":
            return <p key={i}>{inline(block.text)}</p>
        }
      })}
    </div>
  )
}
