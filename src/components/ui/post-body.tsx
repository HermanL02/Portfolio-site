import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Long-form markdown for blog posts.
 *
 * Deliberately separate from MarkdownRenderer, which exists to render the
 * one-line strings inside portfolio cards and has no handling for code blocks,
 * tables, blockquotes or headings below h3.
 */
export function PostBody({ content }: { content: string }) {
  return (
    <div className="text-sm leading-[1.75] text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // More space above a heading than below it, so sections group upward.
          h2: ({ children }) => (
            <h2 className="mt-14 mb-4 text-lg font-bold text-terminal-green-bright">
              <span className="text-terminal-green-dim select-none">## </span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-10 mb-3 text-base font-bold text-terminal-green">
              <span className="text-terminal-green-dim select-none">### </span>
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-4 max-w-[70ch]">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold text-terminal-green-bright">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-cyan hover:text-terminal-green underline underline-offset-2"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 max-w-[70ch] space-y-2 list-none">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 max-w-[70ch] space-y-2 list-decimal pl-6 marker:text-terminal-green-dim">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            // Unordered items get a terminal caret; ordered ones keep their marker.
            const ordered = 'value' in props;
            return ordered ? (
              <li>{children}</li>
            ) : (
              <li className="relative pl-5 before:absolute before:left-0 before:text-terminal-green before:content-['>']">
                {children}
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l border-terminal-border-strong pl-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-10 border-terminal-border" />,
          code: ({ className, children }) => {
            // react-markdown tags fenced blocks with `language-*`; anything
            // without it is inline.
            const isBlock = /language-/.test(className ?? '');
            if (isBlock) {
              return <code className="font-mono text-[0.8125rem]">{children}</code>;
            }
            return (
              <code className="bg-terminal-surface-3 text-terminal-green-bright px-1.5 py-0.5 text-[0.95em] font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto border border-terminal-border bg-terminal-surface-2 p-4 text-terminal-green-bright">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto border border-terminal-border bg-terminal-surface">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-terminal-surface-2 text-terminal-green">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-terminal-border px-3 py-2 text-left font-bold whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-terminal-border px-3 py-2 align-top">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
