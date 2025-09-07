import { EVENT_CATEGORIES } from '../../constants/CalendarConstants/EventCategories';
import { TEvent } from '../../types/Event';
import { TJob } from '../../types/Job';
import { TLead } from '../../types/Lead';

interface ICalendarEvent {
  event: TJob | TEvent | TLead;
  eventType: 'job' | 'event' | 'lead';
  onClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    event: any
  ) => void;
}

const CalendarEvent = ({ event, eventType, onClick }: ICalendarEvent) => {
  const category = EVENT_CATEGORIES[eventType];
  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        py-1.5 px-2 font-medium cursor-pointer
        text-xs transition-all duration-200 shadow-sm rounded-md z-50
      `}
      onClick={(e) => onClick(e, event)}
      title={`${event.title} ${
        event.startDateTime ? `- ${event.startDateTime}` : ''
      }`}
    >
      <div className='flex items-center justify-between'>
        <span className='font-semibold truncate flex-1'>{event.title}</span>
        {event.startDateTime && (
          <span className='text-xs opacity-90 ml-1 flex-shrink-0'>
            {new Date(event.startDateTime).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarEvent;
