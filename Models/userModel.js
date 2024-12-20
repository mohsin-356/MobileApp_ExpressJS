const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//name,email,password, confirmPassword, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        minlength: 2,
        maxlength: 30
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt:{
        Date
    },
    photo: {
        type: String,
        default: 'default.jpg'
    }
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    //enctype the password before saving it!
    this.password=await bcrypt.hash(this.password,10);
    this.confirmPassword=undefined;
    next();
 
});

userSchema.methods.matchPassword=async function(password,passwordDB){
    return await bcrypt.compare(password,passwordDB);
}
userSchema.methods.isPasswordChanged=(JWTTimestamp)=>{
    if(this.passwordChangedAt)
    {
        // console.log(this.passwordChangedAt.toISOString(),JWTTimestamp);   
        const passwordChangedTimestamp=parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(passwordChangedTimestamp,JWTTimestamp);
        return JWTTimestamp<passwordChangedTimestamp;//1<2
    }
    return false;
}
const User=mongoose.model('User',userSchema);
module.exports=User;