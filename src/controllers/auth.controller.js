import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import {generateTokenAndSetCookie} from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, role, departmentCode } = req.body;
    console.log("req.body",req.body)
    // Validate email format
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Check if email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Validate password length
    if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

    // Validate role selection
    if (!["citizen", "employee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role selection" });
    }

    let assignedDepartment = null;

    // If the user is an employee, validate departmentCode and assign department
    if (role === "employee") {
      if (!departmentCode) {
        return res.status(400).json({ error: "Department code is required for employees" });
      }

      // Load department codes from environment variable
      const departmentCodes = JSON.parse(process.env.DEPARTMENT_CODES);

      // Find the department associated with the given code
      assignedDepartment = Object.keys(departmentCodes).find(
        (dept) => departmentCodes[dept] === departmentCode
      );

      if (!assignedDepartment) {
        return res.status(400).json({ error: "Invalid department code" });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      role,
      department: assignedDepartment, // Assign the department based on departmentCode
    });

    // Save the user and generate token
    if (newUser){
        await newUser.save();
        generateTokenAndSetCookie(newUser._id, res);
        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            department: newUser.department,
            profileImg: newUser.profileImg,
            likedPosts: newUser.likedPosts,
            votes: newUser.votes,
            createdAt: newUser.createdAt,
          });
    }
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and if the password is correct
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Send success response with user details
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      profileImg: user.profileImg,
      likedPosts: user.likedPosts,
      votes: user.votes,
      createdAt: user.createdAt,
    });

  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout= async (req,res)=>{
  try {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
} catch (error) {
  console.log("Error in logout controller", error.message);
  res.status(500).json({ error: "Internal Server Error" });
}
}

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};