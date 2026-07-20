import React from 'react';

const AvatarStack = ({ count = 840, avatars = [], maxDisplayed = 4 }) => {
  const defaultAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
  ];

  const displayedAvatars = avatars.length > 0 ? avatars.slice(0, maxDisplayed) : defaultAvatars.slice(0, maxDisplayed);

  return (
    <div className="avatar-stack">
      {displayedAvatars.map((url, i) => (
        <img 
          key={i} 
          className="avatar-stack-item" 
          src={url} 
          alt={`Attendee ${i + 1}`} 
        />
      ))}
      {count > maxDisplayed && (
        <div className="avatar-stack-count">+{count}</div>
      )}
    </div>
  );
};

export default AvatarStack;
