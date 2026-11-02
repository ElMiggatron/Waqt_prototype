import { useState } from 'react';
import { ScheduleSpec } from '../../domain/types';
import { SchedulingInput } from '../../features/calendar/SchedulingInput';
import { RepeatMenu } from '../../features/calendar/RepeatMenu';
import { Button } from '../../components/Button';
import styles from './AcademicTaskForm.module.css';

type Props = {
  onSave: (task: {
    title: string;
    note: string;
    due: ScheduleSpec;
    draftDue: ScheduleSpec;
    repeat: RepeatRule | null;
  }) => void;
  onCancel: () => void;
};

export const AcademicTaskForm = ({ onSave, onCancel }: Props) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  
  const [due, setDue] = useState<ScheduleSpec>({
    kind: 'absolute',
    date: new Date().toISOString().split('T')[0],
    time: '17:00',
    inputCalendar: 'gregorian'
  });
  
  const [draftDue, setDraftDue] = useState<ScheduleSpec>({
    kind: 'absolute',
    date: new Date().toISOString().split('T')[0],
    time: '17:00',
    inputCalendar: 'gregorian'
  });
  
  const [repeat, setRepeat] = useState<RepeatRule | null>(null);

  const handleSave = () => {
    if (!title) return;
    
    onSave({
      title,
      note,
      due,
      draftDue,
      repeat
    });
  };

  return (
    <div className={styles.form}>
      <div className={styles.inputGroup}>
        <label>Task Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label>Notes</label>
        <textarea 
          value={note} 
          onChange={(e) => setNote(e.target.value)}
          placeholder="Task description"
        />
      </div>
      
      <div className={styles.scheduling}>
        <SchedulingInput 
          label="Draft Due" 
          value={draftDue} 
          onChange={setDraftDue} 
        />
        <SchedulingInput 
          label="Final Due" 
          value={due} 
          onChange={setDue} 
        />
      </div>
      
      <RepeatMenu value={repeat} onChange={setRepeat} />
      
      <div className={styles.buttons}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Task</Button>
      </div>
    </div>
  );
};