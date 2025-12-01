import { Types } from "mongoose";
import { UserRole } from "../userRolesEnum";

export class FindQueryDto{
    name?:string;
    email?:string;
    _id?:Types.ObjectId;
    institute?:string;
    role?:UserRole;
}