'use client';

import { Trash2 } from 'lucide-react';
import {
  RightPanel, PanelContent, SidebarTitle, SearchInput, CloseBtn,
  SectionTitle, TechChip, TechCategory, CategoryLabel
} from './editorStyles';
import {
  GenerateSection, CustomTechInput, AiBadge, DeleteBtn, EmptyState, EmptyStateLabel, WideButton
} from './TechInventoryPanel.styles';

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
            <CustomTechInput
              placeholder="Describe custom tech..."
              value={customTechPrompt}
              onChange={e => onCustomTechPromptChange(e.target.value)}
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
