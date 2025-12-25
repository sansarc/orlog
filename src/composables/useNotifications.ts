import {reactive} from "vue";

export type notificationType = 'info' | 'success' | 'error';

export type NotificationType = 'info' | 'success' | 'error';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

// global state
const state = reactive({
    notifications: [] as Notification[],
});

let nextId = 0;

export function useNotifications() {

    function add(title: string, message: string, type: NotificationType = 'info', duration: number = 5000) {
        const id = nextId++;
        const notification: Notification = { id, title, message, type, duration };

        state.notifications.push(notification);

        if (duration > 0)
            setTimeout(() => remove(id), duration);
    }

    function remove(id: number) {
        const index = state.notifications.findIndex(n => n.id === id);
        if (index !== -1)
            state.notifications.splice(index, 1);
    }

    function notifyInfo(msg: string) { add('UPDATE', msg, 'info'); }
    function notifySuccess(msg: string) { add('SKÁL!', msg, 'success'); }
    function notifyError(msg: string) { add('ERROR', msg, 'error'); }

    return {
        notifications: state.notifications,
        add,
        remove,
        notifyInfo,
        notifySuccess,
        notifyError
    };
}

export const NotificationService = useNotifications();