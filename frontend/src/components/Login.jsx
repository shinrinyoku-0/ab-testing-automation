import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/api';
import { Card, CardBody, Button, Input, Link, Form, Alert } from '@heroui/react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await login(formData.username, formData.password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          
          {error && <Alert variant="faded" color="danger" title={error} className="mb-4" />}
          {success && <Alert variant="faded" color="success" title={success} className="mb-4" />}
          
          <Form validationBehavior="native" onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              isRequired
              variant="bordered"
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              isRequired
              variant="bordered"
            />
            
            <Button
              type="submit"
              color="primary"
              variant="solid"
              isDisabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link
              onPress={() => navigate('/register')}
              className="cursor-pointer"
              color="primary"
            >
              Register
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
