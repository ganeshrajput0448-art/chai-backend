import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async ( req, res) => {
   // get user details from fronted
   //validation - not empty
   // cheallig user already exists:(username or emails)
   // cheak for images, cheak for avatar
   // upload them to cloudnary, cheak avatar again
   //creat user object- creat entry in DB
   //remove passwrd and refresh token field from response
   // cheak for user creation
   // return res

   const {fullName, email, username, password } = req.body
   console.log("email: ", email);

//    if(fullName === "" ) {
//     throw new ApiError(400, "fullname is required");
//    }  Hum ase bhi har chij ke liye alf lag if conditon lga skte hai

     if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser =User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser) {
        throw new ApiError(409, "username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})

export { registerUser }