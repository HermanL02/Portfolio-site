import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PostMeta } from '@/types';
import { formatPostDate } from '@/lib/format-date';

interface BlogSectionProps {
  posts: PostMeta[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-terminal-green mb-1">Writing</h2>
        <p className="text-xs text-muted-foreground">
          {posts.length === 0
            ? 'No entries yet'
            : `${posts.length} ${posts.length === 1 ? 'entry' : 'entries'} found`}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="border border-terminal-border bg-terminal-surface-2 p-8 text-center">
          <p className="text-sm text-foreground">Nothing published yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block border border-terminal-border bg-terminal-surface-2 p-5 transition-colors hover:border-terminal-green-dim group terminal-line"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-terminal-green-bright transition-colors">
                  {post.title}
                </h3>

                <p className="mt-1.5 text-xs text-muted-foreground">{post.description}</p>

                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
            ))}
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs text-terminal-green hover:text-terminal-green-bright transition-colors"
          >
            ./read-all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      )}
    </div>
  );
}
