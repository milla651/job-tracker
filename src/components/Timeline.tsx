import { formatDateTime } from "@/lib/utils";
import { TimelineEvent } from "@/lib/db-types";
import { Clock, ArrowRight, FileText, Plus } from "lucide-react";

interface TimelineProps {
  events: TimelineEvent[];
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "CREATED":
      return <Plus className="w-4 h-4" />;
    case "STATUS_CHANGE":
      return <ArrowRight className="w-4 h-4" />;
    case "NOTE":
      return <FileText className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getEventColor(eventType: string) {
  switch (eventType) {
    case "CREATED":
      return "bg-green-500";
    case "STATUS_CHANGE":
      return "bg-indigo-500";
    case "NOTE":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" />

      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Icon circle */}
            <div
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getEventColor(
                event.eventType
              )} text-white shadow-lg`}
            >
              {getEventIcon(event.eventType)}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-300">
                  {event.eventType.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(event.eventDate)}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-gray-400">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
