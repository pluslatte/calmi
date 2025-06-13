import { notifications } from "@mantine/notifications";

export const notifySuccess = (msg: string): void => {
    notifications.show({
        title: '成功',
        message: msg,
        color: 'green',
    });
}

export const notifyFailure = (error?: unknown): void => {
    notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : '不明なエラー',
        color: 'red',
    });
}