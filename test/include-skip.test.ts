import 'reflect-metadata';

import { describe, expect, test } from 'vitest';

import { createZodSchemasFromEntity } from '../src/index.js';
import { TestEntity } from './include-skip.entity.js';

describe('basic', () => {
  const schema = createZodSchemasFromEntity(TestEntity, ['variant1', 'variant2', 'variant3']);

  test('schemas should be defined', () => {
    expect(schema.variant1).toBeDefined();
    expect(schema.variant2).toBeDefined();
    expect(schema.variant3).toBeDefined();
  });

  test('schemas should have keys', () => {
    const keys1 = Object.keys(schema.variant1.shape);
    const keys2 = Object.keys(schema.variant2.shape);
    const keys3 = Object.keys(schema.variant3.shape);

    expect(keys1).toContain('id');
    expect(keys1).toContain('name');
    expect(keys1).toContain('iProperty');
    expect(keys1).not.toContain('sProperty');

    expect(keys2).toContain('id');
    expect(keys2).toContain('name');
    expect(keys2).not.toContain('iProperty');
    expect(keys2).toContain('sProperty');

    expect(keys3).toContain('id');
    expect(keys3).toContain('name');
    expect(keys3).not.toContain('iProperty');
    expect(keys3).not.toContain('sProperty');
  });
});
