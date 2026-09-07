// Serverless function (Vercel) que busca o RSS do Substack no servidor
// e devolve os posts mais recentes já normalizados em JSON.
// Isso evita fazer fetch do RSS direto no browser (bloqueado por CORS).
//
// IMPORTANTE: o RSS do Substack só lista POSTS publicados (newsletter).
// Notes (o formato tipo "tweet" do Substack) NÃO aparecem nesse feed —
// é uma limitação da própria plataforma, não um bug daqui. Se o feed
// vier vazio, não inventamos conteúdo: devolvemos posts: [] e o
// front-end mostra o estado de fallback ("Em breve").
import { XMLParser } from 'fast-xml-parser';

const FEED_URL = 'https://psivictoriapaes.substack.com/feed';
const MAX_POSTS = 3;
const CACHE_SECONDS = 60 * 20; // 20 min

type MinimalRequest = { method?: string };
type MinimalResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
}

function textOf(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '#text' in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)['#text'] ?? '');
  }
  return String(value);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(_req: MinimalRequest, res: MinimalResponse) {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PsiSiteBot/1.0; +https://psi-site-iota.vercel.app)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Feed respondeu com status ${response.status}`);
    }

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata' });
    const data = parser.parse(xml) as {
      rss?: { channel?: { item?: unknown } };
    };

    const rawItems = data?.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    const posts: SubstackPost[] = items.slice(0, MAX_POSTS).map(item => {
      const record = item as Record<string, unknown>;
      const rawTitle = record.title as { __cdata?: string } | string | undefined;
      const rawDescription = record.description as { __cdata?: string } | string | undefined;

      const title = stripHtml(
        typeof rawTitle === 'object' ? rawTitle.__cdata ?? '' : textOf(rawTitle)
      );
      const excerptSource = stripHtml(
        typeof rawDescription === 'object' ? rawDescription.__cdata ?? '' : textOf(rawDescription)
      );

      return {
        title,
        link: textOf(record.link),
        pubDate: textOf(record.pubDate),
        excerpt: excerptSource.length > 160 ? `${excerptSource.slice(0, 160).trim()}…` : excerptSource,
      };
    });

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 3}`
    );
    res.status(200).json({ posts });
  } catch (error) {
    // Falha ao buscar/parsear o feed: não inventamos posts, devolvemos
    // lista vazia com cache curto para tentar de novo em breve.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json({
      posts: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar o feed',
    });
  }
}
