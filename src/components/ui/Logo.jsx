import logotipo from '../../assets/logotipo.png'
import simbolo from '../../assets/logotipo-simbolo.png'

const ALT = 'Karolyne Paola Beauty'

/**
 * Só o símbolo da marca (a lótus com a silhueta), recortado da logo oficial.
 */
export const BrandMark = ({ className = 'w-10' }) => (
  <img
    src={simbolo}
    alt=""
    aria-hidden="true"
    className={`${className} h-auto shrink-0 object-contain`}
  />
)

/**
 * Logo oficial completa em arquivo (símbolo + assinatura), sem fundo.
 *
 * A assinatura do arquivo é cinza-escuro e sumiria em fundo escuro, então ela
 * fica sobre uma placa clara fixa — a marca em si não é recolorida. Use só onde
 * há espaço de sobra; em espaços apertados prefira <Logo />.
 */
export const FullLogo = ({ className = '', imgClassName = 'h-24' }) => (
  <span
    className={`inline-flex items-center justify-center rounded-2xl bg-[#f7f2ec] px-4 py-3 ${className}`}
  >
    <img src={logotipo} alt={ALT} className={`${imgClassName} w-auto object-contain`} />
  </span>
)

/**
 * Lockup compacto: o símbolo da marca com a assinatura redesenhada em texto.
 * Ocupa pouca altura e acompanha o tema (a assinatura em arquivo não acompanha).
 */
const Logo = ({
  className = '',
  markClassName = 'w-10',
  showWordmark = true,
  wordmarkClassName = 'flex',
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <BrandMark className={markClassName} />
    {showWordmark && (
      <span className={`${wordmarkClassName} flex-col leading-none min-w-0`}>
        <span className="font-display text-[15px] font-semibold truncate">Karolyne Paola</span>
        <span className="brand-caps text-[8px] text-muted-foreground mt-1.5">Beauty</span>
      </span>
    )}
  </div>
)

export default Logo
