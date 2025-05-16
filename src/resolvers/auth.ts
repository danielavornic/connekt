import { LoginInput } from "@/types/user";
import { Driver } from "neo4j-driver";
import { generateToken } from "../services/jwt";
import { CreateUserInput, UserService } from "../services/user";

interface Context {
  driver: Driver;
}

export const authResolvers = {
  Mutation: {
    register: async (
      _: any,
      { input }: { input: CreateUserInput },
      { driver }: Context
    ) => {
      const userService = new UserService(driver);

      const existingUser = await userService.findUserByEmail(input.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const user = await userService.createUser(input);

      const token = generateToken(user);

      return {
        token,
        user,
      };
    },

    login: async (
      _: any,
      { input }: { input: LoginInput },
      { driver }: Context
    ) => {
      const userService = new UserService(driver);

      const user = await userService.findUserByEmail(input.email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isValidPassword = await userService.verifyPassword(
        input.password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      const token = generateToken(user);

      return {
        token,
        user,
      };
    },
  },
};
