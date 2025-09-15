import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Calendar, AlertTriangle, CheckCircle, Clock, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const BillsContainer = styled.div`
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

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FilterTab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? '#e3b448' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#d4a23a' : '#f8f9fa'};
  }
`;

const BillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const BillCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'Pending': return '#ffc107';
      case 'Paid': return '#28a745';
      case 'Overdue': return '#dc3545';
      case 'Cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const BillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const BillName = styled.h3`
  color: #3a6b35;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const BillAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3a6b35;
`;

const BillStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'Pending': return '#fff3cd';
      case 'Paid': return '#d4edda';
      case 'Overdue': return '#f8d7da';
      case 'Cancelled': return '#e2e3e5';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Pending': return '#856404';
      case 'Paid': return '#155724';
      case 'Overdue': return '#721c24';
      case 'Cancelled': return '#383d41';
      default: return '#383d41';
    }
  }};
`;

const BillDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const BillActions = styled.div`
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

  &.primary {
    background-color: #e3b448;
    color: white;
    border-color: #e3b448;

    &:hover {
      background-color: #d4a23a;
    }
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

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All Bills' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Overdue', label: 'Overdue' },
    { key: 'Paid', label: 'Paid' }
  ];

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    try {
      const response = await axios.get('/api/dashboards');
      if (response.data.length > 0) {
        setSelectedDashboard(response.data[0]._id);
        fetchBills(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async (dashboardId) => {
    try {
      const response = await axios.get(`/api/bills/dashboard/${dashboardId}`);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filteredBills = bills.filter(bill => {
    if (activeFilter === 'all') return true;
    return bill.status === activeFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Paid': return <CheckCircle size={16} />;
      case 'Overdue': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <BillsContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
      </BillsContainer>
    );
  }

  return (
    <BillsContainer>
      <Header>
        <Title>Bills & Payments</Title>
        <ButtonGroup>
          <Button className="secondary">
            <Upload size={20} />
            Upload Bill
          </Button>
          <Button>
            <Plus size={20} />
            Add Bill
          </Button>
        </ButtonGroup>
      </Header>

      <FilterTabs>
        {filters.map((filter) => (
          <FilterTab
            key={filter.key}
            active={activeFilter === filter.key}
            onClick={() => handleFilterChange(filter.key)}
          >
            {filter.label}
          </FilterTab>
        ))}
      </FilterTabs>

      {filteredBills.length > 0 ? (
        <BillsGrid>
          {filteredBills.map((bill) => (
            <BillCard key={bill._id} status={bill.status}>
              <BillHeader>
                <BillName>{bill.billName}</BillName>
                <BillAmount>₹{bill.amount.toLocaleString()}</BillAmount>
              </BillHeader>
              
              <BillStatus status={bill.status}>
                {getStatusIcon(bill.status)}
                <span style={{ marginLeft: '0.25rem' }}>{bill.status}</span>
              </BillStatus>
              
              <BillDetails>
                <div><strong>Category:</strong> {bill.category}</div>
                <div><strong>Due Date:</strong> {new Date(bill.dueDate).toLocaleDateString()}</div>
                {bill.vendor?.name && (
                  <div><strong>Vendor:</strong> {bill.vendor.name}</div>
                )}
                {bill.description && (
                  <div><strong>Description:</strong> {bill.description}</div>
                )}
              </BillDetails>
              
              <BillActions>
                {bill.status === 'Pending' && (
                  <ActionButton className="primary">Mark Paid</ActionButton>
                )}
                <ActionButton>Edit</ActionButton>
                <ActionButton>Remind</ActionButton>
              </BillActions>
            </BillCard>
          ))}
        </BillsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <Calendar size={40} />
          </EmptyIcon>
          <h3>No bills found</h3>
          <p>Add your first bill to start tracking payments and due dates.</p>
        </EmptyState>
      )}
    </BillsContainer>
  );
};

export default Bills;