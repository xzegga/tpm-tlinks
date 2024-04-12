import {Timestamp, WhereFilterOp} from "firebase-admin/firestore";

export type Filter = {
    field: string,
    operator: WhereFilterOp,
    value: number | number[] | string | string[] | Timestamp,
}
