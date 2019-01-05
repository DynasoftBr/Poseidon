import { RepositoryFactory, InMemoryStorage, DatabasePopulator, EntityType, ServiceFactory, BuiltInEntries, EntityTypeService } from "../../src";
import { PropertyTypes, SysEntities } from "../../src/constants";
import { expect } from "chai";

describe("Entity Type Service Test", () => {

    let repositoryFactory: RepositoryFactory;

    before(async () => {
        const storage = new InMemoryStorage();
        await storage.connect();

        const populator = new DatabasePopulator(storage);
        await populator.populate();

        repositoryFactory = new RepositoryFactory(storage);
    });

    describe("Inserting one entity type", () => {
        it("During entity type's creation it gets the required entity properties.", async () => {
            const service = <EntityTypeService>(await new ServiceFactory(repositoryFactory)
                .getServiceByName(SysEntities.entityType));

            const newEtType = <EntityType>{
                name: "NewEntityType",
                label: "New Entity Type",
                props: [
                    {
                        name: "prop1",
                        validation: {
                            type: PropertyTypes.string
                        }
                    }
                ]
            };

            const builtin = new BuiltInEntries();
            const result = await service.insertOne(newEtType);
            const reqProps = [
                builtin.idPropertyDefinition.name,
                builtin.createdAtPropertyDefinition.name,
                builtin.createdByPropertyDefinition.name,
                builtin.changedAtPropertyDefinition.name,
                builtin.changedByPropertyDefinition.name
            ];

            expect(result.props.map(p => p.name)).to.include.members(reqProps);
        });

        it("When created an entity type can be found.", async () => {
            const service = await new ServiceFactory(repositoryFactory).getServiceByName(SysEntities.entityType);
            const newEtType = <EntityType>{
                name: "NewEntityType",
                label: "New Entity Type",
                props: [
                    {
                        name: "prop1",
                        validation: {
                            type: PropertyTypes.string
                        }
                    }
                ]
            };

            const builtin = new BuiltInEntries();
            const result = await service.insertOne(newEtType);

            const found = service.findOne({ _id: result._id });

            expect(found).to.be.not.null;
        });

        it("When created the entity type has the required properties.", async () => {
            const service = <EntityTypeService>(await new ServiceFactory(repositoryFactory)
                .getServiceByName(SysEntities.entityType));

            const newEtType = <EntityType>{
                name: "NewEntityType",
                label: "New Entity Type",
                props: [
                    {
                        name: "prop1",
                        validation: {
                            type: PropertyTypes.string
                        }
                    }
                ]
            };

            const builtin = new BuiltInEntries();
            const result = await service.insertOne(newEtType);
            const found = await service.findOne({ name: result.name });

            const reqProps = [
                builtin.idPropertyDefinition.name,
                builtin.createdAtPropertyDefinition.name,
                builtin.createdByPropertyDefinition.name,
                builtin.changedAtPropertyDefinition.name,
                builtin.changedByPropertyDefinition.name
            ];
            expect(found.props.map(p => p.name)).to.include.members(reqProps);
        });
    });
});