import Link from 'next/link';
import styled from 'styled-components';
import { Hexagon } from 'lucide-react';

const Shell = styled.div`
  min-height: 100vh;
  position: relative;
  background-color: var(--color-canvas);
`;

const Ambient = styled.div`
  display: none;
`;

const Topbar = styled.header`
  position: relative;
`;

const TopbarInner = styled.div`
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 14px var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  color: var(--color-ink);
  
  &:hover {
    text-decoration: none;
  }
`;

const BrandMark = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 1.1rem;
  font-weight: 800;
`;

const BrandText = styled.div`
  display: grid;
  gap: 2px;
`;

const BrandTitle = styled.span`
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  color: #000;
`;

const BrandSubtitle = styled.span`
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.05em;
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const NavLink = styled(Link)`
  padding: 6px 14px;
  color: ${props => props.$active ? '#000000' : '#666'};
  background: ${props => props.$active ? 'rgba(0,0,0,0.05)' : 'transparent'};
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;

  &:hover {
    color: #000000;
    background: rgba(0,0,0,0.04);
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Main = styled.main`
  position: relative;
  max-width: var(--page-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

export default function AppShell({ children, navItems = [], actions, userSlot }) {
  return (
    <Shell>
      <Ambient />
      <Topbar>
        <TopbarInner>
          <Right>
            <Brand href="/dashboard">
              <BrandMark>
                <Hexagon size={20} strokeWidth={3} fill="currentColor" />
              </BrandMark>
              <BrandText>
                <BrandTitle>Archflow</BrandTitle>
                <BrandSubtitle>AI system design workspace</BrandSubtitle>
              </BrandText>
            </Brand>
            {navItems.length ? (
              <Nav>
                {navItems.map(item => (
                  <NavLink key={item.href} href={item.href} $active={item.active}>
                    {item.label}
                  </NavLink>
                ))}
              </Nav>
            ) : null}
          </Right>
          <Right>
            {actions}
            {userSlot}
          </Right>
        </TopbarInner>
      </Topbar>
      <Main>{children}</Main>
    </Shell>
  );
}
