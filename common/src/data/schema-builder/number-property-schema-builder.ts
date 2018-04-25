import { AbstractSchamaBuilderStrategy } from "./abstract-schema-builder-strategy";
import { SchemaBuilderGeneric, SchemaBuilderCore } from "json-schema-fluent-builder/lib/builders";
import { SchemaBuilder } from "json-schema-fluent-builder";
import { EntityType, EntityRepository, Validation, EntityProperty } from "../..";
import { SysEntities } from "../../constants";
import { EntitySchemaBuilder } from "./entity-schema-builder";

/**
 * Build JSON schama validation for number properties.
 * @class
 */
export class NumberPropertySchemaBuilder extends AbstractSchamaBuilderStrategy {
    async build(rootSchema: SchemaBuilderCore<any>, validation: Validation): Promise<SchemaBuilderGeneric> {
        let propTypeName = validation.type.toLowerCase();
        let propSchema = new SchemaBuilder().type(<"integer" | "number">propTypeName);

        if (validation.min)
            propSchema.min(validation.min);

        if (validation.max)
            propSchema.min(validation.min);

        if (validation.multipleOf)
            propSchema.multipleOf(validation.multipleOf);

        return propSchema;
    }
}