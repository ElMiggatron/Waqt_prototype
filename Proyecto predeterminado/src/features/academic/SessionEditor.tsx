import { useState } from 'react';
import { ScheduleSpec, SessionType } from '../../domain/types';
import { SchedulingInput } from '../../features/calendar/SchedulingInput';
import { RepeatMenu } from '../../features/calendar/RepeatMenu';
import { Button } from '../../components/Button';
import styles from './SessionEditor.module.css';

type Props = {
  onSave: (session: {
    type: SessionType;
    title: string;
    start: ScheduleSpec;
    end: ScheduleSpec;
    repeat: RepeatRule | null;
    notes: string;
  }) => void;
  onCancel: () => void;
};

export const SessionEditor = ({ onSave, onCancel }: Props) => {
  const [type, setType] = useState<SessionType>('class');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [start, setStart] = useState<ScheduleSpec>({
    kind: 'absolute',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    inputCalendar: 'gregorian'
  });
  
  const [end, setEnd] = useState<ScheduleSpec>({
    kind: 'absolute',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    inputCalendar: 'gregorian'
  });
  
  const [repeat, setRepeat] = useState<RepeatRule | null>(null);

  const handleSave = () => {
    if (!title) return;
    
    onSave({
      type,
      title,
      start,
      end,
      repeat,
      notes
    });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.inputGroup}>
        <label>Session Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as SessionType)}>
          <option value="class">Class</option>
          <option value="excursion">Excursion</option>
          <option value="exam">Exam</option>
          <option value="lab">Lab</option>
        </select>
      </div>
      
      <div className={styles.inputGroup}>
        <label>Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
        />
      </div>
      
      <div className={styles.scheduling}>
        <SchedulingInput 
          label="Start Time" 
          value={start} 
          onChange={setStart} 
        />
        <SchedulingInput 
          label="End Time" 
          value={end} 
          onChange={setEnd} 
        />
      </div>
      
      <RepeatMenu value={repeat} onChange={setRepeat} />
      
      <div className={styles.inputGroup}>
        <label>Notes</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes"
        />
      </div>
      
      <div className={styles.buttons}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Session</Button>
      </div>
    </div>
  );
};