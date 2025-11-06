import { Button, Badge, Card } from 'react-bootstrap';
import { SWAP_STATUS } from '../constants';

export default function SwapRequestList({ items, type, onAccept, onReject }) {
  if (!items?.length) {
    return <div className="text-muted">No {type === 'incoming' ? 'incoming' : 'outgoing'} requests.</div>;
  }

  const badgeVariant = (status) =>
    status === SWAP_STATUS.PENDING ? 'warning' : status === SWAP_STATUS.ACCEPTED ? 'success' : 'secondary';

  const fmt = (dt) => new Date(dt).toLocaleString();

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((req) => {
        const myEv = type === 'incoming' ? req.requestedEventId : req.requesterEventId;
        const otherEv = type === 'incoming' ? req.requesterEventId : req.requestedEventId;
        return (
          <Card key={req._id} className="w-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-2">
                <Card.Title className="h6 mb-0 text-wrap">Swap Request</Card.Title>
                <Badge bg={badgeVariant(req.status)}>{req.status}</Badge>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-12 col-md-6">
                  <div className="fw-semibold small text-uppercase text-muted">My Event</div>
                  <div className="text-wrap fw-semibold">{myEv?.title || '-'}</div>
                  <div className="text-muted small text-wrap">
                    {myEv ? `${fmt(myEv.startTime)} - ${fmt(myEv.endTime)}` : '-'}
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="fw-semibold small text-uppercase text-muted">Other Event</div>
                  <div className="text-wrap fw-semibold">{otherEv?.title || '-'}</div>
                  <div className="text-muted small text-wrap">
                    {otherEv ? `${fmt(otherEv.startTime)} - ${fmt(otherEv.endTime)}` : '-'}
                  </div>
                </div>
              </div>

              {type === 'incoming' && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => onAccept(req._id)}
                    disabled={req.status !== SWAP_STATUS.PENDING}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onReject(req._id)}
                    disabled={req.status !== SWAP_STATUS.PENDING}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
}
