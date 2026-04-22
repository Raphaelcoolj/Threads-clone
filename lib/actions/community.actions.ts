"use server";

import mongoose, { SortOrder } from "mongoose";

import Community from "../models/community";
import Thread from '../models/threads.model';
import { User } from "../models/User";

import { connectDB } from "../mongoose";

export async function createCommunity(
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string,
  memberUsernames?: string[],
  type?: string
) {
  try {
    await connectDB();

    const user = await User.findById(createdById);

    if (!user) {
      throw new Error("User not found"); 
    }

    const memberIds: any[] = [];
    if (memberUsernames && memberUsernames.length > 0) {
        for (const un of memberUsernames) {
            const member = await User.findOne({ username: un.trim().toLowerCase() });
            if (member && member._id.toString() !== user._id.toString()) {
                memberIds.push(member._id);
            }
        }
    }

    const newCommunity = new Community({
      name,
      username,
      image,
      bio,
      createdBy: user._id, 
      members: [user._id, ...memberIds],
      type: type || 'public'
    });

    const createdCommunity = await newCommunity.save();

    user.communities.push(createdCommunity._id);
    await user.save();

    for (const memberId of memberIds) {
        const member = await User.findById(memberId);
        if (member) {
            member.communities.push(createdCommunity._id);
            await member.save();
        }
    }

    return JSON.parse(JSON.stringify(createdCommunity));
  } catch (error) {
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    await connectDB();

    const communityDetails = await Community.findById(id).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id",
      },
    ]).lean();

    return communityDetails;
  } catch (error) {
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    await connectDB();

    const communityPosts =  await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image _id", 
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", 
          },
        },
      ],
    }).lean();

    return communityPosts;
  } catch (error) {
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    await connectDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: mongoose.FilterQuery<typeof Community> = {};

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members")
      .lean();

    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    await connectDB();

    const community = await Community.findById(communityId);

    if (!community) {
      throw new Error("Community not found");
    }

    const user = await User.findById(memberId);

    if (!user) {
      throw new Error("User not found");
    }

    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    community.members.push(user._id);
    await community.save();

    user.communities.push(community._id);
    await user.save();

    return JSON.parse(JSON.stringify(community));
  } catch (error) {
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    await connectDB();

    const user = await User.findById(userId, { _id: 1 });
    const community = await Community.findById(communityId, { _id: 1 });

    if (!user) {
      throw new Error("User not found");
    }

    if (!community) {
      throw new Error("Community not found");
    }

    await Community.updateOne(
      { _id: community._id },
      { $pull: { members: user._id } }
    );

    await User.updateOne(
      { _id: user._id },
      { $pull: { communities: community._id } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    await connectDB();

    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      { name, username, image },
      { new: true }
    ).lean();

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    await connectDB();

    const deletedCommunity = await Community.findByIdAndDelete(communityId);

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    await Thread.deleteMany({ community: communityId });

    const communityUsers = await User.find({ communities: deletedCommunity._id });

    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(deletedCommunity._id);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return JSON.parse(JSON.stringify(deletedCommunity));
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}

/**
 * Handles a user's request to join a community.
 * If public, adds member immediately. If private, adds to requests.
 */
export async function requestToJoinCommunity(
  communityId: string,
  userId: string
) {
  try {
    await connectDB();
    const community = await Community.findById(communityId);
    if (!community) throw new Error("Community not found");

    if (community.type === "public") {
      return await addMemberToCommunity(communityId, userId);
    } else {
      await Community.findByIdAndUpdate(communityId, {
        $addToSet: { requests: userId },
      });
      revalidatePath(`/communities/${communityId}`);
    }
  } catch (error) {
    console.error("Error requesting to join community:", error);
    throw error;
  }
}

/**
 * Accepts a user's request to join a private community.
 */
export async function acceptJoinRequest(
  communityId: string,
  userId: string,
  creatorId: string
) {
  try {
    await connectDB();
    const community = await Community.findById(communityId);
    if (!community) throw new Error("Community not found");
    if (community.createdBy.toString() !== creatorId)
      throw new Error("Unauthorized");

    await Community.findByIdAndUpdate(communityId, {
      $pull: { requests: userId },
      $addToSet: { members: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { communities: communityId },
    });
    revalidatePath(`/communities/${communityId}`);
  } catch (error) {
    console.error("Error accepting join request:", error);
    throw error;
  }
}
