import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { formatPostDate } from '@/lib/format-date';

export const metadata: Metadata = {
  title: 'herman@portfolio:~/blog$',
  description: 'Engineering write-ups by Herman Liang — distributed systems, debugging and the occasional root cause.',
  openGraph: {
    title: 'Blog — Herman Liang',
    description: 'Engineering write-ups — distributed systems, debugging and the occasional root cause.',
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-terminal-green transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          cd ~
        </Link>

        <header className="mt-10">
          <p className="text-xs text-muted-foreground">
            <span className="text-terminal-green">$</span> ls ~/blog
          </p>
          <h1 className="mt-3 text-2xl font-bold text-terminal-green-bright tracking-tight">
            Writing
          </h1>
          <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
            Things I broke, and what it took to find out why.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-12 border border-terminal-border bg-terminal-surface p-6 text-sm text-muted-foreground">
            No posts yet.
          </p>
        ) : (
          <ul className="mt-12 space-y-4">
            {posts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block border border-terminal-border bg-terminal-surface p-6 transition-colors hover:border-terminal-green-dim hover:bg-terminal-surface-2 group"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>

                  <h2 className="mt-2 text-base font-bold text-foreground group-hover:text-terminal-green-bright transition-colors">
                    {post.title}
                  </h2>

                  <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">
                    {post.description}
                  </p>

                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="border border-terminal-border px-1.5 py-0.5 text-[10px] text-terminal-green-dim"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
