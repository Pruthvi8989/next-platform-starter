import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CreditCard, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DashboardDetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const DashboardSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${props => {
    switch (props.type) {
      case 'balance': return 'linear-gradient(135deg, #e3b448 0%, #cbd18f 100%)';
      case 'income': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
      case 'expense': return 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
      case 'accounts': return 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)';
      case 'bills': return 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)';
      default: return 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)';
    }
  }};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #3a6b35;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
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
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #3a6b35;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #e3b448 0%, #cbd18f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 180, 72, 0.3);
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid ${props => props.type === 'Income' ? '#28a745' : '#dc3545'};
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: 500;
  color: #3a6b35;
  margin-bottom: 0.25rem;
`;

const TransactionDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const TransactionAmount = styled.div`
  font-weight: bold;
  color: ${props => props.type === 'Income' ? '#28a745' : '#dc3545'};
`;

const BillList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BillItem = styled.div`
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'Pending': return '#ffc107';
      case 'Paid': return '#28a745';
      case 'Overdue': return '#dc3545';
      default: return '#6c757d';
    }
  }};
`;

const BillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const BillName = styled.div`
  font-weight: 500;
  color: #3a6b35;
`;

const BillAmount = styled.div`
  font-weight: bold;
  color: #3a6b35;
`;

const BillDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  justify-content: space-between;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const DashboardDetail = () => {
  const { id } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);

  useEffect(() => {
    if (id) {
      fetchDashboardDetail();
    }
  }, [id]);

  const fetchDashboardDetail = async () => {
    try {
      const response = await axios.get(`/api/dashboards/${id}`);
      const data = response.data;
      
      setDashboard(data.dashboard);
      setSummary(data.summary);
      setAccounts(data.accounts);
      setRecentTransactions(data.recentTransactions);
      setPendingBills(data.pendingBills);
    } catch (error) {
      console.error('Error fetching dashboard detail:', error);
      toast.error('Failed to load dashboard details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardDetailContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
      </DashboardDetailContainer>
    );
  }

  if (!dashboard) {
    return (
      <DashboardDetailContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Dashboard not found</h2>
          <p>The requested dashboard could not be found.</p>
        </div>
      </DashboardDetailContainer>
    );
  }

  return (
    <DashboardDetailContainer>
      <Header>
        <DashboardTitle>{dashboard.name}</DashboardTitle>
        <DashboardSubtitle>{dashboard.description}</DashboardSubtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon type="balance">
            <DollarSign size={28} />
          </StatIcon>
          <StatContent>
            <StatValue>₹{summary.totalBalance?.toLocaleString() || 0}</StatValue>
            <StatLabel>Total Balance</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon type="income">
            <TrendingUp size={28} />
          </StatIcon>
          <StatContent>
            <StatValue>₹{summary.monthlyIncome?.toLocaleString() || 0}</StatValue>
            <StatLabel>Monthly Income</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon type="expense">
            <TrendingDown size={28} />
          </StatIcon>
          <StatContent>
            <StatValue>₹{summary.monthlyExpenses?.toLocaleString() || 0}</StatValue>
            <StatLabel>Monthly Expenses</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon type="accounts">
            <CreditCard size={28} />
          </StatIcon>
          <StatContent>
            <StatValue>{summary.accountCount || 0}</StatValue>
            <StatLabel>Accounts</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon type="bills">
            <AlertTriangle size={28} />
          </StatIcon>
          <StatContent>
            <StatValue>{summary.pendingBillsCount || 0}</StatValue>
            <StatLabel>Pending Bills</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <Receipt size={20} />
              Recent Transactions
            </SectionTitle>
            <AddButton>
              <Plus size={16} />
              Add Transaction
            </AddButton>
          </SectionHeader>

          {recentTransactions.length > 0 ? (
            <TransactionList>
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction._id} type={transaction.type}>
                  <TransactionInfo>
                    <TransactionDescription>{transaction.description}</TransactionDescription>
                    <TransactionDetails>
                      {transaction.accountId?.accountName} • {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </TransactionDetails>
                  </TransactionInfo>
                  <TransactionAmount type={transaction.type}>
                    {transaction.type === 'Income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </TransactionAmount>
                </TransactionItem>
              ))}
            </TransactionList>
          ) : (
            <EmptyState>
              <p>No transactions yet. Add your first transaction to get started!</p>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <Calendar size={20} />
              Pending Bills
            </SectionTitle>
            <AddButton>
              <Plus size={16} />
              Add Bill
            </AddButton>
          </SectionHeader>

          {pendingBills.length > 0 ? (
            <BillList>
              {pendingBills.map((bill) => (
                <BillItem key={bill._id} status={bill.status}>
                  <BillHeader>
                    <BillName>{bill.billName}</BillName>
                    <BillAmount>₹{bill.amount.toLocaleString()}</BillAmount>
                  </BillHeader>
                  <BillDetails>
                    <span>{bill.category}</span>
                    <span>Due: {new Date(bill.dueDate).toLocaleDateString()}</span>
                  </BillDetails>
                </BillItem>
              ))}
            </BillList>
          ) : (
            <EmptyState>
              <p>No pending bills. Great job staying on top of your payments!</p>
            </EmptyState>
          )}
        </Section>
      </ContentGrid>
    </DashboardDetailContainer>
  );
};

export default DashboardDetail;