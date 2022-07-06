import mongooseService from "../../common/services/mongoose.service";
import { CreateUserDto } from "../dto/create.user.dto";
import { PutUserDto } from "../dto/put.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";
import shortid from "shortid";
import debug from "debug";

const log: debug.IDebugger = debug("app:in-memory-dto");

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;
  userSchema = new this.Schema(
    {
      _id: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, select: false, required: true },
      firstName: String,
      lastName: String,
      permissionFlags: Number,
    },
    { id: false }
  );

  User = mongooseService.getMongoose().model("User", this.userSchema);
  users: Array<CreateUserDto> = [];
  constructor() {
    log("Created new instance  of UsersDao");
  }
  async addUser(userFields: CreateUserDto): Promise<string> {
    const userId = shortid.generate();
    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionFlags: 1,
    });
    await user.save();
    return userId;
  }
  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).exec();
  }

  async updateUserById(userId: string, userFields: PatchUserDto | PutUserDto) {
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId },
      { $set: userFields },
      { new: true }
    ).exec();
    return existingUser;
  }

  async removeUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }
  async getUserByEmail(email: string) {
    const objIndex = this.users.findIndex(
      (obj: { email: string }) => obj.email === email
    );
    let currentUser = this.users[objIndex];
    return currentUser || null;
  }
  async getUserByEmailWithPassword(email: string) {
    return this.User.findOne({ email: email })
      .select("_id email permissionFlags +password")
      .exec();
  }
}

export default new UsersDao();
