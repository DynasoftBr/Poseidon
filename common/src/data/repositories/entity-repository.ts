import { AbstractRepository } from "./abstract-repository";
import { Entity, EntityType } from "../../models";
import { Db } from "mongodb";
import { SysEntities } from "../../constants";
import { EntityTypeRepository } from "./entity-type-repository";
import { SysMsgs, DatabaseError } from "../..";
import { ENTITY_TYPE_CHANGED } from "./events";
import _ = require("lodash");
import { AbstractRepositoryFactory } from "./factories/abstract-repository-factory";
import { EntityHelpers } from "./entity-helpers";
import { ValidationProblem } from "./validation-problem";

export class EntityRepository extends AbstractRepository<Entity> {

    constructor(private _db: Db,
        entityType: EntityType,
        repoFactory: AbstractRepositoryFactory) {

        super(_db.collection(SysEntities.entityType), entityType, repoFactory);
    }

    private async beforeValidateUpdate(entity: Entity, old: Entity): Promise<Entity> {
        EntityHelpers.applyConvention(entity, this.entityType);
        EntityHelpers.parseDateTimeProperties(entity, this.entityType);

        return entity;
    }

    private async beforeValidateInsert(entity: Entity, old?: Entity): Promise<Entity> {
        EntityHelpers.ensureIdProperty(entity);
        EntityHelpers.applyDefaults(entity, this.entityType);
        EntityHelpers.applyConvention(entity, this.entityType);
        EntityHelpers.parseDateTimeProperties(entity, this.entityType);

        return entity;
    }

    async beforeValidation(entity: Entity, isNew: boolean, old?: Entity): Promise<Entity> {
        if (isNew)
            return this.beforeValidateInsert(entity);
        else
            return this.beforeValidateUpdate(entity, old);
    }

    async validating(entity: Entity, isNew: boolean, old?: Entity): Promise<ValidationProblem[]> {
        return null;
    }

    async beforeSave(entity: EntityType, isNew: boolean, old?: Entity): Promise<boolean> {
        return true;
    }

    async afterSave(entity: EntityType, isNew: boolean, old?: Entity): Promise<void> { }

    // Not used yet.
    async beforeDelete(entity: EntityType): Promise<boolean> { return true; }

    async afterDelete(entity: EntityType): Promise<void> { }
}