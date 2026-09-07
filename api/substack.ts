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

const PUBLICATION_URL = 'https://psivictoriapaes.substack.com';
const FEED_URL = `${PUBLICATION_URL}/feed`;
const NOTES_URL = `${PUBLICATION_URL}/api/v1/notes`;
const PUBLICATION_HANDLE = 'psivictoriapaes';
const MAX_ITEMS = 3;
const RAW_LIMIT = 10; // tetos defensivos por fonte antes de mesclar/ordenar
const CACHE_SECONDS = 60 * 10; // 10 min
const USER_AGENT = 'Mozilla/5.0 (compatible; PsiSiteBot/1.0; +https://psi-site-iota.vercel.app)';
const NO_BODY_FALLBACK = 'Nova publicação no Substack';
// Proxy de imagem do próprio Substack: redimensiona/otimiza e, importante,
// converte formatos que o browser não renderiza (ex.: .heic) para algo
// exibível (f_auto). Usamos para toda imagem, mesmo já sendo jpeg/png/webp.
const SUBSTACK_CDN_PREFIX =
  'https://substackcdn.com/image/fetch/w_800,c_limit,f_auto,q_auto:good,fl_progressive:steep/';

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
  imageUrl?: string | null;
}

// Hosts confiáveis para URLs que chegam de fora (RSS/Notes) antes de irem
// para o HTML — evita que um feed comprometido injete um href/imagem para
// fora do Substack.
const ALLOWED_LINK_HOSTS = (host: string): boolean =>
  host === 'substack.com' || host.endsWith('.substack.com');

const ALLOWED_IMAGE_HOSTS = (host: string): boolean =>
  host === 'substackcdn.com' ||
  host === 'substack-post-media.s3.amazonaws.com' ||
  host === 'substack.com' ||
  host.endsWith('.substack.com');

function isAllowedUrl(urlString: string, hostAllowed: (host: string) => boolean): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:' && hostAllowed(url.hostname);
  } catch {
    return false;
  }
}

function sanitizeLink(urlString: string): string {
  return isAllowedUrl(urlString, ALLOWED_LINK_HOSTS) ? urlString : PUBLICATION_URL;
}

// Só gera a URL do proxy de imagem do Substack se a imagem original vier de
// um host permitido; caso contrário, sem imagem (null) em vez de repassar
// uma URL arbitrária para o CDN.
function toSubstackCdnUrl(originalUrl: string): string | null {
  if (!isAllowedUrl(originalUrl, ALLOWED_IMAGE_HOSTS)) return null;
  return `${SUBSTACK_CDN_PREFIX}${encodeURIComponent(originalUrl)}`;
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

// O RSS pode trazer a imagem de capa via <enclosure> ou <media:content>
// (ambos como atributos, sem filho de texto). Se nenhum existir, sem imagem.
function extractPostImageUrl(record: Record<string, unknown>): string | null {
  const enclosure = record.enclosure as { '@_url'?: string; '@_type'?: string } | undefined;
  if (typeof enclosure?.['@_url'] === 'string' && enclosure['@_url']) {
    return toSubstackCdnUrl(enclosure['@_url']);
  }

  const media = record['media:content'] as { '@_url'?: string } | undefined;
  if (typeof media?.['@_url'] === 'string' && media['@_url']) {
    return toSubstackCdnUrl(media['@_url']);
  }

  return null;
}

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
        link: sanitizeLink(textOf(record.link)),
        pubDate: textOf(record.pubDate),
        type: 'post',
        imageUrl: extractPostImageUrl(record),
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

interface RawNoteAttachment {
  type?: string;
  imageUrl?: string;
}

interface RawNoteItem {
  context?: { type?: string };
  comment?: {
    body?: unknown;
    date?: unknown;
    attachments?: RawNoteAttachment[];
  };
  entity_key?: string;
}

// Primeiro attachment do tipo imagem, já convertido para a URL do CDN do
// Substack (necessário inclusive para formatos como .heic, que o browser
// não renderiza direto).
function findNoteImageUrl(attachments: RawNoteAttachment[] | undefined): string | null {
  if (!Array.isArray(attachments)) return null;
  const image = attachments.find(a => a?.type === 'image' && typeof a.imageUrl === 'string' && a.imageUrl);
  return image ? toSubstackCdnUrl(image.imageUrl as string) : null;
}

function normalizeNote(raw: RawNoteItem): NormalizedItem | null {
  const entityKey = typeof raw.entity_key === 'string' ? raw.entity_key : '';
  if (!entityKey) return null;

  const text = stripHtml(extractNoteText(raw.comment?.body));
  const imageUrl = findNoteImageUrl(raw.comment?.attachments);
  const pubDate = typeof raw.comment?.date === 'string' ? raw.comment.date : '';

  // Com texto: usa o texto (com ou sem imagem). Sem texto + com imagem: a
  // imagem já carrega o card, não precisa de frase. Sem texto e sem
  // imagem: aí sim o fallback.
  let title = '';
  let excerpt = '';
  if (text) {
    title = truncate(text, 80);
    excerpt = truncate(text, 160);
  } else if (!imageUrl) {
    title = NO_BODY_FALLBACK;
    excerpt = NO_BODY_FALLBACK;
  }

  return {
    title,
    excerpt,
    link: sanitizeLink(`https://substack.com/@${PUBLICATION_HANDLE}/note/${entityKey}`),
    pubDate,
    type: 'note',
    imageUrl,
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

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  const method = (req.method ?? 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).json({ posts: [] });
    return;
  }

  try {
    const [notes, posts] = await Promise.all([fetchNotes(), fetchPosts()]);

    const merged = [...notes, ...posts].sort((a, b) => timeOf(b.pubDate) - timeOf(a.pubDate));
    const result = merged.slice(0, MAX_ITEMS);

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 3}`
    );
    res.status(200).json({ posts: result });
  } catch {
    // Falha inesperada: não inventamos conteúdo, devolvemos lista vazia
    // com cache curto para tentar de novo em breve. Sem campo de erro no
    // corpo — detalhes internos não vão para a resposta pública.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ posts: [] });
  }
}
