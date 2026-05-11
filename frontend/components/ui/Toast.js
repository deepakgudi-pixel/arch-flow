import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle
} from 'lucide-react';

const ToastContainer = styled(motion.div)`
  position: fixed;
  top: 18px;
  right: 18px;
  min-width: 260px;
  max-width: 340px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2000;
  pointer-events: auto;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  background: ${props => 
    props.$tone === 'success' ? 'rgba(34, 197, 94, 0.1)' :
    props.$tone === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    props.$tone === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
    'rgba(59, 130, 246, 0.1)'
  };
  color: ${props => 
    props.$tone === 'success' ? '#16a34a' :
    props.$tone === 'error' ? '#dc2626' :
    props.$tone === 'warning' ? '#d97706' :
    '#2563eb'
  };
`;

const Content = styled.div`
  flex: 1;
`;

const Message = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
`;

export const Toast = ({ $tone = 'info', children }) => {
  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    info: <Info size={16} />
  };

  return (
    <ToastContainer
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
    >
      <IconWrapper $tone={$tone}>
        {icons[$tone]}
      </IconWrapper>
      <Content>
        <Message>{children}</Message>
      </Content>
    </ToastContainer>
  );
};

export default Toast;
