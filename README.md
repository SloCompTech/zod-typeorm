# zod-typeorm

[zod-typeorm](https://github.com/SloCompTech/zod-typeorm) aims to be simple helper library to help developers create Zod schemas from TypeORM entites without assumptions about development style.

## Brief description

- Works with class inheritance (no base class pollution)
- Currently **no property name conflict resolution**
- Currently no integration with *@Column* decorator from TypeORM
- Supports schema variants (no predefined schema)

## Quick start

Define schema for each property with *@ZodProperty*.

- Argument can be schema diretly like `@ZodProperty(z.number().min(0))`
- Or it can be options with *schema* property `@ZodProperty({ schema: z.number().min(0) })`

```ts
@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ZodProperty(z.number().min(0))
  id: number;

  @Column()
  @ZodProperty(z.string().min(1).max(255))
  name: string;
}

// Create schema from entity
const entitySchema = createZodSchemaFromEntity(TestEntity);
// included schema properties: id, name
```

## Installation

```bash
npm install zod-typeorm
```

## Inheritance support

Library supports object inheritance with limition that property names should **not be duplicated** between classes.

```ts
export class EntityBase {
  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  baseProperty: string;
}

@Entity()
export class TestEntity extends EntityBase {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0) })
  id: number;

  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  name: string;
}

// Create schema from entity
const entitySchema = createZodSchemaFromEntity(TestEntity);
// included schema properties: baseProperty, id, name
```

## Schema variants

To create different schema from the same Entity based on your use case, there is support for schema variants.

- Variants can have arbitrary name (except *default* is reserved), variant names don't need to be defined anywhere, just use logic below
- Using *includeForVariants* in *@ZodProperty* you can select variants for which property should be included
- Using *optionalForVariants* in *@ZodProperty* you can make property optional for variants
- Using *skipForVariants* in *@ZodProperty* you can exclude property from variants
- Using *transformForVariants* in *@ZodProperty* you can transform schema additionaly for variants

```ts
@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0) })
  id: number;

  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  name: string;

  @Column({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0), includeForVariants: ['variant1'] })
  iProperty: number;

  @Column({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0), includeForVariants: ['variant2'] })
  sProperty: number;

  @Column({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0), skipForVariants: ['variant2'], optionalForVariants: ['variant3'] })
  pProperty: number;
}

// Create schemas from entity
const schemas = createZodSchemasFromEntity(TestEntity, ['variant1', 'variant2', 'variant3']);
schemas.variant1 // variant1: includes properties id, name, iProperty, pProperty
schemas.variant2 // variant2: includes properties id, name, sProperty
schemas.variant3 // variant3: includes properties id, name, pProperty?
```


## Schema generation options

While creating schemas additional options can be specified.

```ts
const schemas = createZodSchemasFromEntity(TestEntity, ['variant1', 'variant2', 'variant3'], {
  strict: true, // Make schema strict (see Zod doc)
  optionalFields: [], // Make fields optional for all variants
  skipFields: [], // Skip fields for all variants,
  transformFields: {
    variant1: (schema: z.ZodType) => schema, // Transform certain fields
  },
  transformSchema: (schema: z.ZodObject<z.ZodRawShape>) => schema, // Additionaly transform generated schema
  transformSchemaForVariants: {
    variant1: (schema: z.ZodObject<z.ZodRawShape>) => schema, // Transform schema for variant
  },
});
```

## Type Inference

```ts
type Variant1 = z.infer<typeof schemas.variant1>;
type Variant2 = z.infer<typeof schemas.variant2>;
type Variant3 = z.infer<typeof schemas.variant3>;
```

## API reference

Decorators:

- `@ZodProperty(schema)`
- `@ZodProperty({ schema, includeForVariants?, optionalForVariants?, skipForVariants?, transformForVariants? })`

Schema creation:

- `createZodSchemaFromEntity(entityClass, variantName, options)`
- `createZodSchemasFromEntity(entityClass, [variantNames], options)`


## Requirements

- TypeORM >= 1.1.1
- Zod >= 4.0.0
- TypeScript
- *reflect-metadata* package

## Contribution

Contributions are welcome, before commiting changes please run:

```bash
npm run typecheck
npm run test
npm run check-format
```
