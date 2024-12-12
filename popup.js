document.addEventListener('DOMContentLoaded', () => {
    const pinnedList = document.getElementById('pinnedList');
  
    chrome.runtime.sendMessage({action: "getPinnedConversations"}, (pinnedConversations) => {
      if (pinnedConversations && pinnedConversations.length) {
        pinnedConversations.forEach(conversation => {
          const conversationEl = document.createElement('div');
          conversationEl.classList.add('pinned-conversation');
          conversationEl.innerHTML = `
            <span>${conversation.title}</span>
            <button class="remove-pin" data-id="${conversation.id}">Remove</button>
          `;
  
          conversationEl.querySelector('.remove-pin').addEventListener('click', (e) => {
            const conversationId = e.target.dataset.id;
            chrome.runtime.sendMessage({
              action: "removePinnedConversation", 
              conversationId: conversationId
            }, () => {
              conversationEl.remove();
            });
          });
  
          pinnedList.appendChild(conversationEl);
        });
      } else {
        pinnedList.innerHTML = '<p>No pinned conversations</p>';
      }
    });
  });