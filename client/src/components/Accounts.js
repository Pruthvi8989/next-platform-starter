import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, CreditCard, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AccountsContainer = styled.div`
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

const AddButton = styled.button`
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
`;

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const AccountCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'Bank': return '#e3b448';
      case 'Cash': return '#28a745';
      case 'Credit Card': return '#dc3545';
      case 'Investment': return '#6f42c1';
      case 'Loan': return '#fd7e14';
      default: return '#6c757d';
    }
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AccountName = styled.h3`
  color: #3a6b35;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const AccountType = styled.span`
  background-color: #f8f9fa;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const AccountBalance = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3a6b35;
  margin-bottom: 1rem;
`;

const AccountDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const AccountActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #e3b448;
    color: #3a6b35;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #adb5bd;
`;

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState('');

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get('/api/dashboards');
      if (response.data.length > 0) {
        setSelectedDashboard(response.data[0]._id);
        fetchAccounts(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async (dashboardId) => {
    try {
      const response = await axios.get(`/api/accounts/dashboard/${dashboardId}`);
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const handleDashboardChange = (dashboardId) => {
    setSelectedDashboard(dashboardId);
    fetchAccounts(dashboardId);
  };

  if (loading) {
    return (
      <AccountsContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
      </AccountsContainer>
    );
  }

  return (
    <AccountsContainer>
      <Header>
        <Title>Accounts</Title>
        <AddButton>
          <Plus size={20} />
          Add Account
        </AddButton>
      </Header>

      {accounts.length > 0 ? (
        <AccountsGrid>
          {accounts.map((account) => (
            <AccountCard key={account._id} type={account.accountType}>
              <AccountHeader>
                <AccountName>{account.accountName}</AccountName>
                <AccountType>{account.accountType}</AccountType>
              </AccountHeader>
              
              <AccountBalance>
                ₹{account.balance.toLocaleString()}
              </AccountBalance>
              
              {account.bankName && (
                <AccountDetails>
                  <div><strong>Bank:</strong> {account.bankName}</div>
                  {account.accountNumber && (
                    <div><strong>Account:</strong> {account.accountNumber}</div>
                  )}
                </AccountDetails>
              )}
              
              {account.description && (
                <AccountDetails>
                  {account.description}
                </AccountDetails>
              )}
              
              <AccountActions>
                <ActionButton>View Details</ActionButton>
                <ActionButton>Edit</ActionButton>
              </AccountActions>
            </AccountCard>
          ))}
        </AccountsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <CreditCard size={40} />
          </EmptyIcon>
          <h3>No accounts yet</h3>
          <p>Create your first account to start tracking your finances.</p>
        </EmptyState>
      )}
    </AccountsContainer>
  );
};

export default Accounts;