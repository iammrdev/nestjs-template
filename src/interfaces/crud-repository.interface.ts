import { PaginationList } from '../types/common';

export interface CRUDRepository<Entity, Id, ReturnType> {
  findAll(params?: unknown): Promise<PaginationList<ReturnType[]>>;

  findById(id: Id): Promise<ReturnType | null>;

  create(item: Entity): Promise<ReturnType>;

  updateById(id: Id, item: Entity): Promise<ReturnType | null>;

  deleteById(id: Id): Promise<number>;

  deleteAll(): Promise<number>;
}
