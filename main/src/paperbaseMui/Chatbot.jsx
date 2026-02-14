import React, { useEffect } from 'react';

const VoiceflowChat = () => {
  useEffect(() => {
    const addVoiceflowChat = (d, t) => {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          verify: { projectID: '66747077065c05d83d92baff' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production'
        });
      }
      v.src = "https://cdn.voiceflow.com/widget/bundle.mjs"; 
      v.type = "text/javascript"; 
      s.parentNode.insertBefore(v, s);
    };

    addVoiceflowChat(document, 'script');
  }, []);

  return null;
};

export default VoiceflowChat;