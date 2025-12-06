import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Paperclip } from 'lucide-react';

const Chat = () => {
  // Przykładowe dane rozmów (lista po lewej)
  const conversations = [
    { id: 1, name: "Mateusz Kowalski", lastMsg: "Super, czekam na więcej szczegółów!", time: "10:30", unread: 2, active: true },
    { id: 2, name: "Anna Nowak", lastMsg: "Kiedy możemy się spotkać?", time: "Wczoraj", unread: 0, active: false },
    { id: 3, name: "Zespół HackMIT", lastMsg: "Piotr: Mam gotowy design!", time: "Wczoraj", unread: 0, active: false },
  ];

  // Przykładowe wiadomości w aktywnej rozmowie
  const [messages, setMessages] = useState([
    { id: 1, text: "Cześć! Widziałem Twoje ogłoszenie o projekcie AI Study Companion.", sender: "me", time: "10:15" },
    { id: 2, text: "Hej! Tak, szukamy jeszcze frontend developera. Masz doświadczenie z React?", sender: "them", time: "10:18" },
    { id: 3, text: "Tak, pracuję z React od 2 lat. Ostatnio robię dużo z TypeScript i Next.js.", sender: "me", time: "10:20" },
    { id: 4, text: "Świetnie! To dokładnie czego szukamy. Mogę Ci opowiedzieć więcej o projekcie.", sender: "them", time: "10:22" },
    { id: 5, text: "Chętnie posłucham! Jaki jest główny cel aplikacji?", sender: "me", time: "10:25" },
    { id: 6, text: "Chcemy stworzyć asystenta nauki z GPT-4, który pomoże studentom w organizacji materiałów. Będzie generował notatki, quizy i plany nauki.", sender: "them", time: "10:30" },
  ]);

  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Dodajemy nową wiadomość
    setMessages([...messages, {
      id: Date.now(),
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput("");
  };

  return (
    // Ustawiamy wysokość na viewport minus navbar (zakładając, że navbar ma 64px/4rem)
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto border-x border-white/5">
      
      {/* LEWY PANEL - LISTA ROZMÓW */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-surface/50 hidden md:flex">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-background border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <div 
              key={chat.id}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-white/5 ${
                chat.active ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`font-medium truncate ${chat.active ? 'text-white' : 'text-gray-300'}`}>
                    {chat.name}
                  </span>
                  <span className="text-xs text-textMuted">{chat.time}</span>
                </div>
                <p className="text-xs text-textMuted truncate">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRAWY PANEL - OKNO CZATU */}
      <div className="flex-1 flex flex-col bg-background">
        
        {/* HEADER CZATU */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-surface/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <h3 className="font-bold text-white">Mateusz Kowalski</h3>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-textMuted">
            <Phone size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Video size={20} className="hover:text-white cursor-pointer transition-colors" />
            <MoreVertical size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* LISTA WIADOMOŚCI */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.sender === 'me' 
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-br-none' 
                  : 'bg-surface border border-white/10 text-gray-200 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT BAR */}
        <div className="p-4 border-t border-white/10 bg-surface/30">
          <form onSubmit={handleSend} className="flex gap-3">
            <button type="button" className="p-3 text-textMuted hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit" 
              className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Chat;