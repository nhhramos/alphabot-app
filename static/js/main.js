document.addEventListener('DOMContentLoaded', function() {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const csvUpload = document.getElementById('csv-upload');
    const uploadButton = document.getElementById('upload-button');
    const fileNameDisplay = document.getElementById('file-name');
    const newChatBtn = document.getElementById('new-chat-btn');

    let currentFile = null;

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
        clearChat();
    });

    function clearChat() {
        chatWindow.innerHTML = `
            <div class="welcome-message">
                <img src="/static/img/chatbot-ui.png" alt="Chatbot" class="welcome-icon">
                <h2>Olá! Bem-vindo ao Manus Bot</h2>
                <p>Sou seu especialista em análise de dados. Posso ajudá-lo a extrair insights, identificar padrões e responder questões específicas sobre suas informações.</p>
            </div>
        `;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            appendMessage('user', message);
            userInput.value = '';
            
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
                appendMessage('bot', data.reply);
            })
            .catch(error => {
                console.error('Erro ao enviar mensagem:', error);
                removeTypingIndicator(typingIndicator);
                appendMessage('bot', 'Desculpe, houve um erro ao processar sua solicitação. Por favor, tente novamente.');
            });
        }
    }

    function uploadCSV() {
        const file = csvUpload.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('csv_file', file);

            // Limpar mensagem de boas-vindas se existir
            const welcomeMsg = chatWindow.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.remove();
            }

            appendMessage('user', `Enviando arquivo: ${file.name}`);
            const typingIndicator = appendTypingIndicator();

            fetch('/upload_csv', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                removeTypingIndicator(typingIndicator);
                if (data.columns) {
                    appendMessage('bot', `${data.message}\n\nColunas detectadas: ${data.columns.join(', ')}\n\nAgora você pode fazer perguntas sobre seus dados!`);
                } else {
                    appendMessage('bot', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao fazer upload do CSV:', error);
                removeTypingIndicator(typingIndicator);
                appendMessage('bot', 'Desculpe, houve um erro ao fazer upload do arquivo CSV. Por favor, verifique se o arquivo está no formato correto.');
            });
        } else {
            appendMessage('bot', 'Por favor, selecione um arquivo CSV para upload.');
        }
    }

    function appendMessage(sender, message) {
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
        typingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
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

