import styled from 'styled-components';
import { categoryColors } from '@/lib/theme';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-canvas);
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 20px;
  padding: 14px 24px;
  background: #ffffff;
  border-bottom: 3px solid #000000;
  z-index: 100;

  @media (max-width: 1180px) {
    padding: 14px 18px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  min-width: 280px;
  flex: 1 1 320px;
`;

export const Logo = styled.div`
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LogoIcon = styled.span`
  width: 32px;
  height: 32px;
  background: #000000;
  color: white;
  display: grid;
  place-items: center;
  border: 2px solid #000000;
`;

export const DiagramNameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border: 2px solid #000000;
  background: #fafafa;
  min-width: 290px;
`;

export const DiagramName = styled.input`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  color: #000000;
  border: none;
  background: transparent;
  width: min(280px, 38vw);
  text-transform: uppercase;
  &:focus {
    outline: none;
  }
`;

export const HeaderCenter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1 1 340px;
  min-width: 260px;
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  border: 3px solid #000000;
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  transition: all 0.1s;
  &:hover {
    transform: translate(-1px, -1px);
  }
  &:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
`;

export const MainArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const LeftSidebar = styled.div`
  width: ${props => props.$open ? '400px' : '0'};
  background: #ffffff;
  border-right: 4px solid #000000;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  flex-shrink: 0;
  z-index: 50;
`;

export const SidebarContent = styled.div`
  width: 400px;
  padding: 32px;
  height: 100%;
  overflow-y: auto;
`;

export const SidebarTitle = styled.h2`
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: uppercase;
  word-break: break-word;
`;

export const CloseBtn = styled.button`
  background: #000000;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 2px;
  color: white;
  font-family: Arial, sans-serif;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: #333;
  }
`;

export const TechBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border: 2px solid #000000;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  background: ${props => categoryColors[props.$category] || '#000000'};
  color: white;
`;

export const SectionTitle = styled.h3`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  color: #666;
  text-transform: uppercase;
  margin: 32px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::after {
    content: '';
    flex: 1;
    height: 2px;
    background: #e5e5e5;
  }
`;

export const Description = styled.p`
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
`;

export const ProductCard = styled.div`
  padding: 16px;
  background: #ffffff;
  border: 3px solid #000000;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.1s;
  &:hover {
    transform: translate(-2px, -2px);
  }
`;

export const ProductName = styled.div`
  font-weight: 900;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: #000000;
  margin-bottom: 8px;
  word-break: break-word;
`;

export const ProductDesc = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

export const CanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  background: #ffffff;
`;

export const RightPanel = styled.div`
  width: ${props => props.$open ? '320px' : '0'};
  background: #ffffff;
  border-left: 4px solid #000000;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  flex-shrink: 0;
  z-index: 50;
`;

export const PanelContent = styled.div`
  width: 320px;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 3px solid #000000;
  font-family: var(--font-mono);
  font-size: 13px;
  margin-bottom: 24px;
  background: #f8f8f8;
  &:focus {
    outline: none;
    background: #ffffff;
  }
`;

export const TechChip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #ffffff;
  border: 2px solid #000000;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #000000;
  cursor: grab;
  margin-bottom: 8px;
  transition: all 0.1s;
  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }
  &::before {
    content: '::';
    color: ${props => categoryColors[props.$category] || '#000000'};
  }
`;

export const TechCategory = styled.div`
  margin-bottom: 24px;
`;

export const CategoryLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  color: #999;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

export const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: #ffffff;
  border-top: 4px solid #000000;
`;

export const PromptInput = styled.input`
  flex: 1;
  padding: 16px 24px;
  border: 3px solid #000000;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  background: #f8f8f8;
  &:focus {
    outline: none;
    background: #ffffff;
  }
`;

export const TemplateSelect = styled.select`
  padding: 16px 40px 16px 20px;
  border: 3px solid #000000;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  background: #ffffff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4' stroke-linecap='square' stroke-linejoin='inherit'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  transition: all 0.1s;
  &:focus {
    outline: none;
    background-color: #f8f8f8;
  }
  &:hover {
    background-color: #f0f0f0;
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px 0px #000000;
  }
`;

export const EmptyCanvas = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 1;
`;

export const EmptyIcon = styled.div`
  font-size: 80px;
  filter: grayscale(100%);
  margin-bottom: 24px;
  opacity: 0.1;
`;

export const EmptyText = styled.p`
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
  letter-spacing: 0.1em;
`;
