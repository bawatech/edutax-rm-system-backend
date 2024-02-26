import CryptoJS from 'crypto-js';
const secretKey = 'Sec@Edutax'; //never change this

const IV = CryptoJS.enc.Utf8.parse('Sec@Edutax'); //never change this


// export const enc = (value: any) => {
//     if (value != null || value != undefined || value != "") {
//         return CryptoJS.AES.encrypt(value, secretKey).toString();
//     }
//     return;
// }
// export const dec = (value: any) => {
//     if (value != null || value != undefined || value != "") {
//         return CryptoJS.AES.decrypt(value, secretKey).toString(CryptoJS.enc.Utf8);
//     }
//     return;
// }
export const enc = (value: any) => {
    if (value != null || value != undefined || value != "") {
        return CryptoJS.AES.encrypt(value, secretKey, { iv: IV }).toString();
    }
    return;
}

export const dec = (value: any) => {
    if (value != null || value != undefined || value != "") {
        const bytes = CryptoJS.AES.decrypt(value, secretKey, { iv: IV });
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    return;
}
