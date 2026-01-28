
import React, { useState, useEffect } from 'react';
import { ChecklistItem } from '../types';
import { getChecklistItems, saveChecklistItems } from '../utils/storage';
import { Plus, Trash2, AlertCircle, ListChecks } from 'lucide-react';

const ChecklistManager: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState('');

  // Carrega os itens ao montar o componente
  // Fix: Await getChecklistItems since it is an asynchronous function
  useEffect(() => {
    const loadItems = async () => {
      const storedItems = await getChecklistItems();
      setItems(storedItems);
    };
    
    loadItems();
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newItemLabel.trim();
    
    if (!label) return;
    
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: label
    };
    
    const updatedItems = [...items, newItem];
    
    // Atualiza estado local para refletir na UI imediatamente
    setItems(updatedItems);
    // Persiste no localStorage
    saveChecklistItems(updatedItems);
    // Limpa o campo
    setNewItemLabel('');
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    saveChecklistItems(updatedItems);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <ListChecks size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Gerenciar Perguntas do Checklist</h3>
        </div>
        <p className="text-sm text-slate-500 mb-8">Adicione ou remova os itens que serão verificados durante as inspeções de rotina.</p>

        <form onSubmit={handleAddItem} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            placeholder="Nova pergunta (ex: Pintura está em bom estado?)"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!newItemLabel.trim()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </form>

        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remover pergunta"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Nenhum item configurado no checklist.</p>
              <p className="text-slate-300 text-xs mt-1">Utilize o campo acima para criar sua primeira pergunta.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4">
        <div className="p-2 bg-blue-100 rounded-full h-fit text-blue-600">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900">Configuração Dinâmica</p>
          <p className="text-xs text-blue-800 leading-relaxed">
            As alterações realizadas aqui são aplicadas instantaneamente a todas as novas inspeções iniciadas pela equipe de campo. O histórico de inspeções passadas não será alterado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChecklistManager;