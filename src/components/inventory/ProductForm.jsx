import { useState } from 'react'

const NUMERIC_FIELDS = new Set(['costPrice', 'sellingPrice', 'currentStock', 'minStockLevel'])

const ProductForm = ({ onSubmit, onClose, product, categories = [], suppliers = [] }) => {
  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? '',
    supplier: product?.supplier ?? '',
    costPrice: product?.costPrice ?? 0,
    sellingPrice: product?.sellingPrice ?? 0,
    currentStock: product?.currentStock ?? 0,
    minStockLevel: product?.minStockLevel ?? 0,
    unit: product?.unit ?? 'un',
    status: product?.status ?? 'active',
  })
  const [error, setError] = useState('')

  const handleChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: NUMERIC_FIELDS.has(name) ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!formData.name.trim() || !formData.sku.trim()) {
      setError('Nome e SKU são obrigatórios.')
      return
    }
    if (Number(formData.sellingPrice) < Number(formData.costPrice)) {
      setError('O preço de venda não pode ser menor que o preço de custo.')
      return
    }

    setError('')
    const currentStock = Number(formData.currentStock) || 0
    const minStockLevel = Number(formData.minStockLevel) || 0

    onSubmit({
      ...formData,
      id: product?.id,
      costPrice: Number(formData.costPrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      currentStock,
      minStockLevel,
      // Status is derived from stock so the badge can never contradict the numbers.
      status:
        currentStock === 0 ? 'out of stock' : currentStock <= minStockLevel ? 'low' : 'active',
    })
    onClose?.()
  }

  const fieldClass = 'field'

  return (
    <div className="card-surface p-5">
      <h3 className="font-display text-lg font-semibold mb-4">{product ? 'Editar produto' : 'Novo produto'}</h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Nome do produto
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sku" className="block text-sm font-medium mb-1.5">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1.5">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium mb-1.5">
              Fornecedor
            </label>
            <select
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="">Selecione um fornecedor</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium mb-1.5">
              Unidade
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className={fieldClass}
            >
              <option value="un">Unidade</option>
              <option value="kit">Kit</option>
              <option value="cx">Caixa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="costPrice" className="block text-sm font-medium mb-1.5">
              Preço de custo
            </label>
            <input
              id="costPrice"
              name="costPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.costPrice}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium mb-1.5">
              Preço de venda
            </label>
            <input
              id="sellingPrice"
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.sellingPrice}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentStock" className="block text-sm font-medium mb-1.5">
              Estoque atual
            </label>
            <input
              id="currentStock"
              name="currentStock"
              type="number"
              min="0"
              step="1"
              value={formData.currentStock}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="minStockLevel" className="block text-sm font-medium mb-1.5">
              Nível mínimo
            </label>
            <input
              id="minStockLevel"
              name="minStockLevel"
              type="number"
              min="0"
              step="1"
              value={formData.minStockLevel}
              onChange={handleChange}
              className={fieldClass}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
