import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'user', parts: [{ text: "Hi" }] },
        { role: 'model', parts: [{ text: "Hi! Is problem ke baare mein kuch bhi poocho - hint, code review ya complexity." }] }
    ]);
    const [sending, setSending] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const onSubmit = async (data) => {
        // Naya sawaal history mein jodo, phir wahi poori history API ko bhejo
        const history = [...messages, { role: 'user', parts: [{ text: data.message }] }];
        setMessages(history);
        reset();
        setSending(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: history,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                startCode: problem?.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message || "No response from AI" }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: error.response?.data?.message || "Error from AI Chatbot" }]
            }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-bubble bg-base-200 text-base-content whitespace-pre-wrap">
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200 text-base-content">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sticky bottom-0 p-4 bg-base-100 border-t"
            >
                <div className="flex items-center">
                    <input
                        placeholder="Ask me anything"
                        className="input input-bordered flex-1"
                        disabled={sending}
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button
                        type="submit"
                        className="btn btn-ghost ml-2"
                        disabled={!!errors.message || sending}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;
