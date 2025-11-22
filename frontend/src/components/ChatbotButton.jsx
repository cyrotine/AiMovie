import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

function ChatbotButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/chat') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#22c1c3] to-[#fdbb2d] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group z-40"
      aria-label="Open chatbot"
    >
      <MessageCircle className="w-6 h-6 text-[#0b0f14] group-hover:rotate-12 transition-transform" />
    </button>
  );
}

export default ChatbotButton;
