import React, { ReactNode } from 'react';

type MessagePreviewProps = {
    messageContent: ReactNode;
};

export const MessagePreview = ({ messageContent }: MessagePreviewProps): React.ReactElement => (
    <div className="control-group message-group">
        <div className="container full-width">
            <div className="sendTextDiv">{messageContent}</div>
        </div>
    </div>
);


