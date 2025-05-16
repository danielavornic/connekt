import bcrypt from "bcryptjs";
import { Driver } from "neo4j-driver";
import { v4 as uuidv4 } from "uuid";
import { userQueries } from "../queries/user";
import { User, UserRole } from "../types/user";

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export class UserService {
  constructor(private readonly driver: Driver) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const session = this.driver.session();

    try {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const userId = uuidv4();
      const now = new Date().toISOString();

      const result = await session.run(userQueries.createUser, {
        userId,
        username: input.username,
        email: input.email,
        hashedPassword,
        role: input.role,
        now,
      });

      const user = result.records[0].get("u").properties as User;
      return user;
    } finally {
      await session.close();
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const session = this.driver.session();

    try {
      const result = await session.run(userQueries.findByEmail, { email });

      const user = result.records[0]?.get("u")?.properties as User;
      return user || null;
    } finally {
      await session.close();
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
