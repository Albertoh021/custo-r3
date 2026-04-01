import { useMemo } from 'react';
import type { LogisticsRecord } from '../types';
import { formatCurrency } from '../utils';
import { 
  DollarSign, Percent, Users, CheckCircle, 
  TrendingUp, TrendingDown, Package, Truck, 
  Home, Activity, Layers, ActivitySquare, Target
} from 'lucide-react';

interface SummaryViewProps {
  records: LogisticsRecord[];
  darkMode: boolean;
  dateRange: string;
}

export const SummaryView = ({ records, darkMode, dateRange }: SummaryViewProps) => {

  const stats = useMemo(() => {
    let faturado = 0;
    let custoGeral = 0;
    let entregas = 0;
    let insucessos = 0;

    let vlrDiarias = 0;
    let vlrPacotes = 0;
    let vlrColetas = 0;
    let vlrOutros = 0;
    let qtdPacotes = 0;
    let qtdColetas = 0;

    const categories: Record<string, {
      id: string;
      nome: string;
      icon: any;
      colorClass: string;
      motoristas: number;
      flex: number;
      growth: number;
      entregas: number;
      ptColetas: number;
      pctColetados: number;
      pctZeroColeta: number;
    }> = {
      'PACOTE': { id: 'PACOTE', nome: 'Pacotes', icon: Package, colorClass: 'blue', motoristas: 0, flex: 0, growth: 0, entregas: 0, ptColetas: 0, pctColetados: 0, pctZeroColeta: 0 },
      'DIARIA': { id: 'DIARIA', nome: 'Diárias', icon: Truck, colorClass: 'orange', motoristas: 0, flex: 0, growth: 0, entregas: 0, ptColetas: 0, pctColetados: 0, pctZeroColeta: 0 },
      'DIARIA_PACOTE': { id: 'DIARIA_PACOTE', nome: 'Diárias + Pacote', icon: Layers, colorClass: 'indigo', motoristas: 0, flex: 0, growth: 0, entregas: 0, ptColetas: 0, pctColetados: 0, pctZeroColeta: 0 },
      'COLETA': { id: 'COLETA', nome: 'Coletas', icon: ActivitySquare, colorClass: 'purple', motoristas: 0, flex: 0, growth: 0, entregas: 0, ptColetas: 0, pctColetados: 0, pctZeroColeta: 0 },
      'CASA': { id: 'CASA', nome: 'Carros da Casa (Fiorino R3)', icon: Home, colorClass: 'emerald', motoristas: 0, flex: 0, growth: 0, entregas: 0, ptColetas: 0, pctColetados: 0, pctZeroColeta: 0 },
    };

    records.forEach(r => {
      faturado += r.valorFaturado;
      custoGeral += r.vlrTotal;
      entregas += r.entregas;
      insucessos += r.insucessos;

      vlrDiarias += r.vlrDasDiarias;
      vlrPacotes += r.vlrEntregas;
      vlrColetas += r.vlrColetas;
      vlrOutros += (r.bonus + r.vlrSabado + r.pedagio + r.mudanca + r.outrosValores - r.descontos);
      
      qtdPacotes += r.entregas;
      qtdColetas += r.coletas;

      const t = (r.tipoContrato || '').toLowerCase();
      const op = (r.operacao || '').toLowerCase();
      const v = (r.veiculo || '').toLowerCase();
      
      let cat = 'PACOTE';
      // Nova REGRA DE NEGÓCIO: fiorino e r3 (no veiculo) vão para carros da casa
      if (v.includes('fiorino') || v.includes('r3') || t.includes('casa') || v.includes('casa')) cat = 'CASA';
      else if (t.includes('pacote') && (t.includes('diaria') || t.includes('diária'))) cat = 'DIARIA_PACOTE';
      else if (t.includes('pacote')) cat = 'PACOTE';
      else if (t.includes('diaria') || t.includes('diária')) cat = 'DIARIA';
      else if (t.includes('coleta')) cat = 'COLETA';
      // fallback
      else cat = 'PACOTE';

      categories[cat].motoristas += 1;
      categories[cat].entregas += r.entregas;
      categories[cat].ptColetas += r.coletas;
      categories[cat].pctColetados += r.pctColetados;
      categories[cat].pctZeroColeta += r.pctPorPonto;

      if (op.includes('flex')) categories[cat].flex += 1;
      if (op.includes('growth')) categories[cat].growth += 1;
    });

    const sla = entregas + insucessos > 0 ? (entregas / (entregas + insucessos)) * 100 : 0;

    return {
      faturado, custoGeral, entregas, insucessos, sla,
      vlrDiarias, vlrPacotes, vlrColetas, vlrOutros, qtdPacotes, qtdColetas,
      pctCusto: faturado > 0 ? (custoGeral / faturado) * 100 : 0,
      margem: faturado > 0 ? ((faturado - custoGeral) / faturado) * 100 : 0,
      tckFaturado: entregas > 0 ? faturado / entregas : 0,
      tckCusto: entregas > 0 ? custoGeral / entregas : 0,
      cats: Object.values(categories).filter(c => c.motoristas > 0 || c.id === 'CASA') // mostramos casa mesmo vazia
    };
  }, [records]);

  const totalMotoristas = records.length;
  const panelBg = darkMode ? 'bg-slate-900/80 border-slate-800 shadow-[0_4_20px_-5px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-sm';
  const textTitle = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textValue = darkMode ? 'text-white' : 'text-slate-800';

  const fmtNum = (num: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(num);

  const colors = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', badge: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', badge: darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', badge: darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', badge: darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', badge: darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600' },
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 pb-12 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Custo Executivo Geral</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Consolidação financeira e de produtividade da frota operacional.</p>
        </div>
        {dateRange && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <Activity size={16} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
            Período: {dateRange}
          </div>
        )}
      </div>

      {/* SEÇÃO 1: CUSTOS GERAIS (KPI CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>Faturamento</span>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <DollarSign size={18} />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{formatCurrency(stats.faturado)}</p>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>Custo Geral</span>
            <div className={`p-2 rounded-lg flex items-center gap-1.5 ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              <TrendingDown size={18} />
              <span className="text-xs font-bold">{stats.pctCusto.toFixed(1)}%</span>
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{formatCurrency(stats.custoGeral)}</p>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>Margem Bruta</span>
            <div className={`p-2 rounded-lg flex items-center gap-1.5 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp size={18} />
              <span className="text-xs font-bold">{stats.margem.toFixed(1)}%</span>
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{formatCurrency(stats.faturado - stats.custoGeral)}</p>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>SLA Expandido</span>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
              <Target size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className={`text-2xl sm:text-3xl font-black ${darkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>{stats.sla.toFixed(2)}%</p>
            <div className="flex gap-2">
               <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold opacity-60 pb-0.5">Tck Fato.</span>
                  <span className="text-xs font-bold">{formatCurrency(stats.tckFaturado)}</span>
               </div>
               <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold opacity-60 pb-0.5">Tck Custo.</span>
                  <span className="text-xs font-bold">{formatCurrency(stats.tckCusto)}</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* SEÇÃO 2 & 3: FATIAS E DIVISÃO FINANCEIRA */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        
        {/* FROTA (SHARE) */}
        <div className={`p-6 rounded-2xl border ${panelBg}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Users size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${textValue}`}>Composição da Frota</h3>
              <p className={`text-xs ${textTitle}`}>Total de {totalMotoristas} Motoristas Ativos</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {stats.cats.filter(c => c.nome !== 'Diárias + Pacote').map(cat => {
              const pct = totalMotoristas > 0 ? (cat.motoristas / totalMotoristas) * 100 : 0;
              const theme = colors[cat.colorClass as keyof typeof colors];
              
              let hint = '';
              if (cat.id === 'PACOTE') hint = 'Por Pacotes';
              if (cat.id === 'COLETA') hint = 'Diária e Ajuda de Custo';

              return (
                <div key={cat.id} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                       <cat.icon size={16} className={theme.text} />
                       <span className={`text-sm font-bold ${textValue}`}>{cat.nome}</span>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                         {cat.motoristas}
                       </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${textValue}`}>{pct.toFixed(2)}%</span>
                      {hint && <span className={`block text-[9px] uppercase font-bold ${textTitle}`}>{hint}</span>}
                    </div>
                  </div>
                  {/* Progress Bar Visual */}
                  <div className={`h-2.5 w-full rounded-full overflow-hidden flex ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className={`h-full ${theme.bg} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.max(pct, 1)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOS FINANCEIROS */}
        <div className={`p-6 rounded-2xl border flex flex-col ${panelBg}`}>
           <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Percent size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${textValue}`}>Distribuição Financeira</h3>
              <p className={`text-xs ${textTitle}`}>Alocação dos totais gerais do custo operacional</p>
            </div>
          </div>

          {/* Cards for Financial Splits */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            
            <div className={`p-4 rounded-xl flex flex-col justify-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
               <span className={`text-[10px] font-bold uppercase mb-1 tracking-wider ${textTitle}`}>Total Diárias</span>
               <p className={`text-lg font-bold ${textValue}`}>{formatCurrency(stats.vlrDiarias)}</p>
               <div className="flex justify-between items-center mt-2">
                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                   {stats.custoGeral > 0 ? ((stats.vlrDiarias / stats.custoGeral) * 100).toFixed(0) : 0}% Relativo
                 </span>
               </div>
            </div>

            <div className={`p-4 rounded-xl flex flex-col justify-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
               <span className={`text-[10px] font-bold uppercase mb-1 tracking-wider ${textTitle}`}>Total Pacotes</span>
               <p className={`text-lg font-bold ${textValue}`}>{formatCurrency(stats.vlrPacotes)}</p>
               <div className="flex justify-between items-center mt-2">
                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                   {stats.custoGeral > 0 ? ((stats.vlrPacotes / stats.custoGeral) * 100).toFixed(0) : 0}% Relativo
                 </span>
                 <span className={`text-xs font-bold ${textTitle}`}>{stats.qtdPacotes} pacotes</span>
               </div>
            </div>

            <div className={`p-4 rounded-xl flex flex-col justify-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
               <span className={`text-[10px] font-bold uppercase mb-1 tracking-wider ${textTitle}`}>Total Coletas</span>
               <p className={`text-lg font-bold ${textValue}`}>{formatCurrency(stats.vlrColetas)}</p>
               <div className="flex justify-between items-center mt-2">
                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                   {stats.custoGeral > 0 ? ((stats.vlrColetas / stats.custoGeral) * 100).toFixed(0) : 0}% Relativo
                 </span>
                 <div className="flex flex-col text-right">
                   <span className={`text-xs font-bold ${textTitle}`}>{stats.qtdColetas} col</span>
                   <span className={`text-[9px] uppercase font-bold opacity-60 ${textTitle}`}>{stats.qtdColetas > 0 ? (stats.vlrColetas / stats.qtdColetas).toFixed(1).replace('.', ',') : 0} R$/col</span>
                 </div>
               </div>
            </div>

            <div className={`p-4 rounded-xl flex flex-col justify-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
               <span className={`text-[10px] font-bold uppercase mb-1 tracking-wider ${textTitle}`}>Outros Custos</span>
               <p className={`text-lg font-bold ${textValue}`}>{formatCurrency(stats.vlrOutros)}</p>
               <div className="flex justify-between items-center mt-2">
                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-slate-600/30 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                   {stats.custoGeral > 0 ? ((stats.vlrOutros / stats.custoGeral) * 100).toFixed(0) : 0}% Relativo
                 </span>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* SEÇÃO 4: PRODUTIVIDADE EM CARDS GRID TIPO KANBAN/BOXES */}
      <div>
        <div className="flex items-center gap-3 mb-6">
           <div className={`p-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
             <CheckCircle size={18} />
             <h3 className="text-base font-bold uppercase tracking-wider">Produtividade Operacional (Células)</h3>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {stats.cats.map(cat => {
             const mediaEnt = cat.motoristas > 0 ? cat.entregas / cat.motoristas : 0;
             const mediaCol = cat.motoristas > 0 ? cat.ptColetas / cat.motoristas : 0;
             const theme = colors[cat.colorClass as keyof typeof colors];

             return (
               <div key={cat.id} className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${panelBg}`}>
                 
                 {/* Box Header */}
                 <div className={`p-3 sm:p-4 border-b flex items-center justify-between ${darkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                   <div className="flex flex-col">
                      <span className={`text-[10px] uppercase font-black tracking-widest ${theme.text}`}>{cat.nome}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Users size={14} className={textTitle} />
                        <span className={`font-bold text-sm ${textValue}`}>{cat.motoristas}</span>
                      </div>
                   </div>
                   <cat.icon size={20} className={`opacity-40 ${theme.text}`} />
                 </div>

                 {/* Flex vs Growth Tokens */}
                 <div className="px-4 py-3 flex gap-2">
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border ${darkMode ? 'bg-[#151c2f] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                       <span className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${textTitle}`}>Flex</span>
                       <span className={`text-base font-black ${textValue}`}>{cat.flex}</span>
                    </div>
                    <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border ${darkMode ? 'bg-[#151c2f] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                       <span className={`text-[9px] uppercase font-bold tracking-wider mb-0.5 ${textTitle}`}>Growth</span>
                       <span className={`text-base font-black ${textValue}`}>{cat.growth}</span>
                    </div>
                 </div>

                 {/* Metrics */}
                 <div className="px-4 pb-4 space-y-3 mt-auto">
                    
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide opacity-70 ${textTitle}`}>Entregas</span>
                        <span className={`font-bold ${textValue}`}>{fmtNum(cat.entregas)}</span>
                      </div>
                      <div className="flex justify-between items-center pl-2 border-l-2 border-slate-500/20">
                        <span className={`text-[9px] uppercase font-bold ${textTitle}`}>Média/Mot.</span>
                        <span className={`text-xs font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{mediaEnt.toFixed(1)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide opacity-70 ${textTitle}`}>Pt Coletas</span>
                        <span className={`font-bold ${textValue}`}>{fmtNum(cat.ptColetas)}</span>
                      </div>
                      <div className="flex justify-between items-center pl-2 border-l-2 border-slate-500/20">
                        <span className={`text-[9px] uppercase font-bold ${textTitle}`}>Média/Mot.</span>
                        <span className={`text-xs font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>{mediaCol.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className={`pt-2 mt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                       <div className="flex justify-between items-center">
                         <span className={`text-[9px] font-bold uppercase ${textTitle}`}>Pct Coletados</span>
                         <span className={`text-xs font-bold ${textValue}`}>{fmtNum(cat.pctColetados)}</span>
                       </div>
                    </div>

                 </div>

               </div>
             );
          })}
        </div>

      </div>

    </div>
  );
};
