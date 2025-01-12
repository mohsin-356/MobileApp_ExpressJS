// const mongoose = require('mongoose');

// const validator = require('validator');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');

// //name,email,password, confirmPassword, photo
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Please enter a name'],
//         minlength: 2,
//         maxlength: 30
//     },
//     email: {
//         type: String,
//         required: [true, 'Please enter an email'],
//         unique: true,
//         lowercase: true,
//         validate: [validator.isEmail, 'Please enter a valid email']
//     },
//     password: {
//         type: String,
//         required: [true, 'Please enter a password'],
//         minlength: 8,
//         select: false
//     },
//     confirmPassword: {
//         type: String,
//         required: [true, 'Please confirm your password'],
//         validate: {
//             validator: function (el) {
//                 return el === this.password;
//             },
//             message: 'Passwords do not match'
//         }
//     },
//     passwordChangedAt: {
//         type: Number
//     },
//     photo: {
//         type: String,
//         default: 'default.jpg'
//     },
//     role:{
//         type: String,
//         enum:['user','admin'],
//         default:'user'
//     },
//     passwordResetToken:{
//         type:String
//     },
//     passwordResetTokenExpires:{
//         type:Date
//     },
//     active:{
//         type:Boolean,
//         default:true,
//         select:false
//     }
// });

// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     //enctype the password before saving it!
//     this.password=await bcrypt.hash(this.password,10);
//     this.confirmPassword=undefined;
//     next();
 
// });
// userSchema.pre(/^find/,function(next){
//     this.find({active:{$ne:false}});
//     next();
// })
// userSchema.methods.matchPassword=async function(password,passwordDB){
//     return await bcrypt.compare(password,passwordDB);
// };
// userSchema.methods.isPasswordChanged=(JWTTimestamp)=>{
//     if(this.passwordChangedAt)
//     {
//         // console.log(this.passwordChangedAt.toISOString(),JWTTimestamp);   
//         const passwordChangedTimestamp=parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//         console.log(passwordChangedTimestamp,JWTTimestamp);
//         return JWTTimestamp<passwordChangedTimestamp;//1<2
//     }
//     return false;
// };
// userSchema.methods.createResetPasswordToken=function(){
//     const resetToken=crypto.randomBytes(32).toString('hex');
    
//     this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
//     this.passwordResetTokenExpires=Date.now()+10*60*1000; //10 minutes

//     console.log(resetToken,this.passwordResetToken);

//     return resetToken;
//     // const resetToken=crypto.randomBytes(20).toString('hex');
//     // this.passwordResetToken=resetToken;
//     // this.passwordResetTokenExpires=Date.now() + 10*60*1000; //10 minutes
//     // return resetToken;
// };

// const User=mongoose.model('User',userSchema);
// module.exports=User;

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Full schema for user
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please enter your full name'],
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: 8,
        select: false,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password; // Ensure passwords match
            },
            message: 'Passwords do not match',
        },
    },
    street: {
        type: String,
        required: [true, 'Please provide your street address'],
        maxlength: 100,
    },
    city: {
        type: String,
        required: [true, 'Please provide your city'],
        maxlength: 50,
    },
    state: {
        type: String,
        required: [true, 'Please provide your state'],
        maxlength: 50,
    },
    postalCode: {
        type: String,
        required: [true, 'Please provide your postal code'],
        maxlength: 10
        // validate: {
        //     validator: function (value) {
        //         return /^\d{5}(-\d{4})?$/.test(value); // Validates postal code format
        //     },
        //     message: 'Please provide a valid postal code',
        // },
    },
    cnic: {
        type: String,
        required: [true, 'Please provide your CNIC'],
        unique: true
        // validate: {
        //     validator: function (value) {
        //         return /^\d{5}-\d{7}-\d{1}$/.test(value); // Validates CNIC format (e.g., 12345-1234567-1)
        //     },
        //     message: 'Please provide a valid CNIC',
        // },
    },
    picture: {
        type: String,
        // required: [true, 'Please upload your picture'],
        default: 'user.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetTokenExpires: {
        type: Date,
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Hash password
    this.confirmPassword = undefined; // Remove confirmPassword field
    next();
});

// Query middleware to exclude inactive users
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (password, passwordDB) {
    return await bcrypt.compare(password, passwordDB);
};

// Check if password was changed after JWT was issued
userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < passwordChangedTimestamp; // Token issued before password change
    }
    return false;
};

// Method to generate reset password token
userSchema.methods.createResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

