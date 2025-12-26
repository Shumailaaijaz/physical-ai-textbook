/**
 * Chatbot Widget for Physical AI Textbook
 * Loads a floating chatbot button that opens an iframe to the chatbot interface
 */

(function() {
  'use strict';

  // Get API URL from script data attribute
  const script = document.currentScript;
  const apiUrl = script?.getAttribute('data-api') || 'https://huggingface.co/spaces/shumailaaijaz/hackathon-book';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'chatbot-widget-container';
    widgetContainer.innerHTML = `
      <style>
        #chatbot-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }

        .chatbot-toggle-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          color: white;
          font-size: 28px;
        }

        .chatbot-toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .chatbot-toggle-btn:active {
          transform: scale(0.95);
        }

        .chatbot-modal {
          display: none;
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          flex-direction: column;
          z-index: 10000;
        }

        .chatbot-modal.open {
          display: flex;
        }

        .chatbot-modal-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chatbot-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .chatbot-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 24px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .chatbot-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-modal-body {
          flex: 1;
          overflow: hidden;
        }

        .chatbot-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 768px) {
          .chatbot-modal {
            width: calc(100vw - 40px);
            height: calc(100vh - 140px);
            bottom: 90px;
            right: 20px;
          }
        }

        @media (max-width: 480px) {
          .chatbot-modal {
            width: calc(100vw - 20px);
            height: calc(100vh - 100px);
            bottom: 80px;
            right: 10px;
          }

          #chatbot-widget-container {
            bottom: 10px;
            right: 10px;
          }
        }
      </style>

      <button class="chatbot-toggle-btn" id="chatbot-toggle" aria-label="Open chatbot" title="Ask a question">
        💬
      </button>

      <div class="chatbot-modal" id="chatbot-modal">
        <div class="chatbot-modal-header">
          <h3>Physical AI Assistant</h3>
          <button class="chatbot-close-btn" id="chatbot-close" aria-label="Close chatbot">
            ×
          </button>
        </div>
        <div class="chatbot-modal-body">
          <iframe
            class="chatbot-iframe"
            id="chatbot-iframe"
            src=""
            title="Physical AI Chatbot"
            allow="clipboard-write"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(widgetContainer);

    // Get elements
    const toggleBtn = document.getElementById('chatbot-toggle');
    const modal = document.getElementById('chatbot-modal');
    const closeBtn = document.getElementById('chatbot-close');
    const iframe = document.getElementById('chatbot-iframe');

    // Set iframe src to API URL
    iframe.src = apiUrl;

    // Toggle modal
    toggleBtn.addEventListener('click', function() {
      const isOpen = modal.classList.contains('open');
      if (isOpen) {
        modal.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        modal.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
      modal.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (modal.classList.contains('open') &&
          !modal.contains(e.target) &&
          !toggleBtn.contains(e.target)) {
        modal.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
