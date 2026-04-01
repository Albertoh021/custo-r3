import { useMemo } from 'react';
import type { LogisticsRecord, GlobalCosts } from '../types';
import { formatCurrency } from '../utils';
import { 
  ResponsiveContainer, 
  BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

interface DashboardViewProps {
  records: LogisticsRecord[];
  darkMode: boolean;
  globalCosts: GlobalCosts;
  setGlobalCosts: (costs: GlobalCosts) => void;
}

// Win2K Panel component
const Win2kPanel = ({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <fieldset style={{
    border: '2px solid #808080',
    borderTop: '2px solid #808080',
    borderLeft: '2px solid #808080',
    borderRight: '2px solid #ffffff',
    borderBottom: '2px solid #ffffff',
    padding: '4px 8px 8px 8px',
    background: '#d4d0c8',
    margin: 0,
    ...style,
  }}>
    <legend style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px', color: '#000080', background: '#d4d0c8' }}>
      {title}
    </legend>
    {children}
  </fieldset>
);

const Win2kKpi = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div style={{
    background: '#d4d0c8',
    borderTop: '2px solid #ffffff',
    borderLeft: '2px solid #ffffff',
    borderRight: '2px solid #808080',
    borderBottom: '2px solid #808080',
    boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #e8e4dc',
    padding: '6px 10px',
    flex: 1,
    minWidth: 120,
  }}>
    <div style={{ fontSize: '10px', color: '#808080', fontWeight: 'bold', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</div>
    <div style={{
      background: '#ffffff',
      borderTop: '2px solid #808080',
      borderLeft: '2px solid #808080',
      borderRight: '2px solid #e8e4dc',
      borderBottom: '2px solid #e8e4dc',
      boxShadow: 'inset 1px 1px 0 #404040',
      padding: '4px 8px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: color || '#000080',
      fontFamily: "'Courier New', 'Lucida Console', monospace",
    }}>
      {value}
    </div>
  </div>
);

export const DashboardView = ({ records, globalCosts, setGlobalCosts }: DashboardViewProps) => {

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

  const operacaoData = useMemo(() => {
    const map = new Map<string, { name: string, receita: number }>();
    records.forEach(r => { const key = r.operacao || 'Outros'; const e = map.get(key) || { name: key, receita: 0 }; e.receita += r.valorFaturado; map.set(key, e); });
    return Array.from(map.values()).sort((a, b) => b.receita - a.receita).slice(0, 6);
  }, [records]);

  const contratoData = useMemo(() => {
    const map = new Map<string, { name: string, margem: number }>();
    records.forEach(r => { const key = r.tipoContrato || 'Avulso'; const e = map.get(key) || { name: key, margem: 0 }; e.margem += r.lucroBruto; map.set(key, e); });
    return Array.from(map.values()).sort((a, b) => b.margem - a.margem).slice(0, 6);
  }, [records]);

  const motoristasData = useMemo(() => {
    const map = new Map<string, { name: string, receita: number, margem: number }>();
    records.forEach(r => { const key = r.motorista || 'Sem Nome'; const e = map.get(key) || { name: key, receita: 0, margem: 0 }; e.receita += r.valorFaturado; e.margem += r.lucroBruto; map.set(key, e); });
    const arr = Array.from(map.values()).sort((a, b) => b.receita - a.receita);
    const maxReceita = Math.max(...arr.map(a => a.receita), 1);
    const maxMargem = Math.max(...arr.map(a => a.margem), 1);
    return arr.map(m => ({ ...m, pctReceitaWidth: (m.receita / maxReceita) * 100, pctMargemWidth: (m.margem / maxMargem) * 100, margemPctVal: m.receita > 0 ? (m.margem / m.receita) * 100 : 0 }));
  }, [records]);

  if (records.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#808080', fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", fontSize: '11px' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 'bold', color: '#000080', marginBottom: 4 }}>Dashboard Sem Dados</div>
        <div>Acesse a aba "Planilha" e importe um arquivo CSV ou adicione um registro manualmente.</div>
      </div>
    );
  }

  const chartTooltipStyle = { backgroundColor: '#ffffff', border: '1px solid #808080', borderRadius: 0, fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", fontSize: '11px', color: '#000000' };

  const CostInput = ({ label, value, field }: { label: string; value: number; field: keyof GlobalCosts }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={{ fontSize: '10px', fontWeight: 'bold', color: '#000080', textTransform: 'uppercase' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          background: '#d4d0c8',
          borderTop: '2px solid #808080',
          borderLeft: '2px solid #808080',
          borderRight: 'none',
          borderBottom: '2px solid #e8e4dc',
          padding: '2px 4px',
          fontSize: '11px',
          color: '#808080',
          boxShadow: 'inset 1px 1px 0 #404040',
        }}>R$</span>
        <input
          type="number"
          className="win-input"
          style={{ flex: 1, borderRadius: 0 }}
          value={value || ''}
          placeholder="0"
          onChange={e => setGlobalCosts({ ...globalCosts, [field]: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Tahoma', 'MS Sans Serif', Arial, sans-serif", fontSize: '11px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      
      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Win2kKpi label="Faturado Total" value={formatCurrency(totalReceita)} color="#000080" />
        <Win2kKpi label="Custo Global" value={formatCurrency(totalCustoGlobal)} color="#800000" />
        <Win2kKpi label="Lucro Real" value={formatCurrency(totalMargemReal)} color={totalMargemReal >= 0 ? '#006400' : '#800000'} />
        <Win2kKpi label="SLA Entregas" value={`${sla.toFixed(2)}%`} color={sla >= 95 ? '#006400' : '#808000'} />
      </div>

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        
        {/* Fixed Costs */}
        <Win2kPanel title="Custos Fixos da Frota">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
            <CostInput label="Aluguel" field="aluguel" value={globalCosts.aluguel} />
            <CostInput label="Combustível" field="combustivel" value={globalCosts.combustivel} />
            <CostInput label="Manutenção" field="manutencao" value={globalCosts.manutencao} />
            <CostInput label="Seguro" field="seguro" value={globalCosts.seguro} />
          </div>
        </Win2kPanel>

        {/* Margin & Ticket */}
        <Win2kPanel title="Radiografia de Margem (%) e Ticket">
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div style={{ paddingRight: 12, borderRight: '1px solid #808080', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div style={{ fontSize: '10px', color: '#808080', fontWeight: 'bold', textTransform: 'uppercase' }}>% Custo Global</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#800000', fontFamily: "'Courier New', monospace" }}>{pctCustoTotal.toFixed(2)}%</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#808080', fontWeight: 'bold', textTransform: 'uppercase' }}>% Lucro Base</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#006400', fontFamily: "'Courier New', monospace" }}>{pctMargemReal.toFixed(2)}%</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flex: 1 }}>
              {[
                { label: 'Tck Faturado', value: formatCurrency(tckReceita), color: '#000080' },
                { label: 'Tck Custo', value: formatCurrency(tckCusto), color: '#800000' },
                { label: 'Tck Lucro', value: formatCurrency(tckLucro), color: '#006400' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#ffffff',
                  borderTop: '2px solid #808080',
                  borderLeft: '2px solid #808080',
                  borderRight: '2px solid #e8e4dc',
                  borderBottom: '2px solid #e8e4dc',
                  boxShadow: 'inset 1px 1px 0 #404040',
                  padding: '4px 6px',
                }}>
                  <div style={{ fontSize: '9px', color: '#808080', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: item.color, fontFamily: "'Courier New', monospace" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </Win2kPanel>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        
        {/* Receita por Operação */}
        <Win2kPanel title="Receita por Operação">
          <div style={{ height: 260, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operacaoData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#c0bdb5" />
                <XAxis dataKey="name" tick={{ fill: '#000000', fontSize: 9, fontFamily: "'Tahoma', Arial" }} tickLine={false} axisLine={{ stroke: '#808080' }} />
                <YAxis tick={{ fill: '#000000', fontSize: 9, fontFamily: "'Tahoma', Arial" }} tickLine={false} axisLine={{ stroke: '#808080' }} tickFormatter={val => `R$${(val/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="receita" name="Receita" fill="#000080" radius={0} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Win2kPanel>

        {/* Margem por Contrato */}
        <Win2kPanel title="Margem por Contrato">
          <div style={{ height: 260, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={contratoData} margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 9, fontFamily: "'Tahoma', Arial" }} width={70} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="margem" name="Margem R$" fill="#006400" radius={0} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Win2kPanel>

        {/* Análise por Motorista */}
        <Win2kPanel title="Análise por Motorista">
          <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 4 }}>
            {/* Table Header */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', fontFamily: "'Tahoma', 'MS Sans Serif', Arial" }}>
              <thead>
                <tr style={{ background: '#0a246a', color: '#ffffff' }}>
                  <th style={{ padding: '2px 4px', textAlign: 'left', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>Motorista</th>
                  <th style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>Líquido</th>
                  <th style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>Margem</th>
                  <th style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold', fontSize: '9px', textTransform: 'uppercase' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {motoristasData.map((m, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#e8e4dc' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#0a246a'; (e.currentTarget as HTMLTableRowElement).style.color = '#ffffff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#ffffff' : '#e8e4dc'; (e.currentTarget as HTMLTableRowElement).style.color = '#000000'; }}>
                    <td style={{ padding: '2px 4px', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.name}>{m.name}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', color: '#000080' }}>{formatCurrency(m.receita)}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', color: m.margem >= 0 ? '#006400' : '#800000' }}>{formatCurrency(m.margem)}</td>
                    <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold', color: m.margemPctVal >= 0 ? '#006400' : '#800000' }}>{m.margemPctVal.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#d4d0c8', fontWeight: 'bold', borderTop: '2px solid #808080' }}>
                  <td style={{ padding: '2px 4px', color: '#000080', fontWeight: 'bold' }}>TOTAL</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right', color: '#000080' }}>{formatCurrency(totalReceita)}</td>
                  <td style={{ padding: '2px 4px', textAlign: 'right', color: '#006400' }}>{formatCurrency(records.reduce((a,r) => a+r.lucroBruto, 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Win2kPanel>

      </div>
    </div>
  );
};
