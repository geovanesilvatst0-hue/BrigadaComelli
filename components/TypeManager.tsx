
import React, { useState, useEffect } from 'react';
import { ExtinguisherType } from '../types';
import { getExtinguisherTypes, saveExtinguisherTypes } from '../utils/storage';
import { Plus, Trash2, AlertCircle, Flame } from 'lucide-react';

const TypeManager: React.FC = () => {
  const [types, setTypes] = useState<ExtinguisherType[]>([]);
  const [newName, setNewName] = useState('');

  // Fix: Await getExtinguisherTypes as it returns a Promise
  useEffect(() => {
    const loadTypes = async () => {
      const fetchedTypes = await getExtinguisherTypes();
      setTypes(fetchedTypes);
    };
    
    loadTypes();
  }, []);

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    const newType: ExtinguisherType = {
      id: `type-${Date.now()}`,
      name: name
    };

    const updated = [...types, newType];
    setTypes(updated);
    saveExtinguisherTypes(updated);
    setNewName('');
  };

  const handleRemoveType = (id: string) => {
    const updated = types.filter(t => t.id !== id);
    setTypes(updated);
    saveExtinguisherTypes(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <Flame size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Gerenciar Tipos de Extintores</h3>
        </div>
        <p className="text-sm text-slate-500 mb-8">Defina as categorias de extintores disponíveis na sua unidade (ex: PQS, CO2, etc).</p>

        <form onSubmit={handleAddType} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do tipo (ex: Halon, Classe D...)"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {types.map((type) => (
            <div 
              key={type.id} 
              className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all group"
            >
              <span className="text-sm font-semibold text-slate-700">{type.name}</span>
              <button
                onClick={() => handleRemoveType(type.id)}
                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {types.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-400 text-sm">Nenhum tipo cadastrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypeManager;