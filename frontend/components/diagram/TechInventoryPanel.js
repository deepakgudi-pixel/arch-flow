'use client';

import styled from 'styled-components';
import { Trash2 } from 'lucide-react';
import {
  RightPanel, PanelContent, SidebarTitle, SearchInput, CloseBtn,
  SectionTitle, ActionButton, TechChip, TechCategory, CategoryLabel
} from './editorStyles';

const GenerateSection = styled.div`
  margin-bottom: 32px;
`;

const AiBadge = styled.span`
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const DeleteBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: #ef4444;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 24px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.01);
`;

const EmptyStateLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: #999;
  margin-bottom: 16px;
`;

const WideButton = styled(ActionButton)`
  width: 100%;
  justify-content: center;
  padding: 10px;
  font-size: 12px;
`;

export default function TechInventoryPanel({
  open, searchTerm, onSearchTermChange,
  inventory, customTechPrompt, onCustomTechPromptChange,
  generatingTech, onGenerateTech, onDragStart, onDeleteFromInventory,
  onClose
}) {
  return (
    <RightPanel $open={open}>
      {open && (
        <PanelContent>
          <SidebarTitle>
            Modules
            <CloseBtn type="button" onClick={onClose} aria-label="Close tech library">
              ×
            </CloseBtn>
          </SidebarTitle>
          <SearchInput
            placeholder="Filter modules..."
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
          />

          <SectionTitle>Custom Generation</SectionTitle>
          <GenerateSection>
            <SearchInput
              placeholder="Describe custom tech..."
              value={customTechPrompt}
              onChange={e => onCustomTechPromptChange(e.target.value)}
              style={{ marginBottom: '12px' }}
              onKeyPress={e => e.key === 'Enter' && onGenerateTech()}
            />
            <WideButton
              onClick={onGenerateTech}
              disabled={generatingTech || !customTechPrompt.trim()}
            >
              {generatingTech ? 'Synthesizing...' : 'Generate Module'}
            </WideButton>
          </GenerateSection>

          {inventory.community && inventory.community.length > 0 && (
            <TechCategory>
              <CategoryLabel>Community Modules</CategoryLabel>
              {inventory.community
                .filter(tech => !searchTerm || tech.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(tech => (
                <TechChip
                  key={tech.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, tech)}
                  $category={tech.category}
                >
                  {tech.name}
                  {tech.isOwner && (
                    <DeleteBtn onClick={(e) => { e.stopPropagation(); onDeleteFromInventory(tech.id); }}>
                      <Trash2 size={12} />
                    </DeleteBtn>
                  )}
                </TechChip>
              ))}
            </TechCategory>
          )}

          {Object.keys(inventory.builtIn || {}).map(category => {
            const builtInForCat = inventory.builtIn[category] || [];
            const customForCat = (inventory.custom || []).filter(item => item.category === category);
            const allItems = [...builtInForCat, ...customForCat]
              .filter(tech => tech.name.toLowerCase().includes(searchTerm.toLowerCase()));

            if (allItems.length === 0) return null;

            return (
              <TechCategory key={category}>
                <CategoryLabel>{category.replace('_', ' ')}</CategoryLabel>
                {allItems.map((tech, idx) => (
                  <TechChip
                    key={idx}
                    $category={category}
                    draggable
                    onDragStart={e => onDragStart(e, { ...tech, category })}
                  >
                    {tech.name}
                    {tech.id && <AiBadge>AI</AiBadge>}
                  </TechChip>
                ))}
              </TechCategory>
            );
          })}

          {searchTerm && !Object.values(inventory.builtIn || {}).some(cat => cat.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
           !inventory.custom?.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
            <EmptyState>
              <EmptyStateLabel>No local modules found</EmptyStateLabel>
              <WideButton
                onClick={() => {
                  onSearchTermChange(searchTerm);
                  onGenerateTech();
                }}
                disabled={generatingTech}
              >
                {generatingTech ? 'Synthesizing...' : `Synthesize ${searchTerm}`}
              </WideButton>
            </EmptyState>
          )}
        </PanelContent>
      )}
    </RightPanel>
  );
}
