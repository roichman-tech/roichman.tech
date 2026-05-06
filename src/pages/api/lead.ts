import type { APIRoute } from 'astro';

export const prerender = false;

interface LeadPayload {
  name: string;
  email: string;
  company?: string;
  message: string;
}

const MAX_LENGTHS = {
  name: 120,
  email: 200,
  company: 200,
  message: 4000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(error: string) {
  return new Response(JSON.stringify({ error }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

function validate(input: unknown): { ok: true; data: LeadPayload } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Payload inválido.' };
  }
  const obj = input as Record<string, unknown>;

  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  const email = typeof obj.email === 'string' ? obj.email.trim() : '';
  const company = typeof obj.company === 'string' ? obj.company.trim() : '';
  const message = typeof obj.message === 'string' ? obj.message.trim() : '';

  if (!name || name.length > MAX_LENGTHS.name) return { ok: false, error: 'Nome obrigatório.' };
  if (!email || email.length > MAX_LENGTHS.email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Email inválido.' };
  }
  if (company.length > MAX_LENGTHS.company) {
    return { ok: false, error: 'Empresa muito longa.' };
  }
  if (!message || message.length > MAX_LENGTHS.message) {
    return { ok: false, error: 'Mensagem obrigatória.' };
  }

  return { ok: true, data: { name, email, company: company || undefined, message } };
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest('JSON inválido.');
  }

  const result = validate(raw);
  if (!result.ok) return badRequest(result.error);

  // TODO: replace this stub with the real destination (DB, email, CRM, etc.)
  // For now: log to stdout so submissions are visible during development.
  console.log('[lead]', result.data);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
