import { describe, expect, it, vi } from 'vitest';
import { emptyWorkspace, makeMockTask, roles, type Worker } from './model';

vi.stubGlobal('crypto', { randomUUID: () => 'fake-task-id' });
const worker: Worker = { id: 'worker-1', projectId: 'project-1', name: 'Builder', role: 'Builder' };

describe('Sprint 0 mock coordinator', () => {
  it('starts with empty projects, workers, tasks', () => {
    expect(emptyWorkspace()).toEqual({ projects: [], workers: [], tasks: [] });
  });
  it('produces a clearly marked mock task with no fake verification claims', () => {
    const task = makeMockTask('project-1', worker, 'Build a landing page');
    expect(task.status).toBe('MOCK_COMPLETED');
    expect(task.steps.join(' ')).toContain('No AI model');
    expect(task.steps.join(' ')).toContain('No code was generated, tested, committed, built, or deployed.');
  });
  it('rejects empty and excessively long tasks', () => {
    expect(() => makeMockTask('project-1', worker, ' ')).toThrow();
    expect(() => makeMockTask('project-1', worker, 'x'.repeat(601))).toThrow();
  });
  it('supports the four approved worker templates', () => {
    expect(roles).toEqual(['Team Lead', 'Coder', 'Reviewer', 'Builder']);
  });
});
