"use client";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";

const columns = [
  { id: "OPEN", title: "Open" },
  { id: "ASSIGNED", title: "Assigned" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "FIXED", title: "Fixed" },
  { id: "VERIFIED", title: "Verified" },
  { id: "CLOSED", title: "Closed" }
];

export function KanbanBoard({ bugs, onStatusChange, myRole, myUserId }: { bugs: any[], onStatusChange: (bugId: string, newStatus: string) => void, myRole: string, myUserId: string }) {
  const router = useRouter();
  const [boardData, setBoardData] = useState<Record<string, any[]>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const data: Record<string, any[]> = {};
    columns.forEach(c => data[c.id] = []);
    bugs.forEach(b => {
      if (data[b.status]) data[b.status].push(b);
      else data["OPEN"]?.push(b); // fallback
    });
    setBoardData(data);
  }, [bugs]);

  if (!mounted) return null; // Avoid hydration mismatch on DND

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      const sourceCol = [...boardData[source.droppableId]];
      const destCol = [...boardData[destination.droppableId]];
      const [moved] = sourceCol.splice(source.index, 1);
      destCol.splice(destination.index, 0, moved);
      setBoardData({
        ...boardData,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol
      });
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  const isDragDisabled = (bug: any) => {
    return myRole === 'TESTER' || (myRole === 'DEVELOPER' && bug?.assignedTo !== myUserId);
  };

  const severityColors: Record<string, string> = { CRITICAL: "bg-red-500", MAJOR: "bg-orange-500", MINOR: "bg-yellow-500", LOW: "bg-blue-500" };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[400px]">
        {columns.map(col => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`flex-shrink-0 w-[260px] rounded-xl bg-zinc-100 dark:bg-zinc-900/30 p-3 border border-zinc-200 dark:border-zinc-800 flex flex-col ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50' : ''}`}
              >
                <h3 className="font-semibold text-xs uppercase tracking-wider mb-3 text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  {col.title} <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-2 py-0">{boardData[col.id]?.length || 0}</Badge>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 min-h-[150px] pr-1 styled-scrollbar">
                  {boardData[col.id]?.map((bug, index) => (
                    <Draggable key={bug.id} draggableId={bug.id} index={index} isDragDisabled={isDragDisabled(bug)}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => router.push(`/bug/${bug.id}`)}
                          className={`bg-white dark:bg-zinc-950 p-3 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors ${isDragDisabled(bug) ? 'cursor-not-allowed opacity-60 hover:bg-zinc-50 dark:hover:bg-zinc-900/50' : 'cursor-grab active:cursor-grabbing hover:border-indigo-400 dark:hover:border-indigo-500'} ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 z-50' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">BUG-{bug.id.slice(0,4)}</span>
                            <Badge className={`${severityColors[bug.severity]} border-none text-white text-[9px] px-1.5 py-0 leading-tight`}>{bug.severity}</Badge>
                          </div>
                          <p className="font-medium text-[13px] text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 leading-snug">{bug.title}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
                                {bug.assignee?.name?.charAt(0) || '?'}
                              </div>
                              {bug.assignee?.name || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
