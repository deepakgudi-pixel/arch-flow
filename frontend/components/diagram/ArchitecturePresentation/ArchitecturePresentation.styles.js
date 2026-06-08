import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 32px;
`;

export const PresentationShell = styled.div`
  width: min(980px, calc(100vw - 48px));
  max-height: min(760px, calc(100vh - 48px));
  background: #ffffff;
  border: 3px solid #000000;
  border-radius: 8px;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

export const PresentationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  border-bottom: 3px solid #000000;
  background: #f7f7f7;
`;

export const HeaderCopy = styled.div`
  display: grid;
  gap: 10px;
`;

export const Eyebrow = styled.div`
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #555555;
`;

export const Title = styled.h2`
  font-size: clamp(1.8rem, 4vw, 3.8rem);
  line-height: 0.94;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
`;

export const CloseButton = styled.button`
  width: 34px;
  height: 34px;
  border: 2px solid #000000;
  background: #ffffff;
  color: #000000;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
`;

export const PresentationBody = styled.div`
  overflow-y: auto;
  padding: 28px 32px;
  display: grid;
  gap: 22px;
`;

export const ScoreStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const ScoreTile = styled.div`
  border: 2px solid #000000;
  padding: 14px;
  display: grid;
  gap: 4px;
`;

export const ScoreValue = styled.div`
  font-family: var(--font-mono);
  font-size: 1.35rem;
  font-weight: 900;
  color: #000000;
`;

export const ScoreLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

export const Summary = styled.p`
  max-width: 860px;
  font-size: 1.05rem;
  line-height: 1.65;
  color: #222222;
`;

export const Section = styled.section`
  display: grid;
  gap: 12px;
`;

export const SectionTitle = styled.h3`
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
`;

export const StoryList = styled.div`
  display: grid;
  gap: 10px;
`;

export const StoryItem = styled.div`
  border-left: 4px solid #000000;
  background: #f7f7f7;
  padding: 12px 14px;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #222222;
`;

export const WalkthroughGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

export const WalkthroughCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 14px;
  display: grid;
  gap: 8px;
`;

export const WalkthroughTitle = styled.div`
  font-weight: 900;
  color: #000000;
`;

export const WalkthroughText = styled.p`
  font-size: 0.88rem;
  line-height: 1.55;
  color: #333333;
`;

export const ReviewNote = styled.div`
  border: 2px solid #000000;
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #000000;
`;
