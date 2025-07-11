import CRUDMaestro from '../../components/CRUD/CRUDMaestro';
import { clientesConfig } from '../../config/entitiesConfig';

export default function Clientes() {
  return <CRUDMaestro config={clientesConfig} />;
}