import { MessagingWorkspace } from "@/components/provider/messaging-workspace";
import { getProviderMessagingSeed } from "@/lib/messaging-data";

export default function MessagesPage() {
  const messagingSeed = getProviderMessagingSeed();

  return (
    <MessagingWorkspace
      providerId={messagingSeed.providerId}
      contacts={messagingSeed.contacts}
      initialMessages={messagingSeed.messages}
    />
  );
}
