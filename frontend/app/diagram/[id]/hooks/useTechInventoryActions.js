import { useState } from 'react';
import api from '@/lib/api';

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

function buildManualUnitPosition(nodes, category) {
  const categoryIndex = Math.max(CATEGORY_ORDER.indexOf(category), 0);
  const categoryNodeCount = nodes.filter(node => (
    node.type === 'customNode' && node.data?.category === category
  )).length;

  return {
    x: 140 + (categoryIndex * 300),
    y: 140 + (categoryNodeCount * 100)
  };
}

export function useTechInventoryActions({
  nodes,
  setNodes,
  setSelectedNode,
  setLeftSidebarOpen,
  setRightPanelOpen,
  setToast
}) {
  const [customTechPrompt, setCustomTechPrompt] = useState('');
  const [generatingTech, setGeneratingTech] = useState(false);
  const [generatedTechnologies, setGeneratedTechnologies] = useState([]);

  const handleGenerateTech = async () => {
    if (!customTechPrompt.trim()) return;

    setGeneratingTech(true);
    try {
      const tech = await api.generateTech({ description: customTechPrompt });
      const generatedTechnology = {
        ...tech,
        id: `generated_${Date.now()}`
      };

      setGeneratedTechnologies(current => [
        generatedTechnology,
        ...current.filter(item => (
          item.name !== generatedTechnology.name || item.category !== generatedTechnology.category
        ))
      ]);
      setCustomTechPrompt('');
      setToast({ message: 'TECH_READY_FOR_THIS_SESSION', error: false });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Tech generation failed:', err);
      setToast({ message: 'TECH_SYNTHESIS: FAILED', error: true });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setGeneratingTech(false);
    }
  };

  const deleteGeneratedTechnology = (techId) => {
    setGeneratedTechnologies(current => current.filter(item => item.id !== techId));
    setToast({ message: 'SESSION_TECH_REMOVED', error: false });
    setTimeout(() => setToast(null), 2000);
  };

  const handleDragStart = (e, tech) => {
    e.dataTransfer.setData('tech', JSON.stringify(tech));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const techData = e.dataTransfer.getData('tech');
    if (!techData) return;

    let tech;
    try {
      tech = JSON.parse(techData);
    } catch {
      setToast({ message: 'Invalid tech data', error: true });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    const reactFlowBounds = e.target.getBoundingClientRect();
    const position = {
      x: e.clientX - reactFlowBounds.left - 70,
      y: e.clientY - reactFlowBounds.top - 30
    };

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'customNode',
      position,
      data: {
        label: tech.name,
        role: tech.description || tech.role || tech.name,
        category: tech.category,
        icon: tech.icon,
        implementation: tech.name,
        implementationDescription: tech.description || tech.role || '',
        products: tech.products || []
      }
    };

    setNodes(nds => [...nds, newNode]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCreateArchitectureUnit = ({ responsibility, technology }) => {
    const normalizedResponsibility = responsibility.trim();

    if (!normalizedResponsibility || !technology?.name || !technology?.category) {
      return;
    }

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'customNode',
      position: buildManualUnitPosition(nodes, technology.category),
      data: {
        label: normalizedResponsibility,
        role: `Runs ${normalizedResponsibility.toLowerCase()} workflows`,
        reason: `${technology.name} selected to implement ${normalizedResponsibility}`,
        category: technology.category,
        icon: technology.icon || 'server',
        implementation: technology.name,
        implementationDescription: technology.description || technology.role || '',
        products: technology.products || []
      }
    };

    setNodes(currentNodes => [...currentNodes, newNode]);
    setSelectedNode?.(newNode);
    setRightPanelOpen?.(false);
    setLeftSidebarOpen?.(true);
    setToast({
      message: `UNIT_CREATED: ${normalizedResponsibility} · ${technology.name}`,
      error: false
    });
    setTimeout(() => setToast(null), 2400);
  };

  return {
    customTechPrompt,
    setCustomTechPrompt,
    generatingTech,
    generatedTechnologies,
    handleGenerateTech,
    deleteGeneratedTechnology,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleCreateArchitectureUnit
  };
}
