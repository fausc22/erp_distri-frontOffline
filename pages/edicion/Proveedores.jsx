import CRUDMaestro from '../../components/CRUD/CRUDMaestro';
import { proveedoresConfig } from '../../config/entitiesConfig';

export default function Proveedores() {
  return <CRUDMaestro config={proveedoresConfig} />;
}