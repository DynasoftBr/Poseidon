import { ISchamaBuilderStrategy } from "./abstract-schema-builder-strategy";
import { FluentSchemaBuilder } from "json-schema-fluent-builder";
import { SchemaBuilder } from "json-schema-fluent-builder";
import { EntitySchemaBuilder } from "./entity-schema-builder";
import _ = require("lodash");
import { IRepository } from "../data";
import { IEntityType, IValidation, IEntityProperty, SysEntities } from "@poseidon/core-models";
import { Context } from "../context";

/**
 * Build JSON schama validation for linked entities.
 * @class
 */
export class LinkedEntitySchemaBuilder implements ISchamaBuilderStrategy {
  constructor(private readonly context: Context, private readonly entitySchemaBuilder: EntitySchemaBuilder) {}

  async build(rootSchema: FluentSchemaBuilder, validation: IValidation): Promise<FluentSchemaBuilder> {
    const propSchema = new SchemaBuilder().object();
    propSchema.additionalProperties(false);

    // Try find the linked entity type.
    const queryResult = await this.context.executeQuery(SysEntities.entityType, { _id: validation.ref._id });
    const lkdEntityType = queryResult.result.data[0];

    // Iterate only the LINKED PROPERTIES and build it's schema.
    const propsLength = validation.linkedProperties.length;
    for (let idx = 0; idx < propsLength; idx++) {
      const lkdProp = validation.linkedProperties[idx];

      // Find's the linked property in the linked entity type.
      const foundProp: IEntityProperty = _.find(lkdEntityType.props, { name: lkdProp.name }) as IEntityProperty;

      // Call buildSchemaValidation recursively to build schema.
      const schema = await this.entitySchemaBuilder.buildSchemaValidation(rootSchema, foundProp.validation);

      propSchema.prop(foundProp.name, schema, foundProp.validation.required);
    }

    return propSchema;
  }
}
