'use client';

import { useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import {
  getNodeDisplayName,
  getNodeImplementationDisplayName,
  getNodeUnitTypeLabel,
  isSemanticNodeData
} from '@/lib/nodePresentation';
import {
  RightPanel, PanelContent, SidebarTitle, SearchInput, CloseBtn,
  SectionTitle, TechCategory, CategoryLabel
} from '../editorStyles';
import {
  GenerateSection,
  CustomTechInput,
  AiBadge,
  DeleteBtn,
  EmptyState,
  EmptyStateLabel,
  InventoryCard,
  InventoryCardDescription,
  InventoryCardFooter,
  InventoryCardHeader,
  InventoryCardHint,
  InventoryCardMeta,
  InventoryCardTitle,
  PanelHint,
  PanelHintBody,
  PanelHintTitle,
  ResponsibilityBuilder,
  ResponsibilityBuilderActions,
  ResponsibilityField,
  ResponsibilityInput,
  ResponsibilityLabel,
  SelectedTechnology,
  SelectedTechnologyClear,
  SelectedTechnologyLabel,
  SelectedTechnologyName,
  SelectTechnologyButton,
  UseTechnologyButton,
  WideButton
} from './TechInventoryPanel.styles';

export default function TechInventoryPanel({
  open, searchTerm, onSearchTermChange,
  inventory, customTechPrompt, onCustomTechPromptChange,
  generatingTech, onGenerateTech, onDragStart, onDeleteGeneratedTechnology,
  onClose,
  selectedNode,
  onReplaceNode,
  onCreateUnit
}) {
  const [responsibility, setResponsibility] = useState('');
  const [builderTechnology, setBuilderTechnology] = useState(null);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const selectedNodeLabel = selectedNode ? getNodeDisplayName(selectedNode.data) : '';
  const selectedNodeIsSemantic = selectedNode ? isSemanticNodeData(selectedNode.data) : false;
  const selectedTechnology = selectedNode ? getNodeImplementationDisplayName(selectedNode.data) : '';
  const builderReady = Boolean(responsibility.trim() && builderTechnology);

  const handleCreateUnit = (technology = builderTechnology) => {
    if (!responsibility.trim() || !technology) {
      return;
    }

    onCreateUnit?.({
      responsibility,
      technology
    });
    setResponsibility('');
    setBuilderTechnology(null);
  };

  const matchesSearch = (tech) => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = [tech.name, tech.description, tech.role, tech.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  };

  const renderInventoryCard = (tech, category, metaLabel, options = {}) => {
    const technology = { ...tech, category };
    const isBuilderSelection = builderTechnology?.name === tech.name
      && builderTechnology?.category === category;
    const directCreateLabel = responsibility.trim()
      ? `Use ${tech.name} for ${responsibility.trim()}`
      : `Choose ${tech.name} for architecture unit`;

    return (
    <InventoryCard
      key={options.keyId || tech.id || `${category}_${tech.name}`}
      draggable
      $selected={isBuilderSelection}
      onDragStart={event => onDragStart(event, technology)}
    >
      <InventoryCardHeader>
        <InventoryCardTitle>{tech.name}</InventoryCardTitle>
        <InventoryCardMeta>{metaLabel}</InventoryCardMeta>
      </InventoryCardHeader>
      <InventoryCardDescription>
        {tech.description || tech.role || `Use ${tech.name} inside the ${category} layer.`}
      </InventoryCardDescription>
      <InventoryCardFooter>
        <InventoryCardHint>
          {selectedNodeIsSemantic && selectedNode?.data?.category === category
            ? `Compatible with ${selectedNodeLabel}`
            : `Drag to ${category}`}
        </InventoryCardHint>
        <div>
          {selectedNodeIsSemantic && selectedNode?.data?.category === category && (
            <UseTechnologyButton
              type="button"
              onClick={() => onReplaceNode?.(technology)}
            >
              Use technology
            </UseTechnologyButton>
          )}
          {!selectedNodeIsSemantic && (
            <SelectTechnologyButton
              type="button"
              $selected={isBuilderSelection}
              onClick={() => {
                if (responsibility.trim()) {
                  handleCreateUnit(technology);
                  return;
                }

                setBuilderTechnology(technology);
              }}
              aria-label={directCreateLabel}
            >
              {responsibility.trim()
                ? 'Use for unit'
                : isBuilderSelection
                ? <Check size={12} aria-hidden="true" />
                : 'Choose'}
            </SelectTechnologyButton>
          )}
          {options.showAiBadge && <AiBadge>AI</AiBadge>}
          {options.showDelete && (
            <DeleteBtn
              type="button"
              aria-label={`Remove ${tech.name} from this session`}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteGeneratedTechnology?.(tech.id);
              }}
            >
              <Trash2 size={12} />
            </DeleteBtn>
          )}
        </div>
      </InventoryCardFooter>
    </InventoryCard>
    );
  };

  return (
    <RightPanel $open={open}>
      {open && (
        <PanelContent>
          <SidebarTitle>
            Technology Library
            <CloseBtn type="button" onClick={onClose} aria-label="Close tech library">
              ×
            </CloseBtn>
          </SidebarTitle>
          <PanelHint>
            <PanelHintTitle>
              {selectedNodeIsSemantic
                ? `Selected Unit: ${selectedNodeLabel}`
                : 'Technology vs Responsibility'}
            </PanelHintTitle>
            <PanelHintBody>
              {selectedNodeIsSemantic
                ? `This unit keeps its architectural role. Use a compatible technology below to swap its implementation${selectedTechnology ? `, currently ${selectedTechnology}` : ''}. Dragging still adds a separate node.`
                : 'Generated diagrams can show semantic units like claims processing or audit logging. This library is where you choose the technology that implements those responsibilities.'}
            </PanelHintBody>
          </PanelHint>

          {!selectedNodeIsSemantic && (
            <>
              <SectionTitle>Create Architecture Unit</SectionTitle>
              <ResponsibilityBuilder>
                <ResponsibilityField>
                  <ResponsibilityLabel htmlFor="architecture-unit-responsibility">
                    1. Name the responsibility
                  </ResponsibilityLabel>
                  <ResponsibilityInput
                    id="architecture-unit-responsibility"
                    value={responsibility}
                    onChange={event => setResponsibility(event.target.value)}
                    placeholder="Data Layer, Lab Service, Audit Log..."
                    onKeyDown={event => {
                      if (event.key === 'Enter' && builderReady) {
                        handleCreateUnit(builderTechnology);
                      }
                    }}
                  />
                </ResponsibilityField>

                <ResponsibilityField>
                  <ResponsibilityLabel>2. Choose its technology below</ResponsibilityLabel>
                  <SelectedTechnology $empty={!builderTechnology}>
                    <div>
                      <SelectedTechnologyLabel>
                        {builderTechnology
                          ? `${getNodeUnitTypeLabel(builderTechnology.category)} · Implementation`
                          : 'Implementation'}
                      </SelectedTechnologyLabel>
                      <SelectedTechnologyName>
                        {builderTechnology?.name || 'No technology selected'}
                      </SelectedTechnologyName>
                    </div>
                    {builderTechnology && (
                      <SelectedTechnologyClear
                        type="button"
                        onClick={() => setBuilderTechnology(null)}
                        aria-label={`Clear ${builderTechnology.name} selection`}
                      >
                        <X size={13} aria-hidden="true" />
                      </SelectedTechnologyClear>
                    )}
                  </SelectedTechnology>
                </ResponsibilityField>

                <ResponsibilityBuilderActions>
                  <WideButton
                    type="button"
                    onClick={() => handleCreateUnit(builderTechnology)}
                    disabled={!builderReady}
                  >
                    Add Unit to Canvas
                  </WideButton>
                </ResponsibilityBuilderActions>
              </ResponsibilityBuilder>
            </>
          )}

          <SearchInput
            placeholder="Filter by technology or use case..."
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
          />

          <SectionTitle>Generate Technology</SectionTitle>
          <GenerateSection>
            <CustomTechInput
              placeholder="Describe a technology or connector..."
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

          {Object.keys(inventory.builtIn || {}).map(category => {
            const builtInForCat = inventory.builtIn[category] || [];
            const customForCat = (inventory.custom || []).filter(item => item.category === category);
            const allItems = [...builtInForCat, ...customForCat]
              .filter(matchesSearch);

            if (allItems.length === 0) return null;

            return (
              <TechCategory key={category}>
                <CategoryLabel>{category.replace('_', ' ')} technologies</CategoryLabel>
                {allItems.map((tech, idx) => renderInventoryCard(
                  tech,
                  category,
                  tech.id ? 'AI generated' : 'Built in',
                  {
                    keyId: tech.id || `${category}_${idx}_${tech.name}`,
                    showAiBadge: Boolean(tech.id),
                    showDelete: Boolean(tech.id)
                  }
                ))}
              </TechCategory>
            );
          })}

          {searchTerm && !Object.values(inventory.builtIn || {}).some(cat => cat.some(matchesSearch)) &&
           !inventory.custom?.some(matchesSearch) && (
            <EmptyState>
              <EmptyStateLabel>No matching technologies found</EmptyStateLabel>
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
