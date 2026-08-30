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

const getEventTitle = (event: TJob | TEvent | TLead, eventType: string) => {
  if (eventType === 'lead') return (event as TLead).description || 'Lead';
  return (event as TJob | TEvent).title;
};

const CalendarEvent = ({ event, eventType, onClick }: ICalendarEvent) => {
  const categoryKey =
    eventType === 'event' && 'category' in event
      ? event.category
      : eventType;
  const category = EVENT_CATEGORIES[categoryKey] ?? EVENT_CATEGORIES.event;
  const title = getEventTitle(event, eventType);
  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        py-1.5 px-2 font-medium cursor-pointer
        text-xs transition-all duration-200 shadow-sm rounded-md z-50
      `}
      onClick={(e) => onClick(e, event)}
      title={event.startDateTime ? `${title} - ${event.startDateTime}` : title}
    >
      <div className='flex items-center justify-between'>
        <span className='font-semibold truncate flex-1'>{title}</span>
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
