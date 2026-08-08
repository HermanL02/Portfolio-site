import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { Post, PostMeta } from '@/types';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

/**
 * Splits `---\n<yaml>\n---\n<body>` into its two halves.
 *
 * Frontmatter is parsed with js-yaml, which the project already depends on for
 * the config/*.yaml files, rather than pulling in gray-matter for one format.
 */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) {
    return { data: {}, body: raw };
  }
  const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>;
  return { data, body: match[2] };
}

/** Average adult reading speed for technical prose, rounded to whole minutes. */
function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function toMeta(slug: string, data: Record<string, unknown>, body: string): PostMeta {
  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    description: typeof data.description === 'string' ? data.description : '',
    date: typeof data.date === 'string' ? data.date : '',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutes(body),
  };
}

function readMeta(slug: string): PostMeta | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  return toMeta(slug, data, body);
}

function readPostFile(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  return { ...toMeta(slug, data, body), content: body };
}

/** Every post, newest first. Returns an empty list when no posts exist yet. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter(name => name.endsWith('.md'))
    .map(name => readMeta(name.replace(/\.md$/, '')))
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** A single post including its markdown body, or null when the slug is unknown. */
export function getPost(slug: string): Post | null {
  // Guard against traversal via the [slug] route segment.
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  return readPostFile(slug);
}
