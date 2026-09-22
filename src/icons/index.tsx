import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faCopy,
  faDatabase,
  faEye,
  faFolder,
  faFolderOpen,
  faGaugeHigh,
  faGear,
  faGlobe,
  faPenToSquare,
  faPlus,
  faScrewdriverWrench,
  faServer,
  faTable,
  faTrash,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'

export interface IconProps {
  className?: string
}

export function IconDashboard(props: IconProps) {
  return <FontAwesomeIcon icon={faGaugeHigh} {...props} />
}

export function IconSettings(props: IconProps) {
  return <FontAwesomeIcon icon={faGear} {...props} />
}

export function IconFolder(props: IconProps) {
  return <FontAwesomeIcon icon={faFolder} {...props} />
}

export function IconFolderOpen(props: IconProps) {
  return <FontAwesomeIcon icon={faFolderOpen} {...props} />
}

export function IconCheckCircle(props: IconProps) {
  return <FontAwesomeIcon icon={faCircleCheck} {...props} />
}

export function IconAlert(props: IconProps) {
  return <FontAwesomeIcon icon={faTriangleExclamation} {...props} />
}

export function IconServer(props: IconProps) {
  return <FontAwesomeIcon icon={faServer} {...props} />
}

export function IconInfo(props: IconProps) {
  return <FontAwesomeIcon icon={faCircleInfo} {...props} />
}

export function IconXCircle(props: IconProps) {
  return <FontAwesomeIcon icon={faCircleXmark} {...props} />
}

export function IconTrash(props: IconProps) {
  return <FontAwesomeIcon icon={faTrash} {...props} />
}

export function IconGlobe(props: IconProps) {
  return <FontAwesomeIcon icon={faGlobe} {...props} />
}

export function IconDatabase(props: IconProps) {
  return <FontAwesomeIcon icon={faDatabase} {...props} />
}

export function IconTools(props: IconProps) {
  return <FontAwesomeIcon icon={faScrewdriverWrench} {...props} />
}

export function IconEye(props: IconProps) {
  return <FontAwesomeIcon icon={faEye} {...props} />
}

export function IconEdit(props: IconProps) {
  return <FontAwesomeIcon icon={faPenToSquare} {...props} />
}

export function IconPlus(props: IconProps) {
  return <FontAwesomeIcon icon={faPlus} {...props} />
}

export function IconTable(props: IconProps) {
  return <FontAwesomeIcon icon={faTable} {...props} />
}

export function IconCopy(props: IconProps) {
  return <FontAwesomeIcon icon={faCopy} {...props} />
}

export function IconCheck(props: IconProps) {
  return <FontAwesomeIcon icon={faCheck} {...props} />
}
