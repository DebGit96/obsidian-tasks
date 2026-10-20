import type { ReadOnlyTask } from '../Task/ReadOnlyTask';
import type TasksPlugin from '../main';
import { toggleLine } from '../Commands/ToggleDone';
import { createTaskLineModal } from './createTaskLineModal';
import { editTaskLineModal } from './editTaskLineModal';
import { TaskRenderHooks } from './TaskRenderHooks';
import type { TasksApiV1 } from './TasksApiV1';

/**
 * Factory method for API v1
 *
 * @param plugin - Tasks Plugin instance
 */
export const tasksApiV1 = (plugin: TasksPlugin): TasksApiV1 => {
    const app = plugin.app;
    const onSaveSettings = async () => await plugin.saveSettings();

    if (app?.workspace) {
        TaskRenderHooks.getInstance().listenToWorkspace(app.workspace);
    }

    return {
        createTaskLineModal: (): Promise<string> => {
            return createTaskLineModal(app, plugin.getTasks(), onSaveSettings);
        },
        editTaskLineModal: (taskLine: string): Promise<string> => {
            return editTaskLineModal(app, taskLine, plugin.getTasks(), onSaveSettings);
        },
        executeToggleTaskDoneCommand: (line: string, path: string) => toggleLine(line, path).text,
        registerRenderHook: (callback: (li: HTMLLIElement, task: ReadOnlyTask) => void): (() => void) => {
            if (app?.workspace) {
                TaskRenderHooks.getInstance().listenToWorkspace(app.workspace);
            }
            return TaskRenderHooks.getInstance().register(callback);
        },
    };
};

export { TaskRenderHooks } from './TaskRenderHooks';
