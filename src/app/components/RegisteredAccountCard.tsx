import { MisskeyAccountPublic } from "@/types/accounts";
import { Card, Group, Avatar, Badge, Button, Text } from "@mantine/core";

interface RegisteredAccountCardProps {
    account: MisskeyAccountPublic;
    isActive: boolean;
    onDelete: (accountId: string) => void;
    isDeleting: boolean;
}

const RegisteredAccountCard: React.FC<RegisteredAccountCardProps> = ({
    account,
    isActive,
    onDelete,
    isDeleting,
}) => {
    const handleDeleteClick = () => {
        onDelete(account.id);
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
                <Group gap="md">
                    <Avatar
                        src={account.avatarUrl}
                        size="md"
                        radius="xl"
                        alt={account.avatarUrl || "avatar"}
                    />
                    <div>
                        <Text fw={500}>{account.displayName}</Text>
                        <Text size="sm" c="dimmed">
                            @{account.username}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {account.instanceUrl}
                        </Text>
                    </div>
                </Group>

                <Group gap="sm">
                    {isActive && (
                        <Badge color="green">アクティブ</Badge>
                    )}
                    <Button
                        color="red"
                        size="xs"
                        variant="outline"
                        onClick={handleDeleteClick}
                        loading={isDeleting}
                        disabled={isDeleting}
                    >
                        削除
                    </Button>
                </Group>
            </Group>
        </Card>
    );
};

export default RegisteredAccountCard;
