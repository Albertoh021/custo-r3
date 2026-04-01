import type { LogisticsRecord } from '../types';
import { formatCurrency, formatPercent } from '../utils';
import { Trash2 } from 'lucide-react';

interface TableRowProps {
  record: LogisticsRecord;
  onChange: (id: string, field: keyof LogisticsRecord, value: string | number) => void;
  onDelete: (id: string) => void;
  darkMode: boolean;
}

export const TableRow = ({ record, onChange, onDelete, darkMode }: TableRowProps) => {

  const baseInputClass = `bg-transparent border-0 focus:ring-2 outline-none text-sm transition-all rounded px-2 py-1`;
  const lightInputClass = `focus:ring-blue-500 hover:bg-slate-50 text-slate-800 placeholder-slate-300`;
  const darkInputClass = `focus:ring-indigo-500 hover:bg-slate-800 text-slate-200 placeholder-slate-600`;
  const inputTheme = darkMode ? darkInputClass : lightInputClass;

  const InputText = ({ field, widthClass = 'w-full' }: { field: keyof LogisticsRecord, widthClass?: string }) => (
    <input
      type="text"
      value={record[field] as string}
      onChange={(e) => onChange(record.id, field, e.target.value)}
      className={`${baseInputClass} ${inputTheme} ${widthClass}`}
      placeholder={`---`}
    />
  );

  const InputNum = ({ field, widthClass = 'w-full text-right' }: { field: keyof LogisticsRecord, widthClass?: string }) => (
    <input
      type="number"
      value={record[field] === 0 ? '' : Number(record[field])}
      onChange={(e) => onChange(record.id, field, parseFloat(e.target.value) || 0)}
      className={`${baseInputClass} ${inputTheme} ${widthClass}`}
      placeholder="0"
      step="any"
    />
  );

  const profitColorLight = record.lucroBruto >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
  const profitColorDark = record.lucroBruto >= 0 ? 'text-emerald-400 bg-emerald-900/30' : 'text-red-400 bg-red-900/30';
  const profitColor = `font-semibold rounded-md px-2 py-1 ${darkMode ? profitColorDark : profitColorLight}`;

  const rowHover = darkMode ? 'hover:bg-slate-800/80 border-b border-slate-800' : 'hover:bg-blue-50/30 border-b border-slate-100';

  const fixedTdClass = `p-3 sticky left-0 z-10 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)] ${darkMode ? 'bg-slate-900/95 border-r border-slate-800' : 'bg-white border-r border-slate-100'}`;
  const tdBgClass = darkMode ? 'bg-slate-900/40 text-slate-300' : 'bg-slate-50/50 text-slate-700';

  return (
    <tr className={`transition-colors group ${rowHover}`}>
      
      <td className={fixedTdClass}><InputText field="motorista" /></td>
      <td className="p-3"><InputText field="tipoContrato" /></td>
      <td className="p-3"><InputText field="veiculo" /></td>
      <td className="p-3"><InputText field="operacao" /></td>
      
      <td className="p-3"><InputNum field="vlrDiaria" /></td>
      <td className="p-3"><InputNum field="diasTrabalhados" /></td>
      <td className="p-3"><InputNum field="entregas" /></td>
      <td className="p-3"><InputNum field="valorFaturado" /></td>
      <td className="p-3"><InputNum field="insucessos" /></td>
      
      <td className={`p-3 text-right text-sm font-medium ${tdBgClass}`}>{formatCurrency(record.vlrDasDiarias)}</td>
      
      <td className="p-3"><InputNum field="vlrEntregas" /></td>
      <td className="p-3"><InputNum field="bonus" /></td>
      <td className="p-3"><InputNum field="coletas" /></td>
      <td className="p-3"><InputNum field="vlrColetas" /></td>
      <td className="p-3"><InputNum field="vlrSabado" /></td>
      <td className="p-3"><InputNum field="pedagio" /></td>
      <td className="p-3"><InputNum field="mudanca" /></td>
      <td className="p-3"><InputNum field="outrosValores" /></td>
      <td className="p-3"><InputNum field="descontos" /></td>
      
      <td className={`p-3 text-right text-sm font-medium ${darkMode ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-100/50 text-slate-800'}`}>{formatCurrency(record.vlrTotal)}</td>
      <td className="p-3 text-right text-sm text-slate-500">{formatCurrency(record.tckMedio)}</td>
      <td className="p-3 text-right text-sm"><span className={profitColor}>{formatCurrency(record.lucroBruto)}</span></td>
      <td className={`p-3 text-right text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{formatPercent(record.pctCusto)}</td>
      
      <td className="p-3 text-right text-sm text-slate-500">{Number(record.entregasDia).toFixed(1)}</td>
      <td className="p-3 text-right text-sm text-slate-500">{Number(record.coletasDia).toFixed(1)}</td>
      
      <td className="p-3"><InputText field="regiaoEntrega" /></td>
      <td className="p-3"><InputText field="cep" /></td>
      <td className="p-3"><InputNum field="pctColetados" /></td>
      <td className="p-3"><InputNum field="pctPorPonto" /></td>
      
      <td className="p-3 text-center">
        <button 
          onClick={() => onDelete(record.id)}
          className={`p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'text-slate-600 hover:text-red-400 hover:bg-slate-800' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
          title="Excluir linha"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
