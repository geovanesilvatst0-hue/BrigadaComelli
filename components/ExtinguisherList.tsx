
import React from 'react';
import { Extinguisher } from '../types';
import { STATUS_COLORS } from '../constants';
import { Calendar, MapPin, Search, Plus, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface Props {
  extinguishers: Extinguisher[];
  onInspect: (ext: Extinguisher) => void;
  onAdd: () => void;
}

const ExtinguisherList: React.FC<Props> = ({ extinguishers, onInspect, onAdd }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = extinguishers.filter(e => 
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código ou local..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Novo Extintor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ext => {
          const isExpired = new Date(ext.expiryDate) < new Date();
          const status = isExpired ? 'expired' : ext.status;
          
          return (
            <div key={ext.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
                      {status === 'expired' ? 'Vencido' : 'Em Dia'}
                    </span>
                    <h3 className="text-xl font-bold mt-2">{ext.code}</h3>
                    <p className="text-sm text-slate-500 font-medium">{ext.type}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600 font-bold text-sm">
                    {ext.capacity}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{ext.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Validade: {new Date(ext.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onInspect(ext)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <ClipboardCheck size={16} />
                    Inspecionar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
          <AlertTriangle className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-600">Nenhum extintor encontrado</h3>
          <p className="text-slate-400">Tente ajustar sua busca ou adicione um novo registro.</p>
        </div>
      )}
    </div>
  );
};

export default ExtinguisherList;
