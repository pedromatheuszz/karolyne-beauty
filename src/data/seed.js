/**
 * Carga inicial do banco.
 *
 * `CATALOG` é o que entra automaticamente na primeira abertura: o catálogo de
 * serviços e os dados do espaço. São informações reais e úteis desde o começo.
 *
 * `DEMO` são clientes e movimentações fictícias, carregadas só quando alguém
 * clica em "carregar dados de demonstração" nas Configurações. Elas nunca
 * entram sozinhas — um sistema em produção não deve nascer com cliente falso
 * na agenda.
 */
const DAY = 24 * 60 * 60 * 1000

/** ISO date (YYYY-MM-DD) deslocada em `offset` dias a partir de hoje. */
function day(offset) {
  const now = new Date()
  const base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return new Date(base + offset * DAY).toISOString().slice(0, 10)
}

export const salonDefaults = {
  name: 'Karolyne Paola Beauty',
  owner: 'Karolyne Paola',
  nickname: 'Karol',
  role: 'Massoterapeuta e Esteticista',
  tagline: 'Elevando sua autoestima',
  city: 'Joinville - SC',
  whatsapp: '5547996981710',
  instagram: 'karolynepaolabeauty',
  openingTime: '09:00',
  closingTime: '19:00',
}

const services = [
  { id: 'svc_1', name: 'Massagem Relaxante', description: 'Alívio de tensões com óleos essenciais', duration: 60, price: 120, status: 'active', category: 'Massoterapia' },
  { id: 'svc_2', name: 'Massagem Modeladora', description: 'Manobras firmes para contorno corporal', duration: 60, price: 140, status: 'active', category: 'Massoterapia' },
  { id: 'svc_3', name: 'Drenagem Linfática', description: 'Estimula o sistema linfático e reduz retenção', duration: 60, price: 130, status: 'active', category: 'Massoterapia' },
  { id: 'svc_4', name: 'Drenagem Pós-operatória', description: 'Protocolo específico para pós-cirúrgico', duration: 60, price: 150, status: 'active', category: 'Massoterapia' },
  { id: 'svc_5', name: 'Ventosaterapia', description: 'Ventosas para circulação e dores musculares', duration: 45, price: 110, status: 'active', category: 'Massoterapia' },
  { id: 'svc_6', name: 'Pedras Quentes', description: 'Relaxamento profundo com pedras vulcânicas', duration: 75, price: 160, status: 'active', category: 'Massoterapia' },
  { id: 'svc_7', name: 'Hidrolipoclasia', description: 'Protocolo para gordura localizada', duration: 60, price: 250, status: 'active', category: 'Estética Corporal' },
  { id: 'svc_8', name: 'Bambuterapia', description: 'Modelagem corporal com bambus', duration: 60, price: 140, status: 'active', category: 'Estética Corporal' },
  { id: 'svc_9', name: 'Depilação — Axilas', description: 'Cera quente', duration: 20, price: 35, status: 'active', category: 'Depilação' },
  { id: 'svc_10', name: 'Depilação — Meia perna', description: 'Cera quente', duration: 30, price: 55, status: 'active', category: 'Depilação' },
  { id: 'svc_11', name: 'Depilação — Virilha completa', description: 'Cera quente com pós-depilatório', duration: 40, price: 75, status: 'active', category: 'Depilação' },
  { id: 'svc_12', name: 'Limpeza de Pele Profunda', description: 'Extração, alta frequência e máscara calmante', duration: 90, price: 180, status: 'active', category: 'Estética Facial' },
]

/** Entra sozinho na primeira abertura. */
export const CATALOG = {
  services,
  settings: Object.entries(salonDefaults).map(([key, value]) => ({
    id: `set_${key}`,
    key,
    value: String(value),
  })),
}

