import type { LogisticsRecord } from '../types';
import { formatCurrency } from '../utils';

interface DashboardHeaderProps {
  records: LogisticsRecord[];
  darkMode: boolean;
}

const Win2kStatBox = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <div style={{
    background: '#d4d0c8',
    borderTop: '2px solid #ffffff',
    borderLeft: '2px solid #ffffff',
    borderRight: '2px solid #808080',
    borderBottom: '2px solid #808080',
    boxShadow: 'inset -1px -1px 0 #404040, inset 1px 1px 0 #e8e4dc',
    padding: '6px 10px',
    minWidth: 140,
    flex: 1,
  }}>
    {/* Inner label bar - like a group box title */}
    <div style={{ fontSize: '10px', color: '#000080', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </div>
    {/* Value in an inset field */}
    <div style={{
      background: '#ffffff',
      borderTop: '2px solid #808080',
      borderLeft: '2px solid #808080',
      borderRight: '2px solid #e8e4dc',
      borderBottom: '2px solid #e8e4dc',
      boxShadow: 'inset 1px 1px 0 #404040',
      padding: '4px 6px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: color || '#000080',
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      letterSpacing: '0.5px',
    }}>
      {value}
    </div>
  </div>
);

export const DashboardHeader = ({ records }: DashboardHeaderProps) => {
  const totalDeliveries = records.reduce((acc, r) => acc + r.entregas, 0);
  const totalGross = records.reduce((acc, r) => acc + r.valorFaturado, 0);
  const totalCosts = records.reduce((acc, r) => acc + r.vlrTotal, 0);
  const totalNet = records.reduce((acc, r) => acc + r.lucroBruto, 0);

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Group Box style header */}
      <fieldset style={{
        border: '2px solid #808080',
        borderTop: '2px solid #808080',
        borderLeft: '2px solid #808080',
        borderRight: '2px solid #ffffff',
        borderBottom: '2px solid #ffffff',
        padding: '4px 8px 8px 8px',
        margin: '0 0 6px 0',
        background: '#d4d0c8',
      }}>
        <legend style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px', color: '#000080', background: '#d4d0c8' }}>
          Resumo Financeiro
        </legend>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Win2kStatBox label="Receita Bruta" value={formatCurrency(totalGross)} color="#000080" />
          <Win2kStatBox label="Custo Motoristas" value={formatCurrency(totalCosts)} color="#800000" />
          <Win2kStatBox label="Lucro Líquido" value={formatCurrency(totalNet)} color={totalNet >= 0 ? '#006400' : '#800000'} />
          <Win2kStatBox label="Entregas Totais" value={totalDeliveries.toLocaleString('pt-BR')} color="#000080" />
        </div>
      </fieldset>
    </div>
  );
};
