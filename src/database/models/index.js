// Este archivo sirve como intermediario entre
// nuestros controladores y los modelos.

import { User } from "./user.model.js";
import { Task } from "./task.model.js";

// Uno a muchos en sequelize
User.hasMany(Task);
Task.belongsTo(User);

(async () => {
    await User.sync({ 
      // force: true 
    });
    await Task.sync({ 
      // force: true 
    });
  })();

export {
    User,
    Task,
};