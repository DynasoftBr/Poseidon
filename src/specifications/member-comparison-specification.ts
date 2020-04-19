
import { Specification } from "./specificaiton";
import { ISpecification, IEntity, IMemberComparisonSpecification } from "@poseidon/core-models";
import * as _ from "lodash";

type CompareFunc<T extends IEntity = IEntity> = (fact: T) => boolean;

export class MemberComparisonSpecification<T extends IEntity = IEntity>
    extends Specification<T> implements IMemberComparisonSpecification {

    member: string;
    operator: string;
    value: any;

    private compareFunc: CompareFunc<T>;

    constructor() {
        super("", "");
    }

    async eval(fact: T): Promise<boolean> {
        return this.compareFunc(fact);
    }

    private getCompareFunction(): CompareFunc<T> {
        switch (this.operator) {
            case "?": return (fact) => _.get(fact, this.member) != null;
            case ">": return (fact) => _.get(fact, this.member) > this.value;
            case "<": return (fact) => _.get(fact, this.member) < this.value;
            case ">=": return (fact) => _.get(fact, this.member) >= this.value;
            case "<=": return (fact) => _.get(fact, this.member) <= this.value;
            case "==": return (fact) => _.get(fact, this.member) == this.value;
            case "!=": return (fact) => _.get(fact, this.member) != this.value;
            case "*%": return (fact) => {
                const memberValue = (_.get(fact, this.member) || "") as string;

                return memberValue.toString().indexOf(this.value) == 0;
            };
            case "%*": return (fact) => {
                const memberValue = (_.get(fact, this.member) || "") as string;
                const expectedIdx = memberValue.length - (this.value as string).length - 1;

                return memberValue.indexOf(this.value) == expectedIdx;
            };
            case "%*": return (fact) => {
                const memberValue =  (_.get(fact, this.member) || "") as string;
                const expectedIdx = memberValue.length - (this.value as string).length - 1;

                return memberValue.indexOf(this.value) === expectedIdx;
            };
        }
    }

}