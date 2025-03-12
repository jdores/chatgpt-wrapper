export default {
    async fetch(request, env) {
        if (request.url.endsWith('/api/chat')) {
            if (request.method === 'POST') {
                try {
                    const { messages } = await request.json();

                    const response = await fetch(`https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.GATEWAY_NAME}/openai/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${env.OPENAI_TOKEN}`,
                            'cf-aig-authorization': `Bearer ${env.AI_GATEWAY_TOKEN}`,
                        },
                        body: JSON.stringify({
                            model: env.CHATGPT_MODEL,
                            messages: messages
                        })
                    });

                    if (response.status === 424) {
                        return new Response(JSON.stringify({
                            response: "Prompt blocked due to security configurations"
                        }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    if (!response.ok) {
                        throw new Error(`AI Gateway Error: ${response.status}`);
                    }

                    const result = await response.json();
                    const aiMessage = result.choices[0].message.content;

                    return new Response(JSON.stringify({
                        response: markdownToHTML(aiMessage)
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });

                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            return new Response('Method not allowed', { status: 405 });
        }

        return new Response(HTML, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
};

// Improved Markdown to HTML converter
function markdownToHTML(markdown) {
    // Escape HTML to prevent XSS attacks
    markdown = markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Process code blocks (```code```)
    markdown = markdown.replace(/```([\s\S]*?)```/g, (_, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Process inline code (`inline`)
    markdown = markdown.replace(/`([^`]+)`/g, (_, code) => {
        return `<code>${code}</code>`;
    });

    // Headers (#, ##, ###, etc.)
    markdown = markdown.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    markdown = markdown.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    markdown = markdown.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    markdown = markdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    markdown = markdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    markdown = markdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold and Italic
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');             // Italic

    // Lists (unordered and ordered)
    markdown = markdown.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
    markdown = markdown.replace(/^\s*\d+\.\s+(.*)$/gm, '<li>$1</li>');

    // Wrap lists in <ul> or <ol>
    markdown = markdown.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    markdown = markdown.replace(/(<ul>.*?<\/ul>)/gs, match => match.replace(/<\/ul><ul>/g, ''));

    // Paragraphs (wrap non-block elements in <p>)
    markdown = markdown.replace(/(^|\n)(?!<h|<ul|<pre|<li|<code|<strong|<em)(.+?)(?=\n|$)/g, '<p>$2</p>');

    return markdown;
}

const HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Corporate AI LLM</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            color: #333;
            line-height: 1.5;
        }

        .chat-container {
            max-width: 800px;
            margin: 0 auto;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .message {
            margin-bottom: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            max-width: 80%;
        }

        .user-message {
            background: #007bff;
            color: white;
            margin-left: auto;
        }

        .ai-message {
            background: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .input-container {
            padding: 20px;
            background: #fff;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }

        input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            outline: none;
        }

        button {
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        pre, code {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>

<body>
    <div class="chat-container">
        <h1>Corporate AI LLM</h1>
        <div class="chat-messages" id="messages"></div>
        <div class="input-container">
            <input type="text" id="userInput" placeholder="Type your message..." />
            <button onclick="sendMessage()" id="sendButton">Send</button>
        </div>
    </div>

    <script>
        let messages = [];
        const messagesDiv = document.getElementById('messages');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');

        async function sendMessage() {
            const content = userInput.value.trim();
            if (!content) return;

            userInput.disabled = true;
            sendButton.disabled = true;

            messages.push({ role: 'user', content });
            appendMessage('user', content);
            userInput.value = '';

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });

            const result = await response.json();
            appendMessage('ai', result.response);

            userInput.disabled = false;
            sendButton.disabled = false;
        }

        function appendMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role + '-message';
            messageDiv.innerHTML = content;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    </script>

</body>

</html>`;
