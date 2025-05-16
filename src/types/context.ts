import { Driver } from "neo4j-driver";
import { TokenPayload } from "../services/jwt";

export interface Context {
  driver: Driver;
  user?: TokenPayload;
}
