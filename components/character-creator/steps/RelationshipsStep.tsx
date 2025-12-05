'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Plus,
  X,
  ChevronDown,
  UserPlus,
  CalendarPlus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { StepContainer } from '../StepContainer';
import { useWizard } from '../WizardShell';
import type {
  ImportantPersonData,
  ImportantEventData,
  RelationshipType,
  ImportanceLevel,
  EventType,
  EventPriority,
} from '@/types/character-creation';

/**
 * RelationshipsStep - Step 6: Important people and events
 *
 * Collects:
 * - Important people (family, friends, rivals, etc.)
 * - Important events (past events that shaped the character)
 */

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'sister', label: 'Sister' },
  { value: 'brother', label: 'Brother' },
  { value: 'child', label: 'Child' },
  { value: 'partner', label: 'Partner' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'ex-partner', label: 'Ex-Partner' },
  { value: 'best-friend', label: 'Best Friend' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'rival', label: 'Rival' },
  { value: 'pet', label: 'Pet' },
  { value: 'other', label: 'Other' },
];

const IMPORTANCE_LEVELS: { value: ImportanceLevel; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

const EVENT_TYPES: { value: EventType | string; label: string }[] = [
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'trauma', label: 'Traumatic Event' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'loss', label: 'Loss' },
  { value: 'milestone', label: 'Life Milestone' },
  { value: 'relationship', label: 'Relationship Event' },
  { value: 'career', label: 'Career Event' },
  { value: 'other', label: 'Other' },
];

