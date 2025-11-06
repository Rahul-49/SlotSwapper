import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import client from '../api/client';
import EventList from '../shared/EventList.jsx';

export default function Marketplace() {
  const [myEvents, setMyEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedMy, setSelectedMy] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setError('');
    try {
      const [myRes, slotsRes] = await Promise.all([
        client.get('/events'),
        client.get('/swappable-slots'),
      ]);
      setMyEvents(myRes.data);
      setSlots(slotsRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load marketplace');
    }
  };

  useEffect(() => { load(); }, []);

  const requestSwap = async (requestedEventId) => {
    setError('');
    setMessage('');
    if (!selectedMy) return setError('Select one of your events first');
    try {
      await client.post('/swap-request', { requesterEventId: selectedMy._id, requestedEventId });
      setMessage('Swap request sent');
    } catch (e) {
      setError(e?.response?.data?.message || 'Swap request failed');
    }
  };

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Card>
          <Card.Body>
            <Card.Title>Select My Event</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <EventList
              events={myEvents}
              selectable
              selectedId={selectedMy?._id}
              onSelect={setSelectedMy}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Card.Title>Swappable Slots</Card.Title>
              <Button variant="secondary" size="sm" onClick={load}>Refresh</Button>
            </div>
            <table className="table table-bordered table-hover table-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Start</th>
                  <th>End</th>
                  <th style={{width: 120}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((ev) => (
                  <tr key={ev._id}>
                    <td>{ev.title}</td>
                    <td>{new Date(ev.startTime).toLocaleString()}</td>
                    <td>{new Date(ev.endTime).toLocaleString()}</td>
                    <td>
                      <Button size="sm" onClick={() => requestSwap(ev._id)} disabled={!selectedMy}>
                        Request Swap
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
