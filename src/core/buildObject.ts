import { plainToInstance, ClassConstructor } from 'class-transformer';

export function buildObject<T, V>(
  someDto: ClassConstructor<T>,
  plainObject: V,
): T {
  return plainToInstance(someDto, plainObject, {
    excludeExtraneousValues: true,
  });
}
