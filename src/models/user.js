const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require('jsonwebtoken');


const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      let password = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
      );
      if (!password.test(value)) {
        throw new Error(
          'Password must include at least one of uppercase , lowercase , numbers , speacial characters like: "[!@#$%^&*])"'
        );
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Email is invalid");
      }
    },
  },
  age: {
    type: Number,
    default: 18,
    validate(val) {
      if (val <= 0) {
        throw new Error("Age must be pasitive number");
      }
    },
  },
  city: {
    type: String,
  },
  tokens:[
    {
      type: String,
      require: true,
   
    }
  ],
});

userSchema.pre("save", async function () {
  const user = this

  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
});
userSchema.statics.findByCredentials= async(email , password)=>{
    const user = await User.findOne({email : email})
    if (!user){
        throw new Error ('Unable to login , Please check your Email or Password')
    }
    const isMatch = await bcryptjs.compare(password , user.password)
    if (!isMatch){
        throw new Error ('Unable to login , Please check your Email or Password')
    }
    return user
}
/////////////////////////////////////////////////////////
userSchema.methods.generateToken = async function (){
  const user = this 
  const token = jwt.sign({_id: user._id.toString()}, "ahmed123")
  user.tokens = user.tokens.concat(token)
  await user.save()
  return token
}
///////////////////////////////////
userSchema.methods.toJSON = function (){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  

  return userObject
}
////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////

const User = mongoose.model("User", userSchema);

module.exports = User;
