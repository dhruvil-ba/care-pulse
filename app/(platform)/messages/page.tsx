import { MessageForm } from "@/components/message-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listMessages } from "@/lib/in-memory-store";

export default function MessagesPage() {
  const messageList = listMessages();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Care Team Messaging</CardTitle>
          <CardDescription>Secure provider-patient communication for care coordination.</CardDescription>
        </CardHeader>
        <CardContent>
          <MessageForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-2xl border border-white/10">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-white/5 text-left text-slate-300">
                <tr>
                  <th className="px-4 py-3">Sent At</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Read</th>
                </tr>
              </thead>
              <tbody>
                {messageList.map((message) => (
                  <tr key={message.id} className="border-t border-white/10 text-slate-200/90">
                    <td className="px-4 py-3">{new Date(message.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{message.sender_id}</td>
                    <td className="px-4 py-3">{message.receiver_id}</td>
                    <td className="px-4 py-3">{message.message_content}</td>
                    <td className="px-4 py-3">{message.is_read ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
