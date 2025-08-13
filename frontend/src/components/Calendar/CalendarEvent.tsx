import { EVENT_CATEGORIES } from '../../constants/CalendarConstants/EventCategories';

const CalendarEvent = ({ event, onClick }) => {
  const category = EVENT_CATEGORIES[event.category];
  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        py-1.5 px-2 font-medium cursor-pointer
        text-xs transition-all duration-200 shadow-sm rounded-md
        ${event.automated ? 'opacity-80' : ''}
      `}
      onClick={() => onClick(event)}
      title={`${event.title} ${event.time ? `- ${event.time}` : ''}`}
    >
      <div className='flex items-center justify-between'>
        <span className='font-semibold truncate flex-1'>{event.title}</span>
        {event.time && (
          <span className='text-xs opacity-90 ml-1 flex-shrink-0'>
            {event.time}
          </span>
        )}
      </div>
    </div>
  );
};

export default CalendarEvent;