/** Só entra quando alguém pede explicitamente. */
export function buildDemoData() {
  const customers = [
    { id: 'cus_1', name: 'Mariana Schmitt', phone: '(47) 99812-4431', email: 'mariana.schmitt@email.com', birthDate: '1990-05-15', address: 'Rua Blumenau, 420 - América, Joinville', registrationDate: day(-540), notes: 'Prefere horários no fim da tarde.', outstandingBalance: 0 },
    { id: 'cus_2', name: 'Beatriz Koerich', phone: '(47) 99654-8820', email: 'bia.koerich@email.com', birthDate: '1985-08-22', address: 'Rua Dona Francisca, 1180 - Saguaçu, Joinville', registrationDate: day(-410), notes: 'Pós-operatório de abdominoplastia.', outstandingBalance: 0 },
    { id: 'cus_3', name: 'Juliana Reis', phone: '(47) 99231-7745', email: 'juliana.reis@email.com', birthDate: '1992-11-30', address: 'Rua Ottokar Doerffel, 90 - Atiradores, Joinville', registrationDate: day(-300), notes: 'Alergia a óleo de amêndoas.', outstandingBalance: 130 },
    { id: 'cus_4', name: 'Renata Bittencourt', phone: '(47) 99105-2298', email: 'renata.bit@email.com', birthDate: '1988-03-18', address: 'Rua XV de Novembro, 2210 - Glória, Joinville', registrationDate: day(-180), notes: '', outstandingBalance: 0 },
    { id: 'cus_5', name: 'Fernanda Voigt', phone: '(47) 98871-3390', email: 'fe.voigt@email.com', birthDate: '1995-07-10', address: 'Rua Itajaí, 55 - Anita Garibaldi, Joinville', registrationDate: day(-90), notes: 'Primeira vez em drenagem.', outstandingBalance: 0 },
    { id: 'cus_6', name: 'Carolina Hoffmann', phone: '(47) 99427-6614', email: 'carol.hoffmann@email.com', birthDate: '1998-01-27', address: 'Rua Iririú, 1340 - Iririú, Joinville', registrationDate: day(-25), notes: 'Indicada pela Mariana.', outstandingBalance: 0 },
  ]

  const appointments = [
    { id: 'apt_1', customerId: 'cus_2', customerName: 'Beatriz Koerich', serviceId: 'svc_4', service: 'Drenagem Pós-operatória', date: day(-21), startTime: '09:00', endTime: '10:00', price: 150, status: 'completed', notes: '4ª sessão do protocolo' },
    { id: 'apt_2', customerId: 'cus_1', customerName: 'Mariana Schmitt', serviceId: 'svc_1', service: 'Massagem Relaxante', date: day(-18), startTime: '17:30', endTime: '18:30', price: 120, status: 'completed', notes: '' },
    { id: 'apt_3', customerId: 'cus_3', customerName: 'Juliana Reis', serviceId: 'svc_3', service: 'Drenagem Linfática', date: day(-14), startTime: '14:00', endTime: '15:00', price: 130, status: 'completed', notes: 'Usou óleo neutro (alergia)' },
    { id: 'apt_4', customerId: 'cus_2', customerName: 'Beatriz Koerich', serviceId: 'svc_4', service: 'Drenagem Pós-operatória', date: day(-12), startTime: '09:00', endTime: '10:00', price: 150, status: 'completed', notes: '5ª sessão do protocolo' },
    { id: 'apt_5', customerId: 'cus_4', customerName: 'Renata Bittencourt', serviceId: 'svc_11', service: 'Depilação — Virilha completa', date: day(-9), startTime: '11:00', endTime: '11:40', price: 75, status: 'completed', notes: '' },
    { id: 'apt_6', customerId: 'cus_5', customerName: 'Fernanda Voigt', serviceId: 'svc_12', service: 'Limpeza de Pele Profunda', date: day(-7), startTime: '15:00', endTime: '16:30', price: 180, status: 'completed', notes: 'Pele sensível, reduziu alta frequência' },
    { id: 'apt_7', customerId: 'cus_1', customerName: 'Mariana Schmitt', serviceId: 'svc_5', service: 'Ventosaterapia', date: day(-4), startTime: '18:00', endTime: '18:45', price: 110, status: 'completed', notes: 'Tensão cervical' },
    { id: 'apt_8', customerId: 'cus_3', customerName: 'Juliana Reis', serviceId: 'svc_3', service: 'Drenagem Linfática', date: day(-2), startTime: '14:00', endTime: '15:00', price: 130, status: 'completed', notes: '' },
    { id: 'apt_9', customerId: 'cus_6', customerName: 'Carolina Hoffmann', serviceId: 'svc_2', service: 'Massagem Modeladora', date: day(0), startTime: '10:00', endTime: '11:00', price: 140, status: 'confirmed', notes: 'Primeira sessão do pacote' },
    { id: 'apt_10', customerId: 'cus_2', customerName: 'Beatriz Koerich', serviceId: 'svc_4', service: 'Drenagem Pós-operatória', date: day(0), startTime: '16:00', endTime: '17:00', price: 150, status: 'confirmed', notes: '6ª sessão do protocolo' },
    { id: 'apt_11', customerId: 'cus_5', customerName: 'Fernanda Voigt', serviceId: 'svc_3', service: 'Drenagem Linfática', date: day(1), startTime: '09:30', endTime: '10:30', price: 130, status: 'scheduled', notes: '' },
    { id: 'apt_12', customerId: 'cus_4', customerName: 'Renata Bittencourt', serviceId: 'svc_7', service: 'Hidrolipoclasia', date: day(3), startTime: '14:00', endTime: '15:00', price: 250, status: 'scheduled', notes: 'Avaliação prévia feita' },
    { id: 'apt_13', customerId: 'cus_1', customerName: 'Mariana Schmitt', serviceId: 'svc_6', service: 'Pedras Quentes', date: day(5), startTime: '17:00', endTime: '18:15', price: 160, status: 'scheduled', notes: '' },
    { id: 'apt_14', customerId: 'cus_6', customerName: 'Carolina Hoffmann', serviceId: 'svc_2', service: 'Massagem Modeladora', date: day(7), startTime: '10:00', endTime: '11:00', price: 140, status: 'scheduled', notes: '2ª sessão do pacote' },
    { id: 'apt_15', customerId: 'cus_3', customerName: 'Juliana Reis', serviceId: 'svc_9', service: 'Depilação — Axilas', date: day(-5), startTime: '13:30', endTime: '13:50', price: 35, status: 'cancelled', notes: 'Cliente remarcou' },
    { id: 'apt_16', customerId: 'cus_5', customerName: 'Fernanda Voigt', serviceId: 'svc_10', service: 'Depilação — Meia perna', date: day(-11), startTime: '16:00', endTime: '16:30', price: 55, status: 'no-show', notes: '' },
  ]

  const packages = [
    { id: 'pkg_1', customerId: 'cus_2', customerName: 'Beatriz Koerich', serviceId: 'svc_4', serviceName: 'Drenagem Pós-operatória', totalSessions: 10, usedSessions: 6, price: 1200, purchaseDate: day(-30), expiresAt: day(60), status: 'active' },
    { id: 'pkg_2', customerId: 'cus_6', customerName: 'Carolina Hoffmann', serviceId: 'svc_2', serviceName: 'Massagem Modeladora', totalSessions: 10, usedSessions: 1, price: 1150, purchaseDate: day(-3), expiresAt: day(87), status: 'active' },
    { id: 'pkg_3', customerId: 'cus_3', customerName: 'Juliana Reis', serviceId: 'svc_3', serviceName: 'Drenagem Linfática', totalSessions: 5, usedSessions: 2, price: 585, purchaseDate: day(-20), expiresAt: day(10), status: 'active' },
    { id: 'pkg_4', customerId: 'cus_1', customerName: 'Mariana Schmitt', serviceId: 'svc_1', serviceName: 'Massagem Relaxante', totalSessions: 5, usedSessions: 5, price: 540, purchaseDate: day(-120), expiresAt: day(-30), status: 'completed' },
    { id: 'pkg_5', customerId: 'cus_4', customerName: 'Renata Bittencourt', serviceId: 'svc_8', serviceName: 'Bambuterapia', totalSessions: 8, usedSessions: 3, price: 1000, purchaseDate: day(-75), expiresAt: day(-5), status: 'expired' },
  ]

  const payments = [
    { id: 'pay_1', customerId: 'cus_2', customerName: 'Beatriz Koerich', amount: 1200, date: day(-30), method: 'PIX', status: 'pago', reference: 'Pacote 10x Drenagem Pós-operatória' },
    { id: 'pay_2', customerId: 'cus_1', customerName: 'Mariana Schmitt', amount: 120, date: day(-18), method: 'PIX', status: 'pago', reference: 'Massagem Relaxante' },
    { id: 'pay_3', customerId: 'cus_3', customerName: 'Juliana Reis', amount: 585, date: day(-20), method: 'Cartão de Crédito', status: 'parcialmente pago', reference: 'Pacote 5x Drenagem Linfática' },
    { id: 'pay_4', customerId: 'cus_4', customerName: 'Renata Bittencourt', amount: 75, date: day(-9), method: 'Dinheiro', status: 'pago', reference: 'Depilação — Virilha completa' },
    { id: 'pay_5', customerId: 'cus_5', customerName: 'Fernanda Voigt', amount: 180, date: day(-7), method: 'Cartão de Débito', status: 'pago', reference: 'Limpeza de Pele Profunda' },
    { id: 'pay_6', customerId: 'cus_1', customerName: 'Mariana Schmitt', amount: 110, date: day(-4), method: 'PIX', status: 'pago', reference: 'Ventosaterapia' },
    { id: 'pay_7', customerId: 'cus_6', customerName: 'Carolina Hoffmann', amount: 1150, date: day(-3), method: 'Cartão de Crédito', status: 'pago', reference: 'Pacote 10x Massagem Modeladora' },
    { id: 'pay_8', customerId: 'cus_3', customerName: 'Juliana Reis', amount: 130, date: day(-2), method: 'PIX', status: 'pendente', reference: 'Drenagem Linfática avulsa' },
    { id: 'pay_9', customerId: 'cus_4', customerName: 'Renata Bittencourt', amount: 250, date: day(-40), method: 'Transferência Bancária', status: 'atrasado', reference: 'Hidrolipoclasia — sessão anterior' },
  ]

  const products = [
    { id: 'prd_1', name: 'Óleo de Massagem Relaxante 1L', sku: 'KPB-001', category: 'Massoterapia', supplier: 'Bella Cosméticos', costPrice: 48, sellingPrice: 95, currentStock: 9, minStockLevel: 4, unit: 'un', status: 'active' },
    { id: 'prd_2', name: 'Gel Redutor Térmico 1kg', sku: 'KPB-002', category: 'Massoterapia', supplier: 'Bella Cosméticos', costPrice: 62, sellingPrice: 125, currentStock: 3, minStockLevel: 4, unit: 'un', status: 'low' },
    { id: 'prd_3', name: 'Cera Depilatória Quente 1kg', sku: 'KPB-003', category: 'Depilação', supplier: 'Distribuidora Estética Sul', costPrice: 38, sellingPrice: 75, currentStock: 12, minStockLevel: 6, unit: 'un', status: 'active' },
    { id: 'prd_4', name: 'Óleo Pós-depilatório 500ml', sku: 'KPB-004', category: 'Depilação', supplier: 'Distribuidora Estética Sul', costPrice: 22, sellingPrice: 45, currentStock: 5, minStockLevel: 5, unit: 'un', status: 'low' },
    { id: 'prd_5', name: 'Kit Ventosas de Silicone', sku: 'KPB-005', category: 'Massoterapia', supplier: 'Joinville Med Supply', costPrice: 85, sellingPrice: 170, currentStock: 4, minStockLevel: 2, unit: 'kit', status: 'active' },
    { id: 'prd_6', name: 'Argila Verde 500g', sku: 'KPB-006', category: 'Facial', supplier: 'Bella Cosméticos', costPrice: 26, sellingPrice: 55, currentStock: 7, minStockLevel: 3, unit: 'un', status: 'active' },
    { id: 'prd_7', name: 'Ampola Vitamina C (cx 10)', sku: 'KPB-007', category: 'Facial', supplier: 'Bella Cosméticos', costPrice: 95, sellingPrice: 190, currentStock: 0, minStockLevel: 2, unit: 'cx', status: 'out of stock' },
    { id: 'prd_8', name: 'Lençol Descartável (rolo 50m)', sku: 'KPB-008', category: 'Descartáveis', supplier: 'Joinville Med Supply', costPrice: 34, sellingPrice: 60, currentStock: 18, minStockLevel: 8, unit: 'un', status: 'active' },
    { id: 'prd_9', name: 'Luva de Procedimento (cx 100)', sku: 'KPB-009', category: 'Descartáveis', supplier: 'Joinville Med Supply', costPrice: 42, sellingPrice: 80, currentStock: 11, minStockLevel: 6, unit: 'cx', status: 'active' },
  ]

  const inventoryTransactions = [
    { id: 'inv_1', productId: 'prd_1', product: 'Óleo de Massagem Relaxante 1L', type: 'stock entry', quantity: 12, reason: 'Compra mensal', date: day(-28), user: 'Karol' },
    { id: 'inv_2', productId: 'prd_3', product: 'Cera Depilatória Quente 1kg', type: 'stock entry', quantity: 15, reason: 'Compra mensal', date: day(-28), user: 'Karol' },
    { id: 'inv_3', productId: 'prd_1', product: 'Óleo de Massagem Relaxante 1L', type: 'product usage', quantity: -3, reason: 'Uso em atendimentos', date: day(-14), user: 'Karol' },
    { id: 'inv_4', productId: 'prd_2', product: 'Gel Redutor Térmico 1kg', type: 'product usage', quantity: -2, reason: 'Massagem modeladora', date: day(-10), user: 'Karol' },
    { id: 'inv_5', productId: 'prd_7', product: 'Ampola Vitamina C (cx 10)', type: 'sale', quantity: -2, reason: 'Venda para cliente', date: day(-7), user: 'Karol' },
    { id: 'inv_6', productId: 'prd_3', product: 'Cera Depilatória Quente 1kg', type: 'product usage', quantity: -3, reason: 'Depilações da semana', date: day(-5), user: 'Karol' },
    { id: 'inv_7', productId: 'prd_4', product: 'Óleo Pós-depilatório 500ml', type: 'manual adjustment', quantity: -1, reason: 'Frasco danificado', date: day(-3), user: 'Karol' },
  ]

  return { customers, appointments, packages, payments, products, inventoryTransactions }
}
