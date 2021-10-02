import { FC } from 'react';
import { useUtterances } from '../../hooks/useUtterances';

const commentNodeId = 'comments';
const theme = 'github-dark';

const Comments: FC = () => {
  useUtterances(commentNodeId, theme);
  return <div id={commentNodeId} />;
};

export default Comments;
