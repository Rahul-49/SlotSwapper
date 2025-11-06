import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { EVENT_STATUS } from '../constants';

export default function EventForm({ initial, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState(EVENT_STATUS.BUSY);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setStartTime(initial.startTime ? new Date(initial.startTime).toISOString().slice(0, 16) : '');
      setEndTime(initial.endTime ? new Date(initial.endTime).toISOString().slice(0, 16) : '');
      setStatus(initial.status || EVENT_STATUS.BUSY);
    } else {
      setTitle('');
      setStartTime('');
      setEndTime('');
      setStatus(EVENT_STATUS.BUSY);
    }
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status,
    };
    onSubmit(payload);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-2">
        <Form.Label>Title</Form.Label>
        <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Start Time</Form.Label>
        <Form.Control type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>End Time</Form.Label>
        <Form.Control type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value={EVENT_STATUS.BUSY}>Busy</option>
          <option value={EVENT_STATUS.SWAPPABLE}>Swappable</option>
        </Form.Select>
      </Form.Group>
      <div className="d-flex gap-2">
        <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
        {initial && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </Form>
  );
}
