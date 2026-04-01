export interface LogisticsRecord {
  id: string;
  motorista: string;
  tipoContrato: string;
  veiculo: string;
  operacao: string;
  vlrDiaria: number;
  diasTrabalhados: number;
  entregas: number;
  valorFaturado: number;
  insucessos: number;
  // Compute
  vlrDasDiarias: number; // vlrDiaria * diasTrabalhados
  
  vlrEntregas: number;
  bonus: number;
  coletas: number;
  vlrColetas: number;
  vlrSabado: number;
  pedagio: number;
  mudanca: number;
  outrosValores: number;
  descontos: number;
  
  // Compute
  vlrTotal: number; // vlrDasDiarias + vlrEntregas + bonus + vlrColetas + vlrSabado + pedagio + mudanca + outrosValores - descontos
  tckMedio: number; // vlrTotal / entregas
  lucroBruto: number; // valorFaturado - vlrTotal
  pctCusto: number; // vlrTotal / valorFaturado (percentage)
  
  entregasDia: number; // entregas / diasTrabalhados
  coletasDia: number; // coletas / diasTrabalhados
  
  regiaoEntrega: string;
  cep: string;
  pctColetados: number;
  pctPorPonto: number;
}

export interface GlobalCosts {
  aluguel: number;
  combustivel: number;
  manutencao: number;
  seguro: number;
}
