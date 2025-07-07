import {
  Briefcase,
  CheckCircle,
  Clock,
  Edit3,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Settings,
  XCircle,
} from 'lucide-react';
import { QuoteActivityType } from '../../../constants/Enumeration/QuoteEnum/QuoteEnum';

export const getQuoteActivityStyle = (activityType: QuoteActivityType) => {
  const styles = {
    [QuoteActivityType.QuoteCreated]: {
      icon: FileText,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-500',
      lightBg: 'bg-blue-100',
    },
    [QuoteActivityType.QuoteEdited]: {
      icon: Edit3,
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-500',
      lightBg: 'bg-orange-100',
    },
    [QuoteActivityType.QuoteSent]: {
      icon: Send,
      bgColor: 'bg-green-500',
      textColor: 'text-green-500',
      lightBg: 'bg-green-100',
    },
    [QuoteActivityType.InternalNoteAdded]: {
      icon: MessageSquare,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-500',
      lightBg: 'bg-purple-100',
    },
    [QuoteActivityType.CustomerNoteAdded]: {
      icon: MessageSquare,
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      lightBg: 'bg-indigo-100',
    },
    [QuoteActivityType.CustomerMessageAdded]: {
      icon: MessageSquare,
      bgColor: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      lightBg: 'bg-cyan-100',
    },
    [QuoteActivityType.AttachmentAdded]: {
      icon: Paperclip,
      bgColor: 'bg-gray-500',
      textColor: 'text-gray-500',
      lightBg: 'bg-gray-100',
    },
    [QuoteActivityType.MarkedSent]: {
      icon: Send,
      bgColor: 'bg-green-500',
      textColor: 'text-green-500',
      lightBg: 'bg-green-100',
    },
    [QuoteActivityType.MarkedAccepted]: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      lightBg: 'bg-emerald-100',
    },
    [QuoteActivityType.MarkedRejected]: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-red-500',
      lightBg: 'bg-red-100',
    },
    [QuoteActivityType.ConvertedToJob]: {
      icon: Briefcase,
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-600',
      lightBg: 'bg-blue-100',
    },
    [QuoteActivityType.StatusChanged]: {
      icon: Settings,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      lightBg: 'bg-yellow-100',
    },
    default: {
      icon: Clock,
      bgColor: 'bg-gray-400',
      textColor: 'text-gray-400',
      lightBg: 'bg-gray-100',
    },
  };

  return styles[activityType] || styles.default;
};
