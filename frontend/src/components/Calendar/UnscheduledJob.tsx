import { EVENT_CATEGORIES } from '../../constants/CalendarConstants/EventCategories';

const UnscheduledJob = ({ job, onClick }) => {
  const category = EVENT_CATEGORIES[job.category];
  return (
    <div
      className={`
        ${category.colors} ${category.hoverColors} ${category.leftBorder}
        p-2 font-medium cursor-pointer
        text-sm transition-all duration-200 shadow-sm mb-2 rounded-md
      `}
      onClick={() => onClick(job)}
    >
      <div className='font-semibold truncate flex-1'>{job.title}</div>
      <div className='text-xs opacity-90'>{job.customer}</div>
    </div>
  );
};

export default UnscheduledJob;
