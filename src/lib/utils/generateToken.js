import jwt from "jsonwebtoken"
// export const generateTokenAndSetCookie=(userId,res)=>{
//     const token=jwt.sign({userId},process.env.JWT_SECRET,{
//         expiresIn:'15d'
//     })

//     res.cookie("jwt",token,{
//         maxAge:15*24*60*60*1000,
//         httpOnly:true,
//         sameSite:"strict",
//         secure:process.env.NODE_ENV!=="development",
//     })
// }

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true, // Secure against XSS attacks
        sameSite: "strict", // Prevent CSRF attacks
        secure: process.env.NODE_ENV === "production", // Only secure in production
        path: "/", // Ensure cookie is accessible on all routes
    });
};
