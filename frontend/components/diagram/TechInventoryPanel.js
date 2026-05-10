'use client';

import styled from 'styled-components';
import {
  RightPanel, PanelContent, SidebarTitle, SearchInput, CloseBtn,
  SectionTitle, ActionButton, TechChip, TechCategory, CategoryLabel
} from './editorStyles';

const GenerateSection = styled.div`
  margin-bottom: 32px;
`;

const AiBadge = styled.span`
  font-size: 8px;
  background: #000;
  color: #fff;
  padding: 2px 4px;
  margin-left: 8px;
  vertical-align: middle;
`;

const DeleteBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  border: 2px dashed #ccc;
`;

const EmptyStateLabel = styled.div`
  font-size: 10px;
  font-weight: 900;
  color: #999;
  margin-bottom: 12px;
`;

const WideButton = styled(ActionButton)`
  width: 100%;
  font-size: 11px;
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
            MODULES
            <CloseBtn type="button" onClick={onClose} aria-label="Close tech library">
              ×
            </CloseBtn>
          </SidebarTitle>
          <SearchInput
            placeholder="FILTER_TECH..."
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
          />

          <SectionTitle>GENERATE_MODULE</SectionTitle>
          <GenerateSection>
            <SearchInput
              placeholder="DESCRIBE_CUSTOM_TECH..."
              value={customTechPrompt}
              onChange={e => onCustomTechPromptChange(e.target.value)}
              style={{ marginBottom: '12px' }}
              onKeyPress={e => e.key === 'Enter' && onGenerateTech()}
            />
            <WideButton
              onClick={onGenerateTech}
              disabled={generatingTech || !customTechPrompt.trim()}
            >
              {generatingTech ? 'SYNTHESIZING...' : 'INITIATE_TECH_GEN'}
            </WideButton>
          </GenerateSection>

          {inventory.community && inventory.community.length > 0 && (
            <TechCategory>
              <CategoryLabel>COMMUNITY_MODULES</CategoryLabel>
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
                      🗑️
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
                <CategoryLabel>{category}</CategoryLabel>
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

          {inventory.custom && inventory.custom.some(item => !inventory.builtIn[item.category]) && (
            inventory.custom
              .filter(item => !inventory.builtIn[item.category])
              .reduce((acc, item) => {
                if (!acc.includes(item.category)) acc.push(item.category);
                return acc;
              }, [])
              .map(category => (
                <TechCategory key={category}>
                  <CategoryLabel>{category}</CategoryLabel>
                  {inventory.custom
                    .filter(item => item.category === category && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((tech, idx) => (
                      <TechChip
                        key={idx}
                        $category={category}
                        draggable
                        onDragStart={e => onDragStart(e, tech)}
                      >
                        {tech.name}
                        <AiBadge>AI</AiBadge>
                      </TechChip>
                    ))}
                </TechCategory>
              ))
          )}

          {searchTerm && !Object.values(inventory.builtIn || {}).some(cat => cat.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
           !inventory.custom?.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
            <EmptyState>
              <EmptyStateLabel>NO_LOCAL_MATCH_FOUND</EmptyStateLabel>
              <WideButton
                onClick={() => {
                  onSearchTermChange(searchTerm);
                  onGenerateTech();
                }}
                disabled={generatingTech}
              >
                {generatingTech ? 'SYNTHESIZING...' : `SYNTHESIZE_${searchTerm.toUpperCase()}`}
              </WideButton>
            </EmptyState>
          )}
        </PanelContent>
      )}
    </RightPanel>
  );
}
