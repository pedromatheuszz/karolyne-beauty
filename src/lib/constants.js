/** Listas fixas da interface — não são dados, são opções de formulário. */

export const paymentMethods = [
  'PIX',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência Bancária',
  'Outro',
]

export const paymentStatuses = ['pago', 'pendente', 'parcialmente pago', 'atrasado']

export const serviceCategories = [
  'Massoterapia',
  'Estética Corporal',
  'Depilação',
  'Estética Facial',
]

export const productCategories = ['Massoterapia', 'Depilação', 'Facial', 'Descartáveis']

export const suppliers = ['Distribuidora Estética Sul', 'Bella Cosméticos', 'Joinville Med Supply']

/** Identificador único para registros novos. */
export function newId(prefix) {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${random}`
}
