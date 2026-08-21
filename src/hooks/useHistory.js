import { useState, useEffect, useMemo, useCallback } from 'react';
import { historyService } from '../services/history/historyService';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export const useHistory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToast } = useToast();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await historyService.getAll(user?.id);
      setItems(data);
    } catch (err) {
      console.error("Failed loading user history:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const toggleFavorite = useCallback(async (id) => {
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    const newFavoriteState = !targetItem.isFavorite;
    
    // Optimistic UI update
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: newFavoriteState } : item
    ));

    await historyService.toggleFavorite(id, targetItem.isFavorite);
    addToast(newFavoriteState ? 'Added to favorites' : 'Removed from favorites', 'info');
  }, [items, addToast]);

  const deleteItem = useCallback(async (id) => {
    // Optimistic UI update
    setItems(prev => prev.filter(item => item.id !== id));
    await historyService.deleteItem(id);
    addToast('Generation deleted', 'warning');
  }, [addToast]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter(item => {
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query);
      
      const matchesCategory = selectedCategory === 'All' || 
        (selectedCategory === 'Favorites' ? item.isFavorite : (item.toolName && item.toolName.toLowerCase().includes(selectedCategory.toLowerCase())));
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  return {
    loading,
    items: filteredItems,
    rawItems: items,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    toggleFavorite,
    deleteItem,
    refreshHistory: loadHistory
  };
};
