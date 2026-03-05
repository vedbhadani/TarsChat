import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
    const { id } = await params;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar — hidden on mobile when a conversation is open */}
            <div className="hidden md:block">
                <ChatSidebar />
            </div>

            {/* Main chat area — full width on mobile */}
            <main className="flex flex-1 flex-col">
                <ChatWindow conversationId={id} />
            </main>
        </div>
    );
}
