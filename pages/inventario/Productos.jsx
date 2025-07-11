import CRUDMaestro from '../../components/CRUD/CRUDMaestro';
import { productosConfig } from '../../config/entitiesConfig';

export default function Productos() {
  return <CRUDMaestro config={productosConfig} />;
}