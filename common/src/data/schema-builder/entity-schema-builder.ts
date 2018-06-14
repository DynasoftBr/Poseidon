import { FluentSchemaBuilder } from "json-schema-fluent-builder";
import { SchemaBuilder } from "json-schema-fluent-builder";
import { Entity, EntityType, Validation, EntityProperty } from "../../models";
import { PropertyTypes, SysEntities } from "../../constants";

import { LinkedEntitySchemaBuilder } from "./linked-entity-schema-builder";
import { AbstractEntitySchamBuilder } from "./abstract-entity-schema-builder";
import { StringPropertySchemaBuilder } from "./string-property-schema-builder";
import { DateTimePropertySchemaBuilder } from "./date-time-property-schema-builder";
import { BooleanPropertySchemaBuilder } from "./boolean-property-schema-builder";
import { NumberPropertySchemaBuilder } from "./number-property-schema-builder";
import { EnumPropertySchemaBuilder } from "./enum-property-schema-builder";
import { SysError, SysMsgs } from "../..";
import { EntityTypeRepository } from "../repositories/entity-type-repository";
import { ArrayPropertySchemaBuilder } from "./array-property-schema-builder";
import { GenericRepositoryInterface } from "../repositories/repository-interface";

export class EntitySchemaBuilder {

    constructor(private readonly entityTypeRepository: GenericRepositoryInterface<EntityType>) { }

    /**
     * Builds the schema for the specified entity type.
     */
    public async buildSchema(entityType: EntityType): Promise<FluentSchemaBuilder> {
        // The root schema.
        let schema = new SchemaBuilder().object();

        // No additional properties allowed.
        schema.additionalProperties(false);

        // Iterate entity type properties to build each ones schema.
        let propsLength = entityType.props.length;
        for (let idx = 0; idx < propsLength; idx++) {
            const prop = entityType.props[idx];

            let bs = await this.buildSchemaValidation(schema, prop.validation);
            schema.prop(prop.name, bs, prop.validation.required || prop.validation.type === PropertyTypes.boolean);
        }

        return schema;
    }

    /**
     * Builds a sub schema for an property using its validation specification.
     * @param rootSchema The root schema.
     * @param validation A validation object that is used to build the schema.
     */
    public async buildSchemaValidation(rootSchema: FluentSchemaBuilder,
        validation: Validation): Promise<FluentSchemaBuilder> {

        let propSchema: FluentSchemaBuilder;

        switch (validation.type) {
            case PropertyTypes.linkedEntity:
                return new LinkedEntitySchemaBuilder(this.entityTypeRepository, this)
                    .build(rootSchema, validation);

            case PropertyTypes.abstractEntity:
                return new AbstractEntitySchamBuilder(this.entityTypeRepository, this)
                    .build(rootSchema, validation);

            case PropertyTypes.array:
                return new ArrayPropertySchemaBuilder(this)
                    .build(rootSchema, validation);

            case PropertyTypes.string:
                return new StringPropertySchemaBuilder()
                    .build(rootSchema, validation);

            // Handle date.
            case PropertyTypes.dateTime:
                return new DateTimePropertySchemaBuilder()
                    .build(rootSchema, validation);

            // handle boolean.
            case PropertyTypes.boolean:
                return new BooleanPropertySchemaBuilder()
                    .build(rootSchema, validation);

            // Handle number and int.
            case PropertyTypes.number:
            case PropertyTypes.int:
                return new NumberPropertySchemaBuilder()
                    .build(rootSchema, validation);

            // Handle enum.
            case PropertyTypes.enum:
                return new EnumPropertySchemaBuilder()
                    .build(rootSchema, validation);

            default:
                throw new Error(validation.type);
        }

    }
}