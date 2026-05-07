import Link from 'next/link';
import styled from 'styled-components';

const Shell = styled.div`
  min-height: 100vh;
  position: relative;
  background-color: var(--color-canvas);
`;

const Ambient = styled.div`
  display: none;
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  border-bottom: 4px solid #000000;
`;

const TopbarInner = styled.div`
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 24px var(--spacing-md);
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
  width: 48px;
  height: 48px;
  border: 3px solid #000000;
  display: grid;
  place-items: center;
  background: #000000;
  color: white;
  box-shadow: 4px 4px 0px #000000;
  font-size: 1.2rem;
  font-weight: 800;
`;

const BrandText = styled.div`
  display: grid;
  gap: 2px;
`;

const BrandTitle = styled.span`
  font-weight: 900;
  font-size: 1.4rem;
  letter-spacing: -0.04em;
  text-transform: uppercase;
`;

const BrandSubtitle = styled.span`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-ink-soft);
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const NavLink = styled(Link)`
  padding: 12px 20px;
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  background: ${props => props.$active ? '#000000' : 'transparent'};
  border: 3px solid ${props => props.$active ? '#000000' : 'transparent'};
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  transition: all 0.2s ease;

  &:hover {
    border-color: #000000;
    text-decoration: none;
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

const MobileBlocker = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: #ffffff;
  z-index: 10000;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const BlockerIcon = styled.div`
  font-size: 80px;
  margin-bottom: 32px;
  animation: pulse 2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const BlockerTitle = styled.h1`
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const BlockerText = styled.p`
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  color: #666;
  max-width: 320px;
  text-transform: uppercase;
`;

const BlockerStatus = styled.div`
  margin-top: 48px;
  padding: 12px 24px;
  border: 3px solid #000000;
  background: #000000;
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.2em;
`;

export default function AppShell({ children, navItems = [], actions, userSlot }) {
  return (
    <Shell>
      <MobileBlocker>
        <BlockerIcon>📟</BlockerIcon>
        <BlockerTitle>HARDWARE_RESTRICTION_ACTIVE</BlockerTitle>
        <BlockerText>
          System architecture synthesis requires high-precision input and a wide-field display. 
          Your current terminal is insufficiently equipped for the Archflow Mainframe.
          <br /><br />
          <strong>PLEASE VIEW THIS APP ON A DESKTOP OR PC FOR THE FULL EXPERIENCE.</strong>
        </BlockerText>
        <BlockerStatus>[!] AWAITING_DESKTOP_SYNCHRONIZATION...</BlockerStatus>
      </MobileBlocker>

      <Ambient />
      <Topbar>
        <TopbarInner>
          <Right>
            <Brand href="/dashboard">
              <BrandMark>⬡</BrandMark>
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
