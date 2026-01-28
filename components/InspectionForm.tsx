
import React, { useState, useRef, useEffect } from 'react';
import { Extinguisher, Inspection, InspectionStatus, ChecklistItem } from '../types';
import { Camera, Check, X, Loader2, Save, BrainCircuit } from 'lucide-react';
import { analyzeExtinguisherPhoto } from '../services/geminiService';
import { getChecklistItems } from '../utils/storage';

interface Props {
  extinguisher: Extinguisher;
  onSubmit: (inspection: Inspection) => void;
  onCancel: () => void;
}

const InspectionForm: React.FC<Props> = ({ extinguisher, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inspector, setInspector] = useState('Inspetor Padrão');
  const [responses, setResponses] = useState<{ [key: string]: boolean }>({});
  const [notes, setNotes] = useState('');

  // Fix: Handle asynchronous getChecklistItems correctly in useEffect
  useEffect(() => {
    const loadChecklist = async () => {
      const items = await getChecklistItems();
      setChecklistItems(items);
      
      // Inicializa todas as respostas como true por padrão
      const initialResponses: { [key: string]: boolean } = {};
      items.forEach(item => {
        initialResponses[item.id] = true;
      });
      setResponses(initialResponses);
    };
    
    loadChecklist();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      
      setLoading(true);
      try {
        const result = await analyzeExtinguisherPhoto(base64);
        setAnalysisResult(result);
        
        // Mapeia resultados da IA para os campos do checklist se eles existirem
        setResponses(prev => ({
          ...prev,
          manometer: result.manometerOk ?? prev.manometer,
          seal: result.sealOk ?? prev.seal,
          hose: result.hoseOk ?? prev.hose,
          casing: result.casingOk ?? prev.casing
        }));
        
        setNotes(result.observation);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggle = (id: string, value: boolean) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allOk = Object.values(responses).every(v => v === true);
    
    const inspection: Inspection = {
      id: Date.now().toString(),
      extinguisherId: extinguisher.id,
      date: new Date().toISOString(),
      inspector: inspector,
      responses: responses,
      notes: notes,
      status: allOk ? InspectionStatus.OK : InspectionStatus.NON_CONFORMING,
      photoUrl: photo || undefined
    };
    
    onSubmit(inspection);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold">Inspeção de Extintor</h2>
        <p className="text-slate-400 text-sm mt-1">{extinguisher.code} • {extinguisher.location}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Photo Upload & AI Analysis */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Evidência Fotográfica & IA</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden h-48"
          >
            {photo ? (
              <img src={photo} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            ) : (
              <Camera className="text-slate-400 mb-2" size={32} />
            )}
            
            <div className="relative z-10 text-center">
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-blue-600 mb-2" />
                  <span className="text-sm font-medium">IA Analisando...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-600">Tire uma foto ou carregue uma imagem</p>
                  <p className="text-xs text-slate-400 mt-1">A IA verificará automaticamente os itens compatíveis.</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              capture="environment"
            />
          </div>

          {analysisResult && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
              <BrainCircuit className="text-blue-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-900">Análise da IA (Confiança: {(analysisResult.confidenceScore * 100).toFixed(0)}%)</p>
                <p className="text-xs text-blue-800 mt-1">{analysisResult.observation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Checklist Dinâmico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, true)}
                  className={`p-1.5 rounded-md transition-colors ${responses[item.id] === true ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, false)}
                  className={`p-1.5 rounded-md transition-colors ${responses[item.id] === false ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-400'}`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Observações Adicionais</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
            placeholder="Descreva eventuais irregularidades ou ações necessárias..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Salvar Inspeção
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;