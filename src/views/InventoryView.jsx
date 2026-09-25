import { useMemo, useState } from 'react'

import InventoryTransactions from '../components/inventory/InventoryTransactions'
import ProductForm from '../components/inventory/ProductForm'
import Icon from '../components/ui/Icon'
import KPICard from '../components/ui/KPICard'
import SearchableTable from '../components/ui/SearchableTable'
import StatusBadge from '../components/ui/StatusBadge'
import { productCategories, suppliers } from '../lib/constants'
import { formatCurrency } from '../lib/format'

const InventoryView = ({ products, transactions, onSaveProduct }) => {
  const [editing, setEditing] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const totals = useMemo(() => {
    const costValue = products.reduce((sum, p) => sum + p.costPrice * p.currentStock, 0)
    const saleValue = products.reduce((sum, p) => sum + p.sellingPrice * p.currentStock, 0)
    const alerts = products.filter(p => p.currentStock <= p.minStockLevel)
    return { costValue, saleValue, alerts }
  }, [products])

  const columns = useMemo(
    () => [
      { key: 'sku', label: 'SKU' },
      { key: 'name', label: 'Produto' },
      { key: 'category', label: 'Categoria' },
      { key: 'supplier', label: 'Fornecedor' },
      {
        key: 'currentStock',
        label: 'Estoque',
        className: 'text-right',
        render: item => `${item.currentStock} ${item.unit}`,
      },
      { key: 'minStockLevel', label: 'Mínimo', className: 'text-right' },
      {
        key: 'costPrice',
        label: 'Custo',
        className: 'text-right real',
        render: item => formatCurrency(item.costPrice),
      },
      {
        key: 'sellingPrice',
        label: 'Venda',
        className: 'text-right real',
        render: item => formatCurrency(item.sellingPrice),
      },
      { key: 'status', label: 'Status', render: item => <StatusBadge status={item.status} /> },
      {
        key: 'id',
        label: 'Ações',
        render: item => (
          <button
            type="button"
            onClick={() => {
              setEditing(item)
              setIsFormOpen(true)
            }}
            className="text-accent text-sm font-medium hover:underline"
          >
            Editar
          </button>
        ),
      },
    ],
    [],
  )

  const handleClose = () => {
    setIsFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Valor em estoque (custo)" value={totals.costValue} currency icon="box" />
        <KPICard
          title="Valor em estoque (venda)"
          value={totals.saleValue}
          currency
          icon="trending"
          tone="secondary"
        />
        <KPICard
          title="Produtos para repor"
          value={totals.alerts.length}
          icon="alert"
          tone={totals.alerts.length > 0 ? 'warning' : 'default'}
          subtitle={
            totals.alerts.length > 0
              ? totals.alerts.map(p => p.name).join(', ')
              : 'Nenhum produto abaixo do mínimo'
          }
        />
      </div>

      {isFormOpen && (
        <ProductForm
          product={editing}
          categories={productCategories}
          suppliers={suppliers}
          onSubmit={onSaveProduct}
          onClose={handleClose}
        />
      )}

      <SearchableTable
        title="Produtos"
        data={products}
        columns={columns}
        searchPlaceholder="Buscar por nome, SKU ou fornecedor..."
        noDataText="Nenhum produto cadastrado"
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
            className="btn-primary whitespace-nowrap"
          >
            <Icon name="plus" className="w-4 h-4" />
            Novo
          </button>
        }
      />

      <InventoryTransactions transactions={transactions} />
    </div>
  )
}

export default InventoryView
