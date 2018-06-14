import { AbstractSchamaBuilderStrategy } from "./abstract-schema-builder-strategy";
import { FluentSchemaBuilder } from "json-schema-fluent-builder";
import { SchemaBuilder } from "json-schema-fluent-builder";
import { EntityType, Validation, EntityProperty } from "../../models";
import { SysEntities } from "../../constants";
import { EntitySchemaBuilder } from "./entity-schema-builder";
import _ = require("lodash");
import { EntityTypeRepository } from "../repositories/entity-type-repository";
import { GenericRepositoryInterface } from "../repositories/repository-interface";

/**
 * Build JSON schama validation for linked entities.
 * @class
 */
export class LinkedEntitySchemaBuilder extends AbstractSchamaBuilderStrategy {

    constructor(
        private readonly entityTypeRepository: GenericRepositoryInterface<EntityType>,
        private readonly entitySchemaBuilder: EntitySchemaBuilder) {
        super();
    }

    async build(rootSchema: FluentSchemaBuilder, validation: Validation): Promise<FluentSchemaBuilder> {
        let propSchema = new SchemaBuilder().type("object");
        propSchema.additionalProperties(false);

        let lkdEntityType = await this.entityTypeRepository.findById(validation.ref._id);

        // Iterate linked properties to build each schema validation
        validation.linkedProperties.forEach(async (lkdProp) => {

            // Find's the linked property in the linked entity type.
            let foundProp: EntityProperty = _.find(lkdEntityType.props, { name: lkdProp.name });

            // Call buildSchemaValidation recursively to build schema.
            let schema = await this.entitySchemaBuilder.buildSchemaValidation(rootSchema, foundProp.validation);

            propSchema.prop(foundProp.name, schema, foundProp.validation.required);
        });

        return propSchema;
    }
}