import type { Activity, Analytics, Article, Automation, Customer, Dashboard, Page, SearchResult, Task, Ticket, TicketPage, User } from './types';

export class ApiError extends Error {
  constructor(message: string, public errors: Record<string, string[]> = {}, public status = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

let csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf, ...options.headers },
    });
  } catch {
    throw new ApiError('Der Server ist nicht erreichbar. Bitte prüfe deine Verbindung.', {}, 0);
  }
  const result = (await response.json().catch(() => null)) as { message?: string; errors?: Record<string, string[]> } | null;
  if (!response.ok) {
    throw new ApiError(result?.message ?? `Anfrage fehlgeschlagen (${response.status})`, result?.errors ?? {}, response.status);
  }
  return result as T;
}

const query = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== '' && value !== 'all');
  return new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString();
};

const one = async <T>(path: string, options?: RequestInit): Promise<T> => (await request<{ data: T }>(path, options)).data;
const rows = async <T>(path: string): Promise<T[]> => (await request<{ data: T[] }>(path)).data;
const write = (method: string, body?: unknown): RequestInit => ({ method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });

export const api = {
  session: async () => { const data = await request<{ user: User | null; csrf_token: string }>('/auth/session'); csrf = data.csrf_token; return data.user; },
  login: async (email: string, password: string) => { const data = await request<{ user: User; csrf_token: string }>('/auth/login', write('POST', { email, password })); csrf = data.csrf_token; return data.user; },
  logout: async () => { const data = await request<{ csrf_token: string }>('/auth/logout', write('POST')); csrf = data.csrf_token; },
  profile: async (name: string) => (await request<{ user: User }>('/auth/profile', write('PATCH', { name }))).user,
  dashboard: () => one<Dashboard>('/dashboard'),
  analytics: () => one<Analytics>('/analytics'),
  team: () => rows<User>('/team'),
  activity: (page = 1, entity = '') => request<Page<Activity>>(`/activity?${query({ page, entity })}`),
  search: (q: string) => one<SearchResult>(`/search?${query({ q })}`),
  tickets: (params: Record<string, string | number>) => request<TicketPage>(`/tickets?${query(params)}`),
  ticket: (id: number) => one<Ticket>(`/tickets/${id}`),
  createTicket: (data: object) => one<Ticket>('/tickets', write('POST', data)),
  updateTicket: (id: number, data: object) => one<Ticket>(`/tickets/${id}`, write('PATCH', data)),
  addNote: (id: number, body: string) => one<{ id: number; body: string }>(`/tickets/${id}/notes`, write('POST', { body })),
  customers: () => rows<Customer>('/customers'),
  createCustomer: (data: object) => one<Customer>('/customers', write('POST', data)),
  updateCustomer: (id: number, data: object) => one<Customer>(`/customers/${id}`, write('PATCH', data)),
  tasks: () => rows<Task>('/tasks'),
  createTask: (data: object) => one<Task>('/tasks', write('POST', data)),
  updateTask: (id: number, data: object) => one<Task>(`/tasks/${id}`, write('PATCH', data)),
  deleteTask: (id: number) => request<{ ok: boolean }>(`/tasks/${id}`, write('DELETE')),
  articles: () => rows<Article>('/articles'),
  createArticle: (data: object) => one<Article>('/articles', write('POST', data)),
  updateArticle: (id: number, data: object) => one<Article>(`/articles/${id}`, write('PATCH', data)),
  deleteArticle: (id: number) => request<{ ok: boolean }>(`/articles/${id}`, write('DELETE')),
  automations: () => rows<Automation>('/automations'),
  createAutomation: (data: object) => one<Automation>('/automations', write('POST', data)),
  updateAutomation: (id: number, data: object) => one<Automation>(`/automations/${id}`, write('PATCH', data)),
  deleteAutomation: (id: number) => request<{ ok: boolean }>(`/automations/${id}`, write('DELETE')),
  exportUrl: '/api/export/tickets',
};
