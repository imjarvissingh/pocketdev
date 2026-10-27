export type Role = 'Team Lead' | 'Coder' | 'Reviewer' | 'Builder';
export type TaskStatus = 'MOCK_COMPLETED';
export type Project = { id: string; name: string; summary: string; createdAt: string };
export type Worker = { id: string; projectId: string; name: string; role: Role };
export type Task = {
  id: string; projectId: string; workerId: string; request: string;
  status: TaskStatus; steps: string[]; createdAt: string;
};
export type Workspace = { projects: Project[]; workers: Worker[]; tasks: Task[] };
export const roles: Role[] = ['Team Lead', 'Coder', 'Reviewer', 'Builder'];
const key = 'pocketdev:sprint0:v1';
export const emptyWorkspace = (): Workspace => ({ projects: [], workers: [], tasks: [] });
export function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyWorkspace();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyWorkspace();
    const data = parsed as Record<string, unknown>;
    if (![data.projects, data.workers, data.tasks].every(Array.isArray)) return emptyWorkspace();
    return {
      projects: (data.projects as Project[]).filter(p => typeof p.id === 'string' && typeof p.name === 'string'),
      workers: (data.workers as Worker[]).filter(w => typeof w.id === 'string' && roles.includes(w.role)),
      tasks: (data.tasks as Task[]).filter(t => typeof t.id === 'string' && t.status === 'MOCK_COMPLETED'),
    };
  } catch {
    return emptyWorkspace();
  }
}
export function saveWorkspace(workspace: Workspace) {
  localStorage.setItem(key, JSON.stringify(workspace));
}
export function newId() { return crypto.randomUUID(); }
export function makeMockTask(projectId: string, worker: Worker, request: string): Task {
  const text = request.trim();
  if (!text || text.length > 600) throw new Error('Enter a task between 1 and 600 characters.');
  const steps = [
    `Received a demonstration task for ${worker.name} (${worker.role}).`,
    'No AI model was contacted. No repository files were read.',
    'No code was generated, tested, committed, built, or deployed.',
    'This simulated timeline demonstrates the planned task interface only.',
  ];
  return { id: newId(), projectId, workerId: worker.id, request: text, status: 'MOCK_COMPLETED', steps, createdAt: new Date().toISOString() };
}
