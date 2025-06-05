declare namespace Express {
    interface Request {
      user: { email: string };
      // 添加任何其他你需要的屬性
    }
  }