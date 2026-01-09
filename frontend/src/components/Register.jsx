import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { Card, CardBody, Button, Input, Link, Form, Alert } from '@heroui/react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('API URL:', import.meta.env.VITE_API_URL);
    setSuccess(false);
    setLoading(true);

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
          
          {error && <Alert variant="faded" color="danger" title={error} />}
          {success && <Alert variant="faded" color="success" title="Registration successful! Redirecting to login..." />}
          
          <Form validationBehavior="native" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isRequired
              isDisabled={success}
              variant="bordered"
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              isRequired
              isDisabled={success}
              variant="bordered"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              description="Must be at least 6 characters"
              isRequired
              isDisabled={success}
              variant="bordered"
            />

            <Button
              type="submit"
              color="primary"
              variant="solid"
              isDisabled={loading || success}
              className="w-full"
            >
              {loading ? 'Registering...' : success ? 'Redirecting...' : 'Register'}
            </Button>
          </Form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link
                onPress={() => navigate('/login')}
                className="cursor-pointer font-semibold"
                color="primary"
              >
                Login
              </Link>
            </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Register;
