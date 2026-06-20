'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, GripVertical, Sparkles, Trash2, X } from 'lucide-react';
import {
  getNodeDisplayName,
  getNodeImplementationDisplayName,
  getNodeUnitTypeLabel,
  isSemanticNodeData
} from '@/lib/nodePresentation';
import {
  RightPanel, PanelContent, SidebarTitle, SearchInput, CloseBtn
} from '../editorStyles';
import {
  CatalogCount,
  CatalogHeader,
  CategoryBody,
  CategoryButton,
  CategoryCount,
  CategoryHeading,
  CategoryStack,
  CollapsibleSection,
  CollapsibleSectionButton,
  DragHandle,
  GenerateSection,
  CustomTechInput,
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
  ResponsibilityBuilderTitle,
  ResponsibilityField,
  ResponsibilityInput,
  ResponsibilityLabel,
  SearchSection,
  SelectedTechnology,
  SelectedTechnologyClear,
  SelectedTechnologyLabel,
  SelectedTechnologyName,
  SelectTechnologyButton,
  UseTechnologyButton,
  WideButton
} from './TechInventoryPanel.styles';

const CATEGORY_ORDER = [
  'mobile',
  'frontend',
  'auth',
  'backend',
  'database',
  'queue',
  'storage',
  'external',
  'devops'
];

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
  const [expandedCategories, setExpandedCategories] = useState({ backend: true });
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const selectedNodeLabel = selectedNode ? getNodeDisplayName(selectedNode.data) : '';
  const selectedNodeIsSemantic = selectedNode ? isSemanticNodeData(selectedNode.data) : false;
  const selectedTechnology = selectedNode ? getNodeImplementationDisplayName(selectedNode.data) : '';
  const builderReady = Boolean(responsibility.trim() && builderTechnology);

  useEffect(() => {
    if (!selectedNodeIsSemantic || !selectedNode?.data?.category) {
      return;
    }

    setExpandedCategories(current => ({
      ...current,
      [selectedNode.data.category]: true
    }));
  }, [selectedNode?.data?.category, selectedNodeIsSemantic]);

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

  const categorizedTechnologies = useMemo(() => {
    const builtIn = inventory.builtIn || {};
    const generated = inventory.custom || [];
    const categories = new Set([
      ...CATEGORY_ORDER,
      ...Object.keys(builtIn),
      ...generated.map(item => item.category).filter(Boolean)
    ]);

    return [...categories]
      .map(category => {
        const deduped = new Map();

        [
          ...(builtIn[category] || []),
          ...generated.filter(item => item.category === category)
        ].forEach(item => {
          const key = String(item.name || '').trim().toLowerCase();
          if (key && !deduped.has(key)) {
            deduped.set(key, item);
          }
        });

        const items = [...deduped.values()].filter(matchesSearch);

        return { category, items };
      })
      .filter(group => group.items.length > 0)
      .filter(group => (
        !selectedNodeIsSemantic || group.category === selectedNode?.data?.category
      ))
      .sort((a, b) => (
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      ));
  }, [inventory.builtIn, inventory.custom, normalizedSearch, selectedNode?.data?.category, selectedNodeIsSemantic]);

  const technologyCount = categorizedTechnologies.reduce(
    (total, group) => total + group.items.length,
    0
  );

  const toggleCategory = (category) => {
    setExpandedCategories(current => ({
      ...current,
      [category]: !current[category]
    }));
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
        <DragHandle aria-hidden="true">
          <GripVertical size={14} />
        </DragHandle>
        <div>
          <InventoryCardHeader>
            <InventoryCardTitle>{tech.name}</InventoryCardTitle>
            <InventoryCardMeta>{metaLabel}</InventoryCardMeta>
          </InventoryCardHeader>
          <InventoryCardDescription>
            {tech.description || tech.role || `Use ${tech.name} inside the ${category} layer.`}
          </InventoryCardDescription>
          <InventoryCardHint>
            {selectedNodeIsSemantic && selectedNode?.data?.category === category
              ? `Compatible with ${selectedNodeLabel}`
              : `Drag to add as ${getNodeUnitTypeLabel(category).toLowerCase()}`}
          </InventoryCardHint>
        </div>
        <InventoryCardFooter>
          {selectedNodeIsSemantic && selectedNode?.data?.category === category && (
            <UseTechnologyButton
              type="button"
              onClick={() => onReplaceNode?.(technology)}
            >
              Use
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
                ? 'Use'
                : isBuilderSelection
                ? <Check size={12} aria-hidden="true" />
                : 'Choose'}
            </SelectTechnologyButton>
          )}
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
                ? `Swap the implementation without changing ${selectedNodeLabel}${selectedTechnology ? `, currently ${selectedTechnology}` : ''}.`
                : 'Name what the unit does, then choose the technology that runs it.'}
            </PanelHintBody>
          </PanelHint>

          {!selectedNodeIsSemantic && (
            <ResponsibilityBuilder>
              <ResponsibilityBuilderTitle>Create Architecture Unit</ResponsibilityBuilderTitle>
                <ResponsibilityField>
                  <ResponsibilityLabel htmlFor="architecture-unit-responsibility">
                    Responsibility
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

                <SelectedTechnology $empty={!builderTechnology}>
                  <div>
                    <SelectedTechnologyLabel>
                      {builderTechnology
                        ? `${getNodeUnitTypeLabel(builderTechnology.category)} · Implementation`
                        : 'Choose a technology below'}
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
          )}

          <SearchSection>
            <SearchInput
              placeholder="Search technologies or use cases..."
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
            />
          </SearchSection>

          <CatalogHeader>
            <CatalogCount>
              {technologyCount} {technologyCount === 1 ? 'technology' : 'technologies'}
            </CatalogCount>
            {selectedNodeIsSemantic && (
              <CatalogCount>{getNodeUnitTypeLabel(selectedNode.data.category)}</CatalogCount>
            )}
          </CatalogHeader>

          <CategoryStack>
            {categorizedTechnologies.map(({ category, items }) => {
              const expanded = Boolean(normalizedSearch)
                || Boolean(expandedCategories[category]);

              return (
                <CategoryHeading key={category}>
                  <CategoryButton
                    type="button"
                    onClick={() => toggleCategory(category)}
                    aria-expanded={expanded}
                    $expanded={expanded}
                  >
                    <span>{getNodeUnitTypeLabel(category)}</span>
                    <CategoryCount>{items.length}</CategoryCount>
                    <ChevronDown size={15} aria-hidden="true" />
                  </CategoryButton>
                  <CategoryBody $expanded={expanded}>
                    <div>
                      {items.map((tech, idx) => renderInventoryCard(
                        tech,
                        category,
                        tech.id ? 'AI generated' : 'Built in',
                        {
                          keyId: tech.id || `${category}_${idx}_${tech.name}`,
                          showDelete: Boolean(tech.id)
                        }
                      ))}
                    </div>
                  </CategoryBody>
                </CategoryHeading>
              );
            })}
          </CategoryStack>

          <CollapsibleSection>
            <CollapsibleSectionButton
              type="button"
              onClick={() => setGeneratorOpen(current => !current)}
              aria-expanded={generatorOpen}
              $expanded={generatorOpen}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Can’t find a technology?</span>
              <ChevronDown size={15} aria-hidden="true" />
            </CollapsibleSectionButton>
            {generatorOpen && (
              <GenerateSection>
                <CustomTechInput
                  placeholder="Describe a technology or connector..."
                  value={customTechPrompt}
                  onChange={e => onCustomTechPromptChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onGenerateTech()}
                />
                <WideButton
                  onClick={onGenerateTech}
                  disabled={generatingTech || !customTechPrompt.trim()}
                >
                  {generatingTech ? 'Synthesizing...' : 'Generate Technology'}
                </WideButton>
              </GenerateSection>
            )}
          </CollapsibleSection>

          {searchTerm && categorizedTechnologies.length === 0 && (
            <EmptyState>
              <EmptyStateLabel>No matching technologies found</EmptyStateLabel>
              <WideButton
                onClick={() => {
                  onCustomTechPromptChange(searchTerm);
                  setGeneratorOpen(true);
                }}
              >
                Generate “{searchTerm}”
              </WideButton>
            </EmptyState>
          )}
        </PanelContent>
      )}
    </RightPanel>
  );
}
