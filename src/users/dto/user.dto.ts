import { Settings } from "src/mongodb/models/users.model";

export class UserDto {
    username: string;
    email: string;
    settings: Settings;
  }