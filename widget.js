// InfinityFree Chat Widget - Gelişmiş Sürüm
(function() {
    'use strict';

    // Widget konfigürasyonu
    const scriptTag = document.currentScript || document.querySelector('script[data-name="Chat-Widget"]');
    if (!scriptTag) return;

    const config = {
        tokenServer: scriptTag.dataset.tokenServer || 'https://siteniz.com/token.php',
        room: scriptTag.dataset.room || 'genel',
        color: scriptTag.dataset.color || '#FFDD00',
        position: scriptTag.dataset.position || 'right',
        xMargin: parseInt(scriptTag.dataset.x_margin) || 18,
        yMargin: parseInt(scriptTag.dataset.y_margin) || 18,
        title: scriptTag.dataset.title || 'Sohbet',
        placeholder: scriptTag.dataset.placeholder || 'Mesajınızı yazın...',
        language: scriptTag.dataset.language || 'tr'
    };

    // Dil çevirileri
    const translations = {
        tr: {
            title: 'Canlı Sohbet',
            placeholder: 'Mesajınızı yazın...',
            send: 'Gönder',
            connecting: 'Bağlanıyor...',
            online: 'çevrimiçi',
            yourself: 'Siz',
            close: 'Kapat',
            open: 'Sohbeti Aç',
            emoji: 'Emoji',
            language: 'Dil',
            changeName: 'İsim Değiştir',
            save: 'Kaydet',
            cancel: 'İptal',
            namePlaceholder: 'Yeni isminiz...',
            members: 'kişi çevrimiçi',
            typeHere: 'Mesaj yazın...'
        },
        en: {
            title: 'Live Chat',
            placeholder: 'Type your message...',
            send: 'Send',
            connecting: 'Connecting...',
            online: 'online',
            yourself: 'You',
            close: 'Close',
            open: 'Open Chat',
            emoji: 'Emoji',
            language: 'Language',
            changeName: 'Change Name',
            save: 'Save',
            cancel: 'Cancel',
            namePlaceholder: 'Your new name...',
            members: 'members online',
            typeHere: 'Type here...'
        },
        de: {
            title: 'Live-Chat',
            placeholder: 'Nachricht schreiben...',
            send: 'Senden',
            connecting: 'Verbinde...',
            online: 'online',
            yourself: 'Sie',
            close: 'Schließen',
            open: 'Chat öffnen',
            emoji: 'Emoji',
            language: 'Sprache',
            changeName: 'Name ändern',
            save: 'Speichern',
            cancel: 'Abbrechen',
            namePlaceholder: 'Ihr neuer Name...',
            members: 'Mitglieder online'
        },
        fr: {
            title: 'Chat en direct',
            placeholder: 'Écrivez votre message...',
            send: 'Envoyer',
            connecting: 'Connexion...',
            online: 'en ligne',
            yourself: 'Vous',
            close: 'Fermer',
            open: 'Ouvrir le chat',
            emoji: 'Émoji',
            language: 'Langue',
            changeName: 'Changer le nom',
            save: 'Enregistrer',
            cancel: 'Annuler',
            namePlaceholder: 'Votre nouveau nom...',
            members: 'membres en ligne'
        },
        es: {
            title: 'Chat en vivo',
            placeholder: 'Escribe tu mensaje...',
            send: 'Enviar',
            connecting: 'Conectando...',
            online: 'en línea',
            yourself: 'Tú',
            close: 'Cerrar',
            open: 'Abrir chat',
            emoji: 'Emoji',
            language: 'Idioma',
            changeName: 'Cambiar nombre',
            save: 'Guardar',
            cancel: 'Cancelar',
            namePlaceholder: 'Tu nuevo nombre...',
            members: 'miembros en línea'
        },
        ar: {
            title: 'الدردشة المباشرة',
            placeholder: 'اكتب رسالتك...',
            send: 'إرسال',
            connecting: 'جاري الاتصال...',
            online: 'متصل',
            yourself: 'أنت',
            close: 'إغلاق',
            open: 'فتح الدردشة',
            emoji: 'رموز تعبيرية',
            language: 'اللغة',
            changeName: 'تغيير الاسم',
            save: 'حفظ',
            cancel: 'إلغاء',
            namePlaceholder: 'اسمك الجديد...',
            members: 'عضو متصل'
        },
        ru: {
            title: 'Чат',
            placeholder: 'Введите сообщение...',
            send: 'Отправить',
            connecting: 'Подключение...',
            online: 'онлайн',
            yourself: 'Вы',
            close: 'Закрыть',
            open: 'Открыть чат',
            emoji: 'Эмодзи',
            language: 'Язык',
            changeName: 'Сменить имя',
            save: 'Сохранить',
            cancel: 'Отмена',
            namePlaceholder: 'Ваше новое имя...',
            members: 'участников онлайн'
        },
        zh: {
            title: '在线聊天',
            placeholder: '输入您的消息...',
            send: '发送',
            connecting: '连接中...',
            online: '在线',
            yourself: '您',
            close: '关闭',
            open: '打开聊天',
            emoji: '表情符号',
            language: '语言',
            changeName: '更改名称',
            save: '保存',
            cancel: '取消',
            namePlaceholder: '您的新名称...',
            members: '人在线'
        },
        ja: {
            title: 'ライブチャット',
            placeholder: 'メッセージを入力...',
            send: '送信',
            connecting: '接続中...',
            online: 'オンライン',
            yourself: 'あなた',
            close: '閉じる',
            open: 'チャットを開く',
            emoji: '絵文字',
            language: '言語',
            changeName: '名前を変更',
            save: '保存',
            cancel: 'キャンセル',
            namePlaceholder: '新しい名前...',
            members: '人がオンライン'
        }
    };

    // Emoji listesi
    const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '😢', '😍', '🤔', '👏', '🙏', '💯', '⭐', '🌈', '🍕', '🎸', '⚽', '🏀'];

    let t = translations[config.language] || translations.tr;
    let ably = null;
    let channel = null;
    let currentUser = {
        id: generateUserId(),
        name: localStorage.getItem('chat_username') || generateUsername()
    };
    let messages = [];
    let isOpen = false;

    // Kullanıcı ID'si oluştur
    function generateUserId() {
        let userId = localStorage.getItem('chat_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_user_id', userId);
        }
        return userId;
    }

    // Rastgele kullanıcı adı oluştur
    function generateUsername() {
        const adjectives = ['Mutlu', 'Zeki', 'Hızlı', 'Sakin', 'Parlak', 'Neşeli', 'Cesur', 'Bilge'];
        const nouns = ['Panda', 'Kaplan', 'Kartal', 'Yunus', 'Kurt', 'Şahin', 'Aslan', 'Fil'];
        return adjectives[Math.floor(Math.random() * adjectives.length)] + 
               nouns[Math.floor(Math.random() * nouns.length)] +
               Math.floor(Math.random() * 100);
    }

    // Token al ve Ably'ye bağlan
    async function initChat() {
        try {
            // Ably script'ini yükle
            await loadAblyScript();
            
            // Token sunucusundan token al
            const tokenResponse = await fetch(`${config.tokenServer}?client_id=${currentUser.id}&room=${config.room}`);
            const tokenData = await tokenResponse.json();
            
            if (!tokenData.success) {
                throw new Error('Token alınamadı');
            }

            // Ably'ye bağlan
            ably = new Ably.Realtime({
                token: tokenData.token,
                clientId: currentUser.id,
                echoMessages: false
            });

            ably.connection.on('connected', () => {
                updateConnectionStatus(true);
            });

            ably.connection.on('disconnected', () => {
                updateConnectionStatus(false);
            });

            // Kanala katıl
            channel = ably.channels.get(config.room);

            // Mesajları dinle
            await channel.subscribe('message', (message) => {
                messages.push(message.data);
                renderMessages();
            });

            // Kullanıcı varlığını bildir
            await channel.presence.enter({ 
                name: currentUser.name,
                color: config.color
            });

            // Kullanıcı listesini güncelle
            channel.presence.subscribe('enter', updateUserList);
            channel.presence.subscribe('leave', updateUserList);
            updateUserList();

            // Input'u aktif et
            enableChat();

        } catch (error) {
            console.error('Chat başlatılamadı:', error);
            showError('Bağlantı hatası: ' + error.message);
        }
    }

    // Ably script'ini yükle
    function loadAblyScript() {
        return new Promise((resolve, reject) => {
            if (window.Ably) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.ably.com/lib/ably.min-1.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // UI oluştur
    function createUI() {
        // Chat butonu
        const button = document.createElement('div');
        button.id = 'chat-button';
        button.innerHTML = '💬';
        Object.assign(button.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: config.color,
            color: 'white',
            borderRadius: '30px',
            position: 'fixed',
            [config.position]: config.xMargin + 'px',
            bottom: config.yMargin + 'px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: '999999',
            fontSize: '24px',
            transition: 'all 0.3s ease',
            border: '2px solid white'
        });

        // Chat penceresi
        const window = document.createElement('div');
        window.id = 'chat-window';
        Object.assign(window.style, {
            position: 'fixed',
            [config.position]: config.xMargin + 'px',
            bottom: (config.yMargin + 70) + 'px',
            width: '350px',
            height: '550px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 5px 40px rgba(0,0,0,0.2)',
            zIndex: '999998',
            display: 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            border: '1px solid rgba(0,0,0,0.1)'
        });

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px 15px;
            background: ${config.color};
            color: white;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        `;
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>💬</span>
                <span class="chat-title">${t.title}</span>
                <span id="user-count" style="
                    background: rgba(255,255,255,0.2);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                ">0</span>
            </div>
            <div style="display: flex; gap: 12px;">
                <span id="connection-status" style="
                    width: 10px;
                    height: 10px;
                    border-radius: 10px;
                    background: #f44336;
                    display: inline-block;
                "></span>
                <span id="close-chat" style="cursor: pointer; font-size: 18px;">&times;</span>
            </div>
        `;

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            padding: 8px;
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;

        // Dil seçici
        const languageSelect = document.createElement('select');
        languageSelect.id = 'language-select';
        languageSelect.style.cssText = `
            padding: 5px 8px;
            border: 1px solid #ddd;
            border-radius: 15px;
            font-size: 12px;
            outline: none;
            cursor: pointer;
        `;
        languageSelect.innerHTML = `
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
        `;
        languageSelect.value = config.language;

        // İsim değiştir butonu
        const nameButton = document.createElement('button');
        nameButton.innerHTML = '✏️ ' + t.changeName;
        nameButton.style.cssText = `
            padding: 5px 12px;
            border: none;
            background: ${config.color};
            color: white;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        // Emoji butonu
        const emojiButton = document.createElement('button');
        emojiButton.innerHTML = '😊 ' + t.emoji;
        emojiButton.style.cssText = `
            padding: 5px 12px;
            border: none;
            background: #6c757d;
            color: white;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        toolbar.appendChild(languageSelect);
        toolbar.appendChild(nameButton);
        toolbar.appendChild(emojiButton);

        // Emoji paneli
        const emojiPanel = document.createElement('div');
        emojiPanel.id = 'emoji-panel';
        emojiPanel.style.cssText = `
            display: none;
            padding: 10px;
            background: white;
            border-bottom: 1px solid #eee;
            grid-template-columns: repeat(9, 1fr);
            gap: 5px;
        `;
        
        emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.style.cssText = `
                font-size: 20px;
                cursor: pointer;
                text-align: center;
                padding: 5px;
                border-radius: 5px;
                transition: background 0.3s ease;
            `;
            span.onmouseenter = () => span.style.background = '#f0f0f0';
            span.onmouseleave = () => span.style.background = 'transparent';
            span.onclick = () => {
                const input = document.getElementById('chat-input');
                if (input) {
                    input.value += emoji;
                    input.focus();
                }
            };
            emojiPanel.appendChild(span);
        });

        // İsim değiştirme paneli
        const namePanel = document.createElement('div');
        namePanel.id = 'name-panel';
        namePanel.style.cssText = `
            display: none;
            padding: 10px;
            background: white;
            border-bottom: 1px solid #eee;
        `;
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'name-input';
        nameInput.placeholder = t.namePlaceholder;
        nameInput.value = currentUser.name;
        nameInput.style.cssText = `
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 15px;
            margin-bottom: 8px;
            box-sizing: border-box;
        `;

        const nameButtons = document.createElement('div');
        nameButtons.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;

        const saveNameBtn = document.createElement('button');
        saveNameBtn.innerHTML = t.save;
        saveNameBtn.style.cssText = `
            padding: 5px 15px;
            border: none;
            background: ${config.color};
            color: white;
            border-radius: 15px;
            cursor: pointer;
        `;

        const cancelNameBtn = document.createElement('button');
        cancelNameBtn.innerHTML = t.cancel;
        cancelNameBtn.style.cssText = `
            padding: 5px 15px;
            border: 1px solid #ddd;
            background: white;
            color: #666;
            border-radius: 15px;
            cursor: pointer;
        `;

        nameButtons.appendChild(saveNameBtn);
        nameButtons.appendChild(cancelNameBtn);
        namePanel.appendChild(nameInput);
        namePanel.appendChild(nameButtons);

        // Messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'chat-messages';
        messagesContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: #f8f9fa;
        `;

        // Input container
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            padding: 15px;
            background: white;
            border-top: 1px solid #eee;
        `;

        const inputGroup = document.createElement('div');
        inputGroup.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'chat-input';
        input.placeholder = t.typeHere;
        input.disabled = true;
        input.style.cssText = `
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        `;

        const sendButton = document.createElement('button');
        sendButton.id = 'chat-send';
        sendButton.innerHTML = '➤';
        sendButton.disabled = true;
        sendButton.style.cssText = `
            width: 40px;
            height: 40px;
            border: none;
            background: ${config.color};
            color: white;
            border-radius: 20px;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;

        // Event listeners
        button.onmouseenter = () => button.style.transform = 'scale(1.1)';
        button.onmouseleave = () => button.style.transform = 'scale(1)';
        button.onclick = toggleChat;

        header.querySelector('#close-chat').onclick = toggleChat;

        input.onkeypress = (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                sendMessage(input.value.trim());
                input.value = '';
            }
        };

        sendButton.onclick = () => {
            if (input.value.trim()) {
                sendMessage(input.value.trim());
                input.value = '';
            }
        };

        languageSelect.onchange = (e) => {
            setLanguage(e.target.value);
        };

        emojiButton.onclick = () => {
            emojiPanel.style.display = emojiPanel.style.display === 'none' ? 'grid' : 'none';
            namePanel.style.display = 'none';
        };

        nameButton.onclick = () => {
            namePanel.style.display = namePanel.style.display === 'none' ? 'block' : 'none';
            emojiPanel.style.display = 'none';
        };

        saveNameBtn.onclick = () => {
            if (nameInput.value.trim()) {
                changeUsername(nameInput.value.trim());
                namePanel.style.display = 'none';
            }
        };

        cancelNameBtn.onclick = () => {
            namePanel.style.display = 'none';
            nameInput.value = currentUser.name;
        };

        // Assemble
        inputGroup.appendChild(input);
        inputGroup.appendChild(sendButton);
        inputContainer.appendChild(inputGroup);
        
        window.appendChild(header);
        window.appendChild(toolbar);
        window.appendChild(emojiPanel);
        window.appendChild(namePanel);
        window.appendChild(messagesContainer);
        window.appendChild(inputContainer);
        
        document.body.appendChild(button);
        document.body.appendChild(window);

        // Make draggable
        makeDraggable(window, header);
    }

    // Sürükleme fonksiyonu
    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.bottom = 'auto';
            element.style.right = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Chat penceresini aç/kapat
    function toggleChat() {
        const window = document.getElementById('chat-window');
        const button = document.getElementById('chat-button');
        
        if (!isOpen) {
            window.style.display = 'flex';
            button.innerHTML = '✕';
            isOpen = true;
            if (!ably) initChat();
        } else {
            window.style.display = 'none';
            button.innerHTML = '💬';
            isOpen = false;
        }
    }

    // Mesaj gönder
    function sendMessage(text) {
        if (!channel || !text.trim()) return;

        const message = {
            id: Date.now() + '_' + Math.random().toString(36),
            userId: currentUser.id,
            userName: currentUser.name,
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: config.color
        };

        channel.publish('message', message);
    }

    // Mesajları render et
    function renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = messages.map(msg => {
            const isOwn = msg.userId === currentUser.id;
            return `
                <div style="
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: ${isOwn ? 'flex-end' : 'flex-start'};
                ">
                    <div style="
                        max-width: 80%;
                        padding: 10px 14px;
                        border-radius: 18px;
                        background: ${isOwn ? config.color : 'white'};
                        color: ${isOwn ? 'white' : '#333'};
                        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                        word-wrap: break-word;
                    ">
                        ${!isOwn ? `
                            <div style="
                                font-size: 11px;
                                margin-bottom: 4px;
                                color: #666;
                            ">
                                ${escapeHtml(msg.userName)}
                            </div>
                        ` : ''}
                        <div style="font-size: 14px;">${escapeHtml(msg.text)}</div>
                        <div style="
                            font-size: 10px;
                            margin-top: 4px;
                            opacity: 0.7;
                            text-align: right;
                        ">
                            ${msg.time}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    // HTML escape
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Kullanıcı listesini güncelle
    function updateUserList() {
        if (!channel) return;

        channel.presence.get((err, members) => {
            if (!err) {
                const count = members.length;
                const userCount = document.getElementById('user-count');
                if (userCount) {
                    userCount.textContent = count;
                    userCount.title = members.map(m => m.data?.name || 'Anonymous').join(', ');
                }
            }
        });
    }

    // Bağlantı durumunu güncelle
    function updateConnectionStatus(connected) {
        const status = document.getElementById('connection-status');
        if (status) {
            status.style.background = connected ? '#4CAF50' : '#f44336';
        }
    }

    // Input'u aktif et
    function enableChat() {
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('chat-send');
        if (input && sendButton) {
            input.disabled = false;
            sendButton.disabled = false;
            input.placeholder = t.typeHere;
        }
    }

    // Hata göster
    function showError(message) {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.innerHTML = `
                <div style="
                    padding: 20px;
                    text-align: center;
                    color: #f44336;
                ">
                    ⚠️ ${message}
                </div>
            `;
        }
    }

    // Dil değiştir
    function setLanguage(lang) {
        if (translations[lang]) {
            config.language = lang;
            t = translations[lang];
            
            // UI metinlerini güncelle
            document.querySelector('.chat-title').textContent = t.title;
            
            const input = document.getElementById('chat-input');
            if (input) input.placeholder = t.typeHere;
            
            // Toolbar butonlarını güncelle
            const toolbar = document.querySelector('#chat-window > div:nth-child(2)');
            if (toolbar) {
                const buttons = toolbar.querySelectorAll('button');
                if (buttons[0]) buttons[0].innerHTML = '✏️ ' + t.changeName;
                if (buttons[1]) buttons[1].innerHTML = '😊 ' + t.emoji;
            }
            
            // İsim panelini güncelle
            const nameInput = document.getElementById('name-input');
            if (nameInput) nameInput.placeholder = t.namePlaceholder;
            
            const namePanelBtns = document.querySelectorAll('#name-panel button');
            if (namePanelBtns[0]) namePanelBtns[0].innerHTML = t.save;
            if (namePanelBtns[1]) namePanelBtns[1].innerHTML = t.cancel;
        }
    }

    // Kullanıcı adı değiştir
    function changeUsername(newName) {
        if (newName && newName.trim()) {
            currentUser.name = newName.trim();
            localStorage.setItem('chat_username', currentUser.name);
            
            if (channel) {
                channel.presence.update({ 
                    name: currentUser.name,
                    color: config.color
                });
            }
        }
    }

    // Başlangıç
    createUI();
})();
