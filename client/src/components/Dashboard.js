import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: #e3b448;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e3b448 0%, #cbd18f 50%, #3a6b35 100%);
  }
`;

const DashboardName = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a6b35;
  margin-bottom: 1rem;
  text-align: center;
`;

const DashboardStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #3a6b35;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DashboardDescription = styled.p`
  color: #666;
  text-align: center;
  font-size: 0.9rem;
  margin: 0;
`;

const CreateDashboardCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px dashed #cbd18f;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;

  &:hover {
    border-color: #e3b448;
    background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
    transform: translateY(-4px);
  }
`;

const CreateIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const CreateText = styled.h3`
  color: #3a6b35;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CreateSubtext = styled.p`
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const QuickStatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const QuickStatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${props => {
    switch (props.type) {
      case 'income': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      case 'expense': return 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
      case 'balance': return 'linear-gradient(135deg, #e3b448 0%, #cbd18f 100%)';
      case 'bills': return 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)';
      default: return 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)';
    }
  }};
`;

const QuickStatContent = styled.div`
  flex: 1;
`;

const QuickStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a6b35;
  margin-bottom: 0.25rem;
`;

const QuickStatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const Dashboard = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
    pendingBills: 0
  });
  const navigate = useNavigate();

  const dashboardOptions = [
    { name: 'Pruthvi', description: 'Personal and business accounts for Pruthvi' },
    { name: 'Nirav', description: 'Financial management for Nirav' },
    { name: 'Mitesh', description: 'Accounting dashboard for Mitesh' },
    { name: 'Other', description: 'General purpose accounting dashboard' },
    { name: 'Apexture', description: 'Main company accounting dashboard' },
    { name: 'MGC', description: 'MGC business accounts and transactions' }
  ];

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get('/api/dashboards');
      setDashboards(response.data);
      
      // Calculate quick stats
      let totalIncome = 0;
      let totalExpenses = 0;
      let totalBalance = 0;
      let pendingBills = 0;

      for (const dashboard of response.data) {
        const dashboardResponse = await axios.get(`/api/dashboards/${dashboard._id}`);
        const summary = dashboardResponse.data.summary;
        
        totalIncome += summary.monthlyIncome;
        totalExpenses += summary.monthlyExpenses;
        totalBalance += summary.totalBalance;
        pendingBills += summary.pendingBillsCount;
      }

      setQuickStats({
        totalIncome,
        totalExpenses,
        totalBalance,
        pendingBills
      });
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const createDashboard = async (dashboardName) => {
    try {
      const response = await axios.post('/api/dashboards', {
        name: dashboardName,
        description: dashboardOptions.find(d => d.name === dashboardName)?.description || ''
      });
      
      setDashboards(prev => [...prev, response.data]);
      toast.success(`${dashboardName} dashboard created successfully!`);
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast.error('Failed to create dashboard');
    }
  };

  const handleDashboardClick = (dashboard) => {
    navigate(`/dashboard/${dashboard._id}`);
  };

  const getAvailableDashboards = () => {
    const existingNames = dashboards.map(d => d.name);
    return dashboardOptions.filter(d => !existingNames.includes(d.name));
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome to Apexture</WelcomeTitle>
        <WelcomeSubtitle>Your comprehensive accounting solution</WelcomeSubtitle>
      </WelcomeSection>

      <QuickStats>
        <QuickStatCard>
          <QuickStatIcon type="income">
            <TrendingUp size={24} />
          </QuickStatIcon>
          <QuickStatContent>
            <QuickStatValue>₹{quickStats.totalIncome.toLocaleString()}</QuickStatValue>
            <QuickStatLabel>Total Income</QuickStatLabel>
          </QuickStatContent>
        </QuickStatCard>

        <QuickStatCard>
          <QuickStatIcon type="expense">
            <TrendingDown size={24} />
          </QuickStatIcon>
          <QuickStatContent>
            <QuickStatValue>₹{quickStats.totalExpenses.toLocaleString()}</QuickStatValue>
            <QuickStatLabel>Total Expenses</QuickStatLabel>
          </QuickStatContent>
        </QuickStatCard>

        <QuickStatCard>
          <QuickStatIcon type="balance">
            <DollarSign size={24} />
          </QuickStatIcon>
          <QuickStatContent>
            <QuickStatValue>₹{quickStats.totalBalance.toLocaleString()}</QuickStatValue>
            <QuickStatLabel>Total Balance</QuickStatLabel>
          </QuickStatContent>
        </QuickStatCard>

        <QuickStatCard>
          <QuickStatIcon type="bills">
            <AlertTriangle size={24} />
          </QuickStatIcon>
          <QuickStatContent>
            <QuickStatValue>{quickStats.pendingBills}</QuickStatValue>
            <QuickStatLabel>Pending Bills</QuickStatLabel>
          </QuickStatContent>
        </QuickStatCard>
      </QuickStats>

      <DashboardGrid>
        {dashboards.map((dashboard) => (
          <DashboardCard
            key={dashboard._id}
            onClick={() => handleDashboardClick(dashboard)}
          >
            <DashboardName>{dashboard.name}</DashboardName>
            <DashboardStats>
              <StatItem>
                <StatValue>₹0</StatValue>
                <StatLabel>Balance</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>0</StatValue>
                <StatLabel>Accounts</StatLabel>
              </StatItem>
            </DashboardStats>
            <DashboardDescription>
              {dashboard.description}
            </DashboardDescription>
          </DashboardCard>
        ))}

        {getAvailableDashboards().map((dashboard) => (
          <CreateDashboardCard
            key={dashboard.name}
            onClick={() => createDashboard(dashboard.name)}
          >
            <CreateIcon>
              <Plus size={24} />
            </CreateIcon>
            <CreateText>Create {dashboard.name}</CreateText>
            <CreateSubtext>{dashboard.description}</CreateSubtext>
          </CreateDashboardCard>
        ))}
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;