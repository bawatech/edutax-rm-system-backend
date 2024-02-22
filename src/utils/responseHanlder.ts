import { validate } from "class-validator"
import { Response } from 'express';
export const requestDataValidation = async (data: any) => {
    const errors = await validate(data);

    if (errors.length > 0) {
        const result: { [key: string]: string } = {};
        errors.forEach(error => {
            return Object.values(error.constraints || {}).map((message: string) => {
                result[error.property] = message;
            });
        })
        throw new CustomError ({message:"Invalid data found",field_errors:result});
    } else {
        return null;
    }

}


export const sendSuccess =(res:Response,message:string = 'Success',response:any = {},code:number = 200)=>{
    return res.status(code).json({
        message,
        response
    })
}

export const sendError =(res:Response,message:string = 'Error',response:any = {},code:number = 400)=>{
    return res.status(code).json({
        message,
        response
    })
}


export class CustomError extends Error {
    public code: number;
    constructor (public data: any,code:number = 400) {
      super ();
      // Set the prototype explicitly.
      Object.setPrototypeOf (this, CustomError.prototype);
      this.code = code
    }
  }

  export const handleCatch =(res:any, e:any)=>{
    //console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeee",e)
    if (e instanceof CustomError) {
        return res.status(e.code).json(e.data);
      } else {
        return res.status(400).json({ message: 'Something went wrong', e });
      }
  }
