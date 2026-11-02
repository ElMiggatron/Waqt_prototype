import { useState, useEffect } from 'react';
import { useAcademicStore } from '../../stores/academicStore';
import { ScheduleSpec, RepeatRule } from '../../domain/types';
import { SessionEditor } from './SessionEditor';
import { AcademicTaskForm } from './AcademicTaskForm';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
  const handleAddSubject = () => {
    if (!validateSubject()) return;
    
    const newSubject: Omit<AcademicSubject, 'id' | 'createdAt' | 'updatedAt'> = {
      name: subjectInput.name,
      gradeLevel: subjectInput.gradeLevel,
      termCount: Math.max(1, subjectInput.termCount),
      sessions: [],
      sortOrder: subjects.length,
    };
    
    addSubject(newSubject);
    setSubjectInput({ name: '', gradeLevel: '', termCount: 1 });
  };

  const handleSessionAdded = (sessionData: {
    type: 'class' | 'excursion' | 'exam' | 'lab';
    title: string;
    start: ScheduleSpec;
    end: ScheduleSpec;
    repeat: RepeatRule | null;
    notes: string;
  }) => {
    if (!activeSubject) return;
    
    addSession({
      subjectId: activeSubject.id,
      ...sessionData
    });
    setShowSessionDialog(false);
  };

  const handleTaskAdded = (taskData: {
    title: string;
    note: string;
    due: ScheduleSpec;
    draftDue: ScheduleSpec;
    repeat: RepeatRule | null;
  }) => {
    if (!activeSubject) return;
    
    addTask({
      subjectId: activeSubject.id,
      ...taskData
    });
    setShowTaskDialog(false);
  };