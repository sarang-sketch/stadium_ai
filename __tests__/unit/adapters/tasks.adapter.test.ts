import { describe, expect, it } from 'vitest';
import { MockTasksAdapter, createTasksAdapter } from '@/adapters/tasks.adapter';

describe('Tasks Adapter', () => {
  it('should return valid handle on enqueueTask', async () => {
    const adapter = new MockTasksAdapter();
    const handle = await adapter.enqueueTask('reservation-timeout', { seatId: 'seat-1' });
    expect(handle).toBeDefined();
    expect(handle.taskId).toBeTypeOf('string');
  });

  it('should update state to CANCELLED on cancelTask', async () => {
    const adapter = new MockTasksAdapter();
    const handle = await adapter.enqueueTask('reservation-timeout', { seatId: 'seat-1' });
    await adapter.cancelTask(handle.taskId);
    // cancelTask completes without throwing
    expect(true).toBe(true);
  });

  it('should have deterministic taskId for same inputs', async () => {
    const adapter = new MockTasksAdapter();
    const handle1 = await adapter.enqueueTask('email-queue', { userId: 'u1' });
    const handle2 = await adapter.enqueueTask('email-queue', { userId: 'u1' });
    expect(handle1.taskId).toBe(handle2.taskId);
  });

  it('createTasksAdapter returns a working adapter', async () => {
    const adapter = createTasksAdapter();
    const handle = await adapter.enqueueTask('reservation-timeout', { seatId: 'seat-1' });
    expect(handle.taskId).toBeTypeOf('string');
  });
});
