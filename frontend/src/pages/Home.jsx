import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { token } = useAuth();
  return (
    <Card className="mx-auto" style={{ maxWidth: 640 }}>
      <Card.Body>
        <Card.Title>Welcome to SlotSwapper</Card.Title>
        <Card.Text>
          Swap your time slots with peers. Create your schedule, mark swappable slots, and request swaps from the marketplace.
        </Card.Text>
        {!token ? (
          <div className="d-flex gap-2">
            <Button as={Link} to="/login">Login</Button>
            <Button as={Link} to="/signup" variant="secondary">Sign Up</Button>
          </div>
        ) : (
          <Button as={Link} to="/dashboard">Go to Dashboard</Button>
        )}
      </Card.Body>
    </Card>
  );
}
