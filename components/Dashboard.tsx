
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Extinguisher } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Package } from 'lucide-react';

interface Props {
  extinguishers: Extinguisher[];
}

const Dashboard: React.FC<Props> = ({ extinguishers }) => {
  const stats = useMemo(() => {
    const total = extinguishers.length;
    const expired = extinguishers.filter(e => new Date(e.expiryDate) < new Date()).length;
    const nearExpiry = extinguishers.filter(e => {
      const diff = new Date(e.expiryDate).getTime() - new Date().getTime();
      const days = diff / (1000 * 3600 * 24);
      return days > 0 && days < 30;
    }).length;
    const active = total - expired - nearExpiry;

    return { total, expired, nearExpiry, active };
  }, [extinguishers]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    extinguishers.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: 'Nenhum', value: 0 }];
  }, [extinguishers]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">Total</p>
              <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">Conformes</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600">{stats.active}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">Próximo Venc.</p>
              <h3 className="text-3xl font-bold mt-1 text-amber-600">{stats.nearExpiry}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">Vencidos</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600">{stats.expired}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Distribuição por Tipo</h4>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Status Operacional</h4>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={[
                { name: 'OK', value: stats.active },
                { name: 'Alerta', value: stats.nearExpiry },
                { name: 'Crítico', value: stats.expired },
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  { [stats.active, stats.nearExpiry, stats.expired].map((_, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
