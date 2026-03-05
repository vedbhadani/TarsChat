import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

export default function ChatPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar — full width on mobile, fixed width on desktop */}
            <div className="w-full md:w-auto">
                <ChatSidebar />
            </div>

            {/* Main chat area — hidden on mobile when no conversation is selected */}
            <main className="hidden md:flex flex-1 flex-col">
                <ChatWindow />
            </main>
        </div>
    );
}
