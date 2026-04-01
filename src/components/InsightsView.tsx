import { useMemo } from 'react';
import type { LogisticsRecord } from '../types';
import { formatCurrency } from '../utils';
import { 
  Lightbulb, AlertTriangle, TrendingUp, AlertCircle, 
  ArrowRight, ShieldAlert, Sparkles, BatteryWarning, Target, DollarSign
} from 'lucide-react';

interface InsightsProps {
  records: LogisticsRecord[];
  darkMode: boolean;
  dateRange: string;
}

export const InsightsView = ({ records, darkMode, dateRange }: InsightsProps) => {

  const insights = useMemo(() => {
    if (records.length === 0) return null;

    let faturado = 0;
    let entregas = 0;
    let insucessos = 0;
    let totalPontos = 0;
    let ptColetaNormal = 0;

    const diarias: LogisticsRecord[] = [];
    const categorias: Record<string, { nome: string, lucroBruto: number, entregas: number }> = {};

    records.forEach(r => {
      faturado += r.valorFaturado;
      entregas += r.entregas;
      insucessos += r.insucessos;
      totalPontos += r.entregas + r.coletas; // Volume bruto de trabalho

      const t = (r.tipoContrato || '').toLowerCase();
      const v = (r.veiculo || '').toLowerCase();

      // Identificando Diárias para Ociosidade
      if (t.includes('diaria') || t.includes('diária')) {
        diarias.push(r);
      }

      // Identificando Pontos de Coleta Feitos por Carro Normal (R$10)
      let isCasa = v.includes('fiorino') || v.includes('r3') || t.includes('casa') || v.includes('casa');
      let isMoto = v.includes('moto');
      let isDiaria = t.includes('diaria') || t.includes('diária');
      
      if (!isCasa && !isMoto && !isDiaria && r.coletas > 0) {
        ptColetaNormal += r.coletas;
      }

      // Ranking de Categorias
      let catNome = t.includes('pacote') ? 'Motoristas Pacote' : 
                    t.includes('coleta') ? 'Motoristas Coleta' : 
                    (isCasa ? 'Fiorino/R3 (Casa)' : 'Outros');
      
      if (!categorias[catNome]) categorias[catNome] = { nome: catNome, lucroBruto: 0, entregas: 0 };
      categorias[catNome].lucroBruto += r.lucroBruto;
      categorias[catNome].entregas += r.entregas;
    });

    // 1. ANÁLISE DE DIÁRIAS OCIOSAS
    const mediaVolumeFrota = records.length > 0 ? totalPontos / records.length : 0;
    const limitOciosidade = mediaVolumeFrota * 0.5; // Produce menos da metade que a média
    const diariasOciosas = diarias.filter(d => (d.entregas + d.coletas) < limitOciosidade);

    // 2. ARBITRAGEM DE COLETA (Mudar para Fiorino = Economia de R$ 8 por ponto)
    const economiaColeta = ptColetaNormal * 8; // (R$10 - R$2 da Casa)

    // 3. CAMPEÃO DE LUCRATIVIDADE (Lucro por Pacote)
    let campeao = { nome: 'N/A', lucroMedio: 0 };
    Object.values(categorias).forEach(c => {
       if (c.entregas > 0) {
         const lmp = c.lucroBruto / c.entregas;
         if (lmp > campeao.lucroMedio) {
           campeao = { nome: c.nome, lucroMedio: lmp };
         }
       }
    });

    // 4. ROMBO DE INSUCESSOS (SLA)
    const tckFaturado = entregas > 0 ? faturado / entregas : 0;
    const faturamentoPerdido = insucessos * tckFaturado;

    return {
      mediaVolumeFrota,
      diariasOciosas: diariasOciosas.length,
      economiaColeta,
      ptColetaNormal,
      campeao,
      insucessos,
      faturamentoPerdido
    };

  }, [records]);

  const panelBg = darkMode ? 'bg-slate-900/80 border-slate-800 shadow-[0_4_20px_-5px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-sm';
  const textValue = darkMode ? 'text-white' : 'text-slate-800';

  if (!insights) {
    return <div className="p-8 text-center opacity-50">Sem dados suficientes para gerar insights.</div>;
  }

  return (
    <div className={`space-y-8 animate-in fade-in duration-700 pb-12 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'} shadow-sm`}>
             <Sparkles size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Inteligência Operacional</h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sugestões orientadas por IA para aumentar seu lucro logístico.</p>
          </div>
        </div>
        {dateRange && (
          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
            <Lightbulb size={16} className={darkMode ? 'text-indigo-400' : 'text-indigo-500'} />
            Período: {dateRange}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: ARBITRAGEM DE COLETA */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${panelBg} hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group`}>
           <div className={`absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${darkMode ? 'text-green-500' : 'text-green-600'}`}>
              <DollarSign size={200} />
           </div>
           
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                 <TrendingUp size={16} /> 1. Otimização de Coleta
              </div>
           </div>
           
           <div className="relative z-10 mb-6 flex-1">
             <h3 className={`text-3xl font-black mb-2 ${textValue}`}>{formatCurrency(insights.economiaColeta)}</h3>
             <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dinheiro deixado na mesa na tarifa de coletas.</p>
             <p className="text-sm leading-relaxed">
               Foram realizados <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{insights.ptColetaNormal} pontos de coleta</strong> através da "Frota Normal", com tarifa padrão de R$10,00 por ponto.
             </p>
           </div>

           <div className={`p-4 rounded-xl relative z-10 flex gap-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
             <div className="mt-1 shrink-0">
               <ArrowRight size={18} className={darkMode ? 'text-emerald-400' : 'text-emerald-500'} />
             </div>
             <div>
               <span className="block text-[11px] uppercase font-bold tracking-wider mb-1 opacity-60">Sugestão de Ação</span>
               <p className="text-sm font-medium">Transfira a rota desses pontos especificamente para as **Fiorinos/R3 de Casa**. Elas tarifam apenas R$2,00 por ponto, injetando instantaneamente este saving de 80% no seu lucro livre do dia.</p>
             </div>
           </div>
        </div>

        {/* CARD 2: DIÁRIAS OCIOSAS */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${panelBg} hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group`}>
           <div className={`absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
              <BatteryWarning size={200} />
           </div>

           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${darkMode ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                 <AlertTriangle size={16} /> 2. Ociosidade de Contrato
              </div>
           </div>
           
           <div className="relative z-10 mb-6 flex-1">
             <h3 className={`text-3xl font-black mb-2 ${textValue}`}>{insights.diariasOciosas} Motoristas</h3>
             <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Motoristas na "Diária" rodando abaixo da meta.</p>
             <p className="text-sm leading-relaxed">
               Estes motoristas possuem um teto fixo de custo, mas entregaram volumes **50% menores** do que a média bruta da equipe que é de <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{insights.mediaVolumeFrota.toFixed(0)} volumes/dia</strong>.
             </p>
           </div>

           <div className={`p-4 rounded-xl relative z-10 flex gap-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
             <div className="mt-1 shrink-0">
               <ArrowRight size={18} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
             </div>
             <div>
               <span className="block text-[11px] uppercase font-bold tracking-wider mb-1 opacity-60">Sugestão de Ação</span>
               <p className="text-sm font-medium">Sature as rotas da frota Diária primeiro. Todo volume extra jogado nesse modal custa "zero", enquanto enviar excedentes para pacotes avulsos drena sua margem. Desloque rotas fracas para eles.</p>
             </div>
           </div>
        </div>

        {/* CARD 3: ROMBO DE INSUCESSOS */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${panelBg} hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group`}>
           <div className={`absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${darkMode ? 'text-rose-500' : 'text-rose-600'}`}>
              <ShieldAlert size={200} />
           </div>

           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                 <AlertCircle size={16} /> 3. Perda de Faturamento SLA
              </div>
           </div>
           
           <div className="relative z-10 mb-6 flex-1">
             <h3 className={`text-3xl font-black mb-2 ${textValue}`}>{formatCurrency(insights.faturamentoPerdido)}</h3>
             <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Receita evaporada em Insucessos puros.</p>
             <p className="text-sm leading-relaxed">
               A base registrou <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{insights.insucessos} devoluções/falhas</strong>. Baseado no ticket faturado geral, esse foi o montante que deixou de entrar em caixa pelo não-cumprimento logístico.
             </p>
           </div>

           <div className={`p-4 rounded-xl relative z-10 flex gap-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
             <div className="mt-1 shrink-0">
               <ArrowRight size={18} className={darkMode ? 'text-rose-400' : 'text-rose-500'} />
             </div>
             <div>
               <span className="block text-[11px] uppercase font-bold tracking-wider mb-1 opacity-60">Sugestão de Ação</span>
               <p className="text-sm font-medium">Audite instantaneamente a aba da Planilha preenchendo o filtro "Insucessos &gt; 0" e retenha gratificações ou direcione treinamentos diretos aos Top 3 Motoristas com piores índices.</p>
             </div>
           </div>
        </div>

        {/* CARD 4: RANKING DE LUCRATIVIDADE */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${panelBg} hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group`}>
           <div className={`absolute -right-12 -top-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}>
              <Target size={200} />
           </div>

           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                 <Target size={16} /> 4. O Contrato Campeão
              </div>
           </div>
           
           <div className="relative z-10 mb-6 flex-1">
             <h3 className={`text-3xl font-black mb-2 uppercase tracking-tight ${textValue}`}>{insights.campeao.nome}</h3>
             <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>A modalidade que traz maior lucro real.</p>
             <p className="text-sm leading-relaxed">
               Nesta análise de dados, quem operou atrelado a esse tipo espremeu um <strong className={darkMode ? 'text-white' : 'text-slate-900'}>Lucro Bruto de {formatCurrency(insights.campeao.lucroMedio)} puro por pacote/entrega</strong>, desbancando todas as outras estruturas de contrato.
             </p>
           </div>

           <div className={`p-4 rounded-xl relative z-10 flex gap-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
             <div className="mt-1 shrink-0">
               <ArrowRight size={18} className={darkMode ? 'text-blue-400' : 'text-blue-500'} />
             </div>
             <div>
               <span className="block text-[11px] uppercase font-bold tracking-wider mb-1 opacity-60">Sugestão de Ação</span>
               <p className="text-sm font-medium">Congele contratações dos modelos menos rentáveis e concentre sua escala de novos agregados ou veículos atrelados a este tipo de contrato, tracionando um efeito em cascata na sua margem líquida global do mês.</p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};
