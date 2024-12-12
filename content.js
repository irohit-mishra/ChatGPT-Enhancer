class ChatGPTThreadViewer {
    constructor() {
      this.observeDOM();
    }
  
    observeDOM() {
      const targetNode = document.querySelector('main');
      if (!targetNode) return;
  
      const config = { childList: true, subtree: true };
      const callback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'childList') {
            this.createThreadViewButton();
          }
        }
      };
  
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
    }
  
    createThreadViewButton() {
      // Remove existing buttons to prevent duplicates
      const existingButton = document.querySelector('#thread-view-toggle');
      if (existingButton) return;
  
      // Find the conversation header
      const headerElement = document.querySelector('h1');
      if (!headerElement) return;
  
      // Create thread view toggle button
      const threadViewButton = document.createElement('button');
      threadViewButton.id = 'thread-view-toggle';
      threadViewButton.textContent = 'Tree View';
      threadViewButton.classList.add('thread-view-button');
      threadViewButton.addEventListener('click', () => this.toggleThreadView());
  
      // Create pin conversation button
      const pinButton = document.createElement('button');
      pinButton.id = 'pin-conversation';
      pinButton.textContent = 'Pin Conversation';
      pinButton.classList.add('pin-conversation-button');
      pinButton.addEventListener('click', () => this.pinCurrentConversation());
  
      // Append buttons
      headerElement.appendChild(threadViewButton);
      headerElement.appendChild(pinButton);
    }
  
    toggleThreadView() {
      const conversationContainer = document.querySelector('main div[class*="react-scroll-to-bottom"]');
      if (!conversationContainer) return;
  
      // Toggle between original and tree view
      const existingTreeView = document.getElementById('chatgpt-tree-view');
      if (existingTreeView) {
        // Restore original view
        conversationContainer.innerHTML = this.originalContent;
        existingTreeView.remove();
        return;
      }
  
      // Store original content
      this.originalContent = conversationContainer.innerHTML;
  
      // Create tree view
      const treeView = document.createElement('div');
      treeView.id = 'chatgpt-tree-view';
      
      const messageGroups = document.querySelectorAll('div[class*="group"]');
      const treeStructure = this.buildMessageTree(messageGroups);
      
      treeView.innerHTML = this.renderTreeView(treeStructure);
      
      // Replace conversation view
      conversationContainer.innerHTML = '';
      conversationContainer.appendChild(treeView);
    }
  
    buildMessageTree(messageGroups) {
      const tree = [];
      
      messageGroups.forEach((group, index) => {
        const isUserMessage = group.querySelector('svg[aria-label="User"]');
        const isAssistantMessage = group.querySelector('svg[aria-label="ChatGPT"]');
        
        const messageNode = {
          type: isUserMessage ? 'user' : 'assistant',
          content: group.textContent,
          index: index
        };
        
        tree.push(messageNode);
      });
      
      return tree;
    }
  
    renderTreeView(tree) {
      return `
        <div class="chatgpt-tree-container">
          ${tree.map((node, index) => `
            <div class="tree-node ${node.type}-message" data-index="${node.index}">
              <div class="message-icon">${node.type === 'user' ? '👤' : '🤖'}</div>
              <div class="message-content">${this.truncateMessage(node.content)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  
    truncateMessage(message, maxLength = 100) {
      return message.length > maxLength 
        ? message.substr(0, maxLength) + '...' 
        : message;
    }
  
    pinCurrentConversation() {
      // Get current conversation ID and title
      const currentUrl = window.location.href;
      const conversationId = currentUrl.split('/').pop();
      const conversationTitle = document.querySelector('h1')?.textContent || 'Untitled Conversation';
  
      chrome.runtime.sendMessage({
        action: "addPinnedConversation",
        conversation: {
          id: conversationId,
          title: conversationTitle
        }
      }, (response) => {
        if (response.success) {
          alert('Conversation Pinned Successfully!');
        }
      });
    }
  }
  
  // Initialize the viewer when page loads
  function initChatGPTThreadViewer() {
    if (window.location.hostname === 'chat.openai.com') {
      new ChatGPTThreadViewer();
    }
  }
  
  // Run initialization
  initChatGPTThreadViewer();