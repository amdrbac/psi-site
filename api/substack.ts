// Serverless function (Vercel) que busca Posts (RSS) e Notes (API pública)
// do Substack no servidor e devolve os 3 itens mais recentes, já
// normalizados e ordenados por data. Isso evita fazer fetch direto no
// browser (bloqueado por CORS).
//
// Por que duas fontes: o RSS do Substack (https://.../feed) só lista POSTS
// publicados (newsletter) — Notes (os textos curtos do perfil, estilo
// "tweet") não aparecem nele. Notes vêm de um endpoint JSON separado
// (https://.../api/v1/notes), que é público e não documentado oficialmente.
// Buscamos as duas e misturamos pelo pubDate.
//
// Não inventamos conteúdo: se as duas fontes falharem (ou não houver
// nenhum item), devolvemos posts: [] e o front-end mostra o fallback
// "Em breve".
import { XMLParser } from 'fast-xml-parser';

const FEED_URL = 'https://psivictoriapaes.substack.com/feed';
const NOTES_URL = 'https://psivictoriapaes.substack.com/api/v1/notes';
const PUBLICATION_HANDLE = 'psivictoriapaes';
const MAX_ITEMS = 3;
const RAW_LIMIT = 10; // tetos defensivos por fonte antes de mesclar/ordenar
const CACHE_SECONDS = 60 * 10; // 10 min
const USER_AGENT = 'Mozilla/5.0 (compatible; PsiSiteBot/1.0; +https://psi-site-iota.vercel.app)';
const NO_BODY_FALLBACK = 'Nova publicação no Substack';

type MinimalRequest = { method?: string };
type MinimalResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

interface NormalizedItem {
  title: string;
  excerpt: string;
  link: string;
  pubDate: string;
  type: 'post' | 'note';
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

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function timeOf(pubDate: string): number {
  const t = new Date(pubDate).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

// ---------------------------------------------------------------------
// Posts (RSS)
// ---------------------------------------------------------------------

async function fetchPosts(): Promise<NormalizedItem[]> {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Feed respondeu com status ${response.status}`);
    }

    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata' });
    const data = parser.parse(xml) as { rss?: { channel?: { item?: unknown } } };

    const rawItems = data?.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    return items.slice(0, RAW_LIMIT).map((item): NormalizedItem => {
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
        excerpt: truncate(excerptSource, 160),
        link: textOf(record.link),
        pubDate: textOf(record.pubDate),
        type: 'post',
      };
    });
  } catch {
    // Feed indisponível/vazio: a outra fonte (Notes) pode cobrir.
    return [];
  }
}

// ---------------------------------------------------------------------
// Notes (endpoint JSON público)
// ---------------------------------------------------------------------

// O corpo de uma note pode vir como texto puro ou como uma string JSON de
// um documento tipo ProseMirror ({ type: 'doc', content: [...] }). Essa
// função tenta extrair o texto legível nos dois casos.
function extractTextFromDoc(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromDoc).join(' ');
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (typeof obj.text === 'string') return obj.text;
    if (Array.isArray(obj.content)) return extractTextFromDoc(obj.content);
  }
  return '';
}

function extractNoteText(rawBody: unknown): string {
  if (rawBody == null) return '';
  if (typeof rawBody === 'string') {
    const trimmed = rawBody.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return extractTextFromDoc(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof rawBody === 'object') return extractTextFromDoc(rawBody);
  return '';
}

interface RawNoteItem {
  context?: { type?: string };
  comment?: {
    body?: unknown;
    date?: unknown;
    attachments?: unknown[];
  };
  entity_key?: string;
}

function normalizeNote(raw: RawNoteItem): NormalizedItem | null {
  const entityKey = typeof raw.entity_key === 'string' ? raw.entity_key : '';
  if (!entityKey) return null;

  const text = stripHtml(extractNoteText(raw.comment?.body));
  const hasAttachment = Array.isArray(raw.comment?.attachments) && raw.comment.attachments.length > 0;

  if (!text && !hasAttachment) return null;

  const title = text ? truncate(text, 80) : NO_BODY_FALLBACK;
  const excerpt = text ? truncate(text, 160) : NO_BODY_FALLBACK;
  const pubDate = typeof raw.comment?.date === 'string' ? raw.comment.date : '';

  return {
    title,
    excerpt,
    link: `https://substack.com/@${PUBLICATION_HANDLE}/note/${entityKey}`,
    pubDate,
    type: 'note',
  };
}

async function fetchNotes(): Promise<NormalizedItem[]> {
  try {
    const response = await fetch(NOTES_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Notes API respondeu com status ${response.status}`);
    }

    const data = (await response.json()) as { items?: RawNoteItem[] };
    const items = Array.isArray(data.items) ? data.items : [];

    return items
      .filter(item => item?.context?.type === 'note')
      .slice(0, RAW_LIMIT)
      .map(normalizeNote)
      .filter((item): item is NormalizedItem => item !== null);
  } catch {
    // Notes indisponível: a outra fonte (RSS) pode cobrir.
    return [];
  }
}

// ---------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------

export default async function handler(_req: MinimalRequest, res: MinimalResponse) {
  try {
    const [notes, posts] = await Promise.all([fetchNotes(), fetchPosts()]);

    const merged = [...notes, ...posts].sort((a, b) => timeOf(b.pubDate) - timeOf(a.pubDate));
    const result = merged.slice(0, MAX_ITEMS);

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 3}`
    );
    res.status(200).json({ posts: result });
  } catch (error) {
    // Falha inesperada: não inventamos conteúdo, devolvemos lista vazia
    // com cache curto para tentar de novo em breve.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json({
      posts: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar o Substack',
    });
  }
}
