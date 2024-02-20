// import { EventSubscriber, LoadEvent, InsertEvent, UpdateEvent } from 'typeorm';
// import { User } from '../entites/User';

// @EventSubscriber()
// export class UserSubscriber {
//   beforeLoad(event: LoadEvent<User>) {
//     const user = event.entity;
//     user.email = CryptoJS.AES.decrypt(user.email, User.getSecretKey()).toString(CryptoJS.enc.Utf8);
//   }

//   beforeInsert(event: InsertEvent<User>) {
//     const user = event.entity;
//     user.setEmail(user.email); // Encrypt the email before insert
//   }

//   beforeUpdate(event: UpdateEvent<User>) {
//     const user = event.entity;
//     if (user && event.updatedColumns.find(col => col.propertyName === 'email')) {
//       user.setEmail(user.email);
//     }
//   }
// }
