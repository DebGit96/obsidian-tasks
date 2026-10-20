import type { ReadOnlyTask } from '../Task/ReadOnlyTask';

export type TaskRenderHook = (li: HTMLLIElement, task: ReadOnlyTask) => void;

/**
 * Registry for callbacks invoked after a task list item is rendered in HTML query results.
 */
export class TaskRenderHooks {
    private static instance: TaskRenderHooks;
    private readonly hooks: Set<TaskRenderHook> = new Set();
    private currentWorkspace: any = null;
    private workspaceEventRef: any = null;

    private readonly workspaceHandler = (li: HTMLLIElement, task: ReadOnlyTask) => this.invoke(li, task);

    public static getInstance(): TaskRenderHooks {
        if (!TaskRenderHooks.instance) {
            TaskRenderHooks.instance = new TaskRenderHooks();
        }
        return TaskRenderHooks.instance;
    }

    /**
     * Subscribe this registry to task render events on Obsidian's workspace event bus.
     *
     * @param workspace Obsidian workspace instance.
     */
    public listenToWorkspace(workspace: any): void {
        if (!workspace || typeof workspace.on !== 'function') {
            return;
        }
        if (this.currentWorkspace === workspace && this.workspaceEventRef) {
            return;
        }
        if (this.currentWorkspace && this.workspaceEventRef) {
            if (typeof this.currentWorkspace.offref === 'function') {
                this.currentWorkspace.offref(this.workspaceEventRef);
            } else if (typeof this.currentWorkspace.off === 'function') {
                this.currentWorkspace.off('tasks:task-rendered', this.workspaceHandler);
            }
        }
        this.currentWorkspace = workspace;
        this.workspaceEventRef = workspace.on('tasks:task-rendered', this.workspaceHandler);
    }

    /**
     * Register a callback to be called when any task item is rendered.
     *
     * @param callback Function to invoke with the rendered LI element and Task.
     * @returns A cleanup function to unregister the hook.
     */
    public register(callback: TaskRenderHook): () => void {
        this.hooks.add(callback);
        return () => {
            this.hooks.delete(callback);
        };
    }

    /**
     * Invoke all registered hooks for a rendered task.
     *
     * @param li The rendered HTML list item.
     * @param task The read-only task snapshot.
     */
    public invoke(li: HTMLLIElement, task: ReadOnlyTask): void {
        for (const hook of this.hooks) {
            try {
                hook(li, task);
            } catch (error) {
                console.error('Error invoking task render hook:', error);
            }
        }
    }

    /**
     * Reset all registered hooks and unregister workspace listener.
     */
    public reset(workspace?: any): void {
        this.hooks.clear();
        const ws = workspace || this.currentWorkspace;
        if (ws && this.workspaceEventRef) {
            if (typeof ws.offref === 'function') {
                ws.offref(this.workspaceEventRef);
            } else if (typeof ws.off === 'function') {
                ws.off('tasks:task-rendered', this.workspaceHandler);
            }
        }
        this.currentWorkspace = null;
        this.workspaceEventRef = null;
    }
}
