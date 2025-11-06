import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import client from '../api/client';
import { EVENT_STATUS } from '../constants';
import EventForm from '../shared/EventForm.jsx';
import EventList from '../shared/EventList.jsx';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const swappableCount = useMemo(() => events.filter(e => e.status === EVENT_STATUS.SWAPPABLE).length, [events]);

  const load = async () => {
    try {
      const { data } = await client.get('/events');
      setEvents(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load events');
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (payload) => {
    setError('');
    try {
      const { data } = await client.post('/events', payload);
      setEvents(prev => [...prev, data]);
      setEditing(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Create failed');
    }
  };

  const onUpdate = async (id, payload) => {
    setError('');
    try {
      const { data } = await client.put(`/events/${id}`, payload);
      setEvents(prev => prev.map(ev => ev._id === id ? data : ev));
      setEditing(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Update failed');
    }
  };

  const onDelete = async (id) => {
    setError('');
    try {
      await client.delete(`/events/${id}`);
      setEvents(prev => prev.filter(ev => ev._id !== id));
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  const toggleSwappable = (ev) => {
    const next = ev.status === EVENT_STATUS.SWAPPABLE ? EVENT_STATUS.BUSY : EVENT_STATUS.SWAPPABLE;
    onUpdate(ev._id, { status: next });
  };

  return (
    <Row>
      <Col md={5} className="mb-3">
        <Card>
          <Card.Body>
            <Card.Title>{editing ? 'Edit Event' : 'Create Event'}</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <EventForm
              initial={editing}
              onCancel={() => setEditing(null)}
              onSubmit={(data) => editing ? onUpdate(editing._id, data) : onCreate(data)}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={7}>
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Card.Title>My Events</Card.Title>
              <div className="text-muted">Swappable: {swappableCount}</div>
            </div>
            <EventList
              events={events}
              onEdit={setEditing}
              onDelete={onDelete}
              onToggleSwappable={toggleSwappable}
            />
            <Button variant="secondary" className="mt-2" onClick={load}>Refresh</Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
