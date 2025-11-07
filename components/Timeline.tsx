
import React from 'react';
import { TimelineEvent } from '../types';

const EventIcon: React.FC<{ type: TimelineEvent['type'] }> = ({ type }) => {
  const baseClasses = "w-6 h-6 rounded-full flex items-center justify-center text-brand-bg flex-shrink-0";
  let icon, color;

  switch (type) {
    case 'detection':
      icon = '📡'; color = 'bg-red-500'; break;
    case 'correlation':
      icon = '🔄'; color = 'bg-blue-500'; break;
    case 'identification':
      icon = '🎯'; color = 'bg-green-500'; break;
    case 'info':
    default:
      icon = 'ℹ️'; color = 'bg-gray-500'; break;
  }
  return <div className={`${baseClasses} ${color}`}>{icon}</div>;
};

const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-bold text-brand-text mb-2 flex-shrink-0">Event Timeline</h2>
      <div className="flex-1 overflow-y-auto pr-2">
        <ul className="space-y-3">
          {events.map((event, index) => (
            <li key={index} className="flex items-start gap-3">
              <EventIcon type={event.type} />
              <div className="flex-1">
                <p className="text-sm text-brand-text">{event.description}</p>
                <p className="text-xs text-brand-text-dim">{event.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
