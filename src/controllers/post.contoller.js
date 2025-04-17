import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
// import cloudinary from "../config/cloudinary.js";
// export const createPost = async (req, res) => {
// 	try {
// 		const { text } = req.body;
// 		let { img } = req.body;
// 		const userId = req.user._id.toString();

// 		const user = await User.findById(userId);
// 		if (!user) return res.status(404).json({ message: "User not found" });

// 		if (!text && !img) {
// 			return res.status(400).json({ error: "Post must have text or image" });
// 		}

// 		if (img) {
// 			const uploadedResponse = await cloudinary.uploader.upload(img);
// 			img = uploadedResponse.secure_url;
// 		}

// 		const newPost = new Post({
// 			user: userId,
// 			text,
// 			img,
// 		});

// 		await newPost.save();
// 		res.status(201).json(newPost);
// 	} catch (error) {
// 		res.status(500).json({ error: "Internal server error" });
// 		console.log("Error in createPost controller: ", error);
// 	}
// };

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .populate("assigned_department");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const following = req.user.following; // Assume `req.user.following` contains an array of user IDs
    const posts = await Post.find({ user: { $in: following } }).populate(
      "user"
    );
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch following posts" });
  }
};
export const getLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.params.id }).populate("user");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch liked posts" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
	// console.log("hiii")
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id }).populate("user");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			// const notification = new Notification({
			// 	from: userId,
			// 	to: post.user,
			// 	type: "like",
			// });
			// await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      user: req.user._id,
      text: req.body.text,
    };

    post.comments.push(newComment);

    const updatedPost = await post.save();
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};
export const deletePost = async (req, res) => {
	try {
	  // Step 1: Find the post by ID
	  const post = await Post.findById(req.params.id);
	  if (!post) return res.status(404).json({ error: "Post not found" });
  
	  // Step 2: Check if the user is authorized to delete the post
	  if (post.user.toString() !== req.user._id) {
		return res.status(403).json({ error: "Unauthorized action" });
	  }
  
	  // Step 3: Extract the public_id from the Cloudinary URL
	  const publicId = post.imageUrl.split('/').slice(-1)[0].split('.')[0]; // Extract public_id
  
	  // Step 4: Delete the image from Cloudinary
	  await cloudinary.uploader.destroy(publicId, (error, result) => {
		if (error) {
		  console.error("Cloudinary Delete Error:", error);
		  throw error; // Fail gracefully if image deletion fails
		}
		console.log("Cloudinary Image Deleted Successfully:", result);
	  });
  
	  // Step 5: Delete the post from the database
	  await Post.findByIdAndDelete(req.params.id);
	  res.status(200).json({ message: "Post and associated image deleted successfully" });
	} catch (error) {
	  console.error("Error in deletePost:", error.message);
	  res.status(500).json({ error: "Failed to delete post and/or image" });
	}
  };

const convertImageToBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const imageBuffer = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`; // Add MIME type
  } catch (error) {
    console.error("Error converting image to Base64:", error.message);
    throw error;
  }
};

export const createPost = async (req, res) => {
  try {
	// console.log(req.body)
    const { labels, location, description } = req.body;

    const filePath = "D:/projects/pirs_backend/src/lib/images/45.jpg";
    // console.log(fs.existsSync(filePath)); // Check if the file exists

    const image = convertImageToBase64(filePath);
    // Step 1: Upload image to Cloudinary
    // console.log("Uploading image to Cloudinary...");
    const result = await cloudinary.uploader
      .upload(image)
      .catch((error) => {
        console.error("Cloudinary Upload Error:", error);
        throw error;
      });
	// console.log(result)
	// console.log(req.user._id)
    // Step 2: Create a new post with the Cloudinary image URL
    const newPost = new Post({
      user: req.user._id, // Assuming user info is available from the protected route
      imageUrl: result.secure_url, // Save the uploaded image URL
      labels,
      location,
      description,
    });

    // Step 3: Save the post to the database
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
    // console.log(req.user)
  } catch (error) {
	console.error("Error saving post to mongodb",error)
    res.status(500).json({ error: "Failed to create post or upload imageeee" });
  }
};
