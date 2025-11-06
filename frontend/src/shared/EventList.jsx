import { Button, Table, Badge } from 'react-bootstrap';
import { EVENT_STATUS } from '../constants';

const StatusBadge = ({ status }) => {
  const variant = status === EVENT_STATUS.SWAPPABLE ? 'success' : status === EVENT_STATUS.SWAP_PENDING ? 'warning' : 'secondary';
  return <Badge bg={variant}>{status}</Badge>;
};

export default function EventList({ events, onEdit, onDelete, onToggleSwappable, selectable = false, selectedId, onSelect }) {
  return (
    <Table bordered hover size="sm">
      <thead>
        <tr>
          {selectable && <th style={{width: 44}}></th>}
          <th>Title</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
          {onEdit && <th style={{width: 220}}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {events.map(ev => (
          <tr key={ev._id}>
            {selectable && (
              <td>
                <input type="radio" checked={selectedId === ev._id} onChange={() => onSelect?.(ev)} />
              </td>
            )}
            <td>{ev.title}</td>
            <td>{new Date(ev.startTime).toLocaleString()}</td>
            <td>{new Date(ev.endTime).toLocaleString()}</td>
            <td><StatusBadge status={ev.status} /></td>
            {onEdit && (
              <td>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => onEdit(ev)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(ev._id)}>Delete</Button>
                  <Button size="sm" variant="secondary" onClick={() => onToggleSwappable(ev)}>
                    {ev.status === EVENT_STATUS.SWAPPABLE ? 'Mark Busy' : 'Make Swappable'}
                  </Button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
