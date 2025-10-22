import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/axiosInstance';
import './ChatBot.css';

const ChatBot = () => {
    const navigate = useNavigate();
    
    // Parse markdown text to JSX
    const parseMarkdown = (text) => {
        if (!text) return null;
        
        // Split by lines
        const lines = text.split('\n');
        const elements = [];
        let listItems = [];
        let inList = false;
        
        lines.forEach((line, index) => {
            // Headers (##, ###)
            if (line.match(/^###\s/)) {
                if (inList && listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
                    listItems = [];
                    inList = false;
                }
                elements.push(<h3 key={index} className="md-h3">{line.replace(/^###\s/, '')}</h3>);
            } 
            else if (line.match(/^##\s/)) {
                if (inList && listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
                    listItems = [];
                    inList = false;
                }
                elements.push(<h2 key={index} className="md-h2">{line.replace(/^##\s/, '')}</h2>);
            }
            // Bold (**text**)
            else if (line.match(/\*\*.*?\*\*/)) {
                if (inList && listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
                    listItems = [];
                    inList = false;
                }
                const parts = line.split(/(\*\*.*?\*\*)/g);
                elements.push(
                    <p key={index} className="md-p">
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            }
            // List items (* text or - text)
            else if (line.match(/^[\*\-]\s/)) {
                inList = true;
                const content = line.replace(/^[\*\-]\s/, '');
                // Parse bold in list items
                const parts = content.split(/(\*\*.*?\*\*)/g);
                listItems.push(
                    <li key={index}>
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return part;
                        })}
                    </li>
                );
            }
            // Empty line
            else if (line.trim() === '') {
                if (inList && listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
                    listItems = [];
                    inList = false;
                }
            }
            // Regular text
            else if (line.trim() !== '') {
                if (inList && listItems.length > 0) {
                    elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
                    listItems = [];
                    inList = false;
                }
                // Parse bold in regular text
                const parts = line.split(/(\*\*.*?\*\*)/g);
                elements.push(
                    <p key={index} className="md-p">
                        {parts.map((part, i) => {
                            if (part.match(/^\*\*.*\*\*$/)) {
                                return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            }
        });
        
        // Add remaining list items
        if (inList && listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
        }
        
        return elements;
    };
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Xin chào! Tôi là trợ lý AI của dịch vụ chuyển nhà. Tôi có thể giúp gì cho bạn?',
            timestamp: new Date(),
            showQuickActions: true
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Xử lý upload file ảnh
    const handleFileSelect = (files) => {
        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
        );
        
        if (imageFiles.length > 0) {
            const newImages = imageFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                name: file.name,
                size: file.size
            }));
            setSelectedImages(prev => [...prev, ...newImages]);
        }
    };

    // Xử lý drag & drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    // Xử lý paste ảnh
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                handleFileSelect([file]);
                break;
            }
        }
    };

    // Xóa ảnh đã chọn
    const removeImage = (index) => {
        setSelectedImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    // Chuyển đổi file thành base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim() && selectedImages.length === 0) return;

        // Chuẩn bị dữ liệu gửi
        const messageData = {
            message: inputMessage,
            images: []
        };

        // Chuyển đổi ảnh thành base64
        if (selectedImages.length > 0) {
            try {
                const imagePromises = selectedImages.map(img => fileToBase64(img.file));
                messageData.images = await Promise.all(imagePromises);
            } catch (error) {
                console.error('Error converting images:', error);
                return;
            }
        }

        // Add user message với ảnh
        const userMessage = {
            type: 'user',
            text: inputMessage,
            images: selectedImages.map(img => img.preview),
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setSelectedImages([]);
        setIsLoading(true);

        try {
            // Call API với ảnh
            const response = await api.post('/chat-ai', messageData);

            // Add bot response
            const botMessage = {
                type: 'bot',
                text: response.data.result.answer,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            
            const errorMessage = {
                type: 'bot',
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleQuickAction = (action) => {
        if (action === 'view-services') {
            setIsOpen(false);
            navigate('/price-service');
        } else if (action === 'create-request') {
            setIsOpen(false);
            navigate('/customer-page');
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Button */}
            <div 
                className={`chat-button ${isOpen ? 'hidden' : ''}`} 
                onClick={toggleChat}
            >
                <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            </div>
                            <div className="chat-header-text">
                                <h3>Trợ lý AI</h3>
                                <span className="chat-status">Đang hoạt động</span>
                            </div>
                        </div>
                        <button className="close-button" onClick={toggleChat}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                {msg.type === 'bot' && (
                                    <div className="message-avatar">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                        </svg>
                                    </div>
                                )}
                                <div className="message-content">
                                    <div className="message-bubble">
                                        {msg.type === 'bot' ? parseMarkdown(msg.text) : msg.text}
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="message-images">
                                                {msg.images.map((image, imgIndex) => (
                                                    <img 
                                                        key={imgIndex}
                                                        src={image} 
                                                        alt={`Uploaded image ${imgIndex + 1}`}
                                                        className="message-image"
                                                        onClick={() => window.open(image, '_blank')}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot">
                                <div className="message-avatar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                    </svg>
                                </div>
                                <div className="message-content">
                                    <div className="message-bubble typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div 
                        className={`chat-input-container ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {/* Image Preview */}
                        {selectedImages.length > 0 && (
                            <div className="image-preview-container">
                                {selectedImages.map((image, index) => (
                                    <div key={index} className="image-preview">
                                        <img src={image.preview} alt={image.name} />
                                        <button 
                                            className="remove-image-btn"
                                            onClick={() => removeImage(index)}
                                        >
                                            ×
                                        </button>
                                        <div className="image-info">
                                            <span className="image-name">{image.name}</span>
                                            <span className="image-size">
                                                {(image.size / 1024 / 1024).toFixed(1)}MB
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSendMessage}>
                            <div className="input-wrapper">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="attach-button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Đính kèm hình ảnh"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path>
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    className="chat-input"
                                    placeholder={isDragOver ? "Thả ảnh vào đây..." : "Nhập tin nhắn..."}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onPaste={handlePaste}
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit" 
                                    className="send-button"
                                    disabled={(!inputMessage.trim() && selectedImages.length === 0) || isLoading}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;

