import { useMemo } from 'react';
import type { LogisticsRecord, GlobalCosts } from '../types';
import { formatCurrency } from '../utils';
import {
    ResponsiveContainer,
    BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Wallet, TrendingUp, CheckCircle, Flame, Target, Factory } from 'lucide-react';

interface DashboardViewProps {
    records: LogisticsRecord[];
    darkMode: boolean;
    globalCosts: GlobalCosts;
    setGlobalCosts: (costs: GlobalCosts) => void;
}

export const DashboardView = ({ records, darkMode, globalCosts, setGlobalCosts }: DashboardViewProps) => {

    const totalReceita = records.reduce((acc, r) => acc + r.valorFaturado, 0);
    const totalCustoMotoristas = records.reduce((acc, r) => acc + r.vlrTotal, 0);

    const totalCustosFixos = globalCosts.aluguel + globalCosts.combustivel + globalCosts.manutencao + globalCosts.seguro;
    const totalCustoGlobal = totalCustoMotoristas + totalCustosFixos;
    const totalMargemReal = totalReceita - totalCustoGlobal;

    const pctCustoTotal = totalReceita > 0 ? (totalCustoGlobal / totalReceita) * 100 : 0;
    const pctMargemReal = totalReceita > 0 ? (totalMargemReal / totalReceita) * 100 : 0;

    const totalEntregas = records.reduce((acc, r) => acc + r.entregas, 0);
    const totalInsucessos = records.reduce((acc, r) => acc + r.insucessos, 0);
    const sla = totalEntregas + totalInsucessos > 0 ? (totalEntregas / (totalEntregas + totalInsucessos)) * 100 : 0;

    const tckReceita = totalEntregas > 0 ? totalReceita / totalEntregas : 0;
    const tckCusto = totalEntregas > 0 ? totalCustoGlobal / totalEntregas : 0;
    const tckLucro = totalEntregas > 0 ? totalMargemReal / totalEntregas : 0;

    // Bottom Left: Receita por Operação
    const operacaoData = useMemo(() => {
        const map = new Map<string, { name: string, receita: number }>();
        records.forEach(r => {
            const key = r.operacao || 'Outros';
            const existing = map.get(key) || { name: key, receita: 0 };
            existing.receita += r.valorFaturado;
            map.set(key, existing);
        });
        return Array.from(map.values()).sort((a, b) => b.receita - a.receita).slice(0, 6);
    }, [records]);

    // Bottom Center: Margem por Contrato (Horizontal Bar)
    const contratoData = useMemo(() => {
        const map = new Map<string, { name: string, margem: number }>();
        records.forEach(r => {
            const key = r.tipoContrato || 'Avulso';
            const existing = map.get(key) || { name: key, margem: 0 };
            existing.margem += r.lucroBruto;
            map.set(key, existing);
        });
        return Array.from(map.values())
            .sort((a, b) => b.margem - a.margem)
            .slice(0, 6);
    }, [records]);

    // Bottom Right: Analise por Motoristas
    const motoristasData = useMemo(() => {
        const map = new Map<string, { name: string, receita: number, margem: number }>();
        records.forEach(r => {
            const key = r.motorista || 'Sem Nome';
            const existing = map.get(key) || { name: key, receita: 0, margem: 0 };
            existing.receita += r.valorFaturado;
            existing.margem += r.lucroBruto;
            map.set(key, existing);
        });

        const arr = Array.from(map.values()).sort((a, b) => b.receita - a.receita);
        const maxReceita = Math.max(...arr.map(a => a.receita), 1);
        const maxMargem = Math.max(...arr.map(a => a.margem), 1);

        return arr.map(m => ({
            ...m,
            pctReceitaWidth: (m.receita / maxReceita) * 100,
            pctMargemWidth: (m.margem / maxMargem) * 100,
            margemPctVal: m.receita > 0 ? (m.margem / m.receita) * 100 : 0
        }));
    }, [records]);

    if (records.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed ${darkMode ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                <Wallet size={48} className={`mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Dashboard Sem Dados</h2>
                <p className="text-center">Acesse a aba "Planilha" e importe um arquivo CSV ou adicione um registro manualmente.</p>
            </div>
        );
    }

    const panelBg = darkMode ? 'bg-[#111827] border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm';
    const textTitle = darkMode ? 'text-slate-300' : 'text-slate-500';
    const textValue = darkMode ? 'text-white' : 'text-slate-800';

    const blueTheme = { glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]', iconText: 'text-blue-400', iconBg: 'bg-blue-900/30' };
    const orangeTheme = { glow: 'shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]', iconText: 'text-orange-400', iconBg: 'bg-orange-900/30' };
    const greenTheme = { glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]', iconText: 'text-emerald-400', iconBg: 'bg-emerald-900/30' };
    const purpleTheme = { glow: 'shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]', iconText: 'text-purple-400', iconBg: 'bg-purple-900/30' };

    const CostInput = ({ label, value, field }: { label: string, value: number, field: keyof GlobalCosts }) => (
        <div className="flex flex-col">
            <label className={`text-xs font-semibold uppercase mb-1 ${textTitle}`}>{label}</label>
            <div className="relative">
                <span className={`absolute left-3 top-2.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>R$</span>
                <input type="number"
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-sm font-medium border focus:ring-2 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:ring-indigo-500 text-white' : 'bg-slate-50 border-slate-200 focus:ring-blue-500 text-slate-800'}`}
                    value={value || ''}
                    placeholder="0"
                    onChange={e => setGlobalCosts({ ...globalCosts, [field]: parseFloat(e.target.value) || 0 })}
                />
            </div>
        </div>
    );

    return (
        <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Receita Card */}
                <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col h-32 ${panelBg} ${darkMode ? blueTheme.glow : ''}`}>
                    <div className="flex items-start justify-between z-10 mb-2">
                        <p className={`text-sm font-semibold tracking-wider uppercase ${textTitle}`}>Fatorado Total</p>
                        <Wallet size={20} className={darkMode ? blueTheme.iconText : 'text-blue-500'} />
                    </div>
                    <h2 className={`text-3xl font-black z-10 ${textValue}`}>{formatCurrency(totalReceita)}</h2>
                </div>

                {/* Custo Card */}
                <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col h-32 ${panelBg} ${darkMode ? orangeTheme.glow : ''}`}>
                    <div className="flex items-start justify-between z-10 mb-2">
                        <p className={`text-sm font-semibold tracking-wider uppercase ${textTitle}`}>Custo Global</p>
                        <Flame size={20} className={darkMode ? orangeTheme.iconText : 'text-orange-500'} />
                    </div>
                    <h2 className={`text-3xl font-black z-10 ${textValue}`}>{formatCurrency(totalCustoGlobal)}</h2>
                </div>

                {/* Margem Card */}
                <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col h-32 ${panelBg} ${darkMode ? greenTheme.glow : ''}`}>
                    <div className="flex items-start justify-between z-10 mb-2">
                        <p className={`text-sm font-semibold tracking-wider uppercase ${textTitle}`}>Lucro Real</p>
                        <TrendingUp size={20} className={darkMode ? greenTheme.iconText : 'text-emerald-500'} />
                    </div>
                    <h2 className={`text-3xl font-black z-10 ${totalMargemReal >= 0 ? textValue : 'text-red-500'}`}>{formatCurrency(totalMargemReal)}</h2>
                </div>

                {/* SLA Card */}
                <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col h-32 ${panelBg} ${darkMode ? purpleTheme.glow : ''}`}>
                    <div className="flex items-start justify-between z-10 mb-2">
                        <p className={`text-sm font-semibold tracking-wider uppercase ${textTitle}`}>SLA Entregas</p>
                        <CheckCircle size={20} className={darkMode ? purpleTheme.iconText : 'text-purple-500'} />
                    </div>
                    <h2 className={`text-3xl font-black z-10 ${sla >= 95 ? (darkMode ? 'text-purple-400' : 'text-purple-600') : 'text-yellow-500'}`}>{sla.toFixed(2)}%</h2>
                </div>

            </div>

            {/* Middle Ribbon: Global Costs & Ticket Averages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Fixed Costs Editor */}
                <div className={`p-6 rounded-2xl border flex flex-col ${panelBg}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            <Factory size={18} />
                        </div>
                        <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${textValue}`}>Custos Fixos da Frota</h3>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Despesas globais que abatem do lucro dos motoristas</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CostInput label="Aluguel" field="aluguel" value={globalCosts.aluguel} />
                        <CostInput label="Combustível" field="combustivel" value={globalCosts.combustivel} />
                        <CostInput label="Manutenção" field="manutencao" value={globalCosts.manutencao} />
                        <CostInput label="Seguro" field="seguro" value={globalCosts.seguro} />
                    </div>
                </div>

                {/* Margins & Ticket Averages */}
                <div className={`p-6 rounded-2xl border flex flex-col ${panelBg}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            <Target size={18} />
                        </div>
                        <div>
                            <h3 className={`text-sm font-bold uppercase tracking-wider ${textValue}`}>Radiografia de Margem (%) e Ticket</h3>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Impacto dos custos e média por pacote entregue</p>
                        </div>
                    </div>

                    <div className="flex gap-4 h-full">
                        {/* Margins */}
                        <div className={`flex flex-col justify-center space-y-4 pr-6 border-r ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div>
                                <p className={`text-xs font-semibold uppercase ${textTitle}`}>% Custo Global</p>
                                <p className={`text-xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{pctCustoTotal.toFixed(2)}%</p>
                            </div>
                            <div>
                                <p className={`text-xs font-semibold uppercase ${textTitle}`}>% Lucro Base</p>
                                <p className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{pctMargemReal.toFixed(2)}%</p>
                            </div>
                        </div>

                        {/* Tickets */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pl-2">
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                                <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Tck Faturado</p>
                                <p className="text-lg font-bold">{formatCurrency(tckReceita)}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-800/50 text-orange-400' : 'bg-slate-50 text-orange-600'}`}>
                                <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Tck Custo</p>
                                <p className="text-lg font-bold">{formatCurrency(tckCusto)}</p>
                            </div>
                            <div className={`p-3 rounded-xl flex flex-col justify-center border ${darkMode ? 'border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] text-emerald-400' : 'border-green-200 bg-green-50 text-green-700'}`}>
                                <p className="text-[10px] font-bold uppercase opacity-70 mb-1">Tck Lucro</p>
                                <p className="text-xl font-black">{formatCurrency(tckLucro)}</p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Main Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Receita por Operacao */}
                <div className={`p-6 rounded-2xl border h-96 flex flex-col ${panelBg}`}>
                    <h3 className={`text-sm font-semibold tracking-wider uppercase mb-6 ${textTitle}`}>Receita por Operação</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={operacaoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', border: darkMode ? '1px solid #334155' : 'none', borderRadius: '8px', color: darkMode ? '#f8fafc' : '#0f172a' }}
                                    formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Margem por Contrato (Horizontal) */}
                <div className={`p-6 rounded-2xl border h-96 flex flex-col ${panelBg}`}>
                    <h3 className={`text-sm font-semibold tracking-wider uppercase mb-6 ${textTitle}`}>Margem por Contrato</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={contratoData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }} width={80} />
                                <Tooltip
                                    cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }}
                                    contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', border: darkMode ? '1px solid #334155' : 'none', borderRadius: '8px', color: darkMode ? '#f8fafc' : '#0f172a' }}
                                    formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <Bar dataKey="margem" name="Margem R$" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Análise por Equipe de Vendas (Motoristas) */}
                <div className={`p-6 rounded-2xl border h-96 flex flex-col ${panelBg}`}>
                    <h3 className={`text-sm font-semibold tracking-wider uppercase mb-6 ${textTitle}`}>Análise por Motorista</h3>

                    <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                        <div className="w-full text-left text-xs">

                            {/* Table Header */}
                            <div className={`flex justify-between pb-2 mb-3 border-b uppercase font-bold tracking-wider ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                <div className="w-1/3">Motorista</div>
                                <div className="w-1/4 text-right">Líquido</div>
                                <div className="w-1/4 text-right">Margem</div>
                                <div className="w-1/6 text-right">%</div>
                            </div>

                            {/* Table Rows */}
                            <div className="space-y-3">
                                {motoristasData.map((m, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm group">
                                        <div className="w-1/3 font-medium truncate pr-2" title={m.name}>
                                            {m.name}
                                        </div>

                                        {/* Receita Inline Bar */}
                                        <div className="w-1/4 flex flex-col items-end justify-center">
                                            <span className="mb-1 leading-none text-xs">{formatCurrency(m.receita)}</span>
                                            <div className={`h-1.5 w-full rounded-full flex justify-end ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.pctReceitaWidth}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Margem Inline Bar */}
                                        <div className="w-1/4 flex flex-col items-end justify-center pl-4">
                                            <span className="mb-1 leading-none text-xs">{formatCurrency(m.margem)}</span>
                                            <div className={`h-1.5 w-full rounded-full flex justify-end ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                                <div className={`h-full rounded-full ${m.margem >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.max(m.pctMargemWidth, 2)}%` }}></div>
                                            </div>
                                        </div>

                                        <div className={`w-1/6 text-right font-bold pl-2 ${m.margemPctVal >= 0 ? (darkMode ? 'text-pink-400' : 'text-pink-600') : 'text-red-500'}`}>
                                            {m.margemPctVal.toFixed(0)}%
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* Table Footer / Summary */}
                    <div className={`mt-4 pt-3 border-t flex justify-between font-bold text-xs ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <span>Gross Total</span>
                        <span className="text-blue-500">{formatCurrency(totalReceita)}</span>
                        <span className="text-emerald-500">{formatCurrency(records.reduce((a, r) => a + r.lucroBruto, 0))}</span>
                    </div>

                </div>

            </div>
        </div>
    );
};
