import React from 'react';

// username/repo format
const REPO_NAME = 'ylyra/spacetraveling_utterance';

export const useUtterances = (commentNodeId: string, theme: string): void => {
  React.useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId);
    if (!scriptParentNode) return;

    // docs - https://utteranc.es/
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', REPO_NAME);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', theme);
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    // eslint-disable-next-line consistent-return
    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild as Node);
    };
  }, [commentNodeId, theme]);
};
