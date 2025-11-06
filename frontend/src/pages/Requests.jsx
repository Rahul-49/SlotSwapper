import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Alert } from 'react-bootstrap';
import client from '../api/client';
import SwapRequestList from '../shared/SwapRequestList.jsx';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setError('');
    try {
      const { data } = await client.get('/swap-requests');
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load requests');
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, action) => {
    setError('');
    setMessage('');
    try {
      await client.post(`/swap-response/${id}`, { action });
      setMessage(`Request ${action}ed`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to respond');
    }
  };

  return (
    <Row>
      <Col md={6} className="mb-3">
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Card.Title>Incoming Requests</Card.Title>
              <Button size="sm" variant="secondary" onClick={load}>Refresh</Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <SwapRequestList
              type="incoming"
              items={incoming}
              onAccept={(id) => respond(id, 'accept')}
              onReject={(id) => respond(id, 'reject')}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card>
          <Card.Body>
            <Card.Title>Outgoing Requests</Card.Title>
            <SwapRequestList type="outgoing" items={outgoing} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
