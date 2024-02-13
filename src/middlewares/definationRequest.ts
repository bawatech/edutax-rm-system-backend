import { Request } from "express";

export interface ClientRequest extends Request {
  CLIENT_ID: number; // or any other type you would like to use
}

