

class Validator {
  constructor(data, fields) {
    let errors = {};
    let result = {};
    //console.log(data);
    this.result = data;
    this.errors = false;
    Object.keys(fields).forEach((itm) => {
      // console.log(itm + "     " + data[itm])
      result[itm] = data[itm];
      fields[itm].split("|").forEach((check) => {
        switch (check.trim()) {
          case "required":
            // console.log("jhbdfhjbddfhb")
            if (data[itm] === undefined || data[itm] == "") {
              // errors[itm] = itm + " is required";
              errors[itm] = "Required Field";
            }
            break;

         
        }
      });
    });

    if (Object.keys(errors).length == 0) {
      errors = null;
    }
    this.errors = errors;
    this.result = result;
  }
}

export default Validator;