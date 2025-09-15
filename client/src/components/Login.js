import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 50%, #3a6b35 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.h1`
  color: #3a6b35;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  text-align: center;
  letter-spacing: 0.2em;

  &:focus {
    outline: none;
    border-color: #e3b448;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(227, 180, 72, 0.1);
  }

  &::placeholder {
    color: #999;
    letter-spacing: normal;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #e3b448 0%, #d4a23a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(227, 180, 72, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RegisterLink = styled.p`
  margin-top: 1.5rem;
  color: #666;
  font-size: 0.9rem;

  a {
    color: #e3b448;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict input length for userId and password
    if (name === 'userId' && value.length > 6) return;
    if (name === 'password' && value.length > 4) return;
    
    // Only allow numbers for userId and password
    if ((name === 'userId' || name === 'password') && !/^\d*$/.test(value)) return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.userId, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      userId: '',
      password: '',
      name: '',
      email: '',
      phoneNumber: '',
      whatsappNumber: ''
    });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>Apexture</Logo>
        <Subtitle>
          {isLogin ? 'Welcome back to your accounting dashboard' : 'Create your accounting account'}
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              name="userId"
              placeholder="6-digit User ID"
              value={formData.userId}
              onChange={handleChange}
              maxLength="6"
              required
            />
          </InputGroup>

          <InputGroup>
            <Input
              type="password"
              name="password"
              placeholder="4-digit Password"
              value={formData.password}
              onChange={handleChange}
              maxLength="4"
              required
            />
          </InputGroup>

          {!isLogin && (
            <>
              <InputGroup>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <Input
                  type="tel"
                  name="whatsappNumber"
                  placeholder="WhatsApp Number"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </Form>

        <RegisterLink>
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                Register here
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                Sign in here
              </a>
            </>
          )}
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;