const EVENT_PRIORITIES: { value: EventPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Empty person template
const emptyPerson: ImportantPersonData = {
  name: '',
  relationship: 'friend',
  importance: 'medium',
};

// Empty event template
const emptyEvent: ImportantEventData = {
  title: '',
  type: 'milestone',
  description: '',
  eventDate: new Date().toISOString().split('T')[0],
  priority: 'medium',
};

export function RelationshipsStep() {
  const { characterDraft, updateCharacter } = useWizard();
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);

  // Dialog states
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);

  // Form states
  const [personForm, setPersonForm] = useState<ImportantPersonData>(emptyPerson);
  const [eventForm, setEventForm] = useState<ImportantEventData>(emptyEvent);

  // Get current data
  const importantPeople = characterDraft.importantPeople || [];
  const importantEvents = characterDraft.importantEvents || [];

  // Person CRUD
  const openAddPerson = () => {
    setPersonForm(emptyPerson);
    setEditingPersonIndex(null);
    setPersonDialogOpen(true);
  };

  const openEditPerson = (index: number) => {
    setPersonForm(importantPeople[index]);
    setEditingPersonIndex(index);
    setPersonDialogOpen(true);
  };

  const savePerson = useCallback(() => {
    if (!personForm.name.trim()) return;

    const newPeople = [...importantPeople];
    if (editingPersonIndex !== null) {
      newPeople[editingPersonIndex] = personForm;
    } else {
      newPeople.push(personForm);
    }

    updateCharacter({ importantPeople: newPeople });
    setPersonDialogOpen(false);
    setPersonForm(emptyPerson);
  }, [personForm, editingPersonIndex, importantPeople, updateCharacter]);

  const deletePerson = useCallback(
    (index: number) => {
      const newPeople = [...importantPeople];
      newPeople.splice(index, 1);
      updateCharacter({ importantPeople: newPeople });
    },
    [importantPeople, updateCharacter]
  );

  // Event CRUD
  const openAddEvent = () => {
    setEventForm(emptyEvent);
    setEditingEventIndex(null);
    setEventDialogOpen(true);
  };

  const openEditEvent = (index: number) => {
    setEventForm(importantEvents[index]);
    setEditingEventIndex(index);
    setEventDialogOpen(true);
  };

  const saveEvent = useCallback(() => {
    if (!eventForm.description.trim()) return;

    const newEvents = [...importantEvents];
    if (editingEventIndex !== null) {
      newEvents[editingEventIndex] = eventForm;
    } else {
      newEvents.push(eventForm);
    }

    updateCharacter({ importantEvents: newEvents });
    setEventDialogOpen(false);
    setEventForm(emptyEvent);
  }, [eventForm, editingEventIndex, importantEvents, updateCharacter]);

  const deleteEvent = useCallback(
    (index: number) => {
      const newEvents = [...importantEvents];
      newEvents.splice(index, 1);
      updateCharacter({ importantEvents: newEvents });
    },
    [importantEvents, updateCharacter]
  );

  return (
    <StepContainer
      title="Relationships & History"
      description="Add important people and events that shaped your character's life. These will influence how the character remembers and interacts."
    >
      <div className="space-y-6">
        {/* Important People Section */}
        <Collapsible open={peopleOpen} onOpenChange={setPeopleOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Important People</span>
                <Badge variant="secondary" className="ml-2">
                  {importantPeople.length}
                </Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${peopleOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-3">
              {/* People list */}
              <AnimatePresence>
                {importantPeople.map((person, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          IMPORTANCE_LEVELS.find((l) => l.value === person.importance)?.color
                        }`}
                      />
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {RELATIONSHIP_TYPES.find((r) => r.value === person.relationship)?.label ||
                            person.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditPerson(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePerson(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add person button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={openAddPerson}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Important Events Section */}
        <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Important Events</span>
                <Badge variant="secondary" className="ml-2">
                  {importantEvents.length}
                </Badge>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${eventsOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <div className="space-y-3">
              {/* Events list */}
              <AnimatePresence>
                {importantEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {event.title ||
                          EVENT_TYPES.find((t) => t.value === event.type)?.label ||
                          event.type}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof event.eventDate === 'string'
                          ? event.eventDate
                          : new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditEvent(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEvent(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add event button */}
              <Button variant="outline" className="w-full" onClick={openAddEvent}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Add/Edit Person Dialog */}
      <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPersonIndex !== null ? 'Edit Person' : 'Add Important Person'}
            </DialogTitle>
            <DialogDescription>
              Add someone important in your character's life.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Name *</Label>
              <Input
                id="personName"
                value={personForm.name}
                onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                placeholder="Person's name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={personForm.relationship as string}
                  onValueChange={(value) =>
                    setPersonForm({ ...personForm, relationship: value as RelationshipType })
                  }
                >
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={personForm.importance}
                  onValueChange={(value) =>
                    setPersonForm({ ...personForm, importance: value as ImportanceLevel })
                  }
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPORTANCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personDescription">Description</Label>
              <Textarea
                id="personDescription"
                value={personForm.description || ''}
                onChange={(e) => setPersonForm({ ...personForm, description: e.target.value })}
                placeholder="Describe this person and their relationship to the character..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePerson} disabled={!personForm.name.trim()}>
              {editingPersonIndex !== null ? 'Save Changes' : 'Add Person'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEventIndex !== null ? 'Edit Event' : 'Add Important Event'}
            </DialogTitle>
            <DialogDescription>
              Add a significant event that shaped your character.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="eventTitle">Title (Optional)</Label>
              <Input
                id="eventTitle"
                value={eventForm.title || ''}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Type *</Label>
                <Select
                  value={eventForm.type as string}
                  onValueChange={(value) => setEventForm({ ...eventForm, type: value })}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventPriority">Priority</Label>
                <Select
                  value={eventForm.priority}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, priority: value as EventPriority })
                  }
                >
                  <SelectTrigger id="eventPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={
                  typeof eventForm.eventDate === 'string'
                    ? eventForm.eventDate.split('T')[0]
                    : ''
                }
                onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDescription">Description *</Label>
              <Textarea
                id="eventDescription"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Describe this event and its impact on the character..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEvent} disabled={!eventForm.description.trim()}>
              {editingEventIndex !== null ? 'Save Changes' : 'Add Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StepContainer>
  );
}
