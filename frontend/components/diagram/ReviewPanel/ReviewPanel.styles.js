import styled from 'styled-components';

export const Panel = styled.div`
  width: 380px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0 24px;
`;

export const PanelHeader = styled.div`
  padding: 20px 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 12px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const TitleCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const Title = styled.h3`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  color: #000000;
`;

export const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ScoreCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  background: ${props =>
    props.$grade === 'A' ? '#065f46' :
    props.$grade === 'B' ? '#1e40af' :
    props.$grade === 'C' ? '#92400e' :
    props.$grade === 'D' ? '#991b1b' :
    '#7f1d1d'};
  flex-shrink: 0;
`;

export const ScoreMeta = styled.div`
  display: grid;
  gap: 2px;
`;

export const ScoreLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #666;
`;

export const ScoreBar = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #eee;
  overflow: hidden;
`;

export const ScoreFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${props =>
    props.$pct >= 80 ? '#065f46' :
    props.$pct >= 60 ? '#1e40af' :
    props.$pct >= 40 ? '#92400e' :
    '#991b1b'};
  width: ${props => props.$pct}%;
  transition: width 0.5s ease;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

export const SummaryCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 10px;
  display: grid;
  gap: 4px;
  background: #ffffff;
`;

export const SummaryLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const SummaryValue = styled.div`
  font-family: var(--font-sans);
  font-size: 1.1rem;
  font-weight: 800;
  color: #000000;
`;

export const FindingsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FindingCard = styled.button`
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: ${props =>
    props.$severity === 'critical' ? '#FFF5F5' :
    props.$severity === 'warning' ? '#FFFAF0' :
    '#F9F9F9'};
  cursor: pointer;
  display: grid;
  gap: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: none;
    background: ${props =>
      props.$severity === 'critical' ? '#FFF0F0' :
      props.$severity === 'warning' ? '#FFF5E6' :
      '#F2F2F2'};
  }
`;

export const FindingTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const FindingTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.01em;
`;

export const FindingDetail = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

export const Footer = styled.div`
  padding: 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  color: #999;
  line-height: 1.5;
`;

export const EmptyState = styled.div`
  flex: 1;
  padding: 24px;
  display: grid;
  align-content: start;
  gap: 18px;
`;

export const EmptyHero = styled.div`
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 16px;
  background: #F3FFF7;
  padding: 20px;
  display: grid;
  gap: 10px;
`;

export const EmptyTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #065f46;
`;

export const EmptyDescription = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: #333333;
`;

export const CoverageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const CoverageCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  padding: 14px;
  display: grid;
  gap: 6px;
`;

export const CoverageValue = styled.div`
  font-size: 1.3rem;
  font-weight: 900;
  color: #000000;
`;

export const CoverageLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  color: #666666;
  text-transform: uppercase;
`;

export const CheckList = styled.div`
  display: grid;
  gap: 10px;
`;

export const CheckItem = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: #ffffff;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: #666;
`;

export const ReviewSection = styled.div`
  display: grid;
  gap: 10px;
`;

export const SectionHeading = styled.div`
  padding: 4px 4px 0;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

export const SuggestionCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: linear-gradient(180deg, #f2f8ff 0%, #ffffff 100%);
  padding: 16px;
  display: grid;
  gap: 12px;
  box-shadow: none;
`;

export const SuggestionTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const SuggestionName = styled.div`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 700;
  color: #000000;
`;

export const SuggestionRole = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
`;

export const ConnectionList = styled.div`
  display: grid;
  gap: 8px;
`;

export const ConnectionItem = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  padding: 10px 12px;
  display: grid;
  gap: 4px;
`;

export const ConnectionRoute = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 700;
  color: #000000;
`;

export const ConnectionReason = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: #555555;
`;

export const SuggestionActions = styled.div`
  display: flex;
  gap: 10px;
`;

export const SuggestionButton = styled.button`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${props => props.$tone === 'primary' ? 'transparent' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.$tone === 'primary' ? '#000000' : '#ffffff'};
  color: ${props => props.$tone === 'primary' ? '#ffffff' : '#000000'};
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$tone === 'primary' ? '#1a1a1a' : '#f9f9f9'};
    transform: translateY(-1px);
    box-shadow: none;
  }
`;

export const BreakdownToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: #999;
  padding: 4px 0;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }
`;

export const BreakdownPanel = styled.div`
  background: #f8f8f8;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
`;

export const BreakdownRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const BreakdownLabel = styled.span`
  font-family: var(--font-sans);
  font-weight: ${props => props.$bold ? '800' : '500'};
  color: ${props => props.$tone || '#333'};
`;

export const BreakdownValue = styled.span`
  font-weight: 700;
  color: ${props => props.$tone || '#333'};
`;

export const ScoreDivider = styled.div`
  border-top: 1px solid #ddd;
  margin: 4px 0;
`;

export const AutoFixesList = styled.div`
  display: grid;
  gap: 6px;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

export const AutoFixItem = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const SuggestionMetaStack = styled.div`
  display: grid;
  gap: 8px;
`;

export const LearningSummary = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(3, 105, 161, 0.12);
  border-radius: 12px;
  background: #f7fbff;
  display: grid;
  gap: 5px;
`;

export const NarrativeCard = styled.div`
  padding: 12px 14px;
  border: 1px solid rgba(5, 95, 70, 0.14);
  border-radius: 12px;
  background: #f6fffb;
  display: grid;
  gap: 8px;
`;

export const NarrativeList = styled.ul`
  display: grid;
  gap: 6px;
  padding-left: 16px;
  margin: 0;
`;

export const NarrativeItem = styled.li`
  font-size: 11px;
  line-height: 1.5;
  color: #333333;
`;

export const LearningTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  text-transform: uppercase;
`;

export const LearningText = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: #333333;
`;

export const FindingLesson = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 10px;
  display: grid;
  gap: 6px;
`;

export const LessonLabel = styled.div`
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 900;
  color: #666666;
  text-transform: uppercase;
`;

export const LessonText = styled.p`
  font-size: 11px;
  line-height: 1.55;
  color: #333333;
`;

export const StudyGuideList = styled.div`
  display: grid;
  gap: 10px;
`;

export const StudyCard = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #ffffff;
  padding: 14px;
  display: grid;
  gap: 8px;
`;

export const StudyTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 800;
  color: #000000;
`;

export const StudyText = styled.p`
  font-size: 12px;
  line-height: 1.55;
  color: #333333;
`;

export const StudyInspect = styled.p`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  font-size: 11px;
  line-height: 1.55;
  color: #555555;
`;

export const FindingInspectHint = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
`;
