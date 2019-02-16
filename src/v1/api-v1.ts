import { Router, Request, Response } from "express";
import * as winston from "winston"; // Logger. Uses configuration made in server.ts.

import {
    SysError, SysMsgs, ServiceFactory, ConcreteEntity
} from "@poseidon/engine";

import { RequestError } from "./request-error";

export class ApiV1 {
    private static _instance: ApiV1;

    private constructor(private readonly serviceFactory: ServiceFactory) { }

    static init(app: Router, serviceFactory: ServiceFactory) {
        // If we already have an instace, just return it.
        if (this._instance)
            return this._instance;

        const api = this._instance = new ApiV1(serviceFactory);
        const router = Router();
        const routeBase: string = "/:etName";

        // Starts configuring routes for api

        // Bad request, missig entity type.
        router.get("/", (req, res) => api.handleError(res,
            new RequestError(SysMsgs.error.noEntityTypeSpecified)));

        router.get(routeBase, (req, res) => api.getMany(req, res));
        router.get(routeBase + "/:id", (req, res) => api.findById(req, res));
        router.post(routeBase, (req, res) => api.create(req, res));
        router.put(routeBase + "/:id", (req, res) => api.update(req, res));
        router.delete(routeBase + "/:id", (req, res) => api.delete(req, res));

        // All request that not matches the above, gets method not allowed error.
        router.all("*", (req, res) => api.handleError(res,
            new RequestError(SysMsgs.error.methodNotAllowed)));

        app.use("/v1", router);
    }

    /**
     * Get many documents.
     * Check if requested all, or it's a query.
     * @param req Request
     * @param res Response
     */
    private async getMany(req: Request, res: Response) {
        if (req.query.q) {
            return this.query(req, res);
        } else {
            return this.all(req, res);
        }
    }


    /**
     * Query documents.
     * @param req Request
     * @param res Response
     */
    private async query(req: Request, res: Response) {
        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);

            // Get skip and limit from query string.
            // if not provided, use undefined to preserv function defaults.
            const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
            const query = typeof req.query.q == "string" ?
                JSON.parse(req.query.q) : req.query.q;

            const results = await service.findMany(query, skip, limit);

            res.send(results);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Gets all documents of the given entity type.
     * @param req Request
     * @param res Response
     */
    private async all(req: Request, res: Response) {
        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);

            // Get skip and limit from query string.
            // if not provided, use undefined to preserv function defaults.
            const skip = req.query.skip ? parseInt(req.query.skip) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

            const results = await service.findMany({}, skip, limit);

            res.send(results);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Finds one item based on the given id.
     * @param req Request
     * @param res Response
     */
    private async findById(req: Request, res: Response) {
        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);
            const result = await service.findOne({ _id: req.params.id });

            if (result) {
                res.send(result);
            } else // If cannot find specified id, respond with 'not found'.
                this.handleError(res, new RequestError(SysMsgs.error.entityNotFound));
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Add an entity to the collection.
     * @param req Request
     * @param res Response
     */
    private async create(req: Request, res: Response) {

        const entity: ConcreteEntity = req.body;

        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);
            const result = await service.insertOne(entity);

            res.location("/" + result._id).status(201).send(result);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Remove an entity from collection.
     * @param req Request
     * @param res Response
     */
    private async delete(req: Request, res: Response) {

        const _id = req.params.id;

        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);
            const deleteCount = await service.deleteOne(_id);

            // If cannot find specified id, respond with 'not found'.
            if (!deleteCount)
                this.handleError(res, new RequestError(SysMsgs.error.entityNotFound,
                    req.params.etName, req.params.id));

            res.send(null);
        } catch (error) {
            this.handleError(res, error);
        }
    }

    /**
     * Update an entity or part of it.
     * @param req Request
     * @param res Response
     */
    private async update(req: Request, res: Response) {

        const entity: ConcreteEntity = req.body;

        try {
            const service = await this.serviceFactory.getServiceByName(req.params.etName);
            const updatedCount = await service.updateOne(req.params.id, entity);

            // If cannot find specified id, respond with 'not found'.
            if (!updatedCount)
                this.handleError(res, new RequestError(SysMsgs.error.entityNotFound, req.params.etName, req.params.id));

            res.send(204);
        } catch (error) {
            this.handleError(res, error);
        }
    }


    /**
     * Treats errors and answer the request.
     * @param res The response object to give back to client.
     * @param error A SysError object containing the error.
     */
    private handleError(res: Response, error: SysError) {

        if (error.code === SysMsgs.error.noEntityTypeSpecified.code
            || error.code === SysMsgs.error.abstractEntityType.code
            || error.code === SysMsgs.error.invalidHeaderParameters.code)

            res.status(400).send(error);

        else if (error.code === SysMsgs.error.entityNotFound.code
            || error.code === SysMsgs.error.entityTypeNotFound.code)

            res.status(404).send(error);
        else if (error.code === SysMsgs.validation.validationErrorMsg.code)
            res.status(422).send(error);
        else if (error.code === SysMsgs.error.methodNotAllowed.code)
            res.status(405).send(error);
        else {
            res.status(500).send();
            winston.error(error.message, error);
        }
    }

}
const waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));