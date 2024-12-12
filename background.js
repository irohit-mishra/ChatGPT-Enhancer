chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPinnedConversations") {
      chrome.storage.sync.get('pinnedChatGPTConversations', (data) => {
        sendResponse(data.pinnedChatGPTConversations || []);
      });
      return true;
    }
  
    if (request.action === "addPinnedConversation") {
      chrome.storage.sync.get('pinnedChatGPTConversations', (data) => {
        const pinnedConversations = data.pinnedChatGPTConversations || [];
        const conversationId = request.conversation.id;
        
        // Check if conversation already pinned
        if (!pinnedConversations.some(conv => conv.id === conversationId)) {
          pinnedConversations.push({
            id: conversationId,
            title: request.conversation.title,
            timestamp: new Date().toISOString()
          });
          
          chrome.storage.sync.set({pinnedChatGPTConversations: pinnedConversations}, () => {
            sendResponse({success: true});
          });
        }
      });
      return true;
    }
  
    if (request.action === "removePinnedConversation") {
      chrome.storage.sync.get('pinnedChatGPTConversations', (data) => {
        const pinnedConversations = (data.pinnedChatGPTConversations || [])
          .filter(conv => conv.id !== request.conversationId);
        
        chrome.storage.sync.set({pinnedChatGPTConversations: pinnedConversations}, () => {
          sendResponse({success: true});
        });
      });
      return true;
    }
  });
