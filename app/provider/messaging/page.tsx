import { MessageForm } from "@/components/message-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProviderMessagingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Messaging</CardTitle>
        <CardDescription>HIPAA-compliant chat with your care team and patients.</CardDescription>
      </CardHeader>
      <CardContent>
        <MessageForm />
      </CardContent>
    </Card>
  );
}
