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
  flex-wrap: nowrap;
  gap: 14px 32px;
  padding: 12px 24px;
  position: relative;
  background: #ffffff;

  @media (max-width: 1180px) {
    padding: 12px 18px;
    gap: 14px 20px;
  }

  @media (max-width: 760px) {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  min-width: 280px;
  flex: 1 1 320px;

  @media (max-width: 760px) {
    flex: 1 1 100%;
    min-width: 0;
    gap: 10px;
  }
`;

export const Logo = styled.div`
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const LogoIcon = styled.div`
  width: 28px;
  height: 28px;
  background: #000000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: none;
`;

export const DiagramNameWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
`;

export const DiagramName = styled.input`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  border: none;
  background: transparent;
  width: 240px;
  padding: 0;
  margin: 0;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
  }

  @media (max-width: 760px) {
    width: min(220px, 58vw);
  }
`;

export const HeaderCenter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1 1 340px;
  min-width: 260px;

  @media (max-width: 760px) {
    min-width: 0;
  }
`;

export const ActionButton = styled.button`
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid ${props => props.$active ? '#000000' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  background: ${props => props.$active ? '#000000' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#000000'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.$active ? '#1a1a1a' : '#f9f9f9'};
    border-color: ${props => props.$active ? '#000000' : 'rgba(0, 0, 0, 0.2)'};
    transform: translateY(-1px);
    box-shadow: none;
  }

  &:active {
    transform: translateY(0);
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
  position: relative;
  overflow: hidden;
`;

export const LeftSidebar = styled.div`
  width: ${props => props.$open ? '400px' : '0'};
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  border-right-width: ${props => props.$open ? '1px' : '0'};
  transition: width 0.5s ease-in-out, border-right-width 0.5s ease-in-out;
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
  font-family: var(--font-sans);
  font-size: 1.2rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  letter-spacing: -0.01em;
`;

export const CloseBtn = styled.button`
  background: rgba(0, 0, 0, 0.05);
  border: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  color: #000000;
  font-size: 18px;
  line-height: 1;
  font-family: Arial, sans-serif;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }
`;

export const TechBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  background: ${props => categoryColors[props.$category] || '#000000'}15;
  color: ${props => categoryColors[props.$category] || '#000000'};
  border: 1px solid ${props => categoryColors[props.$category] || '#000000'}30;
`;

export const SectionTitle = styled.h3`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  margin: 24px 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.05em;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const Description = styled.p`
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
`;

export const ProductCard = styled.div`
  padding: 14px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    background: #fcfcfc;
    box-shadow: none;
    transform: translateY(-1px);
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 100%);
  background: #ffffff;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: -12px 0 28px rgba(0, 0, 0, 0.08);
  transform: translateX(${props => props.$open ? '0' : '100%'});
  opacity: ${props => props.$open ? 1 : 0};
  visibility: ${props => props.$open ? 'visible' : 'hidden'};
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease,
    visibility 0s ${props => props.$open ? '0s' : '0.32s'};
  overflow: hidden;
  z-index: 150;
`;

export const PanelContent = styled.div`
  width: min(360px, 100vw);
  height: 100%;
  overflow-y: auto;
  padding: 24px;

  > h2 {
    margin-bottom: 14px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #000000;
    box-shadow: none;
  }

  &::placeholder {
    color: #999;
  }
`;

export const BottomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  box-shadow: none;

  @media (max-width: 760px) {
    flex-wrap: wrap;
    border-radius: 16px;
  }
`;

export const PromptInput = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: none;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 500;
  background: transparent;
  color: #000;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #999;
    letter-spacing: 0;
  }
`;

export const TemplateSelect = styled.select`
  max-width: 220px;
  padding: 10px 32px 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  color: #666;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
    color: #000;
  }

  @media (max-width: 760px) {
    max-width: none;
    width: 100%;
  }
`;

export const EmptyCanvas = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
  z-index: 1;
  gap: 20px;
`;

export const EmptyIcon = styled.div`
  font-size: 64px;
  color: #000;
  opacity: 0.04;
  filter: drop-shadow(0 0 0 rgba(0,0,0,0));
`;

export const EmptyText = styled.p`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #000;
  opacity: 0.15;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;
