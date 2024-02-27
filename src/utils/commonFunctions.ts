import CryptoJS from 'crypto-js';
import { createCipheriv, createDecipheriv } from 'crypto';
import * as crypto from 'crypto';
// const secretKey = 'Sec@Edutax'; //never change this

// const IV = CryptoJS.enc.Utf8.parse('Sec@Edutax'); //never change this


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
// export const enc = (value: any) => {
//     if (value != null || value != undefined || value != "") {
//         return CryptoJS.AES.encrypt(value, secretKey, { iv: IV }).toString();
//     }
//     return;
// }

// export const dec = (value: any) => {
//     if (value != null || value != undefined || value != "") {
//         const bytes = CryptoJS.AES.decrypt(value, secretKey, { iv: IV });
//         return bytes.toString(CryptoJS.enc.Utf8);
//     }
//     return;
// }


const secretKey = 'Sec@EdutaxSec@EdutaxSec@Edutax@@'; //pls never change this..it should be 32 characters long
const iv = Buffer.from('Sec@EdutaxEdutax');//pls never change this ..it should be 16 characters long
export const enc = (value: any) => {
    if (value != null && value != undefined && value != "") {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), iv);
        cipher.setAutoPadding(true);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    return '';
}

export const dec = (value: any) => {
    if (value != null && value != undefined && value != "") {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), iv);
        decipher.setAutoPadding(true); // Enable auto-padding
        let decrypted = decipher.update(value, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    return '';
}