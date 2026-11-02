# Module 3 — Academic and Intellectual

The Academic and Intellectual modules are now rendered by two reusable panels. The
Projects view reuses the intellectual panel with a different root filter, and the
sidebar only exposes Projects while at least one greater subject has `isProject = true`.

## Component structure

```
src/features/academic/
├── AcademicPanel.tsx            # route container, subject list, empty state
├── AcademicSubjectForm.tsx      # name / duration in terms / grade
├── AcademicSubjectCard.tsx      # subject setup, sessions, academic tasks
├── AcademicTaskForm.tsx         # title + draft due + final due
├── SessionEditor.tsx            # class / excursion / exam / lab dialog
├── academicScheduling.ts        # class date derivation + schedule comparison
├── AcademicPanel.module.css
└── AcademicsView.tsx            # routing wrapper -> <AcademicPanel />

src/features/intellectual/
├── IntellectualPanel.tsx        # container; mode = "intellectual" | "projects"
├── SubjectTreeNode.tsx          # recursive tree node, tasks, project switch
├── IntellectualPanel.module.css
└── IntellectualView.tsx         # routing wrapper -> mode="intellectual"

src/features/projects/
└── ProjectsView.tsx             # routing wrapper -> <IntellectualPanel mode="projects" />
```

### Academic flow

```
AcademicPanel
└── AcademicSubjectCard (one per subject)
    ├── AcademicSubjectForm             (create subject)
    ├── SessionEditor                   (create/edit/delete session)
    │   ├── two time inputs             (class only, no monthly calendar)
    │   ├── two TaskScheduleField       (excursion / exam / lab, pop-up calendar)
    │   └── RepeatMenu                  (staged weekday / monthly rule)
    └── AcademicTaskForm + task rows     (draft due / final due, no list move)
```

- `class`: the monthly calendar is hidden. `start.date` and `end.date` are derived by
  `firstWeekdayOnOrAfter()` from the earliest selected repeat weekday, and only the two
  time inputs are shown.
- `excursion`, `exam`, `lab`: both scheduling checks use `TaskScheduleField`, which
  reveals the embedded monthly calendar. The end instant must be later than the start.
- Repeat edits stay staged in `RepeatMenu` until **Confirm**; **Discard** restores the
  committed rule.
- Academic tasks are stored with `subjectId`, show both due dates, and deliberately have
  no move-to-list action. The panel states this under the task list.

### Intellectual flow

```
IntellectualPanel (mode)
└── SubjectTreeNode (recursive, depth 0 = greater subject)
    ├── collapse / expand                 (uiStore.collapsedSubjectIds)
    ├── project switch                    (root nodes only)
    ├── tasks (+ task form)               (any depth)
    ├── nested subject form               (childSubject.parentId = node.id)
    └── SubjectTreeNode[]                 (depth + 1)
```

- The flat `IntellectualSubject[]` adjacency list is converted with
  `buildSubjectTree()` from `src/lib/subjectTree.ts`.
- Any node can own tasks. Deleting a subject cascade-deletes its descendants and their
  tasks through `collectSubtreeIds()`.
- The Project switch appears only on roots. Turning it on moves the root from
  **Intellectual** to **Projects**; turning it off moves it back. Descendants inherit
  their root's placement because they are rendered inside the root.
- The tree is soft-limited to `MAX_SUBJECT_DEPTH` levels by the UI; the model itself has
  no depth limit.

## Routing integration

Navigation already uses the Zustand `activeView` union:

| `WorkspaceView` | Rendered component |
| --- | --- |
| `{ kind: 'academics' }` | `AcademicsView` → `AcademicPanel` |
| `{ kind: 'intellectual' }` | `IntellectualView` → `IntellectualPanel mode="intellectual"` |
| `{ kind: 'projects' }` | `ProjectsView` → `IntellectualPanel mode="projects"` |

`MainDisplay` needs no changes beyond the view imports it already has. `Sidebar` reads
`useIntellectualStore` and hides the Projects button when no root has `isProject`.

## Store contract

Both stores are still in-memory Zustand placeholders; no persistence layer was added.

```ts
useAcademicStore:
  subjects, tasks
  addSubject({ name, gradeLevel, termCount })
  deleteSubject(subjectId)                  // also removes its tasks
  saveSession(subjectId, input, sessionId?) // creates or updates
  deleteSession(subjectId, sessionId)
  addTask(subjectId, title, draftDue, finalDue)
  toggleTask(taskId), deleteTask(taskId), reset()

useIntellectualStore:
  subjects, tasks
  addSubject({ name, description, parentId, isProject? })
  deleteSubject(subjectId)                  // cascade
  setProject(subjectId, isProject)          // roots only
  addTask(subjectId, title)
  toggleTask(taskId), deleteTask(taskId), reset()
```

## Validation rules

- Subject: name, grade and a whole-number term count of at least 1.
- Class session: both times are required, the end must be after the start, and at least
  one weekday or the monthly option must be confirmed in Repeat.
- Excursion / exam / lab: both dates and times are required, and the end must be after
  the start.
- Academic task: a title is required, and the draft due instant cannot be after the
  final due instant.
- Intellectual subject: a name is required at both root and nested levels.

## Deviations from the shared standards (documented)

1. **Scheduling types.** This codebase stores `TaskSchedule { date, time }` and
   `TaskRepeat { days, monthly }`. The standards describe `ScheduleSpec` / `RepeatRule`.
   The panels isolate the difference in `academicScheduling.ts`, so a later repository
   layer can map the simplified shapes to the canonical ones.
2. **Subject tasks.** `SubjectTask` is a lighter local model than the standards' `Task`
   with `subjectRef` and `draftDue`. It preserves the key invariants that matter here:
   subject ownership, two due dates for academic work, and no list move.
3. **Collapse state.** Collapsed subjects live in `uiStore.collapsedSubjectIds`, never on
   the entity, as required by §2.7.
4. **Persistence.** Seeded data is session-only. Dexie, repository validators, and
   cross-store moves are still pending.

## Manual verification checklist

1. Add a subject with name, terms and grade; empty or `0` terms is rejected.
2. Add a class: no month grid, times required, Confirm a weekday, save; the row shows
   the derived repeat summary.
3. Add an exam: the Starts / Ends pickers reveal the monthly calendar; an end before the
   start is rejected.
4. Add an academic task with draft and final dates; confirm the final-before-draft guard
   and that no list-move control exists.
5. Add a greater subject, nest a subject several levels deep, and add tasks at multiple
   depths.
6. Collapse and expand a subject; the body (tasks + children) hides and restores.
7. Toggle Project on a root: it disappears from Intellectual, appears under Projects,
   and the Projects sidebar entry disappears when no project roots remain.
