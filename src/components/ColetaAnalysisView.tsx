import { useMemo } from 'react';
import type { LogisticsRecord } from '../types';
import { formatCurrency } from '../utils';
import { 
  PackageSearch, MapPin, Calculator, DollarSign, 
  TrendingDown, Users, Truck, Bike, Home, Car
} from 'lucide-react';

interface ColetaAnalysisProps {
  records: LogisticsRecord[];
  darkMode: boolean;
  dateRange: string;
}

export const ColetaAnalysisView = ({ records, darkMode, dateRange }: ColetaAnalysisProps) => {

  const stats = useMemo(() => {
    // Apenas focar em quem teve coleta
    const colectors = records.filter(r => r.coletas > 0);

    let totalPontos = 0;
    let totalPacotes = 0;
    let custoTotal = 0;

    const categories: Record<string, {
      id: string;
      nome: string;
      tarifa: number;
      icon: any;
      colorClass: string;
      motoristas: number;
      pontos: number;
      pacotes: number;
      custoCalculado: number;
    }> = {
      'DIARIA': { id: 'DIARIA', nome: 'Diárias (Incluso)', tarifa: 0, icon: Users, colorClass: 'slate', motoristas: 0, pontos: 0, pacotes: 0, custoCalculado: 0 },
      'MOTO':   { id: 'MOTO', nome: 'Motos', tarifa: 6.50, icon: Bike, colorClass: 'orange', motoristas: 0, pontos: 0, pacotes: 0, custoCalculado: 0 },
      'CASA':   { id: 'CASA', nome: 'Fiorino / R3 (Casa)', tarifa: 2.00, icon: Home, colorClass: 'emerald', motoristas: 0, pontos: 0, pacotes: 0, custoCalculado: 0 },
      'NORMAL': { id: 'NORMAL', nome: 'Carros Base (Normal)', tarifa: 10.00, icon: Car, colorClass: 'blue', motoristas: 0, pontos: 0, pacotes: 0, custoCalculado: 0 },
    };

    colectors.forEach(r => {
      const t = (r.tipoContrato || '').toLowerCase();
      const v = (r.veiculo || '').toLowerCase();
      
      let cat = 'NORMAL';
      let tarifa = 10.00;
      let custoMotorista = 0;

      if (t.includes('diaria') || t.includes('diária')) {
        cat = 'DIARIA';
        tarifa = 0;
        const volumeTotal = r.entregas + r.coletas;
        custoMotorista = volumeTotal > 0 ? (r.vlrDasDiarias / volumeTotal) * r.coletas : 0;
      } else if (v.includes('fiorino') || v.includes('r3') || t.includes('casa') || v.includes('casa')) {
        cat = 'CASA';
        tarifa = 2.00;
        custoMotorista = r.coletas * tarifa;
      } else if (v.includes('moto')) {
        cat = 'MOTO';
        tarifa = 6.50;
        custoMotorista = r.coletas * tarifa;
      } else {
        custoMotorista = r.coletas * tarifa;
      }

      totalPontos += r.coletas;
      totalPacotes += r.pctColetados;
      custoTotal += custoMotorista;

      categories[cat].motoristas += 1;
      categories[cat].pontos += r.coletas;
      categories[cat].pacotes += r.pctColetados;
      categories[cat].custoCalculado += custoMotorista;
    });

    const custoMedioPorPacote = totalPacotes > 0 ? (custoTotal / totalPacotes) : 0;
    const custoMedioPorPonto = totalPontos > 0 ? (custoTotal / totalPontos) : 0;

    return {
      totalMotoristasColeta: colectors.length,
      totalPontos, 
      totalPacotes, 
      custoTotal,
      custoMedioPorPacote,
      custoMedioPorPonto,
      cats: Object.values(categories)
    };
  }, [records]);

  const panelBg = darkMode ? 'bg-slate-900/80 border-slate-800 shadow-[0_4_20px_-5px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-sm';
  const textTitle = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textValue = darkMode ? 'text-white' : 'text-slate-800';

  const fmtNum = (num: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(num);

  const colors = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', badge: darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', badge: darkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-100' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', badge: darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    slate: { bg: 'bg-slate-500', text: 'text-slate-400', badge: darkMode ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 pb-12 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-600'} shadow-sm`}>
             <PackageSearch size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Análise Específica de Coletas</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Visão minuciosa sobre pontos, pacotes e custos projetados.</p>
          </div>
        </div>
        {dateRange && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <Calculator size={16} className={darkMode ? 'text-amber-400' : 'text-amber-500'} />
            Período: {dateRange}
          </div>
        )}
      </div>

      {/* SEÇÃO 1: KPIs GERAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>Total Pontos de Coleta</span>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <MapPin size={18} />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{fmtNum(stats.totalPontos)}</p>
          <span className={`text-[10px] font-bold uppercase opacity-60 mt-1 ${textTitle}`}>Realizados por {stats.totalMotoristasColeta} motoristas</span>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>Total Pacotes Coletados</span>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Truck size={18} />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{fmtNum(stats.totalPacotes)}</p>
          <span className={`text-[10px] font-bold uppercase opacity-60 mt-1 ${textTitle}`}>Média de {(stats.totalPontos > 0 ? stats.totalPacotes / stats.totalPontos : 0).toFixed(1)} pct/ponto</span>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${panelBg}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${textTitle}`}>Custo Total Projetado</span>
            <div className={`p-2 rounded-lg flex items-center gap-1.5 ${darkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
              <TrendingDown size={18} />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${textValue}`}>{formatCurrency(stats.custoTotal)}</p>
          <span className={`text-[10px] font-bold uppercase opacity-60 mt-1 ${textTitle}`}>Baseado em Tabela de Tarifas</span>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${darkMode ? 'bg-amber-900/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Custo Pct X Custo Ponto</span>
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className={`text-3xl font-black ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>{formatCurrency(stats.custoMedioPorPacote)}</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-600'} opacity-80`}>Por Pacote</span>
            </div>
            
            <div className="text-right">
               <span className={`text-xl font-bold ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>{formatCurrency(stats.custoMedioPorPonto)}</span>
               <span className={`block text-[9px] uppercase font-bold tracking-wider pt-0.5 ${darkMode ? 'text-amber-400/80' : 'text-amber-600/80'}`}>Por Ponto</span>
            </div>
          </div>
        </div>

      </div>

      {/* SEÇÃO 2: DETALHES POR CATEGORIA (Blocos) */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 ml-1">Divisão Custeio Veicular</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {stats.cats.map(cat => {
             const theme = colors[cat.colorClass as keyof typeof colors];
             const pctShare = stats.custoTotal > 0 ? (cat.custoCalculado / stats.custoTotal) * 100 : 0;
             const cptMedioPct = cat.pacotes > 0 ? cat.custoCalculado / cat.pacotes : 0;

             return (
               <div key={cat.id} className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${panelBg} hover:shadow-md`}>
                 
                 {/* Header Colorido */}
                 <div className={`p-4 border-b border-b-white/5 flex items-center gap-3 ${theme.badge}`}>
                    <cat.icon size={22} className={theme.text} />
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${theme.text}`}>{cat.nome}</h4>
                      <p className={`text-[10px] font-bold uppercase opacity-80 ${theme.text}`}>
                        {cat.id === 'DIARIA' ? 'RATEIO PROPORCIONAL AO VOLUME' : `Tabela R$ ${cat.tarifa.toFixed(2)} / Ponto`}
                      </p>
                    </div>
                 </div>

                 {/* Corp do Card */}
                 <div className="p-5 flex-1 flex flex-col">
                    
                    {/* Custo Total */}
                    <div className="mb-4">
                      <p className={`text-[10px] uppercase font-bold opacity-60 mb-0.5 ${textTitle}`}>Custo Desta Categoria</p>
                      <p className={`text-2xl font-black ${textValue}`}>{formatCurrency(cat.custoCalculado)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-1.5 flex-1 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${theme.bg}`} style={{ width: `${Math.max(pctShare, 2)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-bold ${textTitle}`}>{pctShare.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className={`h-[1px] w-full my-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                    {/* Meta Infos */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                       <div>
                         <span className={`block text-[9px] uppercase font-bold opacity-70 mb-0.5 ${textTitle}`}>Motoristas Ativos</span>
                         <span className={`text-sm font-bold ${textValue}`}>{cat.motoristas}</span>
                       </div>
                       <div>
                         <span className={`block text-[9px] uppercase font-bold opacity-70 mb-0.5 ${textTitle}`}>Pontos Coletados</span>
                         <span className={`text-sm font-bold ${textValue}`}>{fmtNum(cat.pontos)}</span>
                       </div>
                       <div>
                         <span className={`block text-[9px] uppercase font-bold opacity-70 mb-0.5 ${textTitle}`}>Total Pacotes</span>
                         <span className={`text-sm font-bold ${textValue}`}>{fmtNum(cat.pacotes)}</span>
                       </div>
                       <div className={`p-1.5 rounded-lg border flex flex-col justify-center ${theme.badge}`}>
                         <span className="block text-[8px] uppercase font-bold opacity-80 mb-0.5">Custo/Pacote</span>
                         <span className="text-sm font-black">{formatCurrency(cptMedioPct)}</span>
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
