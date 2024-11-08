module.exports = {
    PORT: 3307,
    DB_CONFIG: {
      host: 'localhost',
      user: 'root',
      password: 'root',  // укажите пароль для базы данных, если он есть
      database: 'todo_list',  // название вашей базы данных
    },
    JWT_SECRET: 'your_jwt_secret',  // секрет для JWT
  };
  