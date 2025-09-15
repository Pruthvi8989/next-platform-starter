import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: ${props => props.isOpen ? '280px' : '0'};
  background: linear-gradient(180deg, #3a6b35 0%, #2d5230 100%);
  transition: width 0.3s ease;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    position: relative;
    width: ${props => props.isOpen ? '280px' : '80px'};
  }
`;

const SidebarContent = styled.div`
  padding: 2rem 0;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 0 2rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
`;

const LogoText = styled.h1`
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const UserInfo = styled.div`
  padding: 0 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
`;

const UserName = styled.p`
  color: white;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
`;

const UserId = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0 1rem;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  margin: 0.25rem 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  background-color: ${props => props.active ? 'rgba(227, 180, 72, 0.2)' : 'transparent'};
  border: ${props => props.active ? '1px solid rgba(227, 180, 72, 0.3)' : '1px solid transparent'};

  &:hover {
    background-color: rgba(227, 180, 72, 0.1);
    color: white;
    transform: translateX(4px);
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: ${props => props.isOpen ? '1rem' : '0'};
    flex-shrink: 0;
  }
`;

const NavText = styled.span`
  font-weight: 500;
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: opacity 0.3s ease;
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  margin: 1rem;
  border: none;
  border-radius: 12px;
  background-color: rgba(220, 53, 69, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: rgba(220, 53, 69, 0.2);
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
    margin-right: ${props => props.isOpen ? '1rem' : '0'};
    flex-shrink: 0;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '280px' : '0'};
  transition: margin-left 0.3s ease;

  @media (min-width: 768px) {
    margin-left: ${props => props.sidebarOpen ? '280px' : '80px'};
  }
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background-color: #f8f9fa;
  color: #3a6b35;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e3b448;
    color: white;
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const PageTitle = styled.h2`
  color: #3a6b35;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const Content = styled.div`
  padding: 2rem;
  min-height: calc(100vh - 80px);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};

  @media (min-width: 768px) {
    display: none;
  }
`;

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/bills', icon: Receipt, label: 'Bills' },
    { path: '/statements', icon: FileText, label: 'Statements' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = navItems.find(item => currentPath.startsWith(item.path));
    return item ? item.label : 'Apexture';
  };

  return (
    <LayoutContainer>
      <Overlay show={sidebarOpen} onClick={closeSidebar} />
      
      <Sidebar isOpen={sidebarOpen}>
        <SidebarContent>
          <Logo>
            <LogoText>Apexture</LogoText>
          </Logo>

          <UserInfo>
            <UserName>{user?.name || 'User'}</UserName>
            <UserId>ID: {user?.userId || '000000'}</UserId>
          </UserInfo>

          <Nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <NavItem
                  key={item.path}
                  active={isActive}
                  isOpen={sidebarOpen}
                  onClick={() => {
                    navigate(item.path);
                    closeSidebar();
                  }}
                >
                  <Icon />
                  <NavText isOpen={sidebarOpen}>{item.label}</NavText>
                </NavItem>
              );
            })}
          </Nav>

          <LogoutButton isOpen={sidebarOpen} onClick={handleLogout}>
            <LogOut />
            <NavText isOpen={sidebarOpen}>Logout</NavText>
          </LogoutButton>
        </SidebarContent>
      </Sidebar>

      <MainContent sidebarOpen={sidebarOpen}>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MenuButton onClick={toggleSidebar}>
              {sidebarOpen ? <X /> : <Menu />}
            </MenuButton>
            <PageTitle>{getPageTitle()}</PageTitle>
          </div>
        </Header>

        <Content>
          <Outlet />
        </Content>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;