const { Conflict } = require("http-errors");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const { v4 } = require("uuid");
const { middlewareForRegister } = require("../../middlewares/usermiddlewares");
const { User } = require("../../models/user");
const sgMailUser = require("../../sendgrid/app");

const dotenv = require("dotenv");
dotenv.config();
const { PORT = 3000 } = process.env;

async function register(req, res) {
  middlewareForRegister(req, res);
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new Conflict(`User with ${email} already exist`);
  }
  const avatarURL = gravatar.url(email);
  const verificationToken = v4();
  const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(5));
  const data = {
    to: "markel_@ukr.net",
    from: "mark.nelovka@gmail.com",
    subject: "Подтвердите ваш emeil",
    html: `
    <p>Нажмите для подтверждения регистрации на нашем сайте</p>
    <button><a target='_blank' href='http://localhost:${PORT}/api/users/verify/${verificationToken}'>Verification</a></buttom>
   `,
  };

  await sgMailUser(data);

  await User.create({
    name,
    email,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  res.status(201).json({
    status: "success",
    code: 201,
    data: {
      user: {
        email,
        name,
        avatarURL,
        verificationToken,
        message: "Verification send to email",
      },
    },
  });
}

module.exports = register;
