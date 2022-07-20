const { Conflict } = require("http-errors");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const { middlewareForRegister } = require("../../middlewares/usermiddlewares");
const { User } = require("../../models/user");

async function register(req, res) {
  middlewareForRegister(req, res);
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new Conflict(`User with ${email} already exist`);
  }
  const avatarURL = gravatar.url(email);
  const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(5));
  await User.create({ name, email, password: hashPassword, avatarURL });
  console.log(name, email, avatarURL);
  res.status(201).json({
    status: "success",
    code: 201,
    data: {
      user: {
        email,
        name,
        avatarURL,
      },
    },
  });
}

module.exports = register;
