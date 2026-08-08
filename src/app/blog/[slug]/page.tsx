import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts, getPost } from '@/lib/posts';
import { formatPostDate } from '@/lib/format-date';
import { PostBody } from '@/components/ui/post-body';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
      url: `/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background dot-grid">
      <article className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-terminal-green transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          cd ~/blog
        </Link>

        <header className="mt-10 border-b border-terminal-border pb-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-[1.75rem] leading-tight font-bold text-terminal-green-bright tracking-tight">
            {post.title}
          </h1>

          <p className="mt-4 max-w-[65ch] text-sm text-muted-foreground leading-relaxed">
            {post.description}
          </p>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
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
        </header>

        <div className="mt-8">
          <PostBody content={post.content} />
        </div>

        <footer className="mt-16 border-t border-terminal-border pt-6">
          <p className="text-xs text-muted-foreground">
            <span className="text-terminal-green">$</span> written by{' '}
            <Link href="/" className="text-terminal-green hover:text-terminal-green-bright underline underline-offset-2">
              Herman Liang
            </Link>
          </p>
        </footer>
      </article>
    </div>
  );
}
