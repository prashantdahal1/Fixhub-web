import { UserController } from "../controllers/user.controller";
import { Router } from "express";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));

export default userRouter;