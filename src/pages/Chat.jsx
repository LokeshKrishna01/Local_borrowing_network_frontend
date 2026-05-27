import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, User, Users as UsersIcon, ChevronLeft, MessageSquare } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Socket should connect to base URL, not /api
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChat && socket) {
      socket.emit('join_room', activeChat._id);
      fetchMessages(activeChat._id);

      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => socket.off('receive_message');
    }
  }, [activeChat, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/chat/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await API.get(`/chat/messages/${id}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const joinNeighborhoodChat = async () => {
    try {
      const res = await API.post('/chat/neighborhood');
      await fetchConversations();
      setActiveChat(res.data);
      setIsMobileListVisible(false);
    } catch (error) {
      console.error('Failed to join neighborhood chat:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    const messageData = {
      conversationId: activeChat._id,
      senderId: user._id,
      text: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const getRecipientName = (chat) => {
    if (chat.isGroup) return chat.groupName;
    const recipient = chat.participants.find(p => p._id !== user._id);
    return recipient?.name || 'Unknown User';
  };

  return (
    <div className="page chat-page-container">
      <div className="container chat-layout glass-card">
        {/* Sidebar */}
        <div className={`chat-sidebar ${!isMobileListVisible ? 'mobile-hidden' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Messages</h3>
            <button 
              className="btn btn-sm btn-outline" 
              style={{ width: '100%', marginTop: 'var(--space-sm)' }}
              onClick={joinNeighborhoodChat}
            >
              <UsersIcon size={14} style={{ marginRight: '0.4rem' }} /> Join Neighborhood Hub
            </button>
          </div>
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No messages yet
              </div>
            ) : (
              conversations.map((chat) => (
                <div 
                  key={chat._id} 
                  className={`conversation-item ${activeChat?._id === chat._id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChat(chat);
                    setIsMobileListVisible(false);
                  }}
                >
                  <div className="avatar">
                    {chat.isGroup ? <UsersIcon size={20} /> : <User size={20} />}
                  </div>
                  <div className="info">
                    <div className="name">{getRecipientName(chat)}</div>
                    <div className="last-msg">
                      {chat.lastMessage?.text || 'Start a conversation'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`chat-main ${isMobileListVisible ? 'mobile-hidden' : ''}`}>
          {activeChat ? (
            <>
              <div className="chat-header">
                <button 
                  className="mobile-only back-btn" 
                  onClick={() => setIsMobileListVisible(true)}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="avatar">
                  {activeChat.isGroup ? <UsersIcon size={20} /> : <User size={20} />}
                </div>
                <h3>{getRecipientName(activeChat)}</h3>
              </div>

              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message-bubble ${msg.sender === user._id || msg.sender?._id === user._id ? 'own' : ''}`}
                  >
                    {activeChat.isGroup && (msg.sender !== user._id && msg.sender?._id !== user._id) && (
                      <div className="sender-name">{msg.sender?.name || 'Neighbor'}</div>
                    )}
                    <div className="text">{msg.text}</div>
                    <div className="time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-icon">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="icon"><MessageSquare size={48} /></div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting with your neighbors.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
