import notificationModel from "../models/notification.model.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
export const getUserProfile = (req, res) => {
  const { username } = req.params;
  try {
    const user = userModel.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const modifyUser = await userModel.findById(id);
    const currentUser = await userModel.findById(req.user._id);
    if (id == req.user._id) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }
    if (!modifyUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(currentUser.following);
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      await userModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      res.status(200).json({ message: "User Unfollow successfully" });
    } else {
      await userModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      await userModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      notificationModel.create({
        from: req.user._id,
        to: id,
        type: "follow",
      });

      res.status(200).json({ message: "User Follow successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await userModel
      .findById(userId)
      .select("following");
    const users = await userModel.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filterUsers = users.filter((user) => {
      return !usersFollowedByMe.following.includes(user._id);
    });
    const suggestedUsers = filterUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateUserProfile = async (req, res) => {
  const { fullName, bio, email, username, link, newPassword, currentPasword } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  let user = await userModel.findById(userId);
  console.log(user);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if ((!newPassword && currentPasword) || (!currentPasword && newPassword)) {
    return res.status(400).json({ error: "Password is required" });
  }
  try {
    if (newPassword && currentPasword) {
      const isMatch = await bcrypt.compare(currentPasword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const result = await cloudinary.uploader.upload(profileImg);
      profileImg = result.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const result = await cloudinary.uploader.upload(coverImg);
      coverImg = result.secure_url;
    }
    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.email = email || user.email;
    user.username = username || user.username;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user = await user.save();
    user.password = null;
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
