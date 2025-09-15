import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, Bell, Shield, Smartphone, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #3a6b35;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 2rem;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #3a6b35;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #3a6b35;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #e3b448;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #666;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e9ecef;
  }
`;

const CheckboxInfo = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.div`
  font-weight: 500;
  color: #3a6b35;
  margin-bottom: 0.25rem;
`;

const CheckboxDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #e3b448;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 180, 72, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    whatsappNumber: user?.whatsappNumber || ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    whatsapp: {
      enabled: true,
      billReminders: true,
      loginAlerts: true,
      statementAlerts: true
    },
    email: {
      enabled: false,
      billReminders: false,
      loginAlerts: false,
      statementAlerts: false
    }
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await axios.get('/api/notifications/settings');
      setNotificationSettings(response.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleUserSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would update user settings via API
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('/api/notifications/settings', notificationSettings);
      toast.success('Notification settings updated successfully!');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (type, setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: value
      }
    }));
  };

  return (
    <SettingsContainer>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your account preferences and notification settings</Subtitle>
      </Header>

      <SettingsGrid>
        <SettingsSection>
          <SectionHeader>
            <User size={24} />
            <SectionTitle>Profile Information</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleUserSettingsSubmit}>
            <UserInfo>
              <FormGroup>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={userSettings.phoneNumber}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>WhatsApp Number</Label>
                <Input
                  type="tel"
                  value={userSettings.whatsappNumber}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  required
                />
              </FormGroup>
            </UserInfo>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </Button>
          </Form>
        </SettingsSection>

        <SettingsSection>
          <SectionHeader>
            <Bell size={24} />
            <SectionTitle>Notification Settings</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleNotificationSettingsSubmit}>
            <CheckboxGroup>
              <CheckboxItem>
                <CheckboxInfo>
                  <CheckboxTitle>WhatsApp Notifications</CheckboxTitle>
                  <CheckboxDescription>
                    Receive notifications via WhatsApp
                  </CheckboxDescription>
                </CheckboxInfo>
                <Checkbox
                  type="checkbox"
                  checked={notificationSettings.whatsapp.enabled}
                  onChange={(e) => handleNotificationChange('whatsapp', 'enabled', e.target.checked)}
                />
              </CheckboxItem>

              {notificationSettings.whatsapp.enabled && (
                <>
                  <CheckboxItem>
                    <CheckboxInfo>
                      <CheckboxTitle>Bill Payment Reminders</CheckboxTitle>
                      <CheckboxDescription>
                        Get reminders for upcoming bill payments
                      </CheckboxDescription>
                    </CheckboxInfo>
                    <Checkbox
                      type="checkbox"
                      checked={notificationSettings.whatsapp.billReminders}
                      onChange={(e) => handleNotificationChange('whatsapp', 'billReminders', e.target.checked)}
                    />
                  </CheckboxItem>

                  <CheckboxItem>
                    <CheckboxInfo>
                      <CheckboxTitle>Login Alerts</CheckboxTitle>
                      <CheckboxDescription>
                        Get notified when your account is accessed
                      </CheckboxDescription>
                    </CheckboxInfo>
                    <Checkbox
                      type="checkbox"
                      checked={notificationSettings.whatsapp.loginAlerts}
                      onChange={(e) => handleNotificationChange('whatsapp', 'loginAlerts', e.target.checked)}
                    />
                  </CheckboxItem>

                  <CheckboxItem>
                    <CheckboxInfo>
                      <CheckboxTitle>Statement Alerts</CheckboxTitle>
                      <CheckboxDescription>
                        Get notified when statements are shared
                      </CheckboxDescription>
                    </CheckboxInfo>
                    <Checkbox
                      type="checkbox"
                      checked={notificationSettings.whatsapp.statementAlerts}
                      onChange={(e) => handleNotificationChange('whatsapp', 'statementAlerts', e.target.checked)}
                    />
                  </CheckboxItem>
                </>
              )}

              <CheckboxItem>
                <CheckboxInfo>
                  <CheckboxTitle>Email Notifications</CheckboxTitle>
                  <CheckboxDescription>
                    Receive notifications via email
                  </CheckboxDescription>
                </CheckboxInfo>
                <Checkbox
                  type="checkbox"
                  checked={notificationSettings.email.enabled}
                  onChange={(e) => handleNotificationChange('email', 'enabled', e.target.checked)}
                />
              </CheckboxItem>
            </CheckboxGroup>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              ) : (
                <Save size={16} />
              )}
              Save Notification Settings
            </Button>
          </Form>
        </SettingsSection>

        <SettingsSection>
          <SectionHeader>
            <Shield size={24} />
            <SectionTitle>Security</SectionTitle>
          </SectionHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: '#3a6b35', marginBottom: '0.25rem' }}>
                User ID
              </div>
              <div style={{ color: '#666', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                {user?.userId || '000000'}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontWeight: '500', color: '#3a6b35', marginBottom: '0.25rem' }}>
                Password
              </div>
              <div style={{ color: '#666' }}>
                ••••••••
              </div>
            </div>

            <Button type="button" style={{ alignSelf: 'flex-start' }}>
              Change Password
            </Button>
          </div>
        </SettingsSection>
      </SettingsGrid>
    </SettingsContainer>
  );
};

export default Settings;