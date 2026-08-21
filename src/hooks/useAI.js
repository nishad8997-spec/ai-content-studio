import { useState, useCallback, useRef, useEffect } from 'react';
import { aiService } from '../services/ai/aiService';
import { historyService } from '../services/history/historyService';
import { billingService } from '../services/billing/billingService';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

/**
 * Deterministic calculation of credit cost per tool execution based on tool type and model multiplier.
 * Matches authoritative server-side TOOL_ROUTING definitions.
 */
export function calculateGenerationCredits({ toolId, outputSize = 'standard', modelMultiplier = 1.0 }) {
  const baseCredits = {
    'blog-writer': 15,
    'email-writer': 10,
    'instagram-caption': 5,
    'facebook-ads': 8,
    'product-description': 10
  }[toolId] || 10;

  return Math.round(baseCredits * modelMultiplier);
}

export const useAI = () => {
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [lastGeneration, setLastGeneration] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();
  const abortControllerRef = useRef(null);

  // Cleanup pending streaming task on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const generateContent = useCallback(async (tool, inputs) => {
    // Abort previous stream if active
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const requiredCredits = calculateGenerationCredits({ toolId: tool.id });

    // 1. Pre-generation Balance Validation
    if (user?.id) {
      try {
        const wallet = await billingService.getUserWallet(user.id);
        const availableCredits = wallet?.monthly_credits_remaining ?? 60;
        
        if (availableCredits < requiredCredits) {
          addToast(
            `Not enough credits for this generation. Your current balance: ${availableCredits} credits (${requiredCredits} required). Upgrade your plan to continue creating.`,
            'error'
          );
          return;
        }
      } catch (err) {
        console.warn("Could not verify wallet prior to generation:", err);
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGenerating(true);
    setOutput('');
    setActiveTool(tool);
    setLastGeneration(null);
    setIsSaved(false);

    try {
      await aiService.generateStream(
        tool.id,
        inputs,
        (chunkText) => {
          if (!controller.signal.aborted) {
            setOutput(chunkText);
          }
        },
        async (completedResult) => {
          if (controller.signal.aborted) return;
          setGenerating(false);

          const completedText = typeof completedResult === 'string' ? completedResult : (completedResult?.text || '');
          const words = typeof completedResult === 'object' && completedResult?.wordCount 
            ? completedResult.wordCount 
            : completedText.trim().split(/\s+/).filter(Boolean).length;
          const credits = typeof completedResult === 'object' && completedResult?.creditsDeducted 
            ? completedResult.creditsDeducted 
            : requiredCredits;
          const serverGenId = typeof completedResult === 'object' ? completedResult?.generationId : null;

          let savedRow = null;
          if (serverGenId) {
            // Already persisted authoritatively server-side by Edge Function
            savedRow = {
              id: serverGenId,
              toolId: tool.id,
              toolName: tool.name,
              title: inputs.topic || inputs.productName || inputs.recipient || inputs.description?.slice(0, 30) || `${tool.name} Result`,
              content: completedText,
              wordCount: words,
              creditsDeducted: credits,
              isFavorite: false,
              createdAt: new Date().toISOString()
            };
          } else {
            // Fallback for offline / dev mock mode
            savedRow = await historyService.addGeneration({
              toolId: tool.id,
              toolName: tool.name,
              title: inputs.topic || inputs.productName || inputs.recipient || inputs.description?.slice(0, 30) || `${tool.name} Result`,
              inputs: inputs,
              preview: completedText.slice(0, 140) + '...',
              content: completedText,
              wordCount: words,
              creditsDeducted: credits
            }, user?.id);
          }

          if (savedRow) {
            setLastGeneration(savedRow);
          }

          addToast(`Generated ${words} words (${credits} credits used)!`, 'success');
        },
        controller.signal
      );
    } catch (err) {
      if (!controller.signal.aborted) {
        setGenerating(false);
        addToast(err.message || 'AI Generation failed', 'error');
      }
    }
  }, [user, addToast]);

  const toggleSaveCurrentGeneration = useCallback(async () => {
    if (!lastGeneration?.id) {
      addToast("Generate content first to save it to your workspace.", "warning");
      return;
    }

    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);

    try {
      await historyService.toggleFavorite(lastGeneration.id, isSaved);
      if (nextSavedState) {
        addToast("Saved to your workspace.", "success");
      } else {
        addToast("Removed from saved bookmarks.", "info");
      }
    } catch (err) {
      setIsSaved(!nextSavedState); // Revert on failure
      addToast("Could not save this generation. Please try again.", "error");
    }
  }, [lastGeneration, isSaved, addToast]);

  const resetOutput = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setOutput('');
    setActiveTool(null);
    setLastGeneration(null);
    setIsSaved(false);
    setGenerating(false);
  }, []);

  return {
    generating,
    output,
    activeTool,
    lastGeneration,
    isSaved,
    generateContent,
    toggleSaveCurrentGeneration,
    resetOutput
  };
};
