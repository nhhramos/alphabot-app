document.addEventListener('DOMContentLoaded', function() {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const csvUpload = document.getElementById('csv-upload');
    const uploadButton = document.getElementById('upload-button');
    const fileNameDisplay = document.getElementById('file-name');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryContainer = document.getElementById('chat-history');

    // Estrutura para gerenciar conversas
    let conversations = [];
    let currentConversationId = null;
    let currentFile = null;
    let conversationCounter = 0;

    // Inicializar com uma conversa vazia
    initializeApp();

    function initializeApp() {
        createNewConversation();
        renderChatHistory();
    }

    // Event Listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    uploadButton.addEventListener('click', uploadCSV);
    
    csvUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            currentFile = e.target.files[0];
            fileNameDisplay.textContent = `Arquivo selecionado: ${currentFile.name}`;
        }
    });

    newChatBtn.addEventListener('click', function() {
        createNewConversation();
        renderChatHistory();
    });

    function createNewConversation() {
        conversationCounter++;
        const newConv = {
            id: Date.now(),
            title: `Nova Conversa ${conversationCounter}`,
            messages: [],
            csvFile: null,
            csvColumns: null,
            timestamp: new Date()
        };
        
        conversations.unshift(newConv);
        
        // Limitar a 10 conversas
        if (conversations.length > 10) {
            conversations = conversations.slice(0, 10);
        }
        
        currentConversationId = newConv.id;
        clearChatDisplay();
    }

    function getCurrentConversation() {
        return conversations.find(conv => conv.id === currentConversationId);
    }

    function switchConversation(convId) {
        currentConversationId = convId;
        const conv = getCurrentConversation();
        
        if (conv) {
            // Restaurar arquivo CSV se existir
            if (conv.csvFile) {
                fileNameDisplay.textContent = `Arquivo carregado: ${conv.csvFile}`;
            } else {
                fileNameDisplay.textContent = '';
            }
            
            // Recarregar mensagens
            clearChatDisplay();
            conv.messages.forEach(msg => {
                appendMessageToDisplay(msg.sender, msg.text);
            });
            
            // Se não houver mensagens, mostrar welcome
            if (conv.messages.length === 0) {
                showWelcomeMessage();
            }
        }
        
        renderChatHistory();
    }

    function updateConversationTitle(firstMessage) {
        const conv = getCurrentConversation();
        if (conv && conv.messages.length === 1) {
            // Usar as primeiras palavras da mensagem como título
            const words = firstMessage.split(' ').slice(0, 5).join(' ');
            conv.title = words.length < firstMessage.length ? words + '...' : words;
            renderChatHistory();
        }
    }

    function renderChatHistory() {
        chatHistoryContainer.innerHTML = '';
        
        conversations.forEach(conv => {
            const historyItem = document.createElement('button');
            historyItem.classList.add('nav-item', 'history-item');
            
            if (conv.id === currentConversationId) {
                historyItem.classList.add('active');
            }
            
            const icon = document.createElement('span');
            icon.classList.add('icon');
            
            // Ícone SVG para conversa com CSV (gráfico de barras)
            if (conv.csvFile) {
                icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="14" width="4" height="7" rx="1" fill="currentColor"/>
                    <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor"/>
                    <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/>
                </svg>`;
            } else {
                // Ícone SVG para conversa normal (balão de mensagem)
                icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.39 21 9.31 20.82 8.31 20.48L3 22L4.52 16.69C4.18 15.69 4 14.61 4 13.5C4 8.25 8.25 4 13.5 4C18.75 4 21 8.25 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            }
            
            const title = document.createElement('span');
            title.classList.add('history-title');
            title.textContent = conv.title;
            
            const deleteBtn = document.createElement('span');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = '×';
            deleteBtn.onclick = function(e) {
                e.stopPropagation();
                deleteConversation(conv.id);
            };
            
            historyItem.appendChild(icon);
            historyItem.appendChild(title);
            historyItem.appendChild(deleteBtn);
            
            historyItem.addEventListener('click', function() {
                switchConversation(conv.id);
            });
            
            chatHistoryContainer.appendChild(historyItem);
        });
    }

    function deleteConversation(convId) {
        if (conversations.length === 1) {
            // Não permitir deletar a última conversa
            alert('Você deve manter pelo menos uma conversa!');
            return;
        }
        
        conversations = conversations.filter(conv => conv.id !== convId);
        
        // Se deletou a conversa atual, mudar para outra
        if (currentConversationId === convId) {
            switchConversation(conversations[0].id);
        } else {
            renderChatHistory();
        }
    }

    function clearChatDisplay() {
        chatWindow.innerHTML = '';
    }

    function showWelcomeMessage() {
        chatWindow.innerHTML = `
            <div class="welcome-message">
                <h2>Olá! Bem-vindo ao Alpha Bot</h2>
                <p>Sou seu especialista em análise de dados. Carregue uma planilha CSV e faça perguntas sobre seus dados. Posso ajudá-lo a extrair insights, identificar padrões e responder questões específicas sobre suas informações.</p>
            </div>
        `;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            const conv = getCurrentConversation();
            
            // Salvar mensagem na conversa
            conv.messages.push({
                sender: 'user',
                text: message,
                timestamp: new Date()
            });
            
            appendMessageToDisplay('user', message);
            userInput.value = '';
            
            // Atualizar título da conversa com a primeira mensagem
            updateConversationTitle(message);
            
            // Mostrar indicador de digitação
            const typingIndicator = appendTypingIndicator();
            
            // Enviar mensagem para o backend
            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                removeTypingIndicator(typingIndicator);
                
                // Salvar resposta do bot na conversa
                conv.messages.push({
                    sender: 'bot',
                    text: data.reply,
                    timestamp: new Date()
                });
                
                appendMessageToDisplay('bot', data.reply);
            })
            .catch(error => {
                console.error('Erro ao enviar mensagem:', error);
                removeTypingIndicator(typingIndicator);
                const errorMsg = 'Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.';
                
                conv.messages.push({
                    sender: 'bot',
                    text: errorMsg,
                    timestamp: new Date()
                });
                
                appendMessageToDisplay('bot', errorMsg);
            });
        }
    }

    function uploadCSV() {
        const file = csvUpload.files[0];
        if (file) {
            const conv = getCurrentConversation();
            const formData = new FormData();
            formData.append('csv_file', file);

            // Salvar informações do arquivo na conversa
            conv.csvFile = file.name;
            
            // Atualizar título da conversa com o nome do arquivo
            conv.title = file.name.replace('.csv', '');
            renderChatHistory();

            // Limpar mensagem de boas-vindas se existir
            const welcomeMsg = chatWindow.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.remove();
            }

            const uploadMsg = `Enviando arquivo: ${file.name}`;
            conv.messages.push({
                sender: 'user',
                text: uploadMsg,
                timestamp: new Date()
            });
            appendMessageToDisplay('user', uploadMsg);
            
            const typingIndicator = appendTypingIndicator();

            fetch('/upload_csv', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                removeTypingIndicator(typingIndicator);
                
                let botResponse;
                if (data.columns) {
                    conv.csvColumns = data.columns;
                    botResponse = `${data.message}\n\nColunas detectadas: ${data.columns.join(', ')}\n\nAgora você pode fazer perguntas sobre seus dados!`;
                } else {
                    botResponse = data.message;
                }
                
                conv.messages.push({
                    sender: 'bot',
                    text: botResponse,
                    timestamp: new Date()
                });
                
                appendMessageToDisplay('bot', botResponse);
            })
            .catch(error => {
                console.error('Erro ao fazer upload do CSV:', error);
                removeTypingIndicator(typingIndicator);
                
                const errorMsg = 'Desculpe, houve um erro ao fazer upload do arquivo CSV. Por favor, verifique se o arquivo está no formato correto.';
                conv.messages.push({
                    sender: 'bot',
                    text: errorMsg,
                    timestamp: new Date()
                });
                
                appendMessageToDisplay('bot', errorMsg);
            });
        } else {
            const errorMsg = 'Por favor, selecione um arquivo CSV para upload.';
            const conv = getCurrentConversation();
            conv.messages.push({
                sender: 'bot',
                text: errorMsg,
                timestamp: new Date()
            });
            appendMessageToDisplay('bot', errorMsg);
        }
    }

    function appendMessageToDisplay(sender, message) {
        // Remover mensagem de boas-vindas se existir
        const welcomeMsg = chatWindow.querySelector('.welcome-message');
        if (welcomeMsg && sender === 'user') {
            welcomeMsg.remove();
        }

        const msgDiv = document.createElement('div');
        msgDiv.classList.add(sender + '-message');
        msgDiv.textContent = message;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function appendTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        typingDiv.id = 'typing-indicator';
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return typingDiv;
    }

    function removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }
});