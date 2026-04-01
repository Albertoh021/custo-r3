import { TrendingUp, FileText, Anchor } from 'lucide-react';
import type { LogisticsRecord } from '../types';
import { formatCurrency } from '../utils';

interface DashboardHeaderProps {
  records: LogisticsRecord[];
  darkMode: boolean;
}

export const DashboardHeader = ({ records, darkMode }: DashboardHeaderProps) => {
  const totalDeliveries = records.reduce((acc, r) => acc + r.entregas, 0);
  const totalGross = records.reduce((acc, r) => acc + r.valorFaturado, 0);
  const totalCosts = records.reduce((acc, r) => acc + r.vlrTotal, 0);
  const totalNet = records.reduce((acc, r) => acc + r.lucroBruto, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Gross Revenue */}
      <div className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Receita Bruta</p>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {formatCurrency(totalGross)}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-blue-50 text-blue-600'}`}>
          <FileText size={24} />
        </div>
      </div>

      {/* Costs */}
      <div className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Custo Motoristas</p>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {formatCurrency(totalCosts)}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-orange-900/30 text-orange-500' : 'bg-orange-50 text-orange-500'}`}>
          <Anchor size={24} />
        </div>
      </div>

      {/* Net Profit */}
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lucro Líquido</p>
            <p className={`text-2xl font-bold ${totalNet >= 0 ? (darkMode ? 'text-emerald-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-500')}`}>
              {formatCurrency(totalNet)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${totalNet >= 0 ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-500')}`}>
            <TrendingUp size={24} className={totalNet < 0 ? 'rotate-180' : ''} />
          </div>
        </div>
      </div>

      {/* Deliveries */}
      <div className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Entregas Totais</p>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
            {totalDeliveries.toLocaleString()}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
          <TrendingUp size={24} />
        </div>
      </div>

    </div>
  );
};
