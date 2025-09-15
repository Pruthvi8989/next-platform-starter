import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Download, Share, Calendar, FileText, Send, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const StatementsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #3a6b35;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(227, 180, 72, 0.3);
  }

  &.secondary {
    background: linear-gradient(135deg, #cbd18f 0%, #3a6b35 100%);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  gap: 1rem;
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

const Select = styled.select`
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
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #e3b448;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ScheduleItem = styled.div`
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #e3b448;
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ScheduleName = styled.div`
  font-weight: 600;
  color: #3a6b35;
`;

const ScheduleFrequency = styled.span`
  background-color: #e3b448;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ScheduleDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const Statements = () => {
  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [statementForm, setStatementForm] = useState({
    startDate: '',
    endDate: '',
    format: 'pdf',
    accountIds: []
  });
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'monthly',
    recipients: [],
    format: 'pdf'
  });
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboards();
    fetchSchedules();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get('/api/dashboards');
      setDashboards(response.data);
      if (response.data.length > 0) {
        setSelectedDashboard(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    }
  };

  const fetchSchedules = async () => {
    try {
      // This would fetch scheduled statements from the API
      setSchedules([]);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleStatementSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/statements/generate', {
        dashboardId: selectedDashboard,
        ...statementForm
      }, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statement_${statementForm.startDate}_${statementForm.endDate}.${statementForm.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Statement generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating statement:', error);
      toast.error('Failed to generate statement');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/statements/schedule', {
        dashboardId: selectedDashboard,
        ...scheduleForm
      });

      toast.success('Statement schedule created successfully!');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleShareStatement = async () => {
    try {
      await axios.post('/api/statements/share', {
        dashboardId: selectedDashboard,
        startDate: statementForm.startDate,
        endDate: statementForm.endDate,
        recipients: ['+1234567890'], // This would come from a form
        message: 'Please find your statement attached.'
      });

      toast.success('Statement shared successfully!');
    } catch (error) {
      console.error('Error sharing statement:', error);
      toast.error('Failed to share statement');
    }
  };

  return (
    <StatementsContainer>
      <Header>
        <Title>Statements & Reports</Title>
        <ButtonGroup>
          <Button className="secondary">
            <Upload size={20} />
            Upload Statement
          </Button>
        </ButtonGroup>
      </Header>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <FileText size={24} />
            <SectionTitle>Generate Statement</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleStatementSubmit}>
            <FormGroup>
              <Label>Dashboard</Label>
              <Select
                value={selectedDashboard}
                onChange={(e) => setSelectedDashboard(e.target.value)}
                required
              >
                {dashboards.map((dashboard) => (
                  <option key={dashboard._id} value={dashboard._id}>
                    {dashboard.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={statementForm.startDate}
                onChange={(e) => setStatementForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>End Date</Label>
              <Input
                type="date"
                value={statementForm.endDate}
                onChange={(e) => setStatementForm(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Format</Label>
              <Select
                value={statementForm.format}
                onChange={(e) => setStatementForm(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </Select>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              ) : (
                <Download size={16} />
              )}
              Generate & Download
            </SubmitButton>
          </Form>
        </Section>

        <Section>
          <SectionHeader>
            <Calendar size={24} />
            <SectionTitle>Schedule Statements</SectionTitle>
          </SectionHeader>

          <Form onSubmit={handleScheduleSubmit}>
            <FormGroup>
              <Label>Frequency</Label>
              <Select
                value={scheduleForm.frequency}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Format</Label>
              <Select
                value={scheduleForm.format}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Recipients (WhatsApp Numbers)</Label>
              <Input
                type="text"
                placeholder="+1234567890, +0987654321"
                value={scheduleForm.recipients.join(', ')}
                onChange={(e) => setScheduleForm(prev => ({ 
                  ...prev, 
                  recipients: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                }))}
              />
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              ) : (
                <Send size={16} />
              )}
              Create Schedule
            </SubmitButton>
          </Form>

          {schedules.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#3a6b35' }}>Active Schedules</h4>
              <ScheduleList>
                {schedules.map((schedule) => (
                  <ScheduleItem key={schedule._id}>
                    <ScheduleHeader>
                      <ScheduleName>{schedule.dashboardName}</ScheduleName>
                      <ScheduleFrequency>{schedule.frequency}</ScheduleFrequency>
                    </ScheduleHeader>
                    <ScheduleDetails>
                      Format: {schedule.format.toUpperCase()} • 
                      Recipients: {schedule.recipients.length}
                    </ScheduleDetails>
                  </ScheduleItem>
                ))}
              </ScheduleList>
            </div>
          )}
        </Section>
      </ContentGrid>
    </StatementsContainer>
  );
};

export default Statements;