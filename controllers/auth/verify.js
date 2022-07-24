const sgMailUser = require("../../sendgrid/app");

const { User } = require("../../models/index");

const dotenv = require("dotenv");
const { v4 } = require("uuid");
dotenv.config();
const { PORT } = process.env;

async function verifyUser(req, res, next) {
  try {
    const user = await User.findOne({
      verificationToken: req.params.verificationToken,
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: `Ops, user not found`, response: null });
    }
    const token = v4();
    const userVerification = await User.findOneAndUpdate(
      { verificationToken: req.params.verificationToken },
      { verify: true, token: token },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Verification success", response: userVerification });
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Ops, user not found`, response: null, error: error });
  }
}

async function dubleVerifyUser(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ message: `Ops, user not found`, response: null });
    }
    if (user.verify) {
      return res.status(404).json({
        message: `Verification has already been passed`,
        response: null,
      });
    }
    const massageForVerifyUser = {
      to: email,
      subject: "Подтвердите ваш emeil",
      html: `
    <p>Нажмите для подтверждения регистрации на нашем сайте</p>
    <button><a target='_blank' href='http://localhost:${PORT}/api/users/verify/${user.verificationToken}'>Verification</a></buttom>
   `,
    };
    await sgMailUser(massageForVerifyUser);
    return res.status(200).json({
      message: "Verification send to email",
      response: massageForVerifyUser,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Ops, user not found`, response: null, error: error });
  }
}

module.exports = {
  verifyUser,
  dubleVerifyUser,
};
