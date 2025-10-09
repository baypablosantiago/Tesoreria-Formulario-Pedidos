export interface DraftFundingRequest {
  id: number;
  userId: string;
  draftData: string;
  lastSaved: Date;
}

export interface DraftRowData {
  DA: string | number;
  nroSolicitud: string | number;
  ejercicio: string | number;
  ordenPago: string;
  concepto: string;
  vencimiento: string;
  importe: string | number;
  fuenteFinanciamiento: string;
  cuentaCorriente: string;
  comentarios: string;
}
