import { LinkedProperty, AbstractEntity } from ".";
import { PropertyConvention, PropertyTypes } from "../constants";
import { EntityTypeRef } from "./references";

export interface Validation extends AbstractEntity {
    type: PropertyTypes;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    ref?: EntityTypeRef;
    linkedProperties?: LinkedProperty[];
    items?: Validation;
    uniqueItems?: boolean;
    multipleOf?: number;
    default?: string;
    convention?: PropertyConvention;
    base64Encoded?: boolean;
}