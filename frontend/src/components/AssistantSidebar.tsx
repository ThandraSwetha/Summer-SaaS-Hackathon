import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';

const AssistantSidebar: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder for future effect (e.g., debounce) – currently no side‑effects needed
  useEffect(() => {}, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = `You: ${input}`;
    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await apiClient.post('/recruiter/assistant/chat', { message: input });
      const { reply, pending_action } = res.data;
      setMessages((prev) => [...prev, `Assistant: ${reply}`]);
      setPendingAction(pending_action || null);
    } catch (err) {
      setMessages((prev) => [...prev, 'Assistant: Error contacting server']);
    } finally {
      setLoading(false);
    }
    setInput('');
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    try {
      const res = await apiClient.post('/recruiter/assistant/confirm', pendingAction);
      const { success, message } = res.data;
      setMessages((prev) => [...prev, `Assistant: ${message}`]);
      if (success) setPendingAction(null);
    } catch (err) {
      setMessages((prev) => [...prev, 'Assistant: Confirmation failed']);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[70vh] flex flex-col glass backdrop-blur-lg shadow-xl rounded-xl border border-border overflow-hidden z-50 pointer-events-auto">
      <div className="flex-1 p-4 overflow-y-auto pointer-events-none">
        {messages.length === 0 ? (
          <p className="text-muted-foreground italic">Hi! Tell me what you’d like to do – e.g., “Shortlist Swetha for Full Stack Developer” or “Generate an offer for Rahul, $80k, joining Aug 1”.</p>
        ) : (
          messages.map((msg, i) => (
            <p key={i} className="my-1 text-sm break-words text-foreground">{msg}</p>
          ))
        )}
        {pendingAction && (
          <button
            className="mt-2 w-full btn-primary py-1 rounded hover:opacity-90 transition"
            onClick={handleConfirm}
          >
            Confirm & Send Email
          </button>
        )}
      </div>
      <div className="border-t border-border p-2 flex">
        <input
          type="text"
          className="flex-1 input-glass rounded-l-lg px-2 py-1 focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => { console.log('Input change:', e.target.value); setInput(e.target.value); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="bg-primary text-white px-3 rounded-r-lg hover:bg-primary/80 transition disabled:opacity-50"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 inline-block" /> : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AssistantSidebar;
