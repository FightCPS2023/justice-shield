import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Plus, Calendar, Trash2, MoreVertical, Edit } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { HelpTooltip, InfoBox } from "./ui/help-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

interface CaseTimelineProps {
  events: TimelineEvent[];
  onAddEvent: (event: Omit<TimelineEvent, "id">) => void;
  onDeleteEvent?: (id: string) => void;
  onEditEvent?: (id: string, event: Omit<TimelineEvent, "id">) => void;
}

export function CaseTimeline({ events, onAddEvent, onDeleteEvent, onEditEvent }: CaseTimelineProps) {
  const [newEvent, setNewEvent] = useState({
    date: "",
    title: "",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState({
    date: "",
    title: "",
    description: "",
  });

  const handleSubmit = () => {
    if (newEvent.date && newEvent.title) {
      onAddEvent(newEvent);
      setNewEvent({ date: "", title: "", description: "" });
      setShowForm(false);
    }
  };

  const handleDeleteClick = (event: TimelineEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete.id);
      toast.success(`Event "${eventToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleEditClick = (event: TimelineEvent) => {
    setEditingEventId(event.id);
    setEditEvent({ date: event.date, title: event.title, description: event.description });
    setShowForm(true);
  };

  const handleEditSubmit = () => {
    if (editingEventId && onEditEvent && editEvent.date && editEvent.title) {
      onEditEvent(editingEventId, editEvent);
      toast.success(`Event "${editEvent.title}" updated successfully`);
      setEditingEventId(null);
      setEditEvent({ date: "", title: "", description: "" });
      setShowForm(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEventId(null);
    setEditEvent({ date: "", title: "", description: "" });
    setNewEvent({ date: "", title: "", description: "" });
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <h2 className="text-base sm:text-lg">Case Timeline</h2>
          <HelpTooltip 
            content="Document every important event in your case chronologically. This creates a clear picture of what happened and when, which is crucial for identifying procedural violations and building your defense." 
            side="right"
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add a new event to your case timeline</TooltipContent>
        </Tooltip>
      </div>

      {events.length === 0 && !showForm && (
        <InfoBox title="Why Timeline Matters" variant="primary">
          <p className="mb-3">A detailed timeline is one of your most powerful defense tools:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>Exposes Procedural Violations:</strong> Shows missed deadlines and improper procedures</li>
            <li><strong>Reveals Inconsistencies:</strong> Highlights contradictions in CPS statements</li>
            <li><strong>Proves Your Case:</strong> Documents your cooperation and efforts</li>
            <li><strong>Court Presentation:</strong> Provides clear, organized evidence for hearings</li>
            <li><strong>Memory Aid:</strong> Helps you remember details months or years later</li>
          </ul>
          <p className="mt-3 text-xs italic">💡 Tip: Add events as they happen - don't wait. Include dates of visits, phone calls, court hearings, and any significant interactions with CPS.</p>
        </InfoBox>
      )}

      {showForm && (
        <Card className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate" className="text-sm">Date</Label>
            <Input
              id="eventDate"
              type="date"
              value={editingEventId ? editEvent.date : newEvent.date}
              onChange={(e) => editingEventId ? setEditEvent({ ...editEvent, date: e.target.value }) : setNewEvent({ ...newEvent, date: e.target.value })}
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTitle" className="text-sm">Event Title</Label>
            <Input
              id="eventTitle"
              value={editingEventId ? editEvent.title : newEvent.title}
              onChange={(e) => editingEventId ? setEditEvent({ ...editEvent, title: e.target.value }) : setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="e.g., Initial home visit"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDescription" className="text-sm">Description</Label>
            <Textarea
              id="eventDescription"
              value={editingEventId ? editEvent.description : newEvent.description}
              onChange={(e) => editingEventId ? setEditEvent({ ...editEvent, description: e.target.value }) : setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Event details..."
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={editingEventId ? handleEditSubmit : handleSubmit} className="w-full sm:w-auto" size="sm">
              {editingEventId ? 'Update Event' : 'Add Event'}
            </Button>
            <Button variant="outline" onClick={handleCancelForm} className="w-full sm:w-auto" size="sm">Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3 sm:space-y-4">
        {sortedEvents.length === 0 ? (
          <p className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">No timeline events yet. Add an event to get started.</p>
        ) : (
          sortedEvents.map((event, index) => (
            <div key={event.id} className="flex gap-2 sm:gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary" />
                {index < sortedEvents.length - 1 && (
                  <div className="w-0.5 h-full min-h-[50px] sm:min-h-[60px] bg-border" />
                )}
              </div>
              <Card className="flex-1 p-3 sm:p-4 mb-3 sm:mb-4 min-w-0">
                <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  {onDeleteEvent && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(event)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </DropdownMenuItem>
                        {onEditEvent && (
                          <DropdownMenuItem
                            onClick={() => handleEditClick(event)}
                            className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-950 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="text-sm sm:text-base font-medium mb-1">{event.title}</div>
                {event.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{event.description}</p>
                )}
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timeline Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{eventToDelete?.title}&quot;? This action cannot be undone and the event will be permanently removed from your case timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}